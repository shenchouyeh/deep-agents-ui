import { NextRequest, NextResponse } from "next/server";
import { decideApproval } from "@/lib/task-control/mock-store";
import type { Decision } from "@/lib/task-control/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ approvalId: string }> },
) {
  const body = (await request.json()) as Decision;
  if (!body.actor || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }
  const { approvalId } = await params;
  const approval = decideApproval(approvalId, body);
  return approval
    ? NextResponse.json(approval)
    : NextResponse.json({ error: "Approval not found or already decided" }, { status: 404 });
}
