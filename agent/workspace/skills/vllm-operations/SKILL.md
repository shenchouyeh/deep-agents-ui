---
name: vllm-operations
description: Diagnose an OpenAI-compatible vLLM endpoint. Use for vLLM health, model discovery, `/v1/models`, chat completion failures, endpoint latency, and inference troubleshooting.
---

# vLLM operations

The sandbox can only use allowlisted commands. For endpoint discovery, use a single `curl` request to the configured vLLM origin and do not use shell composition, redirects, pipes, or environment-variable expansion.

## Workflow

1. Identify the failure boundary: browser UI, LangGraph API, agent, or vLLM endpoint.
2. For model discovery, run a direct request only when needed:
   `curl -sS http://125.228.207.174:20089/v1/models`
3. Confirm the configured model ID appears exactly in the response.
4. Classify failures as connection/TLS, 401/403 auth, 404 endpoint/model, 422 request, 429 capacity, or 5xx server.
5. For GPU, KV-cache, queueing, or server logs, ask the operator for evidence. Do not attempt host shell access.

## Safety

- Never expose API keys, tokens, or contents of environment files.
- Do not attempt to bypass the sandbox command policy.
- Do not restart services, write files outside the sandbox workspace, or issue destructive commands.
- Report observed evidence separately from hypotheses.
