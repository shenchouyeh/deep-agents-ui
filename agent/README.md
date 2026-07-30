# Local LangGraph backend

This backend exposes the `deep_agent` assistant used by the Deep Agents UI. It calls an OpenAI-compatible vLLM endpoint; the browser UI never receives the vLLM API key.

## Windows setup

```powershell
cd agent
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
langgraph dev --no-browser
```

Keep the terminal running. In the UI configuration dialog, set:

```text
Deployment URL: http://127.0.0.1:2024
Assistant ID: deep_agent
LangSmith API Key: leave blank
```

## vLLM endpoint

The checked-in `.env.example` points at `http://125.228.207.174:20089/v1` and model `qwen/qwen3.6-27b`. If the server enforces an API key, replace `OPENAI_API_KEY` in the untracked `.env` file with that secret.

Before starting LangGraph, validate reachability from this machine:

```powershell
Invoke-RestMethod http://125.228.207.174:20089/v1/models
```

If the UI cannot send messages after configuration, inspect the terminal running `langgraph dev`; the browser must reach `http://127.0.0.1:2024` and the backend must reach the vLLM endpoint.
