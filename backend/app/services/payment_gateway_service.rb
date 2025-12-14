# frozen_string_literal: true

# Abstract base class for payment gateway services
class PaymentGatewayService
  attr_reader :payment, :errors

  def initialize(payment)
    @payment = payment
    @errors = []
  end

  # Create payment intent/order
  def create_payment_intent
    raise NotImplementedError, 'Subclasses must implement create_payment_intent'
  end

  # Confirm payment
  def confirm_payment(payment_intent_id)
    raise NotImplementedError, 'Subclasses must implement confirm_payment'
  end

  # Refund payment
  def refund(amount = nil)
    raise NotImplementedError, 'Subclasses must implement refund'
  end

  # Verify webhook signature
  def verify_webhook_signature(payload, signature)
    raise NotImplementedError, 'Subclasses must implement verify_webhook_signature'
  end

  # Handle webhook event
  def handle_webhook_event(event_data)
    raise NotImplementedError, 'Subclasses must implement handle_webhook_event'
  end

  protected

  def update_payment_status(status, transaction_id: nil, metadata: {})
    @payment.update!(
      status: status,
      transaction_id: transaction_id || @payment.transaction_id,
      payment_method_details: @payment.payment_method_details.merge(metadata),
      processed_at: Time.current
    )
  end

  def log_error(message)
    @errors << message
    Rails.logger.error "Payment Error (#{@payment.id}): #{message}"
  end
end

