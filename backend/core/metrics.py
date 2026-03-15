"""
Metrics Engine: collects and aggregates real-time metrics for every inference step.
"""
from datetime import datetime
from backend.models.schemas import StepMetric, RoutingMode, SubtaskType
import numpy as np


class MetricsEngine:
    """In-memory metrics store with aggregation capabilities."""

    def __init__(self):
        # task_id -> list of StepMetric
        self.metrics: dict[str, list[StepMetric]] = {}

    def record(self, metric: StepMetric):
        """Record a step metric."""
        if metric.task_id not in self.metrics:
            self.metrics[metric.task_id] = []
        self.metrics[metric.task_id].append(metric)

    def get_task_metrics(self, task_id: str) -> list[StepMetric]:
        """Get all metrics for a task."""
        return self.metrics.get(task_id, [])

    def get_task_summary(self, task_id: str) -> dict:
        """Compute aggregate metrics for a task."""
        steps = self.metrics.get(task_id, [])
        if not steps:
            return {
                "total_cost": 0,
                "total_latency_ms": 0,
                "avg_latency_ms": 0,
                "p95_latency_ms": 0,
                "avg_quality": 0,
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "step_count": 0,
                "models_used": {},
            }

        costs = [s.estimated_cost for s in steps]
        latencies = [s.latency_ms for s in steps]
        qualities = [s.quality_score for s in steps if s.quality_score > 0]

        # Count model usage
        model_counts: dict[str, int] = {}
        for s in steps:
            model_counts[s.model_key] = model_counts.get(s.model_key, 0) + 1

        return {
            "total_cost": round(sum(costs), 6),
            "total_latency_ms": round(sum(latencies), 2),
            "avg_latency_ms": round(np.mean(latencies), 2) if latencies else 0,
            "p95_latency_ms": round(float(np.percentile(latencies, 95)), 2) if latencies else 0,
            "avg_quality": round(np.mean(qualities), 3) if qualities else 0,
            "total_input_tokens": sum(s.input_tokens for s in steps),
            "total_output_tokens": sum(s.output_tokens for s in steps),
            "step_count": len(steps),
            "models_used": model_counts,
        }

    def compare(self, naive_task_id: str, optimized_task_id: str) -> dict:
        """Compare naive vs optimized runs."""
        naive = self.get_task_summary(naive_task_id)
        optimized = self.get_task_summary(optimized_task_id)

        cost_savings = (
            ((naive["total_cost"] - optimized["total_cost"]) / naive["total_cost"] * 100)
            if naive["total_cost"] > 0 else 0
        )
        latency_savings = (
            ((naive["total_latency_ms"] - optimized["total_latency_ms"]) / naive["total_latency_ms"] * 100)
            if naive["total_latency_ms"] > 0 else 0
        )
        quality_delta = optimized["avg_quality"] - naive["avg_quality"]

        return {
            "naive": naive,
            "optimized": optimized,
            "cost_savings_pct": round(cost_savings, 1),
            "latency_savings_pct": round(latency_savings, 1),
            "quality_delta": round(quality_delta, 3),
        }
