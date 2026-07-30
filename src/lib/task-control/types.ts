export type RunStatus =
  | 'queued'
  | 'running'
  | 'waiting_approval'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type TaskRun = {
  id: string;
  threadId: string;
  taskName: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  checkpointId?: string;
  attempt: number;
};

export type ApprovalRequest = {
  id: string;
  runId: string;
  threadId: string;
  toolName: string;
  risk: 'high' | 'critical';
  status: ApprovalStatus;
  rationale: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
  decision?: { actor: string; comment?: string; decidedAt: string; editedPayload?: Record<string, unknown> };
};

export type Decision = {
  action: 'approve' | 'reject';
  actor: string;
  comment?: string;
  editedPayload?: Record<string, unknown>;
};
