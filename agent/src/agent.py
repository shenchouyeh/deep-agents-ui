import os
from pathlib import Path

from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI

from sandbox.docker_backend import RestrictedDockerSandboxBackend

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT / "workspace"
WORKSPACE.mkdir(exist_ok=True)

model = ChatOpenAI(
    model=os.environ["OPENAI_MODEL"],
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.getenv("OPENAI_API_KEY", "local-vllm"),
    temperature=0,
    timeout=300,
    max_retries=1,
)

# The agent can only read/write workspace files. Secrets in agent/.env are
# outside this root. Command execution is routed to ephemeral Docker containers.
backend = RestrictedDockerSandboxBackend(root_dir=str(WORKSPACE))

graph = create_deep_agent(
    model=model,
    name="deep_agent",
    backend=backend,
    skills=["/skills/"],
    system_prompt=(
        "You are a helpful deep agent. For simple conversational requests, answer "
        "directly without tools. Use tools only when necessary. Shell execution runs "
        "inside a restricted ephemeral Docker container and may be denied by policy. "
        "Never seek, read, reveal, or modify secrets. Always return a final answer "
        "after completing a task."
    ),
)
