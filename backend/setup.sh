#!/bin/bash

# MedInventory Backend Setup Script
# This script sets up the backend environment and installs dependencies

echo "🚀 Setting up MedInventory Backend..."
echo "====================================="

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed"
    echo "Please install python3 first:"
    echo "  sudo apt update"
    echo "  sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Check if python3-venv is available
if ! python3 -m venv --help &> /dev/null; then
    echo "❌ Error: python3-venv is not installed"
    echo "Please install it first:"
    echo "  sudo apt update"
    echo "  sudo apt install python3-venv"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ Python3-venv is available"

# Check if we're in the backend directory
if [ ! -f "requirements-minimal.txt" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "Current directory: $(pwd)"
    echo "Expected files: requirements-minimal.txt should be present"
    exit 1
fi

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo "🗑️  Removing existing virtual environment..."
    rm -rf venv
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
if ! python3 -m venv venv; then
    echo "❌ Error: Failed to create virtual environment"
    echo "Please ensure python3-venv is installed:"
    echo "  sudo apt install python3-venv"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [ ! -f "venv/bin/activate" ]; then
    echo "❌ Error: Virtual environment was not created properly"
    exit 1
fi
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install minimal requirements
echo "📥 Installing dependencies..."
pip install -r requirements-minimal.txt

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Copy env_template.txt to .env and add your Supabase credentials"
echo "3. Run the database setup script in Supabase SQL Editor (init_database.sql)"
echo "4. Start the server:"
echo "   source venv/bin/activate"
echo "   python3 start_server.py"
echo ""
echo "📖 API Documentation will be available at: http://localhost:8000/docs"
echo "❤️  Health Check: http://localhost:8000/health"
echo ""