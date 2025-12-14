# frozen_string_literal: true

require 'razorpay'

class RazorpayPaymentService < PaymentGatewayService
  RAZORPAY_KEY_ID = ENV['RAZORPAY_KEY_ID'] || Rails.application.credentials.razorpay&.key_id
  RAZORPAY_KEY_SECRET = ENV['RAZORPAY_KEY_SECRET'] || Rails.application.credentials.razorpay&.key_secret

  def initialize(payment)
    super(payment)
    Razorpay.setup(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) if RAZORPAY_KEY_ID.present? && RAZORPAY_KEY_SECRET.present?
  end

  # Create Razorpay Order
  def create_payment_intent
    return { success: false, error: 'Razorpay credentials not configured' } unless credentials_configured?

    begin
      # Convert amount to paise (smallest currency unit)
      amount_in_paise = (@payment.amount * 100).to_i

      order = Razorpay::Order.create(
        amount: amount_in_paise,
        currency: @payment.currency.upcase,
        receipt: @payment.booking.booking_reference,
        notes: {
          booking_id: @payment.booking_id,
          booking_reference: @payment.booking.booking_reference,
          user_id: @payment.booking.user_id,
          event_id: @payment.booking.event_id
        }
      )

      # Update payment record
      @payment.update!(
        payment_intent_id: order.id,
        payment_method_details: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: order.status
        }
      )

      {
        success: true,
        payment_intent_id: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RAZORPAY_KEY_ID # Required for client-side integration
      }
    rescue Razorpay::Error => e
      log_error("Razorpay error: #{e.message}")
      {
        success: false,
        error: e.message,
        razorpay_error: e.error
      }
    end
  end

  # Verify and confirm payment
  def confirm_payment(payment_id, order_id = nil)
    return { success: false, error: 'Payment ID required' } unless payment_id.present?

    begin
      # Retrieve payment from Razorpay
      razorpay_payment = Razorpay::Payment.fetch(payment_id)

      # Verify payment signature (should be done with signature from client)
      order_id ||= razorpay_payment.order_id

      # Verify payment status
      if razorpay_payment.status == 'authorized' || razorpay_payment.status == 'captured'
        # Capture payment if authorized
        if razorpay_payment.status == 'authorized'
          razorpay_payment.capture({ amount: razorpay_payment.amount })
        end

        # Update payment record
        update_payment_status(:completed, transaction_id: payment_id, metadata: {
          order_id: order_id,
          payment_method: razorpay_payment.method,
          bank: razorpay_payment.bank,
          wallet: razorpay_payment.wallet,
          vpa: razorpay_payment.vpa
        })

        # Confirm the booking
        @payment.booking.confirm! if @payment.booking.pending?

        {
          success: true,
          status: 'completed',
          transaction_id: payment_id
        }
      else
        update_payment_status(:failed, metadata: { reason: razorpay_payment.status })
        {
          success: false,
          status: razorpay_payment.status,
          error: "Payment status: #{razorpay_payment.status}"
        }
      end
    rescue Razorpay::Error => e
      log_error("Razorpay confirmation error: #{e.message}")
      update_payment_status(:failed, metadata: { error: e.message })
      {
        success: false,
        error: e.message
      }
    end
  end

  # Refund payment
  def refund(amount = nil)
    return { success: false, error: 'Transaction ID required' } unless @payment.transaction_id.present?

    begin
      refund_amount = amount || @payment.amount
      refund_amount_paise = (refund_amount * 100).to_i

      refund = Razorpay::Refund.create(
        payment_id: @payment.transaction_id,
        amount: refund_amount_paise,
        notes: {
          booking_id: @payment.booking_id,
          reason: 'customer_request'
        }
      )

      @payment.update!(
        status: :refunded,
        refunded_amount: (refund.amount / 100.0),
        refunded_at: Time.current,
        payment_method_details: @payment.payment_method_details.merge(
          refund_id: refund.id,
          refund_status: refund.status
        )
      )

      {
        success: true,
        refund_id: refund.id,
        amount: refund.amount / 100.0
      }
    rescue Razorpay::Error => e
      log_error("Razorpay refund error: #{e.message}")
      {
        success: false,
        error: e.message
      }
    end
  end

  # Verify webhook signature
  def verify_webhook_signature(payload, signature)
    webhook_secret = ENV['RAZORPAY_WEBHOOK_SECRET'] || Rails.application.credentials.razorpay&.webhook_secret

    begin
      Razorpay::Utility.verify_webhook_signature(payload, signature, webhook_secret)
      true
    rescue => e
      log_error("Razorpay signature verification error: #{e.message}")
      false
    end
  end

  # Handle webhook events
  def handle_webhook_event(event_data)
    event_type = event_data['event']
    entity = event_data['payload']['payment']['entity'] rescue event_data['payload']['payment.entity']

    case event_type
    when 'payment.authorized', 'payment.captured'
      handle_payment_succeeded(entity)
    when 'payment.failed'
      handle_payment_failed(entity)
    when 'refund.created', 'refund.processed'
      handle_refund(event_data['payload']['refund']['entity'])
    else
      Rails.logger.info "Unhandled Razorpay event: #{event_type}"
    end
  end

  private

  def credentials_configured?
    RAZORPAY_KEY_ID.present? && RAZORPAY_KEY_SECRET.present?
  end

  def handle_payment_succeeded(payment_entity)
    payment = Payment.find_by(payment_intent_id: payment_entity['order_id']) ||
              Payment.find_by(transaction_id: payment_entity['id'])
    return unless payment

    payment.update!(
      status: :completed,
      transaction_id: payment_entity['id'],
      processed_at: Time.current,
      payment_method_details: payment.payment_method_details.merge(
        payment_method: payment_entity['method'],
        bank: payment_entity['bank'],
        wallet: payment_entity['wallet'],
        vpa: payment_entity['vpa']
      )
    )

    # Confirm booking
    payment.booking.confirm! if payment.booking.pending?

    # Send notification
    PaymentNotificationJob.perform_later(payment.id, 'succeeded') if defined?(PaymentNotificationJob)
  end

  def handle_payment_failed(payment_entity)
    payment = Payment.find_by(payment_intent_id: payment_entity['order_id']) ||
              Payment.find_by(transaction_id: payment_entity['id'])
    return unless payment

    payment.update!(
      status: :failed,
      failure_reason: payment_entity['error_description'] || 'Payment failed',
      payment_method_details: payment.payment_method_details.merge(
        error_code: payment_entity['error_code'],
        error_description: payment_entity['error_description']
      )
    )

    # Send notification
    PaymentNotificationJob.perform_later(payment.id, 'failed') if defined?(PaymentNotificationJob)
  end

  def handle_refund(refund_entity)
    payment = Payment.find_by(transaction_id: refund_entity['payment_id'])
    return unless payment

    payment.update!(
      status: :refunded,
      refunded_amount: (refund_entity['amount'] / 100.0),
      refunded_at: Time.current,
      payment_method_details: payment.payment_method_details.merge(
        refund_id: refund_entity['id'],
        refund_status: refund_entity['status']
      )
    )

    # Cancel booking if needed
    payment.booking.cancel! if payment.booking.confirmed?
  end
end

