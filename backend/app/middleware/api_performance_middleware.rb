# frozen_string_literal: true

class ApiPerformanceMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)

    # Call the next middleware/app
    status, headers, response = @app.call(env)

    end_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    duration = ((end_time - start_time) * 1000).round(2) # milliseconds

    # Only log API requests
    if api_request?(env)
      endpoint = extract_endpoint(env)

      # Log performance metrics
      PerformanceMonitor.log_api_performance(endpoint, duration, status)

      # Add performance headers for debugging
      unless Rails.env.production?
        headers['X-Response-Time'] = "#{duration}ms"
        headers['X-Memory-Usage'] = "#{GetProcessMem.new.mb}MB"
      end

      # Alert on slow responses in production
      if Rails.env.production? && duration > 2000 # 2 seconds
        Rails.logger.error("SLOW API RESPONSE: #{endpoint} took #{duration}ms")
        # Could send alert to monitoring service
      end
    end

    [status, headers, response]
  end

  private

  def api_request?(env)
    env['PATH_INFO']&.start_with?('/api/')
  end

  def extract_endpoint(env)
    path = env['PATH_INFO']
    method = env['REQUEST_METHOD']

    # Extract controller and action if available
    if env['action_dispatch.request.parameters']
      params = env['action_dispatch.request.parameters']
      controller = params['controller']
      action = params['action']

      if controller && action
        "#{controller}##{action}"
      else
        "#{method} #{path}"
      end
    else
      "#{method} #{path}"
    end
  end
end
