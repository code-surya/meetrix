# frozen_string_literal: true

# Optimize database connection pool for better performance
Rails.application.config.after_initialize do
  # Set database connection pool size based on environment
  pool_size = case Rails.env
              when 'production'
                ENV.fetch('DB_POOL_SIZE', 25).to_i
              when 'staging'
                ENV.fetch('DB_POOL_SIZE', 10).to_i
              else
                ENV.fetch('DB_POOL_SIZE', 5).to_i
              end

  # Configure connection pool
  config = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env).first
  if config
    config.merge!(
      pool: pool_size,
      checkout_timeout: 10, # seconds
      reaping_frequency: 60, # seconds
      dead_connection_timeout: 300 # seconds
    )
  end

  # Set pool size for the current connection
  ActiveRecord::Base.connection_pool.disconnect!
  ActiveRecord::Base.establish_connection

  # Monitor connection pool health
  if defined?(NewRelic)
    ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      NewRelic::Agent.record_metric('Database/Query/Time', event.duration)
    end
  end
end
