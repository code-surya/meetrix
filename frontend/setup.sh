#!/bin/bash

echo "🚀 Setting up Meetrix Frontend"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Setting up environment file..."
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update .env with your actual API keys and configuration"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p public

echo ""
echo "🎉 Frontend setup complete!"
echo ""
echo "🚀 To start development server:"
echo "   npm run dev"
echo ""
echo "📊 To build for production:"
echo "   npm run build"
echo ""
echo "🔍 To preview production build:"
echo "   npm run preview"
echo ""
echo "📝 Demo credentials:"
echo "   Admin: admin@meetrix.com / password123"
echo "   Organizer: organizer1@meetrix.com / password123"
echo "   Attendee: attendee1@meetrix.com / password123"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo ""
echo "📚 Read the README.md for more information"

