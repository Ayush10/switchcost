"""
Configuration and model registry for Inference Autopilot.
All model metadata, pricing, and provider config lives here.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
NEBIUS_API_KEY = os.getenv("NEBIUS_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# Provider base URLs
NEBIUS_BASE_URL = "https://api.tokenfactory.nebius.com/v1/"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Baseline model (simulates GPT-4 class pricing for comparison)
BASELINE_MODEL = "nebius-large"

# Quality threshold for "MIGRATE" verdict (0-100 scale)
QUALITY_THRESHOLD = 80

# Model Registry
MODEL_REGISTRY = {
    "nebius-small": {
        "provider": "nebius",
        "model_id": "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
        "tier": "small",
        "cost_per_1m_input": 0.03,
        "cost_per_1m_output": 0.09,
        "max_tokens": 4096,
        "display_name": "Llama 3.1 8B",
        "description": "Fast 8B model. Classification, extraction, simple routing.",
        "color": "#22d3ee",
    },
    "nebius-mid": {
        "provider": "nebius",
        "model_id": "Qwen/Qwen3-32B",
        "tier": "mid",
        "cost_per_1m_input": 0.14,
        "cost_per_1m_output": 0.14,
        "max_tokens": 8192,
        "display_name": "Qwen3 32B",
        "description": "Balanced 32B model. Summarization, analysis, synthesis.",
        "color": "#a78bfa",
    },
    "nebius-large": {
        "provider": "nebius",
        "model_id": "deepseek-ai/DeepSeek-R1-0528",
        "tier": "large",
        "cost_per_1m_input": 0.80,
        "cost_per_1m_output": 2.40,
        "max_tokens": 16384,
        "display_name": "DeepSeek R1",
        "description": "Powerful 671B MoE reasoner. Complex multi-step reasoning only.",
        "color": "#f97316",
    },
    "openrouter-small": {
        "provider": "openrouter",
        "model_id": "openai/gpt-oss-20b",
        "tier": "small",
        "cost_per_1m_input": 0.05,
        "cost_per_1m_output": 0.20,
        "max_tokens": 4096,
        "display_name": "GPT-OSS 20B",
        "description": "OpenAI open-weight 20B. Tool use, structured output.",
        "color": "#34d399",
    },
    "openrouter-mid": {
        "provider": "openrouter",
        "model_id": "qwen/qwen3-30b-a3b",
        "tier": "mid",
        "cost_per_1m_input": 0.10,
        "cost_per_1m_output": 0.30,
        "max_tokens": 8192,
        "display_name": "Qwen3 30B MoE",
        "description": "Qwen3 MoE 30B. Efficient instruction following.",
        "color": "#fb923c",
    },
}

# Reference pricing for proprietary models (savings calculator)
PROPRIETARY_PRICING = {
    "gpt-4o": {
        "cost_per_1m_input": 2.50,
        "cost_per_1m_output": 10.00,
        "display_name": "GPT-4o",
    },
    "gpt-4-turbo": {
        "cost_per_1m_input": 10.00,
        "cost_per_1m_output": 30.00,
        "display_name": "GPT-4 Turbo",
    },
    "claude-3.5-sonnet": {
        "cost_per_1m_input": 3.00,
        "cost_per_1m_output": 15.00,
        "display_name": "Claude 3.5 Sonnet",
    },
    "gemini-1.5-pro": {
        "cost_per_1m_input": 1.25,
        "cost_per_1m_output": 5.00,
        "display_name": "Gemini 1.5 Pro",
    },
}

# Demo task for judges
DEMO_TASK = (
    "Research the top 5 AI cloud infrastructure companies (Nebius, CoreWeave, Lambda, "
    "Together AI, Fireworks AI). For each company, find their latest funding round, "
    "GPU offerings, and pricing strategy. Compare their approaches to inference "
    "optimization. Then write a 500-word investment analysis recommending which "
    "company has the strongest competitive moat and why."
)
