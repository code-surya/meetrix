# frozen_string_literal: true

require 'stripe'

class StripePaymentService < PaymentGatewayService
  STRIPE_API_KEY = ENV['STRIPE_SECRET_KEY'] || Rails.application.credentials.stripe&.secret_key

  def initialize(payment)
    super(payment)
    Stripe.api_key = STRIPE_API_KEY
  end

  # Create Stripe Payment Intent
  def create_payment_intent
    return { success: false, error: 'Stripe API key not configured' } unless STRIPE_API_KEY.present?

    begin
      intent = Stripe::PaymentIntent.create(
        amount: (@payment.amount * 100).to_i, # Convert to cents
        currency: @payment.currency.downcase,
        metadata: {
          booking_id: @payment.booking_id,
          booking_reference: @payment.booking.booking_reference,
          user_id: @payment.booking.user_id,
          event_id: @payment.booking.event_id
        },
        description: "Payment for booking #{@payment.booking.booking_reference}",
        automatic_payment_methods: {
          enabled: true
        },
        confirm: false
      )

      # Update payment record
      @payment.update!(
        payment_intent_id: intent.id,
        payment_method_details: {
          client_secret: intent.client_secret,
          status: intent.status
        }
      )

      {
        success: true,
        payment_intent_id: intent.id,
        client_secret: intent.client_secret
      }
    rescue Stripe::StripeError => e
      log_error("Stripe error: #{e.message}")
      {
        success: false,
        error: e.message,
        stripe_error: e.error
      }
    end
  end

  # Confirm payment after client-side confirmation
  def confirm_payment(payment_intent_id)
    return { success: false, error: 'Payment intent ID required' } unless payment_intent_id.present?

    begin
      intent = Stripe::PaymentIntent.retrieve(payment_intent_id)

      case intent.status
      when 'succeeded'
        update_payment_status(:completed, transaction_id: intent.id, metadata: {
          payment_method: intent.payment_method,
          receipt_url: intent.charges.data.first&.receipt_url
        })

        # Confirm the booking
        @payment.booking.confirm! if @payment.booking.pending?

        {
          success: true,
          status: 'completed',
          transaction_id: intent.id
        }
      when 'requires_action', 'requires_payment_method'
        {
          success: false,
          status: intent.status,
          requires_action: true,
          client_secret: intent.client_secret
        }
      when 'canceled'
        update_payment_status(:failed, metadata: { reason: 'Payment canceled' })
        {
          success: false,
          status: 'canceled',
          error: 'Payment was canceled'
        }
      else
        {
          success: false,
          status: intent.status,
          error: "Payment status: #{intent.status}"
        }
      end
    rescue Stripe::StripeError => e
      log_error("Stripe confirmation error: #{e.message}")
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
      refund = Stripe::Refund.create(
        payment_intent: @payment.transaction_id,
        amount: (refund_amount * 100).to_i, # Convert to cents
        metadata: {
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
    rescue Stripe::StripeError => e
      log_error("Stripe refund error: #{e.message}")
      {
        success: false,
        error: e.message
      }
    end
  end

  # Verify webhook signature
  def verify_webhook_signature(payload, signature)
    webhook_secret = ENV['STRIPE_WEBHOOK_SECRET'] || Rails.application.credentials.stripe&.webhook_secret

    begin
      Stripe::Webhook.construct_event(
        payload,
        signature,
        webhook_secret
      )
      true
    rescue JSON::ParserError
      log_error('Invalid payload')
      false
    rescue Stripe::SignatureVerificationError
      log_error('Invalid signature')
      false
    end
  end

  # Handle webhook events
  def handle_webhook_event(event)
    case event.type
    when 'payment_intent.succeeded'
      handle_payment_succeeded(event.data.object)
    when 'payment_intent.payment_failed'
      handle_payment_failed(event.data.object)
    when 'charge.refunded'
      handle_refund(event.data.object)
    when 'payment_intent.canceled'
      handle_payment_canceled(event.data.object)
    else
      Rails.logger.info "Unhandled Stripe event: #{event.type}"
    end
  end

  private

  def handle_payment_succeeded(payment_intent)
    payment = Payment.find_by(payment_intent_id: payment_intent.id)
    return unless payment

    payment.update!(
      status: :completed,
      transaction_id: payment_intent.id,
      processed_at: Time.current,
      payment_method_details: payment.payment_method_details.merge(
        payment_method: payment_intent.payment_method,
        receipt_url: payment_intent.charges.data.first&.receipt_url
      )
    )

    # Confirm booking
    payment.booking.confirm! if payment.booking.pending?

    # Send notification
    PaymentNotificationJob.perform_later(payment.id, 'succeeded') if defined?(PaymentNotificationJob)
  end

  def handle_payment_failed(payment_intent)
    payment = Payment.find_by(payment_intent_id: payment_intent.id)
    return unless payment

    payment.update!(
      status: :failed,
      failure_reason: payment_intent.last_payment_error&.message || 'Payment failed',
      payment_method_details: payment.payment_method_details.merge(
        error: payment_intent.last_payment_error&.to_json
      )
    )

    # Send notification
    PaymentNotificationJob.perform_later(payment.id, 'failed') if defined?(PaymentNotificationJob)
  end

  def handle_refund(refund)
    payment = Payment.find_by(transaction_id: refund.payment_intent)
    return unless payment

    payment.update!(
      status: :refunded,
      refunded_amount: (refund.amount / 100.0),
      refunded_at: Time.current,
      payment_method_details: payment.payment_method_details.merge(
        refund_id: refund.id,
        refund_status: refund.status
      )
    )

    # Cancel booking if needed
    payment.booking.cancel! if payment.booking.confirmed?
  end

  def handle_payment_canceled(payment_intent)
    payment = Payment.find_by(payment_intent_id: payment_intent.id)
    return unless payment

    payment.update!(
      status: :failed,
      failure_reason: 'Payment was canceled',
      payment_method_details: payment.payment_method_details.merge(
        canceled_at: Time.current
      )
    )
  end
end

