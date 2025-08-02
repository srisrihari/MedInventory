#!/usr/bin/env bash
# Build script for Render deployment

echo "🚀 Building MedInventory Backend..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs

# Set environment variables for production
export PYTHONPATH="${PYTHONPATH}:${PWD}"

echo "✅ Build completed successfully!"
echo "🎯 Starting Gunicorn server..."

# Start the application with Gunicorn
exec gunicorn app.main:app -c gunicorn_config.py 