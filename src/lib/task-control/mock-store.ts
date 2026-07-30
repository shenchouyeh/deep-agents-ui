import type { ApprovalRequest, Decision, RunStatus, TaskRun } from './types';

const now = () => new Date().toISOString();
const runs: TaskRun[] = [
  { id: 'run_demo_001', threadId: 'thread_demo_001', taskName: 'Quarterly revenue analysis', status: 'waiting_approval', createdAt: now(), updatedAt: now(), checkpointId: 'checkpoint_001', attempt: 1 },
  { id: 'run_demo_002', threadId: 'thread_demo_002', taskName: 'Knowledge-base research', status: 'queued', createdAt: now(), updatedAt: now(), scheduledFor: new Date(Date.now() + 3600000).toISOString(), attempt: 0 },
];
const approvals: ApprovalRequest[] = [
  { id: 'approval_demo_001', runId: 'run_demo_001', threadId: 'thread_demo_001', toolName: 'execute_sql', risk: 'critical', status: 'pending', rationale: 'The proposed statement modifies production rows.', payload: { sql: "UPDATE invoices SET status = 'paid' WHERE id = 42", database: 'production' }, createdAt: now(), expiresAt: new Date(Date.now() + 86400000).toISOString() },
];

export const listRuns = () => runs;
export const listApprovals = () => approvals;
export function changeRun(id: string, action: 'cancel' | 'retry' | 'resume') {
  const run = runs.find((item) => item.id === id);
  if (!run) return undefined;
  const next: Record<typeof action, RunStatus> = { cancel: 'cancelled', retry: 'queued', resume: 'running' };
  run.status = next[action];
  if (action === 'retry') run.attempt += 1;
  run.updatedAt = now();
  return run;
}
export function decideApproval(id: string, decision: Decision) {
  const approval = approvals.find((item) => item.id === id);
  if (!approval || approval.status !== 'pending') return undefined;
  approval.status = decision.action === 'approve' ? 'approved' : 'rejected';
  approval.decision = { actor: decision.actor, comment: decision.comment, editedPayload: decision.editedPayload, decidedAt: now() };
  const run = runs.find((item) => item.id === approval.runId);
  if (run) { run.status = approval.status === 'approved' ? 'running' : 'paused'; run.updatedAt = now(); }
  return approval;
}
