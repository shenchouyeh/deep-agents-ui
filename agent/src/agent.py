import os

from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model=os.environ["OPENAI_MODEL"],
    base_url=os.environ["OPENAI_BASE_URL"],
    api_key=os.getenv("OPENAI_API_KEY", "local-vllm"),
    temperature=0,
)

graph = create_deep_agent(
    model=model,
    name="deep_agent",
    system_prompt=(
        "You are a helpful deep agent. Plan multi-step work, use tools when available, "
        "and report concise, verifiable results."
    ),
)
