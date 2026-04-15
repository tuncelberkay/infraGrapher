import { NextResponse } from 'next/server';
import { generateImpactGraph } from '@/services/correlationEngine';
import { generateImpactReport } from '@/services/impactAnalyzer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetIp, enableLLM = false } = body;

    if (!targetIp) {
      return NextResponse.json({ error: "Target IP parameter is required." }, { status: 400 });
    }

    // Step 1: Generate Deterministic Graph
    const graph = generateImpactGraph(targetIp);

    // Step 2: Generate LLM Impact Report
    const impactReport = await generateImpactReport(graph, enableLLM);

    return NextResponse.json({
      success: true,
      data: {
        graph,
        impactReport
      }
    });

  } catch (error: unknown) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Turbopack Cache Invalidate
