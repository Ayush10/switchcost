# Architecture

## System Overview

Inference Autopilot is a self-optimizing agentic inference system with a Python/FastAPI backend and React/Vite frontend. It decomposes complex tasks into typed subtasks, routes each to the optimal model, and learns cost-quality tradeoffs over time.

## Data Flow

```
1. User Input (TaskInput.jsx)
   |
   v
2. POST /api/run-comparison (routes.py)
   |
   v
3. Task Decomposer (decomposer.py)
   - Uses nebius-mid (Qwen/Qwen3-32B) to break task into subtasks
   - Output: list of Subtask objects with type, complexity, dependencies
   |
   v
4. Smart Router (router.py)
   - Naive mode:  all subtasks -> nebius-large (DeepSeek-R1-0528)
   - Optimized:   subtask type -> best model from learned routing table
   |
   v
5. Execution
   - Search subtasks -> Tavily API (tavily_search.py)
   - All other subtasks -> InferenceProvider (provider.py)
     - Nebius Token Factory (OpenAI-compatible, custom base_url)
     - OpenRouter (OpenAI-compatible, custom base_url)
   |
   v
6. Quality Evaluation (quality.py)
   - LLM-as-judge using nebius-small
   - Scores each output 1-10, normalized to 0-1
   - Fallback: 0.5 if evaluation fails
   |
   v
7. Metrics Collection (metrics.py)
   - Per-step: tokens, latency, cost, quality, model used
   - Aggregates: total cost, avg latency, avg quality
   - Comparison: naive vs optimized deltas
   |
   v
8. Routing Optimizer (optimizer.py)
   - Analyzes profiling data
   - Efficiency score: quality / (cost * 1000) - (latency / 10000)
   - Updates routing table with best model per subtask type
   - Computes Pareto frontier for visualization
   |
   v
9. Frontend Dashboard (App.jsx)
   - Polls /api/comparison/{id} every 2 seconds
   - Renders: MetricsPanel, CostChart, LatencyChart,
     StepTimeline, ModelUsage, ParetoChart
```

## Component Diagram

```
+---------------------+       +---------------------+
|     Frontend        |       |     Backend          |
|  (React + Vite)     |       |  (FastAPI + Uvicorn) |
|                     |       |                      |
| TaskInput           |  HTTP | routes.py            |
| MetricsPanel        |<----->| websocket.py         |
| CostChart           |  WS   |                      |
| LatencyChart        |       | core/                |
| StepTimeline        |       |   decomposer.py      |
| ModelUsage          |       |   router.py          |
| ParetoChart         |       |   profiler.py        |
|                     |       |   metrics.py         |
| hooks/              |       |   optimizer.py       |
|   useWebSocket.js   |       |   quality.py         |
| utils/              |       |                      |
|   api.js            |       | services/            |
+---------------------+       |   provider.py        |
                               |   tavily_search.py   |
                               +---------------------+
                                    |          |
                          +---------+          +----------+
                          |                               |
                  +-------v-------+            +----------v---------+
                  | Nebius Token  |            | OpenRouter          |
                  | Factory API   |            | API                 |
                  | (3 model tiers)|           | (2 model tiers)     |
                  +---------------+            +--------------------+
                                                        |
                                               +--------v---------+
                                               | Tavily Search    |
                                               | API              |
                                               +------------------+
```

## Model Registry

| Key | Provider | Model | Tier | Cost/1M In | Cost/1M Out | Use Case |
|-----|----------|-------|------|-----------|------------|----------|
| nebius-small | Nebius | Meta-Llama-3.1-8B-Instruct-fast | small | $0.03 | $0.09 | Classification, extraction |
| nebius-mid | Nebius | Qwen/Qwen3-32B | mid | $0.14 | $0.14 | Summarization, analysis |
| nebius-large | Nebius | DeepSeek-R1-0528 | large | $0.80 | $2.40 | Complex reasoning |
| openrouter-small | OpenRouter | openai/gpt-oss-20b | small | $0.05 | $0.20 | Tool use, structured output |
| openrouter-mid | OpenRouter | qwen/qwen3-30b-a3b | mid | $0.10 | $0.30 | Instruction following |

## Routing Strategies

**Default (optimized) routing:**
- classify -> nebius-small
- extract -> nebius-small
- summarize -> nebius-mid
- reason -> nebius-large
- search -> tavily
- generate -> nebius-mid

**Naive routing (baseline for comparison):**
- All subtask types -> nebius-large (except search -> tavily)

After profiling, the optimizer updates the default routing table based on measured efficiency scores per (model, subtask_type) pair.

## State Management

All state is in-memory (no database). This includes:
- `task_store` dict in routes.py (task results, comparisons, profiles)
- `MetricsEngine` stores per-task step metrics
- `SmartRouter` stores routing table and performance history
- `RoutingOptimizer` stores profiling results and Pareto data

## Frontend Architecture

- `App.jsx` is the root component managing all state
- Polling-based updates (2-second interval) for task/comparison status
- WebSocket available at `/ws/metrics/{task_id}` for real-time step streaming
- All charts use Recharts library
- Styling via TailwindCSS with custom dark theme and neon accents
