# Inference Autopilot

## Product Vision

**Inference Autopilot** is a migration and optimization engine that helps AI teams safely move from expensive proprietary models (GPT-4, Claude, Gemini) to open-source models on Nebius Token Factory, cutting inference costs by 50-90% without sacrificing output quality.

You plug it into your existing agentic workflow. It captures your real calls. It replays each one against tiered open models on Nebius Token Factory and OpenRouter. It measures quality, latency, and cost for every replay. Then it builds a concrete migration plan: which calls can safely move to which open model, with hard numbers on savings and quality parity.

**This is the product every AI startup founder in SF needs today.** They know open models are cheaper. They are afraid to switch because "what if quality drops." Inference Autopilot removes that fear with data.

**Built for:** Nebius Build SF Hackathon (March 15, 2026)
**Track:** Edge Inference & Agents (Statement 1)
**Team:** Solo (Ayush)
**Time budget:** ~6 hours

## The Problem

AI teams building agents on proprietary APIs (OpenAI, Anthropic, Google) face a cost crisis:
- GPT-4o costs $2.50-10/M tokens. Claude costs $3-15/M tokens.
- A production agent making 100k calls/day can cost $3,000-15,000/month in inference.
- Open models on Nebius Token Factory cost $0.03-2.40/M tokens (10-100x cheaper).
- Teams don't migrate because they have NO VISIBILITY into which calls can safely move without quality regression.

The result: AI startups bleed money on inference while cheaper open-model alternatives go unused.

## The Solution

Inference Autopilot is a 3-step migration engine:

### Step 1: Capture
Ingest a complex agentic task (or a batch of real tasks). Decompose it into typed subtasks: classification, extraction, summarization, reasoning, search, generation.

### Step 2: Replay and Profile
Run the baseline on the most expensive model (simulating proprietary). Then replay every subtask against each open model tier on Nebius Token Factory and OpenRouter. For each replay, measure quality (LLM-as-judge vs baseline), latency, and exact cost.

### Step 3: Migration Plan
For each subtask type, recommend the cheapest open model that maintains quality parity (>= 80% match). Show projected monthly savings. Show the quality matrix. Let users adjust the volume slider to see how savings scale.

## Architecture

```
Agentic Task Input
        |
        v
+--------------------+
| Task Decomposer    |  Breaks into typed subtasks
+--------------------+
        |
        v
+--------------------+
| Baseline Runner    |  Runs everything on expensive model (simulates proprietary)
+--------------------+
        |
        v
+--------------------+
| Replay Engine      |  Replays same subtasks against each open model tier
+--------------------+
   /     |      \
  v      v       v
+------+-------+--------+
|Small | Mid   | Large  |  Nebius Token Factory + OpenRouter models
+------+-------+--------+
        |
        v
+--------------------+
| Quality Comparator |  Scores open model output vs baseline (LLM-as-judge)
+--------------------+
        |
        v
+--------------------+
| Migration Planner  |  Recommends cheapest model per subtask type that passes quality bar
+--------------------+
        |
        v
+--------------------+
| Savings Calculator |  Projects monthly cost reduction at user-specified volume
+--------------------+
        |
        v
+--------------------+
| Dashboard          |  Migration plan, savings, quality matrix, cost charts
+--------------------+
```

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, asyncio, uvicorn
- **Frontend:** React (Vite), TailwindCSS, Recharts
- **Inference:** Nebius Token Factory + OpenRouter (both OpenAI-compatible)
- **Search:** Tavily API
- **Quality Eval:** LLM-as-judge + optional Toloka human eval
- **Package Manager:** uv (Python), npm (frontend)

## Environment Variables

```bash
NEBIUS_API_KEY=your_nebius_token_factory_key
OPENROUTER_API_KEY=your_openrouter_key
TAVILY_API_KEY=your_tavily_key
```

## Model Registry

```python
MODEL_REGISTRY = {
    "nebius-small": {
        "provider": "nebius",
        "model_id": "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
        "tier": "small",
        "cost_per_1m_input": 0.03,
        "cost_per_1m_output": 0.09,
        "display_name": "Llama 3.1 8B",
        "color": "#22d3ee",
    },
    "nebius-mid": {
        "provider": "nebius",
        "model_id": "Qwen/Qwen3-32B",
        "tier": "mid",
        "cost_per_1m_input": 0.14,
        "cost_per_1m_output": 0.14,
        "display_name": "Qwen3 32B",
        "color": "#a78bfa",
    },
    "nebius-large": {
        "provider": "nebius",
        "model_id": "deepseek-ai/DeepSeek-R1-0528",
        "tier": "large",
        "cost_per_1m_input": 0.80,
        "cost_per_1m_output": 2.40,
        "display_name": "DeepSeek R1",
        "color": "#f97316",
    },
    "openrouter-small": {
        "provider": "openrouter",
        "model_id": "openai/gpt-oss-20b",
        "tier": "small",
        "cost_per_1m_input": 0.05,
        "cost_per_1m_output": 0.20,
        "display_name": "GPT-OSS 20B",
        "color": "#34d399",
    },
    "openrouter-mid": {
        "provider": "openrouter",
        "model_id": "qwen/qwen3-30b-a3b",
        "tier": "mid",
        "cost_per_1m_input": 0.10,
        "cost_per_1m_output": 0.30,
        "display_name": "Qwen3 30B MoE",
        "color": "#fb923c",
    },
}

# Reference pricing for proprietary models (for savings calculator UI)
PROPRIETARY_PRICING = {
    "gpt-4o": {"cost_per_1m_input": 2.50, "cost_per_1m_output": 10.00, "display_name": "GPT-4o"},
    "gpt-4-turbo": {"cost_per_1m_input": 10.00, "cost_per_1m_output": 30.00, "display_name": "GPT-4 Turbo"},
    "claude-3.5-sonnet": {"cost_per_1m_input": 3.00, "cost_per_1m_output": 15.00, "display_name": "Claude 3.5 Sonnet"},
    "gemini-1.5-pro": {"cost_per_1m_input": 1.25, "cost_per_1m_output": 5.00, "display_name": "Gemini 1.5 Pro"},
}
```

## Directory Structure

```
inference-autopilot/
├── CLAUDE.md
├── README.md
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── core/
│   │   ├── decomposer.py        # Task decomposition
│   │   ├── baseline.py          # Run baseline on expensive model
│   │   ├── replay.py            # Replay against all open models
│   │   ├── comparator.py        # Quality comparison (LLM-as-judge)
│   │   ├── planner.py           # Migration plan builder
│   │   ├── savings.py           # Savings calculator
│   │   └── metrics.py           # Metrics collection
│   ├── services/
│   │   ├── provider.py          # Unified Nebius/OpenRouter client
│   │   └── tavily_search.py     # Tavily integration
│   ├── api/
│   │   ├── routes.py            # REST endpoints
│   │   └── websocket.py         # Live streaming
│   └── models/
│       └── schemas.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TaskInput.jsx
│   │   │   ├── MigrationPlan.jsx   # Hero component: the migration table
│   │   │   ├── SavingsPanel.jsx    # Big savings number + volume slider
│   │   │   ├── QualityMatrix.jsx   # Heatmap of quality scores
│   │   │   ├── CostChart.jsx       # Before/after bar chart
│   │   │   ├── StepTimeline.jsx    # Replay step cards
│   │   │   └── ParetoChart.jsx     # Cost vs quality scatter
│   │   ├── hooks/useWebSocket.js
│   │   └── utils/api.js
│   └── ...config files
├── scripts/setup.sh
├── pyproject.toml
└── .env.example
```

## Implementation Plan (Priority Order)

### Phase 1: Core Infrastructure (Hour 1-2)
1. FastAPI app with CORS and health check
2. `config.py` with model registry AND proprietary pricing table
3. `provider.py` unified Nebius + OpenRouter async client (openai SDK)
4. `tavily_search.py` wrapper
5. `schemas.py` Pydantic models
6. Test: all providers connect successfully

### Phase 2: Capture and Baseline (Hour 2-3)
1. `decomposer.py`: decompose task into typed subtasks using nebius-mid
2. `baseline.py`: run all subtasks through nebius-large (expensive proxy for GPT-4 class). Record outputs, costs, latencies, token counts.
3. `metrics.py`: wrap every call, record StepMetric objects, compute aggregates
4. Test: decompose a task and run baseline, see metrics

### Phase 3: Replay, Compare, Plan (Hour 3-4.5)
1. `replay.py`: for each subtask, replay against ALL open model tiers. Record (subtask_type, model_key) -> {output, cost, latency, tokens}
2. `comparator.py`: LLM-as-judge comparing each replay output vs baseline output. Score 0-100. Store quality matrix.
3. `planner.py`: for each subtask_type, find cheapest model with quality >= 80. Build migration plan.
4. `savings.py`: project monthly savings at configurable daily call volume. Compare vs each proprietary model.
5. Test: full pipeline produces a migration plan with savings numbers

### Phase 4: API Endpoints (Hour 4.5-5)
1. `POST /api/analyze` -- main endpoint, runs full pipeline, returns analysis_id
2. `GET /api/analyze/{id}` -- poll status, get results when done
3. `GET /api/analyze/{id}/plan` -- migration plan only
4. `GET /api/analyze/{id}/quality-matrix` -- quality scores heatmap data
5. `POST /api/savings-calculator` -- custom savings with user-provided volume and proprietary model choice
6. `GET /api/demo-task` -- pre-configured demo
7. `WS /ws/analyze/{id}` -- stream progress

### Phase 5: Frontend Dashboard (Hour 5-6)
Layout from top to bottom:

**Header:** "Inference Autopilot" with subtitle "Migrate from proprietary to open models. See exactly what you save."

**Panel 1: Task Input**
- Textarea + "Analyze Migration" button + "Load Demo" button
- Progress bar with status text during analysis

**Panel 2: Migration Plan (HERO -- make this beautiful)**
- Card for each subtask type:
  - Left side: current model ("GPT-4 class"), cost badge
  - Arrow pointing right
  - Right side: recommended open model ("Llama 3.1 8B on Nebius"), cost badge
  - Quality parity bar (96% = green, 83% = yellow, etc.)
  - Cost reduction badge ("97% cheaper")
  - Verdict: green "MIGRATE" or yellow "KEEP"
- Summary row at bottom: "X of Y call types can migrate. Total cost reduction: Z%"

**Panel 3: Savings Calculator**
- HUGE number: "$3,420/mo savings"
- Current vs migrated cost comparison
- Slider: "Daily call volume" (100 to 1,000,000). Savings update in real time.
- Dropdown: "Migrating from:" (GPT-4o, Claude 3.5, Gemini Pro). Savings update per selection.

**Panel 4: Evidence**
- Quality matrix heatmap
- Cost comparison bar chart (per subtask type)
- Replay timeline (scrollable)

### Phase 6: Polish and Demo (Last 30 min)
1. "Demo Mode" button
2. Polish migration plan UI
3. Record 1-min video
4. Push public GitHub
5. README with sponsor attributions

## Demo Script (3 minutes for judges)

**Opening (20s):**
"Every AI team I know spends $3,000 to $15,000 a month on OpenAI or Anthropic inference. They know open models on Nebius are 10 to 50x cheaper. But they don't switch because they're scared of quality drops. Inference Autopilot fixes that."

**The Product (30s):**
"Give it a sample of your agent's workload. It captures the baseline, replays every call against open models on Nebius Token Factory, scores quality, and builds a concrete migration plan with projected savings."

**Live Demo (90s):**
- Load demo task, click "Analyze Migration"
- Watch progress stream: "Running baseline... Replaying against Llama 8B... Qwen 32B... Scoring quality..."
- Migration plan appears:
  - "Classification: migrate to Llama 8B. 96% quality. 97% cheaper."
  - "Summarization: migrate to Qwen 32B. 94% quality. 85% cheaper."
  - "Reasoning: migrate to DeepSeek R1 on Nebius. 91% quality. 70% cheaper than GPT-4o."
- Show savings: "$3,420/mo saved at 10k calls/day"
- Drag volume slider to 100k: "$34,200/mo saved"
- Switch dropdown from GPT-4o to Claude 3.5: savings change

**Close (20s):**
"This is the missing piece for Nebius Token Factory adoption. Teams want to switch. They need proof that quality holds. Inference Autopilot gives them that proof with real data."

## Quality Comparison Prompt

```
You are a quality comparison judge. You will see two AI outputs for the same task.

Output A is the BASELINE (from an expensive model).
Output B is from an OPEN-SOURCE model being evaluated as a replacement.

Score how well Output B matches Output A on a scale of 0-100:
- 95-100: Indistinguishable quality. Perfect replacement.
- 85-94: Minor differences. Fully acceptable replacement.
- 75-84: Noticeable differences but still usable.
- 60-74: Significant quality gap.
- <60: Not suitable as replacement.

Consider: accuracy, completeness, coherence, and usefulness.

Return ONLY JSON (no markdown): {"score": 92, "reasoning": "Brief explanation"}
```

## Migration Plan Data Format

```python
@dataclass
class MigrationRecommendation:
    subtask_type: str                # "classify", "summarize", etc.
    baseline_model: str              # "nebius-large" (proxy for GPT-4)
    baseline_cost_per_call: float    # actual cost from baseline run
    recommended_model: str           # "nebius-small"
    recommended_display_name: str    # "Llama 3.1 8B on Nebius"
    recommended_cost_per_call: float # actual cost from replay
    quality_parity_score: float      # 0.0 to 1.0
    cost_reduction_pct: float        # e.g. 96.3
    verdict: str                     # "MIGRATE" or "KEEP"
    call_count_in_task: int          # how many calls of this type in the sample
```

## Important Notes for Claude Code

1. Use `uv` for Python packages, not pip
2. All API clients use `openai` Python SDK with custom base_url
3. The migration plan table is the HERO UI element. Make it professional and clear.
4. Do NOT use Streamlit (banned by hackathon)
5. GitHub repo must be public
6. Do not use em-dashes anywhere
7. Quality threshold for "MIGRATE" verdict is 0.80 (80%)
8. The baseline uses nebius-large but label it "GPT-4 class" in the UI
9. Savings calculator must have an interactive volume slider
10. The "Migrating from" dropdown should reference proprietary pricing table
11. Stream analysis progress via WebSocket so the demo feels live
12. Error handling on all API calls. Show errors gracefully in UI.

## Demo Task

```
Research the top 5 AI cloud infrastructure companies (Nebius, CoreWeave, Lambda,
Together AI, Fireworks AI). For each company, find their latest funding round,
GPU offerings, and pricing strategy. Compare their approaches to inference
optimization. Then write a 500-word investment analysis recommending which
company has the strongest competitive moat and why.
```

## Sponsor Integration

| Sponsor | Integration | Importance |
|---------|------------|------------|
| Nebius Token Factory | Primary inference platform, 3 model tiers | MUST HAVE |
| OpenRouter | Secondary model pool, adds diversity | MUST HAVE |
| Tavily | Search subtask execution in agentic workflows | MUST HAVE |
| Toloka | Human quality evaluation (stretch goal) | NICE TO HAVE |
| Hugging Face | Publish routing model/quality dataset | NICE TO HAVE |
| Oumi | Fine-tune routing classifier (stretch) | STRETCH |
| Cline | Dev tool attribution | MENTION |
