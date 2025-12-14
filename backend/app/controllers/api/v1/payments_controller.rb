# frozen_string_literal: true

module Api
  module V1
    class PaymentsController < BaseController
      before_action :authenticate_user!
      before_action :set_payment, only: [:show, :confirm, :refund, :status]

      # GET /api/v1/payments
      def index
        payments = current_user.bookings.joins(:payment)
                                .select('payments.*')
                                .order('payments.created_at DESC')
                                .page(params[:page] || 1)
                                .per(params[:per_page] || 20)

        render_success(
          data: {
            payments: payments.map { |p| payment_serializer(p) },
            pagination: pagination_meta(payments)
          }
        )
      end

      # GET /api/v1/payments/:id
      def show
        authorize_payment_access
        render_success(
          data: {
            payment: payment_serializer(@payment, detailed: true)
          }
        )
      end

      # POST /api/v1/payments
      # Create payment intent for a booking
      def create
        booking = Booking.find(params[:booking_id])
        
        # Verify booking belongs to user
        unless booking.user_id == current_user.id
          return render_forbidden(message: 'You can only create payments for your own bookings')
        end

        # Check if payment already exists
        if booking.payment.present?
          return render_error(
            message: 'Payment already exists for this booking',
            status: :unprocessable_entity
          )
        end

        # Create payment record
        payment = booking.create_payment!(
          amount: booking.total_amount,
          currency: params[:currency] || 'USD',
          status: :pending,
          payment_method: params[:payment_method]&.to_sym || :credit_card
        )

        # Get payment gateway service
        gateway = params[:gateway] || 'stripe' # Default to Stripe
        service = get_payment_service(payment, gateway)

        # Create payment intent
        result = service.create_payment_intent

        if result[:success]
          render_success(
            data: {
              payment: payment_serializer(payment.reload, detailed: true),
              payment_intent: result.except(:success)
            },
            message: 'Payment intent created successfully',
            status: :created
          )
        else
          render_error(
            message: 'Failed to create payment intent',
            errors: [result[:error]],
            status: :unprocessable_entity
          )
        end
      end

      # POST /api/v1/payments/:id/confirm
      # Confirm payment after client-side processing
      def confirm
        authorize_payment_access

        gateway = params[:gateway] || detect_gateway
        service = get_payment_service(@payment, gateway)

        # Gateway-specific confirmation
        if gateway == 'stripe'
          payment_intent_id = params[:payment_intent_id] || @payment.payment_intent_id
          result = service.confirm_payment(payment_intent_id)
        elsif gateway == 'razorpay'
          payment_id = params[:payment_id] || params[:razorpay_payment_id]
          order_id = params[:order_id] || @payment.payment_intent_id
          result = service.confirm_payment(payment_id, order_id)
        else
          return render_error(
            message: 'Invalid payment gateway',
            status: :bad_request
          )
        end

        if result[:success]
          render_success(
            data: {
              payment: payment_serializer(@payment.reload, detailed: true)
            },
            message: 'Payment confirmed successfully'
          )
        else
          render_error(
            message: result[:error] || 'Payment confirmation failed',
            errors: service.errors,
            status: :unprocessable_entity
          )
        end
      end

      # POST /api/v1/payments/:id/refund
      def refund
        authorize_payment_access

        unless @payment.completed?
          return render_error(
            message: 'Only completed payments can be refunded',
            status: :unprocessable_entity
          )
        end

        gateway = detect_gateway
        service = get_payment_service(@payment, gateway)

        refund_amount = params[:amount]&.to_f
        result = service.refund(refund_amount)

        if result[:success]
          render_success(
            data: {
              payment: payment_serializer(@payment.reload, detailed: true),
              refund: {
                refund_id: result[:refund_id],
                amount: result[:amount]
              }
            },
            message: 'Refund processed successfully'
          )
        else
          render_error(
            message: result[:error] || 'Refund failed',
            errors: service.errors,
            status: :unprocessable_entity
          )
        end
      end

      # GET /api/v1/payments/:id/status
      def status
        authorize_payment_access

        gateway = detect_gateway
        service = get_payment_service(@payment, gateway)

        # Fetch latest status from gateway
        if gateway == 'stripe' && @payment.payment_intent_id.present?
          begin
            intent = Stripe::PaymentIntent.retrieve(@payment.payment_intent_id)
            @payment.update!(
              status: map_stripe_status(intent.status),
              payment_method_details: @payment.payment_method_details.merge(
                latest_status: intent.status
              )
            )
          rescue Stripe::StripeError => e
            log_error("Failed to fetch Stripe status: #{e.message}")
          end
        end

        render_success(
          data: {
            payment: payment_serializer(@payment.reload, detailed: true)
          }
        )
      end

      private

      def set_payment
        @payment = Payment.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_not_found(message: 'Payment not found')
      end

      def authorize_payment_access
        unless @payment.booking.user_id == current_user.id || current_user.admin?
          render_forbidden(message: 'You can only access your own payments')
        end
      end

      def get_payment_service(payment, gateway)
        case gateway.to_s.downcase
        when 'stripe'
          StripePaymentService.new(payment)
        when 'razorpay'
          RazorpayPaymentService.new(payment)
        else
          raise ArgumentError, "Unknown payment gateway: #{gateway}"
        end
      end

      def detect_gateway
        # Detect gateway from payment_intent_id format or payment_method_details
        if @payment.payment_intent_id&.start_with?('pi_')
          'stripe'
        elsif @payment.payment_intent_id&.start_with?('order_')
          'razorpay'
        else
          # Default or check payment_method_details
          @payment.payment_method_details&.dig('gateway') || 'stripe'
        end
      end

      def map_stripe_status(status)
        case status
        when 'succeeded'
          :completed
        when 'processing', 'requires_action', 'requires_payment_method'
          :processing
        when 'canceled'
          :failed
        else
          :pending
        end
      end

      def payment_serializer(payment, detailed: false)
        data = {
          id: payment.id,
          booking_id: payment.booking_id,
          booking_reference: payment.booking.booking_reference,
          amount: payment.amount.to_f,
          currency: payment.currency,
          status: payment.status,
          payment_method: payment.payment_method,
          transaction_id: payment.transaction_id,
          payment_intent_id: payment.payment_intent_id,
          created_at: payment.created_at,
          processed_at: payment.processed_at
        }

        if detailed
          data.merge!(
            booking: {
              id: payment.booking.id,
              booking_reference: payment.booking.booking_reference,
              event_title: payment.booking.event.title
            },
            payment_method_details: payment.payment_method_details,
            refunded_amount: payment.refunded_amount&.to_f,
            refunded_at: payment.refunded_at,
            failure_reason: payment.failure_reason
          )

          # Add gateway-specific data
          if payment.payment_method_details.present?
            if payment.payment_method_details['client_secret']
              data[:client_secret] = payment.payment_method_details['client_secret']
            end
            if payment.payment_method_details['key_id']
              data[:key_id] = payment.payment_method_details['key_id']
            end
          end
        end

        data
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages: collection.total_pages,
          total_count: collection.total_count,
          per_page: collection.limit_value
        }
      end
    end
  end
end

