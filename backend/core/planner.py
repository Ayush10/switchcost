"""
Migration Planner: builds migration recommendations from replay + quality data.
For each subtask type, recommends the cheapest model that meets quality threshold.
"""
from backend.models.schemas import ReplayResult, MigrationRecommendation, StepMetric
from backend.config import MODEL_REGISTRY, BASELINE_MODEL, QUALITY_THRESHOLD


class MigrationPlanner:
    def build_plan(
        self,
        baseline_metrics: list[StepMetric],
        replays: list[ReplayResult],
    ) -> list[MigrationRecommendation]:
        """
        Build migration recommendations.
        For each subtask type, find cheapest model with quality >= threshold.
        """
        # Group baseline costs by subtask type
        baseline_by_type: dict[str, list[float]] = {}
        type_counts: dict[str, int] = {}
        for metric in baseline_metrics:
            st = metric.subtask_type.value
            if st == "search":
                continue
            if st not in baseline_by_type:
                baseline_by_type[st] = []
            baseline_by_type[st].append(metric.estimated_cost)
            type_counts[st] = type_counts.get(st, 0) + 1

        # Group replays by (subtask_type, model_key)
        replay_groups: dict[tuple[str, str], list[ReplayResult]] = {}
        for replay in replays:
            key = (replay.subtask_type.value, replay.model_key)
            if key not in replay_groups:
                replay_groups[key] = []
            replay_groups[key].append(replay)

        recommendations = []
        baseline_info = MODEL_REGISTRY[BASELINE_MODEL]

        for subtask_type, baseline_costs in baseline_by_type.items():
            avg_baseline_cost = sum(baseline_costs) / len(baseline_costs)
            call_count = type_counts.get(subtask_type, 1)

            # Find best candidate: cheapest model with quality >= threshold
            best_candidate = None
            best_cost = float("inf")

            for model_key in MODEL_REGISTRY:
                if model_key == BASELINE_MODEL:
                    continue

                key = (subtask_type, model_key)
                model_replays = replay_groups.get(key, [])
                if not model_replays:
                    continue

                avg_quality = (
                    sum(r.quality_score for r in model_replays) / len(model_replays)
                )
                avg_cost = (
                    sum(r.estimated_cost for r in model_replays) / len(model_replays)
                )

                if avg_quality >= QUALITY_THRESHOLD and avg_cost < best_cost:
                    best_candidate = {
                        "model_key": model_key,
                        "display_name": MODEL_REGISTRY[model_key]["display_name"],
                        "avg_cost": avg_cost,
                        "avg_quality": avg_quality,
                    }
                    best_cost = avg_cost

            if best_candidate:
                cost_reduction = (
                    (avg_baseline_cost - best_candidate["avg_cost"])
                    / avg_baseline_cost
                    * 100
                    if avg_baseline_cost > 0
                    else 0
                )
                recommendations.append(MigrationRecommendation(
                    subtask_type=subtask_type,
                    baseline_model=BASELINE_MODEL,
                    baseline_display_name=baseline_info["display_name"],
                    baseline_cost_per_call=round(avg_baseline_cost, 8),
                    recommended_model=best_candidate["model_key"],
                    recommended_display_name=best_candidate["display_name"],
                    recommended_cost_per_call=round(best_candidate["avg_cost"], 8),
                    quality_parity_score=round(best_candidate["avg_quality"], 1),
                    cost_reduction_pct=round(cost_reduction, 1),
                    verdict="MIGRATE",
                    call_count=call_count,
                ))
            else:
                # No candidate meets quality threshold
                recommendations.append(MigrationRecommendation(
                    subtask_type=subtask_type,
                    baseline_model=BASELINE_MODEL,
                    baseline_display_name=baseline_info["display_name"],
                    baseline_cost_per_call=round(avg_baseline_cost, 8),
                    recommended_model=BASELINE_MODEL,
                    recommended_display_name=baseline_info["display_name"],
                    recommended_cost_per_call=round(avg_baseline_cost, 8),
                    quality_parity_score=100.0,
                    cost_reduction_pct=0.0,
                    verdict="KEEP",
                    call_count=call_count,
                ))

        return recommendations

    def build_quality_matrix(self, replays: list[ReplayResult]) -> dict:
        """
        Build quality matrix: subtask_type -> model_key -> avg quality score.
        """
        # Collect scores
        raw: dict[str, dict[str, list[float]]] = {}
        for replay in replays:
            st = replay.subtask_type.value
            mk = replay.model_key
            if st not in raw:
                raw[st] = {}
            if mk not in raw[st]:
                raw[st][mk] = []
            raw[st][mk].append(replay.quality_score)

        # Average
        matrix = {}
        for st, models in raw.items():
            matrix[st] = {}
            for mk, scores in models.items():
                matrix[st][mk] = round(sum(scores) / len(scores), 1)

        return matrix
