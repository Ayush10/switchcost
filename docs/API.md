# API Reference

Base URL: `http://localhost:8000`

## Health Check

### `GET /health`

Returns server health status.

**Response:**
```json
{ "status": "ok" }
```

## Task Execution

### `POST /api/task`

Submit a task for execution in a single routing mode.

**Request body:**
```json
{
  "task": "Research the top AI companies and write an analysis.",
  "routing_mode": "optimized"   // "naive" or "optimized"
}
```

**Response:**
```json
{
  "task_id": "a1b2c3d4e5f6",
  "status": "running"
}
```

### `GET /api/task/{task_id}`

Get task status, subtasks, metrics, and summary.

**Response (running):**
```json
{
  "task_id": "a1b2c3d4e5f6",
  "status": "running",
  "task": "Research the top AI companies..."
}
```

**Response (completed):**
```json
{
  "task_id": "a1b2c3d4e5f6",
  "task": "Research the top AI companies...",
  "routing_mode": "optimized",
  "subtasks": [...],
  "step_metrics": [...],
  "summary": {
    "total_cost": 0.0023,
    "total_latency_ms": 4521,
    "avg_quality": 0.82,
    "total_input_tokens": 1200,
    "total_output_tokens": 3400,
    "step_count": 6,
    "models_used": ["nebius-small", "nebius-mid", "nebius-large"]
  },
  "status": "completed"
}
```

## Comparison

### `POST /api/run-comparison`

Run the same task in both naive and optimized modes for a before/after comparison. This is the primary endpoint for the dashboard demo.

**Request body:**
```json
{
  "task": "Research the top 5 AI cloud infrastructure companies..."
}
```

**Response:**
```json
{
  "comparison_id": "cmp-a1b2c3d4",
  "naive_task_id": "naive-e5f6g7h8",
  "optimized_task_id": "opt-i9j0k1l2"
}
```

### `GET /api/comparison/{comparison_id}`

Get comparison results. Poll this endpoint until `status` is `"completed"`.

**Response (completed):**
```json
{
  "comparison_id": "cmp-a1b2c3d4",
  "naive_task_id": "naive-e5f6g7h8",
  "optimized_task_id": "opt-i9j0k1l2",
  "task": "Research the top 5 AI...",
  "status": "completed",
  "comparison": {
    "cost_savings_pct": 62.5,
    "latency_savings_pct": 43.2,
    "quality_delta": 0.02,
    "naive_total_cost": 0.0089,
    "optimized_total_cost": 0.0033,
    "naive_total_latency_ms": 12400,
    "optimized_total_latency_ms": 7040
  }
}
```

## Metrics

### `GET /api/metrics/{task_id}`

Get detailed per-step metrics for a task.

**Response:**
```json
{
  "task_id": "a1b2c3d4e5f6",
  "steps": [
    {
      "task_id": "a1b2c3d4e5f6",
      "step_id": "1",
      "subtask_type": "search",
      "model_key": "tavily",
      "provider": "tavily",
      "model_id": "tavily-search",
      "input_tokens": 0,
      "output_tokens": 0,
      "latency_ms": 1200,
      "estimated_cost": 0.0,
      "quality_score": 0.75,
      "routing_mode": "optimized",
      "output_preview": "First 200 chars..."
    }
  ],
  "summary": { ... }
}
```

## Profiling

### `POST /api/profile`

Trigger a profiling run across all models and subtask types. Runs representative prompts against each model, measures performance, and updates the routing table.

**Response:**
```json
{
  "profile_id": "profile-a1b2c3d4",
  "status": "running"
}
```

Poll via `GET /api/task/{profile_id}` for results including `results`, `routing_changes`, and `new_routing_table`.

## Routing

### `GET /api/routing-table`

Get the current routing table (default or learned after profiling).

**Response:**
```json
{
  "classify": "nebius-small",
  "extract": "nebius-small",
  "summarize": "nebius-mid",
  "reason": "nebius-large",
  "search": "tavily",
  "generate": "nebius-mid"
}
```

### `GET /api/pareto`

Get Pareto frontier data for the cost-vs-quality scatter plot.

**Response:**
```json
[
  {
    "model_key": "nebius-small",
    "subtask_type": "classify",
    "avg_cost": 0.00003,
    "avg_quality": 0.78,
    "avg_latency_ms": 250,
    "is_optimal": true
  }
]
```

## Demo

### `GET /api/demo-task`

Get the pre-configured demo task for judges.

**Response:**
```json
{
  "task": "Research the top 5 AI cloud infrastructure companies..."
}
```

## WebSocket

### `WS /ws/metrics/{task_id}`

Connect to receive real-time metrics as each step completes.

**Message format:**
```json
{
  "event": "step_complete",
  "data": {
    "step_id": "3",
    "subtask_type": "summarize",
    "model_used": "Qwen/Qwen3-32B",
    "latency_ms": 342,
    "cost": 0.00012,
    "quality_score": 0.87,
    "output_preview": "First 100 chars..."
  }
}
```
