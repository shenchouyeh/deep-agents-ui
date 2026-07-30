---
name: vllm-operations
description: Diagnose and operate an OpenAI-compatible vLLM endpoint. Use when the user mentions vLLM, model availability, `/v1/models`, chat completions, inference failures, endpoint health, throughput, GPU utilization, or serving configuration.
---

# vLLM operations

Use this workflow for troubleshooting or operating the configured vLLM endpoint. The endpoint and model are configured through `OPENAI_BASE_URL` and `OPENAI_MODEL`; never reveal `OPENAI_API_KEY`.

## Diagnostic workflow

1. Identify the exact failure boundary: browser UI → LangGraph API → agent → vLLM endpoint. Request the relevant error message, HTTP status, or server log.
2. Verify model discovery first. Ask the operator to run `Invoke-RestMethod $env:OPENAI_BASE_URL/models` from the LangGraph host, or use an available HTTP tool. Confirm that the configured model appears in the response.
3. For model invocation, verify that the endpoint is OpenAI-compatible and uses the `/v1` base path. Check model identifier case and spelling exactly.
4. Distinguish transport failures (timeout, DNS, connection refused, TLS) from API errors (401/403 auth, 404 model/path, 422 invalid request, 429 capacity, 5xx server).
5. For slow or failed generation, request vLLM server logs and GPU metrics. Check queueing, KV-cache pressure, max model length, concurrent sequence limits, and tensor-parallel configuration.

## Safety

- Treat API keys, bearer tokens, and internal host details as sensitive; redact them in reports.
- Do not advise restarting a production vLLM service, changing model configuration, or issuing destructive shell commands without explicit operator approval.
- Do not claim endpoint health without evidence from a request, metric, or log.

## Reporting format

Report: observed symptom, failed layer, evidence, most likely cause, lowest-risk next check, and rollback impact when proposing a configuration change.
