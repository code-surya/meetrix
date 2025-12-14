# frozen_string_literal: true

class HealthController < ApplicationController
  skip_before_action :authenticate_user!

  def check
    status = {
      status: 'ok',
      timestamp: Time.current.iso8601,
      service: 'Meetrix API',
      version: '1.0.0'
    }

    # Check database connection
    begin
      ActiveRecord::Base.connection.execute('SELECT 1')
      status[:database] = 'connected'
    rescue => e
      status[:database] = 'disconnected'
      status[:errors] ||= []
      status[:errors] << "Database: #{e.message}"
    end

    # Check Redis connection
    begin
      Redis.current.ping
      status[:redis] = 'connected'
    rescue => e
      status[:redis] = 'disconnected'
      status[:errors] ||= []
      status[:errors] << "Redis: #{e.message}"
    end

    http_status = status[:errors] ? :service_unavailable : :ok
    render json: status, status: http_status
  end
end

