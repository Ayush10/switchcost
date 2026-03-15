"""
Task Decomposer: breaks a complex task into typed, ordered subtasks.
Uses a small/mid model to do the decomposition itself (meta-task).
"""
import json
import uuid
from backend.services.provider import InferenceProvider
from backend.models.schemas import Subtask, SubtaskType, Complexity

DECOMPOSE_SYSTEM_PROMPT = """You are a task decomposition agent for an AI inference optimization system.
Given a complex task, break it into atomic subtasks that can each be routed to different AI models.

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "subtasks": [
    {
      "id": "1",
      "description": "Brief description of what to do",
      "type": "classify|extract|summarize|reason|search|generate",
      "complexity": "simple|medium|complex",
      "depends_on": [],
      "input_context": "What input this subtask needs from previous steps"
    }
  ]
}

Subtask types:
- search: Find information from the web (will use Tavily search API)
- classify: Categorize or label data (simple, use cheapest model)
- extract: Pull specific data points from text (simple/medium)
- summarize: Condense information (medium)
- reason: Multi-step logical analysis, comparisons, drawing conclusions (complex)
- generate: Create new content like reports, analyses, recommendations (medium/complex)

Rules:
- Break into 4-8 subtasks (not too few, not too many)
- Start with search tasks to gather information
- Use depends_on to chain tasks that need prior outputs
- Classify complexity honestly: only use "complex" for tasks requiring deep reasoning
- Be specific in descriptions so each subtask is self-contained"""


class TaskDecomposer:
    def __init__(self, provider: InferenceProvider):
        self.provider = provider

    async def decompose(self, task: str) -> tuple[list[Subtask], dict]:
        """
        Decompose a task into subtasks.
        Returns (subtasks, decomposition_metrics).
        Uses nebius-mid for decomposition (good balance of speed and quality).
        """
        messages = [
            {"role": "system", "content": DECOMPOSE_SYSTEM_PROMPT},
            {"role": "user", "content": f"Task: {task}"},
        ]

        result = await self.provider.complete(
            model_key="nebius-mid",
            messages=messages,
            max_tokens=2048,
            temperature=0.3,
        )

        # Parse the JSON response
        try:
            content = result["content"].strip()
            # Handle potential markdown wrapping
            if content.startswith("```"):
                content = content.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            parsed = json.loads(content)
            subtasks = []
            for st in parsed.get("subtasks", []):
                subtasks.append(Subtask(
                    id=st.get("id", str(uuid.uuid4())[:8]),
                    description=st["description"],
                    type=SubtaskType(st["type"]),
                    complexity=Complexity(st.get("complexity", "medium")),
                    depends_on=st.get("depends_on", []),
                    input_context=st.get("input_context", ""),
                ))
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # Fallback: create a single "generate" subtask with the whole task
            subtasks = [
                Subtask(
                    id="1",
                    description=task,
                    type=SubtaskType.GENERATE,
                    complexity=Complexity.COMPLEX,
                    depends_on=[],
                    input_context="Original user task",
                )
            ]

        return subtasks, result
