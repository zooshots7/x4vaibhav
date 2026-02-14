#!/bin/bash

echo "🔄 Restarting x402Metrics Services..."
echo ""

# Kill all node processes
echo "1️⃣  Killing all Node processes..."
killall -9 node 2>/dev/null
sleep 3

# Start backend first
echo "2️⃣  Starting Backend (port 3001)..."
cd /Users/vaibu/x402/backend
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
sleep 3

# Check if backend started
if curl -s http://localhost:3001/health > /dev/null; then
    echo "   ✅ Backend running on http://localhost:3001"
else
    echo "   ❌ Backend failed to start"
    cat /tmp/backend.log
    exit 1
fi

# Start frontend
echo "3️⃣  Starting Frontend..."
cd /Users/vaibu/x402/frontend
rm -rf .next/dev/lock
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
sleep 5

# Find frontend port
FRONTEND_PORT=$(cat /tmp/frontend.log | grep -o "localhost:[0-9]*" | head -1 | cut -d: -f2)
echo "   ✅ Frontend running on http://localhost:$FRONTEND_PORT"

echo ""
echo "🎉 Services Started!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "💡 To switch roles: Click the dropdown next to 'Viewing as: Provider'"
