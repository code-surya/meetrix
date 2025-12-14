# frozen_string_literal: true

class EventFilterService
  def initialize(scope, params)
    @scope = scope
    @params = params
  end

  def call
    apply_filters
    apply_search
    apply_sorting
    @scope
  end

  private

  attr_reader :scope, :params

  def apply_filters
    filter_by_status
    filter_by_category
    filter_by_date_range
    filter_by_location
    filter_by_price_range
    filter_by_organizer
  end

  def filter_by_status
    return unless params[:status].present?

    status = params[:status].to_s.downcase
    @scope = @scope.where(status: status) if Event.statuses.key?(status)
  end

  def filter_by_category
    return unless params[:category].present?

    category = params[:category].to_s.downcase
    @scope = @scope.where(category: category) if Event.categories.key?(category)
  end

  def filter_by_date_range
    if params[:start_date_from].present?
      @scope = @scope.where('start_date >= ?', parse_date(params[:start_date_from]))
    end

    if params[:start_date_to].present?
      @scope = @scope.where('start_date <= ?', parse_date(params[:start_date_to]))
    end

    if params[:upcoming] == 'true'
      @scope = @scope.upcoming
    elsif params[:past] == 'true'
      @scope = @scope.past
    end
  end

  def filter_by_location
    if params[:latitude].present? && params[:longitude].present?
      lat = params[:latitude].to_f
      lng = params[:longitude].to_f
      radius = (params[:radius] || 10).to_f # Default 10km

      @scope = @scope.nearby(lat, lng, radius)
    elsif params[:city].present?
      @scope = @scope.where('LOWER(city) = ?', params[:city].downcase)
    elsif params[:state].present?
      @scope = @scope.where('LOWER(state) = ?', params[:state].downcase)
    elsif params[:country].present?
      @scope = @scope.where('LOWER(country) = ?', params[:country].downcase)
    end
  end

  def filter_by_price_range
    return unless params[:min_price].present? || params[:max_price].present?

    # Join with ticket_types to filter by price
    @scope = @scope.joins(:ticket_types)
                   .group('events.id')
                   .having('MIN(ticket_types.price) >= ?', params[:min_price].to_f) if params[:min_price].present?

    @scope = @scope.having('MAX(ticket_types.price) <= ?', params[:max_price].to_f) if params[:max_price].present?
  end

  def filter_by_organizer
    return unless params[:organizer_id].present?

    @scope = @scope.where(organizer_id: params[:organizer_id])
  end

  def apply_search
    return unless params[:search].present?

    search_term = params[:search].strip
    @scope = @scope.search_by_text(search_term)
  end

  def apply_sorting
    sort_by = params[:sort_by] || 'start_date'
    sort_order = params[:sort_order] || 'asc'

    case sort_by
    when 'date', 'start_date'
      @scope = @scope.order(start_date: sort_order.to_sym)
    when 'price'
      @scope = @scope.left_joins(:ticket_types)
                     .group('events.id')
                     .order("MIN(ticket_types.price) #{sort_order.upcase}")
    when 'created_at'
      @scope = @scope.order(created_at: sort_order.to_sym)
    when 'title'
      @scope = @scope.order(title: sort_order.to_sym)
    when 'popularity'
      @scope = @scope.left_joins(:bookings)
                     .group('events.id')
                     .order('COUNT(bookings.id) DESC')
    else
      @scope = @scope.order(start_date: :asc)
    end
  end

  def parse_date(date_string)
    Time.zone.parse(date_string)
  rescue ArgumentError, TypeError
    nil
  end
end

