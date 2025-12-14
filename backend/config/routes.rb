# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/register', to: 'auth#register'
      post 'auth/login', to: 'auth#login'
      post 'auth/refresh', to: 'auth#refresh'
      delete 'auth/logout', to: 'auth#logout'
      delete 'auth/logout_all', to: 'auth#logout_all'
      get 'auth/me', to: 'auth#me'
      post 'auth/forgot_password', to: 'auth#forgot_password'
      post 'auth/reset_password', to: 'auth#reset_password'
      patch 'auth/change_password', to: 'auth#change_password'

      # Events
      resources :events, only: [:index, :show, :create, :update, :destroy] do
        collection do
          get 'search', to: 'events#search'
        end
        member do
          patch 'publish', to: 'events#publish'
          patch 'cancel', to: 'events#cancel'
          get 'analytics', to: 'events#analytics'
        end
        resources :tickets, only: [:index, :create, :update, :destroy], controller: 'ticket_types'
        resources :bookings, only: [:index, :create]
        resources :reviews, only: [:index, :create]
      end

      # Bookings
      resources :bookings, only: [:index, :show, :create, :update] do
        collection do
          get 'availability', to: 'bookings#check_availability'
          post 'verify_qr', to: 'bookings#verify_qr'
        end
        member do
          patch 'cancel', to: 'bookings#cancel'
          post 'confirm', to: 'bookings#confirm'
        end
      end

      # Check-ins (Organizer only)
      resources :events do
        resources :check_ins, only: [] do
          collection do
            post 'verify_qr', to: 'check_ins#verify_qr'
            post 'bulk_check_in', to: 'check_ins#bulk_check_in'
            get 'attendance', to: 'check_ins#event_attendance'
          end
          member do
            post 'check_in', to: 'check_ins#check_in'
          end
        end
      end

      # Groups
      resources :groups, only: [:index, :show, :create, :update, :destroy] do
        member do
          post 'join', to: 'groups#join'
          delete 'leave', to: 'groups#leave'
          delete 'members/:member_id', to: 'groups#remove_member'
          post 'book', to: 'groups#create_booking'
        end
        resources :members, only: [:index], controller: 'group_members'
      end

      # Notifications
      resources :notifications, only: [:index, :show, :update] do
        collection do
          get 'unread', to: 'notifications#unread'
          patch 'mark_all_read', to: 'notifications#mark_all_read'
        end
        member do
          patch 'read', to: 'notifications#mark_read'
        end
      end

      # Payments
      resources :payments, only: [:index, :show, :create] do
        member do
          post 'confirm', to: 'payments#confirm'
          post 'refund', to: 'payments#refund'
          get 'status', to: 'payments#status'
        end
      end

      # Webhooks
      post 'webhooks/stripe', to: 'webhooks#stripe'
      post 'webhooks/razorpay', to: 'webhooks#razorpay'

      # Users
      resources :users, only: [:show, :update] do
        member do
          get 'bookings', to: 'users#bookings'
          get 'events', to: 'users#organized_events'
        end
      end

      # Search
      get 'search/events', to: 'search#events'
      get 'search/suggestions', to: 'search#suggestions'

      # Analytics (organizer/admin only)
      namespace :analytics do
        get 'dashboard', to: 'analytics#dashboard'
        get 'revenue', to: 'analytics#revenue'
        get 'registrations', to: 'analytics#registrations'
        get 'events', to: 'analytics#events'
        get 'events/:event_id', to: 'analytics#event_analytics'
        get 'ticket-types', to: 'analytics#ticket_types'
      end
    end
  end

  # Health check
  get 'health', to: 'health#check'
end

