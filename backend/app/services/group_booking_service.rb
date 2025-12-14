# frozen_string_literal: true

class GroupBookingService
  attr_reader :bookings, :errors, :group

  DISCOUNT_TIERS = {
    5 => 0.05,   # 5% discount for 5-9 people
    10 => 0.10,  # 10% discount for 10-19 people
    20 => 0.15,  # 15% discount for 20-49 people
    50 => 0.20   # 20% discount for 50+ people
  }.freeze

  def initialize(group, ticket_requests)
    @group = group
    @event = group.event
    @ticket_requests = ticket_requests
    @errors = []
    @bookings = []
  end

  def create
    return false unless validate_group_booking

    ActiveRecord::Base.transaction do
      # Calculate discount based on total group size
      total_quantity = calculate_total_quantity
      discount_percentage = calculate_discount(total_quantity)

      # Create booking for each group member
      @group.members.each do |member|
        booking = create_member_booking(member, discount_percentage)
        @bookings << booking if booking
      end

      # Update group with booking information
      @group.update!(
        total_bookings: @bookings.count,
        total_amount: @bookings.sum(&:total_amount),
        discount_applied: discount_percentage
      )

      # Send group booking notifications
      send_group_notifications

      true
    end
  rescue StandardError => e
    @errors << e.message
    @bookings.each(&:destroy) if @bookings.any?
    false
  end

  private

  def validate_group_booking
    @errors.clear

    unless @group.present?
      @errors << 'Group is required'
      return false
    end

    unless @group.active?
      @errors << 'Group is not active'
      return false
    end

    unless @group.event.published?
      @errors << 'Event is not available for booking'
      return false
    end

    if @group.event.start_date <= Time.current
      @errors << 'Event has already started'
      return false
    end

    # Validate ticket requests
    if @ticket_requests.blank? || !@ticket_requests.is_a?(Array)
      @errors << 'Ticket requests are required'
      return false
    end

    # Validate ticket availability for all members
    total_quantity = calculate_total_quantity
    required_quantity = total_quantity * @group.members.count

    @ticket_requests.each do |request|
      ticket_type = TicketType.find_by(id: request[:ticket_type_id])
      quantity_per_member = request[:quantity].to_i

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

      # Check if enough tickets available for all members
      required = quantity_per_member * @group.members.count
      unless ticket_type.available_quantity >= required
        @errors << "Insufficient tickets available for #{ticket_type.name}. Need #{required}, available #{ticket_type.available_quantity}"
        next
      end
    end

    @errors.empty?
  end

  def calculate_total_quantity
    @ticket_requests.sum { |r| r[:quantity].to_i }
  end

  def calculate_discount(total_quantity)
    # Find the highest discount tier that applies
    applicable_tier = DISCOUNT_TIERS.keys.reverse.find { |tier| total_quantity >= tier }
    applicable_tier ? DISCOUNT_TIERS[applicable_tier] : 0.0
  end

  def create_member_booking(member, discount_percentage)
    booking_service = BookingService.new(member, @event, @ticket_requests)

    # Create booking
    return nil unless booking_service.create

    booking = booking_service.booking

    # Apply group discount
    if discount_percentage > 0
      discount_amount = booking.total_amount * discount_percentage
      booking.update!(
        total_amount: booking.total_amount - discount_amount,
        discount_amount: discount_amount,
        discount_percentage: discount_percentage
      )

      # Update payment amount
      booking.payment&.update!(amount: booking.total_amount)
    end

    # Link booking to group
    booking.update!(group: @group)

    # Generate QR codes
    booking_service.send(:generate_ticket_qr_codes)

    booking
  end

  def send_group_notifications
    @group.members.each do |member|
      member_booking = @bookings.find { |b| b.user_id == member.id }

      if member_booking
        Notification.create!(
          user: member,
          notification_type: :booking_confirmed,
          title: 'Group Booking Confirmed',
          message: "Your group booking for #{@event.title} has been confirmed. Discount: #{member_booking.discount_percentage * 100}%",
          notifiable: member_booking
        )
      end
    end

    # Notify group creator
    Notification.create!(
      user: @group.creator,
      notification_type: :general,
      title: 'Group Booking Completed',
      message: "All group members have completed their bookings for #{@event.title}",
      notifiable: @group
    )
  end
end

