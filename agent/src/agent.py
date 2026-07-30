import os
from pathlib import Path

from deepagents import create_deep_agent
from deepagents.backends.filesystem import FilesystemBackend
from langchain_openai import ChatOpenAI

ROOT = Path(__file__).resolve().parents[1]

model = ChatOpenAI(
    model=os.environ["OPENAI_MODEL"],
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.getenv("OPENAI_API_KEY", "local-vllm"),
    temperature=0,
)

# Skills use the Agent Skills / SKILL.md format. The backend root is the
# agent directory, so /skills/ resolves to agent/skills on disk.
backend = FilesystemBackend(root_dir=str(ROOT))

graph = create_deep_agent(
    model=model,
    name="deep_agent",
    backend=backend,
    skills=["/skills/"],
    system_prompt=(
        "You are a helpful deep agent. Plan multi-step work, use tools when available, "
        "and report concise, verifiable results. Read a relevant SKILL.md before "
        "following a specialized workflow."
    ),
)
