# Task control contract

The UI will ship a development-only in-memory adapter at `/api/task-control`. It demonstrates the client contract and must not be used for production: it has no durable storage or authentication.

## Production components

- PostgreSQL persists `threads`, `tasks`, `runs`, `run_events`, `approval_requests`, `approval_decisions`, and `schedules`. Every state transition writes an immutable event row.
- Redis and BullMQ provide queueing, concurrency limits, retry backoff, delayed jobs, and cancellation signalling.
- A LangGraph worker persists `thread_id` and `checkpoint_id`. A guarded tool creates an approval request and calls `interrupt`; approval resumes the same checkpoint, rejection pauses the run.
- Authenticate all API calls. Derive the approval actor from session/OIDC claims, never from browser input.

## API

- `GET /v1/runs` lists runs.
- `POST /v1/runs/{id}/cancel|retry|resume` changes run control state.
- `GET /v1/approvals?status=pending` lists approval requests.
- `POST /v1/approvals/{id}/decision` records `{action, comment, editedPayload?}` and resumes or pauses the linked run.

Each approval preserves original tool payload, edited payload, policy version, agent, actor, timestamps, and linked run/thread IDs.
