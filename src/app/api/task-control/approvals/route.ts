import { NextResponse } from "next/server";
import { listApprovals } from "@/lib/task-control/mock-store";

export async function GET() {
  return NextResponse.json(listApprovals());
}
