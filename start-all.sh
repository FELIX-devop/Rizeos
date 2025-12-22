#!/bin/bash

echo "🚀 Starting RizeOS Local Development Environment"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check MongoDB
echo -e "${YELLOW}📊 Checking MongoDB...${NC}"
if command -v mongosh &> /dev/null; then
    if mongosh --quiet --eval "db.adminCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB might not be running. Please start it via MongoDB Compass or: brew services start mongodb-community${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  mongosh not found. Please check MongoDB Compass is running.${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Starting Backend...${NC}"
cd backend
if [ -f .env.local ]; then
    cp .env.local .env
fi
go run cmd/server/main.go &
BACKEND_PID=$!
cd ..

echo ""
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

echo ""
echo -e "${YELLOW}🎨 Starting Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Services starting!${NC}"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend:  http://localhost:8080"
echo "📍 API:      http://localhost:8080/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
