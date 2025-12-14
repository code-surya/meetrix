# frozen_string_literal: true

class EventSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :category, :status, :slug,
             :start_date, :end_date, :timezone,
             :venue_name, :venue_address, :city, :state, :country, :postal_code,
             :latitude, :longitude,
             :image_url, :banner_url,
             :featured, :created_at, :updated_at

  belongs_to :organizer, serializer: UserSerializer
  has_many :ticket_types, serializer: TicketTypeSerializer
  has_many :reviews, serializer: ReviewSerializer

  def venue
    {
      name: object.venue_name,
      address: object.venue_address,
      city: object.city,
      state: object.state,
      country: object.country,
      postal_code: object.postal_code
    }
  end

  def location
    {
      latitude: object.latitude.to_f,
      longitude: object.longitude.to_f
    }
  end

  def statistics
    {
      total_tickets_sold: object.total_tickets_sold,
      available_tickets: object.available_tickets,
      sold_out: object.sold_out?,
      average_rating: object.average_rating,
      total_reviews: object.total_reviews,
      total_revenue: object.total_revenue.to_f
    }
  end
end

