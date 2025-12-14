# frozen_string_literal: true

module Api
  module V1
    class WebhooksController < BaseController
      # Skip authentication for webhooks (they use signature verification)
      skip_before_action :authenticate_user!
      skip_before_action :verify_authenticity_token

      # POST /api/v1/webhooks/stripe
      def stripe
        payload = request.body.read
        signature = request.headers['Stripe-Signature']

        # Find payment from event
        event = nil
        begin
          event = Stripe::Webhook.construct_event(
            payload,
            signature,
            ENV['STRIPE_WEBHOOK_SECRET'] || Rails.application.credentials.stripe&.webhook_secret
          )
        rescue JSON::ParserError => e
          Rails.logger.error "Stripe webhook JSON parse error: #{e.message}"
          return render_error(message: 'Invalid payload', status: :bad_request)
        rescue Stripe::SignatureVerificationError => e
          Rails.logger.error "Stripe webhook signature verification failed: #{e.message}"
          return render_error(message: 'Invalid signature', status: :unauthorized)
        end

        # Process webhook event
        process_stripe_webhook(event)

        render json: { received: true }, status: :ok
      end

      # POST /api/v1/webhooks/razorpay
      def razorpay
        payload = request.body.read
        signature = request.headers['X-Razorpay-Signature']

        # Parse payload
        begin
          event_data = JSON.parse(payload)
        rescue JSON::ParserError => e
          Rails.logger.error "Razorpay webhook JSON parse error: #{e.message}"
          return render_error(message: 'Invalid payload', status: :bad_request)
        end

        # Verify signature
        webhook_secret = ENV['RAZORPAY_WEBHOOK_SECRET'] || Rails.application.credentials.razorpay&.webhook_secret
        unless verify_razorpay_signature(payload, signature, webhook_secret)
          Rails.logger.error "Razorpay webhook signature verification failed"
          return render_error(message: 'Invalid signature', status: :unauthorized)
        end

        # Process webhook event
        process_razorpay_webhook(event_data)

        render json: { received: true }, status: :ok
      end

      private

      def process_stripe_webhook(event)
        # Get payment service
        payment = find_payment_from_stripe_event(event)
        return unless payment

        service = StripePaymentService.new(payment)
        service.handle_webhook_event(event)

        # Log webhook event
        WebhookLog.create!(
          gateway: 'stripe',
          event_type: event.type,
          event_id: event.id,
          payload: event.to_json,
          processed: true
        ) if defined?(WebhookLog)
      rescue StandardError => e
        Rails.logger.error "Stripe webhook processing error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end

      def process_razorpay_webhook(event_data)
        # Get payment service
        payment = find_payment_from_razorpay_event(event_data)
        return unless payment

        service = RazorpayPaymentService.new(payment)
        service.handle_webhook_event(event_data)

        # Log webhook event
        WebhookLog.create!(
          gateway: 'razorpay',
          event_type: event_data['event'],
          event_id: event_data['event_id'] || SecureRandom.uuid,
          payload: event_data.to_json,
          processed: true
        ) if defined?(WebhookLog)
      rescue StandardError => e
        Rails.logger.error "Razorpay webhook processing error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end

      def find_payment_from_stripe_event(event)
        payment_intent = event.data.object

        case event.type
        when 'payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled'
          Payment.find_by(payment_intent_id: payment_intent.id)
        when 'charge.refunded'
          Payment.find_by(transaction_id: payment_intent.payment_intent)
        else
          nil
        end
      end

      def find_payment_from_razorpay_event(event_data)
        entity = event_data.dig('payload', 'payment', 'entity') || 
                 event_data.dig('payload', 'payment.entity')

        return nil unless entity

        case event_data['event']
        when 'payment.authorized', 'payment.captured', 'payment.failed'
          Payment.find_by(payment_intent_id: entity['order_id']) ||
            Payment.find_by(transaction_id: entity['id'])
        when 'refund.created', 'refund.processed'
          refund_entity = event_data.dig('payload', 'refund', 'entity')
          Payment.find_by(transaction_id: refund_entity['payment_id'])
        else
          nil
        end
      end

      def verify_razorpay_signature(payload, signature, secret)
        return false unless secret.present?

        begin
          Razorpay::Utility.verify_webhook_signature(payload, signature, secret)
          true
        rescue => e
          Rails.logger.error "Razorpay signature verification error: #{e.message}"
          false
        end
      end
    end
  end
end

