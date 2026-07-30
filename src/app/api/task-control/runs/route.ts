import { NextResponse } from "next/server";
import { listRuns } from "@/lib/task-control/mock-store";

export async function GET() {
  return NextResponse.json(listRuns());
}
