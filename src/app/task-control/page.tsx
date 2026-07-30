"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApprovalRequest, TaskRun } from "@/lib/task-control/types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/task-control${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

export default function TaskControlPage() {
  const [runs, setRuns] = useState<TaskRun[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setError(undefined);
      const [nextRuns, nextApprovals] = await Promise.all([
        api<TaskRun[]>("/runs"),
        api<ApprovalRequest[]>("/approvals"),
      ]);
      setRuns(nextRuns);
      setApprovals(nextApprovals);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load task-control data");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const runAction = async (runId: string, action: "cancel" | "retry" | "resume") => {
    await api(`/runs/${runId}/${action}`, { method: "POST" });
    await load();
  };
  const decide = async (approvalId: string, action: "approve" | "reject") => {
    await api(`/approvals/${approvalId}/decision`, {
      method: "POST",
      body: JSON.stringify({ action, actor: "local-admin" }),
    });
    await load();
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
      <header>
        <h1 className="text-3xl font-semibold">Task control</h1>
        <p className="text-sm text-muted-foreground">Runs, resumable checkpoints, schedules, and auditable tool approvals.</p>
      </header>
      {error ? <p className="rounded border border-red-500 p-3 text-red-600">{error}</p> : null}
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Run queue</h2>
        <div className="overflow-x-auto rounded border"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Task</th><th className="p-3">Thread / checkpoint</th><th className="p-3">Status</th><th className="p-3">Schedule</th><th className="p-3">Actions</th></tr></thead><tbody>{runs.map((run) => <tr className="border-b" key={run.id}><td className="p-3">{run.taskName}<br /><span className="text-xs text-muted-foreground">attempt {run.attempt}</span></td><td className="p-3 font-mono text-xs">{run.threadId}<br />{run.checkpointId ?? "—"}</td><td className="p-3">{run.status}</td><td className="p-3">{run.scheduledFor ? new Date(run.scheduledFor).toLocaleString() : "—"}</td><td className="space-x-2 p-3"><button onClick={() => void runAction(run.id, "cancel")}>Cancel</button><button onClick={() => void runAction(run.id, "retry")}>Retry</button><button onClick={() => void runAction(run.id, "resume")}>Resume</button></td></tr>)}</tbody></table></div>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">Approval queue</h2>
        {approvals.map((approval) => <article className="rounded border p-4" key={approval.id}><div className="flex items-center justify-between gap-4"><div><h3 className="font-medium">{approval.toolName} · {approval.risk}</h3><p className="text-sm text-muted-foreground">{approval.rationale}</p></div><span>{approval.status}</span></div><pre className="mt-3 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(approval.payload, null, 2)}</pre>{approval.status === "pending" ? <div className="mt-3 space-x-2"><button onClick={() => void decide(approval.id, "approve")}>Approve & resume</button><button onClick={() => void decide(approval.id, "reject")}>Reject</button></div> : null}</article>)}
      </section>
    </main>
  );
}
