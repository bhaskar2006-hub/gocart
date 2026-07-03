#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo " Starting GoCart Deployment Script"
echo "=========================================="

# 1. Check if we are in the root directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "Error: Please run this script from the root directory of the gocart repository."
  exit 1
fi

# 2. Check System Memory and Warn if Low (less than 1.5GB RAM)
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 1500 ]; then
  echo "WARNING: Your system has less than 1.5GB of RAM ($TOTAL_RAM MB)."
  echo "Next.js builds ('next build') can be very memory-intensive."
  echo "If the build fails, please set up a swap file using the following commands:"
  echo "  sudo fallocate -l 2G /swapfile"
  echo "  sudo chmod 600 /swapfile"
  echo "  sudo mkswap /swapfile"
  echo "  sudo swapon /swapfile"
  echo "  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab"
  echo "------------------------------------------"
fi

# 3. Setup Backend
echo "--> Configuring Backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install --no-audit --no-fund

# Load environment variables for Prisma setup
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Fallback DATABASE_URL if not set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./dev.db"
fi

# Generate Prisma Client
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations / push schema
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

# Seed Database
echo "Seeding database..."
node prisma/seed.js

cd ..

# 4. Setup Frontend
echo "--> Configuring Frontend..."
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install --no-audit --no-fund

# Run Next.js production build
echo "Building Next.js frontend application..."
npm run build

cd ..

# 5. Process Management with PM2
echo "--> Launching applications with PM2..."
if pm2 list | grep -q "gocart"; then
  echo "Applications are already running. Reloading PM2..."
  pm2 reload ecosystem.config.cjs --env production
else
  echo "Starting applications for the first time..."
  pm2 start ecosystem.config.cjs --env production
fi

# Save PM2 process list to restore on boot
pm2 save

echo "=========================================="
echo " Deployment completed successfully!"
echo "=========================================="
echo "To ensure applications start automatically on system reboot, run:"
echo "  pm2 startup"
echo "and then run the command that PM2 prints on your screen."
echo "=========================================="
