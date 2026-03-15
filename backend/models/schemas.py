"""
Pydantic models for Inference Autopilot API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SubtaskType(str, Enum):
    CLASSIFY = "classify"
    EXTRACT = "extract"
    SUMMARIZE = "summarize"
    REASON = "reason"
    SEARCH = "search"
    GENERATE = "generate"


class Complexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"


class Subtask(BaseModel):
    id: str
    description: str
    type: SubtaskType
    complexity: Complexity
    depends_on: list[str] = []
    input_context: str = ""


class AnalysisRequest(BaseModel):
    task: str = Field(..., description="The complex task to analyze for migration")


class StepMetric(BaseModel):
    task_id: str
    step_id: str
    subtask_type: SubtaskType
    model_key: str
    provider: str
    model_id: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    estimated_cost: float
    quality_score: float = 0.0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    output_preview: str = ""
    output_full: str = ""


class ReplayResult(BaseModel):
    subtask_id: str
    subtask_type: SubtaskType
    subtask_description: str
    model_key: str
    display_name: str
    provider: str
    model_id: str
    output: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    estimated_cost: float
    quality_score: float = 0.0


class MigrationRecommendation(BaseModel):
    subtask_type: str
    baseline_model: str
    baseline_display_name: str
    baseline_cost_per_call: float
    recommended_model: str
    recommended_display_name: str
    recommended_cost_per_call: float
    quality_parity_score: float
    cost_reduction_pct: float
    verdict: str
    call_count: int


class SavingsRequest(BaseModel):
    daily_calls: int = 1000
    proprietary_model: str = "gpt-4o"


class SavingsResult(BaseModel):
    daily_calls: int
    proprietary_model: str
    proprietary_display_name: str
    proprietary_monthly_cost: float
    migrated_monthly_cost: float
    monthly_savings: float
    savings_pct: float
    per_call_breakdown: list[dict] = []


class WebSocketMessage(BaseModel):
    event: str
    data: dict
