#!/bin/bash

echo "🚀 Setting up Meetrix Event Management Platform"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Pulling required Docker images..."
docker-compose pull

echo "🏗️  Building application containers..."
docker-compose build

echo "🗃️  Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

echo "⏳ Waiting for databases to be ready..."
sleep 10

echo "⚙️  Setting up Rails application..."
docker-compose run --rm backend bash -c "
  bundle install &&
  rails db:create &&
  rails db:migrate &&
  rails db:seed
"

echo "📱 Setting up React application..."
docker-compose run --rm frontend npm install

echo "🎉 Setup complete! Starting all services..."
docker-compose up -d

echo ""
echo "🎊 Meetrix is now running!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3000"
echo "🗄️  Database: localhost:5432"
echo "🔄 Redis: localhost:6379"
echo ""
echo "📝 Default admin credentials:"
echo "   Email: admin@meetrix.com"
echo "   Password: password123"
echo ""
echo "To stop the application: docker-compose down"
echo "To view logs: docker-compose logs -f"
