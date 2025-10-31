#!/bin/bash

echo "=== Clean Dev Server Startup ==="
echo ""

# Kill any existing Next.js dev servers
echo "1. Checking for running dev servers..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   Found dev server on port 3000, killing..."
  pkill -f "next dev"
  sleep 2
  echo "   ✓ Killed all Next.js processes"
else
  echo "   ✓ No existing dev servers found"
fi

# Verify port is free
echo ""
echo "2. Verifying port 3000 is available..."
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "   ✗ Port 3000 is still in use!"
  echo "   Run: lsof -ti:3000 | xargs kill -9"
  exit 1
else
  echo "   ✓ Port 3000 is free"
fi

# Verify database connection
echo ""
echo "3. Testing database connection..."
npx tsx verify-connection.ts || exit 1

# Start dev server
echo ""
echo "4. Starting Next.js dev server..."
echo ""
npm run dev
