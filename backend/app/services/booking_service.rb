# frozen_string_literal: true

class BookingService
  attr_reader :booking, :errors

  def initialize(user, event, ticket_requests)
    @user = user
    @event = event
    @ticket_requests = ticket_requests
    @errors = []
  end

  def create
    return false unless validate_booking

    ActiveRecord::Base.transaction do
      # Reserve tickets
      reserve_tickets

      # Create booking
      @booking = @user.bookings.build(
        event: @event,
        status: :pending,
        total_amount: calculate_total_amount
      )

      # Create booking items
      create_booking_items

      # Generate booking reference
      @booking.booking_reference = generate_booking_reference

      if @booking.save
        # Create payment record
        create_payment

        # Generate QR codes for tickets
        generate_ticket_qr_codes

        true
      else
        @errors.concat(@booking.errors.full_messages)
        rollback_reservations
        raise ActiveRecord::Rollback
      end
    end
  rescue StandardError => e
    @errors << e.message
    rollback_reservations
    false
  end

  def confirm
    return false unless @booking
    return false unless @booking.pending?

    ActiveRecord::Base.transaction do
      # Confirm tickets (increment sold_quantity)
      @booking.booking_items.each do |item|
        item.ticket_type.increment_sold_quantity!(item.quantity)
      end

      # Update booking status
      @booking.update!(
        status: :confirmed,
        confirmed_at: Time.current
      )

      # Update event analytics
      update_event_analytics

      # Send confirmation notifications
      send_confirmation_notifications

      true
    end
  rescue StandardError => e
    @errors << e.message
    false
  end

  def cancel
    return false unless @booking
    return false unless @booking.can_be_cancelled?

    ActiveRecord::Base.transaction do
      # Release tickets
      @booking.booking_items.each do |item|
        item.ticket_type.decrement_sold_quantity!(item.quantity)
      end

      # Update booking status
      @booking.update!(
        status: :cancelled,
        cancelled_at: Time.current
      )

      # Refund payment if exists
      refund_payment if @booking.payment&.completed?

      # Send cancellation notifications
      send_cancellation_notifications

      true
    end
  rescue StandardError => e
    @errors << e.message
    false
  end

  private

  def validate_booking
    @errors.clear

    # Validate event
    unless @event.present?
      @errors << 'Event is required'
      return false
    end

    unless @event.published?
      @errors << 'Event is not available for booking'
      return false
    end

    if @event.start_date <= Time.current
      @errors << 'Event has already started'
      return false
    end

    # Validate ticket requests
    if @ticket_requests.blank? || !@ticket_requests.is_a?(Array)
      @errors << 'Ticket requests are required'
      return false
    end

    # Validate each ticket request
    @ticket_requests.each do |request|
      ticket_type = TicketType.find_by(id: request[:ticket_type_id])
      quantity = request[:quantity].to_i

      unless ticket_type
        @errors << "Ticket type #{request[:ticket_type_id]} not found"
        next
      end

      unless ticket_type.event_id == @event.id
        @errors << "Ticket type #{ticket_type.id} does not belong to this event"
        next
      end

      unless ticket_type.on_sale?
        @errors << "Ticket type #{ticket_type.name} is not on sale"
        next
      end

      unless ticket_type.can_purchase?(quantity)
        @errors << "Insufficient tickets available for #{ticket_type.name}"
        next
      end

      if quantity <= 0
        @errors << "Quantity must be greater than 0 for #{ticket_type.name}"
        next
      end
    end

    @errors.empty?
  end

  def reserve_tickets
    @reserved_tickets = []

    @ticket_requests.each do |request|
      ticket_type = TicketType.find(request[:ticket_type_id])
      quantity = request[:quantity].to_i

      # Lock ticket type for update
      ticket_type.lock!

      # Check availability again (double-check)
      unless ticket_type.can_purchase?(quantity)
        raise "Insufficient tickets available for #{ticket_type.name}"
      end

      # Reserve tickets (increment sold_quantity temporarily)
      ticket_type.increment!(:sold_quantity, quantity)
      @reserved_tickets << { ticket_type: ticket_type, quantity: quantity }
    end
  end

  def rollback_reservations
    return unless @reserved_tickets

    @reserved_tickets.each do |reservation|
      reservation[:ticket_type].decrement!(:sold_quantity, reservation[:quantity])
    end
  end

  def create_booking_items
    @ticket_requests.each do |request|
      ticket_type = TicketType.find(request[:ticket_type_id])
      quantity = request[:quantity].to_i

      @booking.booking_items.create!(
        ticket_type: ticket_type,
        quantity: quantity,
        unit_price: ticket_type.price
      )
    end

    # Recalculate total amount
    @booking.total_amount = calculate_total_amount
  end

  def calculate_total_amount
    total = 0.0

    @ticket_requests.each do |request|
      ticket_type = TicketType.find(request[:ticket_type_id])
      quantity = request[:quantity].to_i
      total += ticket_type.price * quantity
    end

    total
  end

  def generate_booking_reference
    loop do
      reference = SecureRandom.alphanumeric(10).upcase
      break reference unless Booking.exists?(booking_reference: reference)
    end
  end

  def create_payment
    @booking.create_payment!(
      amount: @booking.total_amount,
      currency: 'USD',
      status: :pending,
      payment_method: :credit_card
    )
  end

  def generate_ticket_qr_codes
    @booking.booking_items.each do |item|
      item.quantity.times do |index|
        ticket_number = "#{@booking.booking_reference}-#{item.ticket_type.id}-#{index + 1}"
        qr_data = {
          booking_reference: @booking.booking_reference,
          ticket_type_id: item.ticket_type.id,
          ticket_number: ticket_number,
          event_id: @event.id,
          user_id: @user.id
        }

        qr_code = QrCodeService.generate(qr_data)
        item.update(qr_codes: (item.qr_codes || []) + [qr_code])
      end
    end
  end

  def update_event_analytics
    analytics = @event.event_analytics || @event.create_event_analytics
    analytics.increment_bookings!
    analytics.add_revenue!(@booking.total_amount)
  end

  def send_confirmation_notifications
    # Send email notification
    BookingMailer.confirmation(@booking).deliver_later if defined?(BookingMailer)

    # Create in-app notification
    Notification.create!(
      user: @user,
      notification_type: :booking_confirmed,
      title: 'Booking Confirmed',
      message: "Your booking #{@booking.booking_reference} for #{@event.title} has been confirmed.",
      notifiable: @booking
    )
  end

  def send_cancellation_notifications
    # Send email notification
    BookingMailer.cancellation(@booking).deliver_later if defined?(BookingMailer)

    # Create in-app notification
    Notification.create!(
      user: @user,
      notification_type: :booking_cancelled,
      title: 'Booking Cancelled',
      message: "Your booking #{@booking.booking_reference} for #{@event.title} has been cancelled.",
      notifiable: @booking
    )
  end

  def refund_payment
    @booking.payment.refund!(@booking.total_amount) if @booking.payment
  end
end

