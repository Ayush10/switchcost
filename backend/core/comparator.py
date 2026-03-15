"""
Quality Comparator: scores open model outputs vs baseline using LLM-as-judge.
Returns 0-100 quality parity scores.
"""
import json
from backend.services.provider import InferenceProvider

COMPARISON_PROMPT = """You are a quality comparison judge. You will see two AI outputs for the same task.

Output A is the BASELINE (from an expensive model).
Output B is from an OPEN-SOURCE model being evaluated as a replacement.

Score how well Output B matches Output A on a scale of 0-100:
- 95-100: Indistinguishable quality. Perfect replacement.
- 85-94: Minor differences. Fully acceptable replacement.
- 75-84: Noticeable differences but still usable.
- 60-74: Significant quality gap.
- <60: Not suitable as replacement.

Consider: accuracy, completeness, coherence, and usefulness.

Return ONLY JSON (no markdown): {"score": 92, "reasoning": "Brief explanation"}"""


class QualityComparator:
    def __init__(self, provider: InferenceProvider):
        self.provider = provider

    async def compare(
        self, task_description: str, baseline_output: str, candidate_output: str
    ) -> dict:
        """
        Compare candidate output vs baseline output.
        Returns {"score": 0-100, "reasoning": "..."}
        """
        messages = [
            {"role": "system", "content": COMPARISON_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Task: {task_description}\n\n"
                    f"Output A (BASELINE):\n{baseline_output[:1500]}\n\n"
                    f"Output B (CANDIDATE):\n{candidate_output[:1500]}"
                ),
            },
        ]

        try:
            result = await self.provider.complete(
                model_key="nebius-small",
                messages=messages,
                max_tokens=256,
                temperature=0.1,
            )

            content = result["content"].strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            parsed = json.loads(content)
            score = max(0, min(100, int(parsed.get("score", 50))))
            reasoning = parsed.get("reasoning", "")

            return {"score": score, "reasoning": reasoning}

        except Exception:
            return {"score": 50, "reasoning": "Evaluation failed, neutral score assigned"}

    async def score_replays(self, replays, baseline_outputs, on_step=None) -> list:
        """
        Score all replay results against their baseline outputs.
        Updates replay objects in-place with quality_score.
        """
        for replay in replays:
            baseline_output = baseline_outputs.get(replay.subtask_id, "")
            if not baseline_output:
                replay.quality_score = 50.0
                continue

            result = await self.compare(
                task_description=replay.subtask_description,
                baseline_output=baseline_output,
                candidate_output=replay.output,
            )
            replay.quality_score = result["score"]

            if on_step:
                await on_step("quality_scored", {
                    "subtask_id": replay.subtask_id,
                    "model_key": replay.model_key,
                    "score": result["score"],
                    "reasoning": result["reasoning"],
                })

        return replays
