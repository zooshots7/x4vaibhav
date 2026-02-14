#!/bin/bash

# Start backend
cd backend
npm start > /dev/null 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend
sleep 3

# Start frontend
cd ../frontend
PORT=3000 npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "Services running:"
echo "  Backend: http://localhost:3001"
echo "  Frontend: http://localhost:3000"
echo ""
echo "To stop: killall -9 node"
