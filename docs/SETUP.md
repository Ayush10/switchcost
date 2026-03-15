# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- npm

## Environment Variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env
```

Required keys in `.env`:

```
NEBIUS_API_KEY=your_nebius_token_factory_key
OPENROUTER_API_KEY=your_openrouter_key
TAVILY_API_KEY=your_tavily_key
TOLOKA_API_KEY=your_toloka_key          # optional, stretch goal
```

## Automated Setup

```bash
chmod +x scripts/setup.sh
bash scripts/setup.sh
```

This will:
1. Check for `.env` (copy from `.env.example` if missing)
2. Install `uv` if not present
3. Create a Python 3.11 virtual environment
4. Install backend dependencies
5. Run `npm install` for the frontend

## Manual Setup

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate      # Linux/macOS
# or: .venv\Scripts\activate   # Windows
uv pip install -r ../pyproject.toml
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

Backend will be available at http://localhost:8000
API docs (Swagger UI) at http://localhost:8000/docs

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Dashboard will be available at http://localhost:5173

## Verifying the Setup

1. Open http://localhost:8000/health -- should return `{"status": "ok"}`
2. Open http://localhost:5173 -- should show the Inference Autopilot dashboard
3. Click "Load Demo Task" to populate the input with a sample task
4. Click "Run Comparison" to execute the naive vs optimized comparison

## Troubleshooting

**Backend won't start:**
- Ensure `.env` exists in the project root with valid API keys
- Ensure you activated the virtual environment
- Check Python version: `python --version` (needs 3.11+)

**Frontend won't start:**
- Ensure `npm install` completed successfully
- Check Node version: `node --version` (needs 18+)

**API calls failing:**
- Verify your Nebius API key is valid at https://console.nebius.com
- Verify your OpenRouter API key at https://openrouter.ai/keys
- Verify your Tavily API key at https://tavily.com

**CORS errors:**
- The backend is configured to allow all origins in development
- Ensure both backend (port 8000) and frontend (port 5173) are running
