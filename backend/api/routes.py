"""
API Routes for Inference Autopilot.
"""
import uuid
from fastapi import APIRouter, BackgroundTasks
from backend.models.schemas import (
    AnalysisRequest, SavingsRequest, MigrationRecommendation,
)
from backend.services.provider import InferenceProvider
from backend.services.tavily_search import TavilySearch
from backend.core.decomposer import TaskDecomposer
from backend.core.baseline import BaselineRunner
from backend.core.replay import ReplayEngine
from backend.core.comparator import QualityComparator
from backend.core.planner import MigrationPlanner
from backend.core.savings import SavingsCalculator
from backend.api.websocket import broadcast_to_task
from backend.config import DEMO_TASK, PROPRIETARY_PRICING

router = APIRouter()

# Shared state (in-memory for hackathon)
provider = InferenceProvider()
tavily = TavilySearch()
decomposer = TaskDecomposer(provider)
baseline_runner = BaselineRunner(provider, tavily)
replay_engine = ReplayEngine(provider)
comparator = QualityComparator(provider)
planner = MigrationPlanner()
savings_calc = SavingsCalculator()

# Store analysis results
analysis_store: dict[str, dict] = {}


async def run_analysis(analysis_id: str, task: str):
    """Full analysis pipeline: decompose -> baseline -> replay -> compare -> plan."""

    async def on_step(event, data):
        await broadcast_to_task(analysis_id, {"event": event, "data": data})
        analysis_store[analysis_id]["progress"].append({"event": event, **data})

    try:
        # Step 1: Decompose
        await on_step("status", {"message": "Decomposing task into subtasks..."})
        subtasks, decompose_meta = await decomposer.decompose(task)
        analysis_store[analysis_id]["subtasks"] = [s.model_dump() for s in subtasks]
        await on_step("decomposed", {
            "subtask_count": len(subtasks),
            "message": f"Decomposed into {len(subtasks)} subtasks",
        })

        # Step 2: Run baseline
        await on_step("status", {
            "message": "Running baseline on expensive model (GPT-4 class)...",
        })
        baseline = await baseline_runner.run(analysis_id, subtasks, on_step=on_step)
        analysis_store[analysis_id]["baseline"] = {
            "metrics": [m.model_dump() for m in baseline["metrics"]],
        }

        # Step 3: Replay against all models
        await on_step("status", {
            "message": "Replaying against open models on Nebius + OpenRouter...",
        })
        replays = await replay_engine.replay_all(
            subtasks, baseline["outputs"], on_step=on_step
        )

        # Step 4: Score quality
        await on_step("status", {
            "message": "Scoring quality vs baseline (LLM-as-judge)...",
        })
        replays = await comparator.score_replays(
            replays, baseline["outputs"], on_step=on_step
        )
        analysis_store[analysis_id]["replays"] = [r.model_dump() for r in replays]

        # Step 5: Build migration plan
        await on_step("status", {"message": "Building migration plan..."})
        migration_plan = planner.build_plan(baseline["metrics"], replays)
        quality_matrix = planner.build_quality_matrix(replays)
        analysis_store[analysis_id]["migration_plan"] = [
            r.model_dump() for r in migration_plan
        ]
        analysis_store[analysis_id]["quality_matrix"] = quality_matrix

        # Step 6: Calculate savings
        savings = savings_calc.calculate(migration_plan)
        analysis_store[analysis_id]["savings"] = savings.model_dump()

        analysis_store[analysis_id]["status"] = "completed"
        await on_step("complete", {"message": "Analysis complete"})

    except Exception as e:
        analysis_store[analysis_id]["status"] = "error"
        analysis_store[analysis_id]["error"] = str(e)
        try:
            await on_step("error", {"message": str(e)})
        except Exception:
            pass


@router.post("/analyze")
async def start_analysis(
    request: AnalysisRequest, background_tasks: BackgroundTasks
):
    """Start a full migration analysis for a task."""
    analysis_id = f"analysis-{str(uuid.uuid4())[:8]}"
    analysis_store[analysis_id] = {
        "analysis_id": analysis_id,
        "task": request.task,
        "status": "running",
        "progress": [],
    }
    background_tasks.add_task(run_analysis, analysis_id, request.task)
    return {"analysis_id": analysis_id, "status": "running"}


@router.get("/analyze/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get analysis status and results."""
    if analysis_id not in analysis_store:
        return {"error": "Analysis not found"}
    return analysis_store[analysis_id]


@router.get("/analyze/{analysis_id}/plan")
async def get_migration_plan(analysis_id: str):
    """Get just the migration plan and quality matrix."""
    if analysis_id not in analysis_store:
        return {"error": "Analysis not found"}
    return {
        "migration_plan": analysis_store[analysis_id].get("migration_plan", []),
        "quality_matrix": analysis_store[analysis_id].get("quality_matrix", {}),
    }


@router.get("/analyze/{analysis_id}/quality-matrix")
async def get_quality_matrix(analysis_id: str):
    """Get quality matrix heatmap data."""
    if analysis_id not in analysis_store:
        return {"error": "Analysis not found"}
    return analysis_store[analysis_id].get("quality_matrix", {})


@router.post("/savings-calculator")
async def calculate_savings(request: SavingsRequest):
    """Calculate savings with custom volume and proprietary model."""
    # Find the latest completed analysis's migration plan
    plan = None
    for aid in reversed(list(analysis_store.keys())):
        entry = analysis_store[aid]
        if entry.get("status") == "completed" and "migration_plan" in entry:
            plan = [
                MigrationRecommendation(**r) for r in entry["migration_plan"]
            ]
            break

    if not plan:
        return {"error": "No migration plan available. Run an analysis first."}

    result = savings_calc.calculate(plan, request.daily_calls, request.proprietary_model)
    return result.model_dump()


@router.get("/proprietary-models")
async def get_proprietary_models():
    """Get available proprietary model pricing for the savings calculator."""
    return PROPRIETARY_PRICING


@router.get("/demo-task")
async def get_demo_task():
    """Get the pre-configured demo task."""
    return {"task": DEMO_TASK}
