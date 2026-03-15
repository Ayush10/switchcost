"""
Savings Calculator: projects monthly cost savings based on migration plan.
"""
from backend.models.schemas import MigrationRecommendation, SavingsResult
from backend.config import PROPRIETARY_PRICING, MODEL_REGISTRY


class SavingsCalculator:
    def calculate(
        self,
        plan: list[MigrationRecommendation],
        daily_calls: int = 1000,
        proprietary_model: str = "gpt-4o",
    ) -> SavingsResult:
        """
        Calculate projected monthly savings.
        daily_calls: total daily API calls across all subtask types.
        proprietary_model: the proprietary model being replaced.
        """
        prop_info = PROPRIETARY_PRICING.get(
            proprietary_model, PROPRIETARY_PRICING["gpt-4o"]
        )

        # Estimate proprietary cost per call
        # ~500 input tokens, ~500 output tokens per call average
        avg_input_tokens = 500
        avg_output_tokens = 500
        prop_cost_per_call = (
            (avg_input_tokens / 1_000_000) * prop_info["cost_per_1m_input"]
            + (avg_output_tokens / 1_000_000) * prop_info["cost_per_1m_output"]
        )

        total_call_weight = sum(r.call_count for r in plan) or 1

        migrated_cost_weighted = 0.0
        per_call_breakdown = []

        for rec in plan:
            weight = rec.call_count / total_call_weight
            calls_of_type = daily_calls * weight

            model_info = MODEL_REGISTRY.get(rec.recommended_model, {})
            migrated_cost = (
                (avg_input_tokens / 1_000_000) * model_info.get("cost_per_1m_input", 0)
                + (avg_output_tokens / 1_000_000) * model_info.get("cost_per_1m_output", 0)
            )
            migrated_cost_weighted += migrated_cost * weight

            per_call_breakdown.append({
                "subtask_type": rec.subtask_type,
                "calls_per_day": round(calls_of_type),
                "proprietary_cost_per_call": round(prop_cost_per_call, 6),
                "migrated_cost_per_call": round(migrated_cost, 6),
                "recommended_model": rec.recommended_display_name,
                "verdict": rec.verdict,
            })

        monthly_days = 30
        proprietary_monthly = prop_cost_per_call * daily_calls * monthly_days
        migrated_monthly = migrated_cost_weighted * daily_calls * monthly_days

        savings = proprietary_monthly - migrated_monthly
        savings_pct = (savings / proprietary_monthly * 100) if proprietary_monthly > 0 else 0

        return SavingsResult(
            daily_calls=daily_calls,
            proprietary_model=proprietary_model,
            proprietary_display_name=prop_info["display_name"],
            proprietary_monthly_cost=round(proprietary_monthly, 2),
            migrated_monthly_cost=round(migrated_monthly, 2),
            monthly_savings=round(savings, 2),
            savings_pct=round(savings_pct, 1),
            per_call_breakdown=per_call_breakdown,
        )
