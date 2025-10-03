// app/api/agent-training/flows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { FlowService } from "@/services/flowService";

// -------- GET --------
export async function GET(req: NextRequest) {
  try {
    const botId = req.nextUrl.searchParams.get("botId");
    if (!botId) return NextResponse.json({ error: "Missing botId" }, { status: 400 });

    const flows = await FlowService.getFlows(botId);
    return NextResponse.json(flows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------- POST --------
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    if (!rawData.botId) return NextResponse.json({ error: "Missing botId" }, { status: 400 });

    const newFlow = await FlowService.createFlow(rawData);
    return NextResponse.json(newFlow);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------- PUT --------
export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing flow ID" }, { status: 400 });

    const updated = await FlowService.updateFlow(id, updateData);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------- DELETE --------
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const botId = req.nextUrl.searchParams.get("botId");
    if (!id || !botId) return NextResponse.json({ error: "Missing id or botId" }, { status: 400 });

    const success = await FlowService.deleteFlow(id, botId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
