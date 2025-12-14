# frozen_string_literal: true

class TicketAvailabilityService
  attr_reader :event, :errors

  def initialize(event)
    @event = event
    @errors = []
  end

  def check_availability(ticket_type_id, quantity)
    ticket_type = @event.ticket_types.find_by(id: ticket_type_id)

    unless ticket_type
      @errors << "Ticket type not found"
      return { available: false, errors: @errors }
    end

    available_quantity = ticket_type.available_quantity
    on_sale = ticket_type.on_sale?
    can_purchase = ticket_type.can_purchase?(quantity)

    {
      available: can_purchase,
      ticket_type: {
        id: ticket_type.id,
        name: ticket_type.name,
        price: ticket_type.price,
        total_quantity: ticket_type.quantity,
        sold_quantity: ticket_type.sold_quantity,
        available_quantity: available_quantity,
        on_sale: on_sale,
        sold_out: ticket_type.sold_out?
      },
      requested_quantity: quantity,
      can_purchase: can_purchase,
      errors: @errors
    }
  end

  def check_all_availability
    ticket_types = @event.ticket_types.active

    {
      event_id: @event.id,
      event_title: @event.title,
      ticket_types: ticket_types.map do |tt|
        {
          id: tt.id,
          name: tt.name,
          price: tt.price,
          total_quantity: tt.quantity,
          sold_quantity: tt.sold_quantity,
          available_quantity: tt.available_quantity,
          on_sale: tt.on_sale?,
          sold_out: tt.sold_out?,
          sale_start_date: tt.sale_start_date,
          sale_end_date: tt.sale_end_date
        }
      end,
      total_available: ticket_types.sum(&:available_quantity),
      event_sold_out: @event.sold_out?
    }
  end

  def check_bulk_availability(ticket_requests)
    results = []

    ticket_requests.each do |request|
      ticket_type_id = request[:ticket_type_id]
      quantity = request[:quantity].to_i

      result = check_availability(ticket_type_id, quantity)
      results << {
        ticket_type_id: ticket_type_id,
        requested_quantity: quantity,
        available: result[:available],
        ticket_type: result[:ticket_type],
        errors: result[:errors]
      }
    end

    all_available = results.all? { |r| r[:available] }

    {
      all_available: all_available,
      results: results,
      can_proceed: all_available && @errors.empty?
    }
  end

  def reserve_tickets(ticket_requests, duration: 10.minutes)
    # This would typically use Redis to reserve tickets temporarily
    # For now, we'll use database locking
    reserved = []

    ActiveRecord::Base.transaction do
      ticket_requests.each do |request|
        ticket_type = TicketType.find(request[:ticket_type_id])
        quantity = request[:quantity].to_i

        ticket_type.lock!

        unless ticket_type.can_purchase?(quantity)
          raise "Insufficient tickets for #{ticket_type.name}"
        end

        # Reserve by incrementing sold_quantity
        ticket_type.increment!(:sold_quantity, quantity)
        reserved << { ticket_type: ticket_type, quantity: quantity }

        # In production, you might want to use Redis with expiration
        # Redis.current.setex("reservation:#{ticket_type.id}:#{SecureRandom.uuid}", duration.to_i, quantity)
      end
    end

    reserved
  rescue StandardError => e
    # Rollback reservations
    reserved.each do |reservation|
      reservation[:ticket_type].decrement!(:sold_quantity, reservation[:quantity])
    end
    raise e
  end
end

