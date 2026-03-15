"""
Unified provider interface for Nebius Token Factory and OpenRouter.
Both are OpenAI-compatible, so we use the openai SDK with different base URLs.
"""
import time
from openai import AsyncOpenAI
from backend.config import (
    NEBIUS_API_KEY, OPENROUTER_API_KEY,
    NEBIUS_BASE_URL, OPENROUTER_BASE_URL,
    MODEL_REGISTRY,
)


class InferenceProvider:
    """Unified async inference provider that routes to Nebius or OpenRouter."""

    def __init__(self):
        self.nebius_client = AsyncOpenAI(
            base_url=NEBIUS_BASE_URL,
            api_key=NEBIUS_API_KEY,
        )
        self.openrouter_client = AsyncOpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
        )

    def _get_client(self, provider: str) -> AsyncOpenAI:
        if provider == "nebius":
            return self.nebius_client
        elif provider == "openrouter":
            return self.openrouter_client
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def complete(
        self,
        model_key: str,
        messages: list[dict],
        max_tokens: int = 2048,
        temperature: float = 0.7,
    ) -> dict:
        """
        Run a chat completion against the specified model.
        Returns dict with: content, input_tokens, output_tokens, latency_ms, model_key, provider, model_id
        """
        model_info = MODEL_REGISTRY[model_key]
        client = self._get_client(model_info["provider"])

        start_time = time.perf_counter()
        response = await client.chat.completions.create(
            model=model_info["model_id"],
            messages=messages,
            max_tokens=min(max_tokens, model_info["max_tokens"]),
            temperature=temperature,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        usage = response.usage
        input_tokens = usage.prompt_tokens if usage else 0
        output_tokens = usage.completion_tokens if usage else 0

        # Compute cost from registry pricing
        cost = (
            (input_tokens / 1_000_000) * model_info["cost_per_1m_input"]
            + (output_tokens / 1_000_000) * model_info["cost_per_1m_output"]
        )

        content = response.choices[0].message.content if response.choices else ""

        return {
            "content": content,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "latency_ms": round(latency_ms, 2),
            "estimated_cost": round(cost, 8),
            "model_key": model_key,
            "provider": model_info["provider"],
            "model_id": model_info["model_id"],
        }
