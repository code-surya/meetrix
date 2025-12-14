# frozen_string_literal: true

class QrCodeService
  require 'rqrcode'
  require 'chunky_png'

  def self.generate_for_booking_item(booking_item)
    return if booking_item.qr_codes.present?

    qr_data = booking_item.generate_qr_data
    qr_codes = []

    # Generate QR codes for each ticket in the booking item
    booking_item.quantity.times do |index|
      ticket_data = {
        booking_item_id: booking_item.id,
        ticket_number: index + 1,
        qr_data: qr_data,
        token: generate_secure_token
      }.to_json

      qr_code = RQRCode::QRCode.new(ticket_data, size: 6, level: :m)
      qr_codes << {
        ticket_number: index + 1,
        qr_data: ticket_data,
        token: generate_secure_token,
        image_base64: generate_png_base64(qr_code),
        generated_at: Time.current.iso8601,
        expires_at: (booking_item.booking.event.end_date + 1.day).iso8601
      }
    end

    booking_item.update!(qr_codes: qr_codes)
    qr_codes
  end

  def self.validate_qr_token(token, booking_item_id)
    booking_item = BookingItem.find_by(id: booking_item_id)
    return false unless booking_item

    # Check if token exists in QR codes and hasn't been used
    booking_item.qr_codes&.any? do |qr|
      qr['token'] == token && !qr['used_at']
    end
  end

  def self.mark_token_used(token, booking_item_id)
    booking_item = BookingItem.find_by(id: booking_item_id)
    return false unless booking_item

    qr_codes = booking_item.qr_codes
    qr_codes.each do |qr|
      if qr['token'] == token && !qr['used_at']
        qr['used_at'] = Time.current.iso8601
        qr['checked_in_by'] = Current.user&.id
        break
      end
    end

    booking_item.update!(qr_codes: qr_codes)
    true
  end

  def self.verify_qr_data(qr_data)
    begin
      parsed = JSON.parse(qr_data)
      booking_item = BookingItem.find_by(id: parsed['booking_item_id'])

      return false unless booking_item
      return false if booking_item.checked_in?
      return false if Time.current.to_i > parsed['expires_at']
      return false unless parsed['token'].present?

      # Validate token
      validate_qr_token(parsed['token'], booking_item.id)
    rescue JSON::ParserError, ActiveRecord::RecordNotFound
      false
    end
  end

  private

  def self.generate_secure_token
    SecureRandom.hex(16)
  end

  def self.generate_png_base64(qr_code)
    png = qr_code.as_png(
      bit_depth: 1,
      border_modules: 4,
      color_mode: ChunkyPNG::COLOR_GRAYSCALE,
      color: 'black',
      file: nil,
      fill: 'white',
      module_px_size: 6,
      resize_exactly_to: false,
      resize_gte_to: false,
      size: 240
    )

    Base64.encode64(png.to_s).gsub("\n", '')
  end
end
