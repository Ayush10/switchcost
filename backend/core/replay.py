"""
Replay Engine: replays each subtask against all open model tiers.
For each subtask, runs against every model in the registry (except baseline).
"""
from backend.services.provider import InferenceProvider
from backend.models.schemas import Subtask, SubtaskType, ReplayResult
from backend.config import MODEL_REGISTRY, BASELINE_MODEL


class ReplayEngine:
    def __init__(self, provider: InferenceProvider):
        self.provider = provider

    async def replay_all(
        self, subtasks: list[Subtask], baseline_outputs: dict, on_step=None
    ) -> list[ReplayResult]:
        """
        Replay each non-search subtask against all models except baseline.
        Returns list of ReplayResult objects.
        """
        results = []
        test_models = [k for k in MODEL_REGISTRY if k != BASELINE_MODEL]

        for subtask in subtasks:
            if subtask.type == SubtaskType.SEARCH:
                continue

            # Build context from dependencies using baseline outputs
            context_parts = []
            for dep_id in subtask.depends_on:
                if dep_id in baseline_outputs:
                    context_parts.append(
                        f"[Context from step {dep_id}]: {baseline_outputs[dep_id][:500]}"
                    )
            context = "\n".join(context_parts)

            for model_key in test_models:
                model_info = MODEL_REGISTRY[model_key]

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

                try:
                    result = await self.provider.complete(
                        model_key=model_key,
                        messages=messages,
                        max_tokens=2048,
                    )

                    replay_result = ReplayResult(
                        subtask_id=subtask.id,
                        subtask_type=subtask.type,
                        subtask_description=subtask.description,
                        model_key=model_key,
                        display_name=model_info["display_name"],
                        provider=result["provider"],
                        model_id=result["model_id"],
                        output=result["content"],
                        input_tokens=result["input_tokens"],
                        output_tokens=result["output_tokens"],
                        latency_ms=result["latency_ms"],
                        estimated_cost=result["estimated_cost"],
                    )
                    results.append(replay_result)

                    if on_step:
                        await on_step("replay_step", {
                            "subtask_id": subtask.id,
                            "subtask_type": subtask.type.value,
                            "model_key": model_key,
                            "display_name": model_info["display_name"],
                            "latency_ms": result["latency_ms"],
                            "cost": result["estimated_cost"],
                        })

                except Exception as e:
                    if on_step:
                        await on_step("replay_error", {
                            "subtask_id": subtask.id,
                            "model_key": model_key,
                            "error": str(e),
                        })

        return results
