# frozen_string_literal: true

module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!, only: [:register, :login, :refresh, :forgot_password, :reset_password]

      # POST /api/v1/auth/register
      def register
        user = User.new(user_params)
        user.role = params[:role]&.to_sym || :attendee

        if user.save
          # Generate tokens
          access_token = JwtService.generate_access_token(user)
          refresh_token = JwtService.generate_refresh_token(user)

          render_success(
            data: {
              user: user_serializer(user),
              access_token: access_token,
              refresh_token: refresh_token
            },
            message: 'Registration successful',
            status: :created
          )
        else
          render_error(
            message: 'Registration failed',
            errors: user.errors.full_messages,
            status: :unprocessable_entity
          )
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: login_params[:email]&.downcase)

        if user&.authenticate(login_params[:password])
          unless user.active?
            return render_error(
              message: 'Account is inactive',
              status: :forbidden
            )
          end

          # Generate tokens
          access_token = JwtService.generate_access_token(user)
          refresh_token = JwtService.generate_refresh_token(user)

          # Update last login (if you have this field)
          user.touch(:updated_at)

          render_success(
            data: {
              user: user_serializer(user),
              access_token: access_token,
              refresh_token: refresh_token
            },
            message: 'Login successful'
          )
        else
          render_error(
            message: 'Invalid email or password',
            status: :unauthorized
          )
        end
      end

      # POST /api/v1/auth/refresh
      def refresh
        refresh_token = params[:refresh_token]

        unless refresh_token
          return render_error(
            message: 'Refresh token is required',
            status: :bad_request
          )
        end

        user = JwtService.verify_refresh_token(refresh_token)

        if user
          # Generate new tokens
          access_token = JwtService.generate_access_token(user)
          new_refresh_token = JwtService.generate_refresh_token(user)

          # Revoke old refresh token
          JwtService.revoke_refresh_token(user.id, refresh_token)

          render_success(
            data: {
              access_token: access_token,
              refresh_token: new_refresh_token
            },
            message: 'Token refreshed successfully'
          )
        else
          render_error(
            message: 'Invalid or expired refresh token',
            status: :unauthorized
          )
        end
      end

      # DELETE /api/v1/auth/logout
      def logout
        token = extract_token_from_header
        if token
          decoded = JwtService.decode(token)
          JwtService.blacklist_token(decoded['jti']) if decoded
        end

        # Revoke refresh token if provided
        if params[:refresh_token]
          JwtService.revoke_refresh_token(current_user.id, params[:refresh_token])
        end

        render_success(message: 'Logged out successfully')
      end

      # DELETE /api/v1/auth/logout_all
      def logout_all
        # Revoke all refresh tokens
        JwtService.revoke_all_refresh_tokens(current_user.id)

        render_success(message: 'Logged out from all devices')
      end

      # GET /api/v1/auth/me
      def me
        render_success(
          data: {
            user: user_serializer(current_user)
          }
        )
      end

      # POST /api/v1/auth/forgot_password
      def forgot_password
        user = User.find_by(email: params[:email]&.downcase)

        if user
          # Generate password reset token
          reset_token = SecureRandom.urlsafe_base64
          user.update(
            reset_password_token: reset_token,
            reset_password_sent_at: Time.current
          )

          # Send password reset email (implement with your mailer)
          # UserMailer.password_reset(user, reset_token).deliver_later

          render_success(
            message: 'Password reset instructions sent to your email'
          )
        else
          # Don't reveal if email exists for security
          render_success(
            message: 'If the email exists, password reset instructions have been sent'
          )
        end
      end

      # POST /api/v1/auth/reset_password
      def reset_password
        user = User.find_by(reset_password_token: params[:reset_token])

        unless user
          return render_error(
            message: 'Invalid or expired reset token',
            status: :unprocessable_entity
          )
        end

        # Check if token is expired (e.g., 1 hour)
        if user.reset_password_sent_at < 1.hour.ago
          return render_error(
            message: 'Reset token has expired',
            status: :unprocessable_entity
          )
        end

        if user.update(
          password: params[:password],
          password_confirmation: params[:password_confirmation],
          reset_password_token: nil,
          reset_password_sent_at: nil
        )
          render_success(message: 'Password reset successfully')
        else
          render_error(
            message: 'Password reset failed',
            errors: user.errors.full_messages,
            status: :unprocessable_entity
          )
        end
      end

      # PATCH /api/v1/auth/change_password
      def change_password
        unless current_user.authenticate(params[:current_password])
          return render_error(
            message: 'Current password is incorrect',
            status: :unprocessable_entity
          )
        end

        if current_user.update(
          password: params[:new_password],
          password_confirmation: params[:new_password_confirmation]
        )
          render_success(message: 'Password changed successfully')
        else
          render_error(
            message: 'Password change failed',
            errors: current_user.errors.full_messages,
            status: :unprocessable_entity
          )
        end
      end

      private

      def user_params
        params.require(:user).permit(
          :email,
          :password,
          :password_confirmation,
          :first_name,
          :last_name,
          :phone,
          :date_of_birth,
          :city,
          :state,
          :country
        )
      end

      def login_params
        params.require(:auth).permit(:email, :password)
      end

      def user_serializer(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          active: user.active,
          email_verified: user.email_verified,
          created_at: user.created_at
        }
      end

      def extract_token_from_header
        auth_header = request.headers['Authorization']
        return nil unless auth_header

        auth_header.split(' ').last if auth_header.start_with?('Bearer ')
      end
    end
  end
end

