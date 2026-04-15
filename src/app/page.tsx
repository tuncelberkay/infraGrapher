"use client";

import React, { useState } from "react";
import ImpactGraph from "../components/ImpactGraph";
import SearchPanel from "../components/SearchPanel";
import FloatingDock from "../components/FloatingDock";
import { GraphNode, GraphEdge } from "../services/correlationEngine";

export default function Home() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIp, setCurrentIp] = useState("10.50.20.15");

  const handleAnalyze = async (ip: string) => {
    setIsLoading(true);
    setCurrentIp(ip);
    
    try {
      const res = await fetch("/api/antigravity/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleCreateReport = () => {
    if (!currentIp) return;
    window.open(`/report?ip=${encodeURIComponent(currentIp)}`, "_blank");
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background">
      <SearchPanel isLoading={isLoading} onAnalyze={handleAnalyze} defaultIp={currentIp} />
      
      <div className="absolute inset-0 w-full h-full">
        <ImpactGraph nodes={nodes} edges={edges} />
      </div>

      <FloatingDock onGenerateReport={handleCreateReport} />
    </main>
  );
}
