# frozen_string_literal: true

namespace :security do
  desc 'Run security audit on the codebase'
  task audit: :environment do
    puts '🔒 Running Security Audit...'

    # Check for SQL injection vulnerabilities
    puts 'Checking for SQL injection patterns...'
    sql_injection_files = []
    Dir.glob('app/**/*.rb').each do |file|
      content = File.read(file)
      if content.match?(/where.*#\{.*\}|where.*\+.*|find_by_sql|execute/)
        sql_injection_files << file
      end
    end

    if sql_injection_files.any?
      puts "⚠️  Potential SQL injection vulnerabilities found in:"
      sql_injection_files.each { |file| puts "  - #{file}" }
    else
      puts '✅ No SQL injection patterns found'
    end

    # Check for mass assignment vulnerabilities
    puts 'Checking for mass assignment vulnerabilities...'
    mass_assignment_files = []
    Dir.glob('app/controllers/**/*.rb').each do |file|
      content = File.read(file)
      if content.match?(/params\[:\w+\]\.permit!/)
        mass_assignment_files << file
      end
    end

    if mass_assignment_files.any?
      puts "⚠️  Mass assignment vulnerabilities found in:"
      mass_assignment_files.each { |file| puts "  - #{file}" }
    else
      puts '✅ No mass assignment vulnerabilities found'
    end

    # Check for missing CSRF protection
    puts 'Checking for CSRF protection...'
    csrf_issues = []
    Dir.glob('app/controllers/**/*.rb').each do |file|
      content = File.read(file)
      next if file.include?('api/') # API controllers might not need CSRF

      if content.match?(/protect_from_forgery/) && !content.match?(/protect_from_forgery.*false/)
        # Has CSRF protection
      else
        csrf_issues << file
      end
    end

    if csrf_issues.any?
      puts "⚠️  Missing CSRF protection in:"
      csrf_issues.each { |file| puts "  - #{file}" }
    else
      puts '✅ CSRF protection properly configured'
    end

    # Check for hardcoded secrets
    puts 'Checking for hardcoded secrets...'
    secret_files = []
    Dir.glob('**/*.{rb,yml,yaml}').each do |file|
      next if file.include?('log/') || file.include?('tmp/')

      content = File.read(file)
      if content.match?(/password.*=|secret.*=|key.*=|token.*=/i) &&
         !file.include?('config/credentials') &&
         !file.include?('config/database.yml')
        secret_files << file
      end
    end

    if secret_files.any?
      puts "⚠️  Potential hardcoded secrets found in:"
      secret_files.each { |file| puts "  - #{file}" }
    else
      puts '✅ No hardcoded secrets found'
    end

    puts '🔒 Security audit completed!'
  end

  desc 'Run performance audit'
  task performance: :environment do
    puts '⚡ Running Performance Audit...'

    # Check for N+1 queries
    puts 'Checking for N+1 query patterns...'
    n_plus_one_files = []
    Dir.glob('app/**/*.rb').each do |file|
      content = File.read(file)
      if content.match?(/\w+\.\w+\.each\s*do\s*\|.*\|\s*\w+\.\w+/) &&
         !content.match?(/includes\(|joins\(|preload\(|eager_load\(/)
        n_plus_one_files << file
      end
    end

    if n_plus_one_files.any?
      puts "⚠️  Potential N+1 queries found in:"
      n_plus_one_files.each { |file| puts "  - #{file}" }
    else
      puts '✅ No obvious N+1 query patterns found'
    end

    # Check for missing database indexes
    puts 'Checking database indexes...'
    # This would require analyzing the database schema
    puts '📊 Database index analysis requires manual review'

    puts '⚡ Performance audit completed!'
  end
end
