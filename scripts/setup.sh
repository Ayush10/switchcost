#!/bin/bash
set -e

echo "=== Inference Autopilot Setup ==="
echo ""

# Check for .env
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "!! IMPORTANT: Edit .env and add your API keys before running !!"
    echo ""
fi

# Backend setup
echo "Setting up Python backend..."
cd backend
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
fi

uv venv --python 3.11
source .venv/bin/activate
uv pip install fastapi "uvicorn[standard]" openai httpx pydantic python-dotenv tavily-python websockets numpy
cd ..

# Frontend setup
echo ""
echo "Setting up React frontend..."
cd frontend
npm install
cd ..

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To run:"
echo "  Terminal 1 (backend):  cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000"
echo "  Terminal 2 (frontend): cd frontend && npm run dev"
echo ""
echo "Dashboard will be at: http://localhost:5173"
echo "API docs at: http://localhost:8000/docs"
