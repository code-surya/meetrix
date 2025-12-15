Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
      delete 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'

      # Events
      resources :events do
        collection do
          get 'search'
          get 'nearby'
        end
        member do
          post 'publish'
          post 'cancel'
          get 'analytics'
        end
        resources :bookings, only: [:index, :create], controller: 'events/bookings'
      end

      # Bookings
      resources :bookings do
        member do
          post 'confirm'
          post 'cancel'
          get 'qr'
        end
        collection do
          post 'bulk_confirm'
          get 'availability'
          post 'verify_qr'
        end
      end

      # Check-ins
      resources :check_ins, only: [:create, :index] do
        collection do
          post 'bulk'
        end
      end

      # Analytics
      get 'analytics/dashboard', to: 'analytics#dashboard'
      get 'analytics/revenue', to: 'analytics#revenue'
      get 'analytics/registrations', to: 'analytics#registrations'
      get 'analytics/events', to: 'analytics#events'
      get 'analytics/events/:id', to: 'analytics#event'

      # Notifications
      resources :notifications, only: [:index, :show, :update] do
        collection do
          post 'mark_all_read'
          get 'unread_count'
        end
        member do
          post 'mark_read'
        end
      end

      # Payments
      resources :payments, only: [:index, :show, :create] do
        member do
          post 'confirm'
          post 'refund'
        end
      end

      # Webhooks
      post 'webhooks/stripe', to: 'webhooks#stripe'
      post 'webhooks/razorpay', to: 'webhooks#razorpay'
    end
  end

  # ActionCable for WebSocket connections
  mount ActionCable.server => '/cable'

  # Sidekiq Web UI (in development only)
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq' if defined?(Sidekiq::Web)

  # Defines the root path route ("/")
  # root "posts#index"
end
