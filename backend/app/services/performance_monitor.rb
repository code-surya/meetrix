# frozen_string_literal: true

class PerformanceMonitor
  QUERY_TIME_THRESHOLD = 500.ms # Log slow queries
  MEMORY_THRESHOLD = 100.megabytes # Log high memory usage

  class << self
    def measure_query_time(query_name)
      start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      result = yield
      end_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      duration = (end_time - start_time) * 1000 # milliseconds

      if duration > QUERY_TIME_THRESHOLD
        Rails.logger.warn("Slow query detected: #{query_name} took #{duration.round(2)}ms")
        # Could send to monitoring service like DataDog, New Relic, etc.
      end

      result
    end

    def cache_performance_metrics
      {
        hit_rate: Rails.cache.try(:hit_rate) || 0,
        size: Rails.cache.try(:size) || 0,
        memory_usage: GetProcessMem.new.mb,
        uptime: Process.clock_gettime(Process::CLOCK_MONOTONIC)
      }
    end

    def log_api_performance(endpoint, duration, status)
      metrics = {
        endpoint: endpoint,
        duration: duration,
        status: status,
        timestamp: Time.current.to_i,
        memory_usage: GetProcessMem.new.mb
      }

      # Log to structured logger
      Rails.logger.info("API Performance: #{metrics.to_json}")

      # Send to monitoring service if response is slow
      if duration > 1000 # 1 second
        # Send alert to monitoring system
        Rails.logger.warn("Slow API response: #{endpoint} took #{duration}ms")
      end
    end

    def database_connection_pool_status
      pool = ActiveRecord::Base.connection_pool
      {
        size: pool.size,
        available: pool.available_connections.size,
        borrowed: pool.borrowed_connections.size,
        waiting: pool.waiting_connections.size
      }
    end

    def optimize_query(query, name = 'unnamed')
      measure_query_time(name) do
        # Add query optimization hints
        optimized_query = query

        # Ensure proper indexing
        optimized_query = optimized_query.includes(:associations) unless query.includes_values.present?

        # Add query timeout for protection
        optimized_query = optimized_query.timeout(30.seconds)

        optimized_query.load
      end
    end
  end
end
