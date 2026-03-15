"""
Baseline Runner: executes all subtasks on the most expensive model.
Simulates what happens when you use GPT-4 class for everything.
"""
from backend.services.provider import InferenceProvider
from backend.services.tavily_search import TavilySearch
from backend.models.schemas import Subtask, SubtaskType, StepMetric
from backend.config import BASELINE_MODEL


class BaselineRunner:
    def __init__(self, provider: InferenceProvider, tavily: TavilySearch):
        self.provider = provider
        self.tavily = tavily

    async def run(self, task_id: str, subtasks: list[Subtask], on_step=None) -> dict:
        """
        Run all subtasks through the baseline model (most expensive).
        Returns dict with step_outputs and step_metrics.
        """
        step_outputs = {}
        step_metrics = []

        for subtask in subtasks:
            # Build context from dependencies
            context_parts = []
            for dep_id in subtask.depends_on:
                if dep_id in step_outputs:
                    context_parts.append(
                        f"[Output from step {dep_id}]: {step_outputs[dep_id][:500]}"
                    )
            context = "\n".join(context_parts)

            if subtask.type == SubtaskType.SEARCH:
                result = await self.tavily.search(subtask.description)
                step_outputs[subtask.id] = result["content"]
            else:
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are a helpful AI assistant. "
                            "Complete the following task thoroughly and accurately."
                        ),
                    },
                ]
                if context:
                    messages.append({
                        "role": "user",
                        "content": (
                            f"Context from previous steps:\n{context}\n\n"
                            f"Task: {subtask.description}"
                        ),
                    })
                else:
                    messages.append({
                        "role": "user",
                        "content": subtask.description,
                    })

                result = await self.provider.complete(
                    model_key=BASELINE_MODEL,
                    messages=messages,
                    max_tokens=2048,
                )
                step_outputs[subtask.id] = result["content"]

            metric = StepMetric(
                task_id=task_id,
                step_id=subtask.id,
                subtask_type=subtask.type,
                model_key=result["model_key"],
                provider=result["provider"],
                model_id=result["model_id"],
                input_tokens=result["input_tokens"],
                output_tokens=result["output_tokens"],
                latency_ms=result["latency_ms"],
                estimated_cost=result["estimated_cost"],
                output_preview=step_outputs[subtask.id][:200],
                output_full=step_outputs[subtask.id],
            )
            step_metrics.append(metric)

            if on_step:
                await on_step("baseline_step", {
                    "step_id": subtask.id,
                    "subtask_type": subtask.type.value,
                    "model_key": result["model_key"],
                    "latency_ms": result["latency_ms"],
                    "cost": result["estimated_cost"],
                })

        return {
            "outputs": step_outputs,
            "metrics": step_metrics,
        }
