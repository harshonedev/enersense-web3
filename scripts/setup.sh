#!/bin/bash

# EnerSense Setup Script
# This script helps you set up the development environment

set -e

echo "========================================="
echo "  EnerSense Web3 Setup"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version $NODE_VERSION is too old${NC}"
    echo "Please upgrade to Node.js 18 or higher"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check npm
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Install blockchain dependencies
echo ""
echo "Installing blockchain dependencies..."
cd blockchain
npm install
cd ..
echo -e "${GREEN}✓ Blockchain dependencies installed${NC}"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
    echo -e "${YELLOW}⚠ Please edit .env.local with your actual credentials${NC}"
else
    echo -e "${YELLOW}⚠ .env.local already exists, skipping...${NC}"
fi

# Create blockchain .env if it doesn't exist
if [ ! -f blockchain/.env ]; then
    echo ""
    echo "Creating blockchain/.env file..."
    cd blockchain
    cp .env.example .env
    cd ..
    echo -e "${YELLOW}⚠ Please edit blockchain/.env with your private key${NC}"
else
    echo -e "${YELLOW}⚠ blockchain/.env already exists, skipping...${NC}"
fi

# Compile smart contracts
echo ""
echo "Compiling smart contracts..."
cd blockchain
npm run compile
cd ..
echo -e "${GREEN}✓ Smart contracts compiled${NC}"

echo ""
echo "========================================="
echo -e "${GREEN}  Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment:"
echo "   - Edit .env.local with Supabase, Tuya, and kWALA credentials"
echo "   - Edit blockchain/.env with deployment private key"
echo ""
echo "2. Set up Supabase database:"
echo "   - Create a project at https://supabase.com"
echo "   - Run the SQL in supabase/schema.sql"
echo ""
echo "3. Deploy smart contracts:"
echo "   cd blockchain"
echo "   npm run deploy:baseSepolia"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "5. Visit http://localhost:3000"
echo ""
echo "For more information, see README.md"
echo ""
