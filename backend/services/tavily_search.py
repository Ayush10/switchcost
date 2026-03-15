"""
Tavily search integration for handling 'search' type subtasks.
"""
import time
from tavily import AsyncTavilyClient
from backend.config import TAVILY_API_KEY


class TavilySearch:
    def __init__(self):
        self.client = AsyncTavilyClient(api_key=TAVILY_API_KEY)

    async def search(self, query: str, max_results: int = 5) -> dict:
        """
        Execute a Tavily search and return results with timing.
        Returns dict with: content, latency_ms, result_count
        """
        start_time = time.perf_counter()
        response = await self.client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_answer=True,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        # Format results into a readable context string
        results_text = []
        if response.get("answer"):
            results_text.append(f"Summary: {response['answer']}\n")

        for i, result in enumerate(response.get("results", []), 1):
            results_text.append(
                f"[{i}] {result.get('title', 'No title')}\n"
                f"    URL: {result.get('url', '')}\n"
                f"    {result.get('content', '')[:300]}\n"
            )

        content = "\n".join(results_text)

        return {
            "content": content,
            "latency_ms": round(latency_ms, 2),
            "result_count": len(response.get("results", [])),
            "provider": "tavily",
            "model_key": "tavily",
            "model_id": "tavily-search",
            "input_tokens": len(query.split()),  # approximate
            "output_tokens": len(content.split()),  # approximate
            "estimated_cost": 0.001,  # Tavily cost is per-search, approximate
        }
