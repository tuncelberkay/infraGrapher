"use client";

import React, { useState } from "react";
import ImpactGraph from "../components/ImpactGraph";
import TopBar from "../components/TopBar";
import { GraphNode, GraphEdge } from "../services/correlationEngine";

export default function Home() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (ip: string) => {
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/antigravity/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: We skip the LLM execution for instant graph parsing!
        body: JSON.stringify({ targetIp: ip, enableLLM: false })
      });
      
      const json = await res.json();
      if (json.success) {
        setNodes(json.data.graph.nodes);
        setEdges(json.data.graph.edges);
      } else {
        console.error("Analysis Error:", json.error);
        alert("Tarama başarısız oldu: " + json.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Critical Analysis Error:", msg);
      alert("Kritik Hata: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <TopBar isLoading={isLoading} onAnalyze={handleAnalyze} />
      {/* Container below TopBar so graph centers properly */}
      <div className="absolute top-16 left-0 w-full h-[calc(100vh-64px)]">
        <ImpactGraph nodes={nodes} edges={edges} />
      </div>
    </main>
  );
}
