# frozen_string_literal: true

module InputSanitizer
  extend ActiveSupport::Concern

  included do
    before_action :sanitize_params
  end

  private

  def sanitize_params
    # Sanitize string parameters
    sanitize_string_params

    # Validate and sanitize numeric parameters
    sanitize_numeric_params

    # Sanitize search parameters
    sanitize_search_params

    # Validate email parameters
    validate_email_params

    # Sanitize HTML content
    sanitize_html_params
  end

  def sanitize_string_params
    params.each do |key, value|
      next unless value.is_a?(String)

      # Remove null bytes and other dangerous characters
      clean_value = value.gsub(/\x00/, '').strip

      # Limit string length (configurable per field)
      max_length = string_max_length(key)
      clean_value = clean_value[0...max_length] if max_length && clean_value.length > max_length

      params[key] = clean_value
    end
  end

  def sanitize_numeric_params
    numeric_fields = %w[page per_page event_id booking_id user_id quantity price]

    params.each do |key, value|
      next unless numeric_fields.include?(key.to_s)
      next if value.blank?

      # Convert to integer and validate range
      if key.to_s.end_with?('_id')
        # IDs should be positive integers
        begin
          numeric_value = Integer(value)
          params[key] = numeric_value if numeric_value.positive?
        rescue ArgumentError
          params.delete(key) # Remove invalid IDs
        end
      else
        # Other numeric fields
        begin
          numeric_value = Float(value)
          params[key] = numeric_value
        rescue ArgumentError
          params.delete(key)
        end
      end
    end
  end

  def sanitize_search_params
    return unless params[:q].present? || params[:search].present?

    search_term = params[:q] || params[:search]

    # Remove potentially dangerous characters for search
    clean_search = search_term.to_s.gsub(/[<>'"%;()&+]/, '').strip

    # Limit search length
    clean_search = clean_search[0..100] if clean_search.length > 100

    params[:q] = params[:search] = clean_search
  end

  def validate_email_params
    email_fields = %w[email]

    params.each do |key, value|
      next unless email_fields.include?(key.to_s)
      next if value.blank?

      # Basic email validation
      unless value.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i)
        params.delete(key)
      end
    end
  end

  def sanitize_html_params
    html_fields = %w[description bio content]

    params.each do |key, value|
      next unless html_fields.include?(key.to_s)
      next if value.blank?

      # Remove script tags and other dangerous HTML
      clean_html = value.to_s
        .gsub(/<script[^>]*>.*?<\/script>/im, '')
        .gsub(/<iframe[^>]*>.*?<\/iframe>/im, '')
        .gsub(/javascript:/i, '')
        .gsub(/on\w+\s*=/i, '')

      params[key] = clean_html
    end
  end

  def string_max_length(field_name)
    limits = {
      'title' => 200,
      'description' => 2000,
      'name' => 100,
      'email' => 255,
      'password' => 128,
      'q' => 100,
      'search' => 100
    }

    limits[field_name.to_s]
  end
end

