import { NextRequest, NextResponse } from "next/server";
import { changeRun } from "@/lib/task-control/mock-store";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string; action: string }> },
) {
  const { runId, action } = await params;
  if (action !== "cancel" && action !== "retry" && action !== "resume") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  const run = changeRun(runId, action);
  return run
    ? NextResponse.json(run)
    : NextResponse.json({ error: "Run not found" }, { status: 404 });
}
