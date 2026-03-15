# Tasks and Roadmap

## Status Legend

- [x] Complete
- [ ] Not started
- [~] Partially done

## Core Features (Complete)

- [x] FastAPI backend with health check and CORS
- [x] Unified inference provider client (Nebius + OpenRouter via OpenAI SDK)
- [x] Tavily search integration for research subtasks
- [x] Model registry with 5 models across 3 tiers and 2 providers
- [x] Task decomposition via LLM (structured JSON output)
- [x] Smart routing with default and naive routing tables
- [x] Per-step metrics collection (tokens, latency, cost, quality)
- [x] LLM-as-judge quality evaluation (nebius-small, 1-10 score)
- [x] Model profiling on representative subtask prompts
- [x] Routing optimizer with efficiency scoring and Pareto frontier
- [x] Before/after comparison (naive vs optimized, same task)
- [x] REST API endpoints for all operations
- [x] WebSocket endpoint for live metrics streaming
- [x] React dashboard with dark theme and neon accents
- [x] Charts: cost comparison, latency comparison, model usage, Pareto frontier
- [x] Step timeline with model badges
- [x] Demo mode with pre-configured task for judges
- [x] Pydantic schemas for all data models

## Remaining Tasks

### High Priority

- [ ] **Test end-to-end flow** -- Run the full comparison pipeline and verify all charts render correctly
- [ ] **Validate API keys** -- Ensure Nebius, OpenRouter, and Tavily keys are working
- [ ] **Demo rehearsal** -- Run the demo task 2-3 times to verify consistent results and timing
- [ ] **Error handling in UI** -- Display meaningful error messages if API calls fail
- [ ] **Record demo video** -- 1-minute video showing the before/after comparison for submission

### Medium Priority

- [ ] **WebSocket real-time updates** -- Currently the WebSocket endpoint holds the connection but the frontend uses polling; wire up actual push-based updates
- [ ] **Parallel subtask execution** -- Currently subtasks run sequentially; subtasks without dependencies could run in parallel for faster execution
- [ ] **Loading states for profiling** -- Add UI feedback while the profile endpoint runs
- [ ] **Responsive design check** -- Verify dashboard looks good at different screen sizes

### Stretch Goals

- [ ] **Toloka human evaluation** -- Integrate Toloka API for human quality scoring instead of LLM-as-judge (code: `NEBIUSBUILD30` for credits)
- [ ] **Oumi fine-tuning** -- Fine-tune a small classifier model for routing decisions using profiling data
- [ ] **Hugging Face publishing** -- Publish the routing dataset and/or model to Hugging Face
- [ ] **Persistent storage** -- Replace in-memory task_store with a lightweight database for cross-session persistence
- [ ] **Cost forecasting** -- Predict total cost before execution based on decomposed subtasks and routing table
- [ ] **Multi-run learning** -- Accumulate performance data across multiple runs to improve routing over time

## Submission Checklist

- [ ] Public GitHub repository
- [ ] README with setup instructions, architecture, sponsor attributions
- [ ] 1-minute demo video (YouTube or Loom)
- [ ] Submit at https://cerebralvalley.ai/e/nebius-build-sf/hackathon/submit
- [ ] Verify all sponsor integrations are mentioned:
  - [x] Nebius Token Factory (primary inference)
  - [x] OpenRouter (secondary model pool)
  - [x] Tavily (agentic search)
  - [~] Toloka (stretch goal, fallback implemented)
  - [ ] Hugging Face (publishing)
  - [ ] Oumi (fine-tuning)
  - [x] Cline (dev tool attribution)
