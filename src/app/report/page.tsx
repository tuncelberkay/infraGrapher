"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Network, Terminal, BrainCircuit, Activity } from "lucide-react";

function ReportContent() {
  const searchParams = useSearchParams();
  const ip = searchParams.get("ip");
  
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);

  const triggerReport = async (useAI: boolean) => {
    setLoading(true);
    setModeSelected(true);
    try {
      const res = await fetch("/api/antigravity/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetIp: ip, enableLLM: useAI })
      });
      const json = await res.json();
      if (json.success) {
        setReport(json.data.impactReport);
      } else {
        setReport("ERROR: " + json.error);
      }
    } catch (err) {
      setReport("ERROR: Execution failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!ip) {
    return <div className="text-center font-mono text-brand-critical pt-24">URL bağlamında geçerli bir IP vektörü sağlanmadı.</div>
  }

  if (!modeSelected) {
     return (
        <div className="max-w-3xl mx-auto py-48 px-8 text-center">
          <h2 className="text-2xl font-mono text-brand-cyan mb-12 uppercase tracking-widest">Analiz Motorunu Seçin</h2>
          <div className="grid grid-cols-2 gap-8">
             <button onClick={() => triggerReport(true)} className="flex flex-col items-center gap-6 p-10 border border-brand-amber hover:bg-brand-amber/10 transition-colors cursor-pointer group">
                <BrainCircuit className="w-16 h-16 text-brand-amber group-hover:scale-110 transition-transform" />
                <span className="font-mono text-white text-sm uppercase font-bold tracking-widest">Yapay Zeka (LLM)</span>
                <span className="font-mono text-[#666] text-xs">Derin bağlam analizi ve yorumlama</span>
             </button>
             <button onClick={() => triggerReport(false)} className="flex flex-col items-center gap-6 p-10 border border-brand-cyan hover:bg-brand-cyan/10 transition-colors cursor-pointer group">
                <Activity className="w-16 h-16 text-brand-cyan group-hover:scale-110 transition-transform" />
                <span className="font-mono text-white text-sm uppercase font-bold tracking-widest">Standart Telemetri</span>
                <span className="font-mono text-[#666] text-xs">Deterministik ayrıştırıcı (Çevrimdışı)</span>
             </button>
          </div>
        </div>
     );
  }

  if (loading) {
     return (
       <div className="flex animate-pulse space-y-4 flex-col mx-auto max-w-3xl py-48 text-center items-center justify-center">
          <Terminal className="w-16 h-16 text-brand-amber mb-6 animate-bounce" />
          <h2 className="font-mono text-brand-cyan tracking-widest text-lg uppercase">Altyapı Matrisi Derleniyor...</h2>
          <p className="font-mono text-[#666] text-sm uppercase">{ip} vektörü için bağlantı izlemesi yürütülüyor</p>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto py-24 px-8">
       <div className="border-b border-[#333] pb-8 mb-8">
           <h1 className="text-3xl font-sans uppercase font-bold text-white mb-2">Yönetici Etki Alanı Raporu</h1>
           <h2 className="text-lg font-mono text-brand-cyan uppercase">Hedef Vektör: <span className="text-brand-amber">{ip}</span></h2>
       </div>

       <div className="prose prose-invert prose-p:font-mono prose-p:text-sm prose-p:leading-relaxed prose-headings:font-sans prose-headings:uppercase prose-a:text-brand-cyan max-w-none">
            {report?.split('\n').map((line, i) => {
              if (line.startsWith('* ') || line.startsWith('- ')) {
                return <li key={i} className="text-[#ddd] marker:text-brand-cyan list-square ml-4 mb-2">{line.replace(/^[\*\-]\s/, '')}</li>;
              }
              if (line.startsWith('###')) return <h3 key={i} className="text-white mt-8 mb-4 border-b border-[#333] pb-2">{line.replace(/^###\s/, '')}</h3>;
              if (line.startsWith('##')) return <h2 key={i} className="text-brand-cyan mt-8 mb-4">{line.replace(/^##\s/, '')}</h2>;
              if (line.startsWith('#')) return <h1 key={i} className="text-brand-amber mt-10 mb-4 text-2xl border-b border-[#555] pb-2">{line.replace(/^#\s/, '')}</h1>;
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="text-[#aaa] mb-4">{line}</p>;
            })}
        </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-auto">
      <div className="fixed top-0 left-0 w-full h-16 border-b border-[#333] bg-[#0a0a0a]/90 backdrop-blur-sm shadow-xl flex items-center px-6 z-50">
          <Network className="text-brand-critical w-6 h-6 mr-3" />
          <h1 className="text-white font-mono uppercase tracking-widest text-lg m-0">Durugörü / <span className="text-[#666]">Rapor Modülü</span></h1>
      </div>
      <Suspense fallback={<div className="pt-24 text-center font-mono text-[#666]">Modül Yükleniyor...</div>}>
         <ReportContent />
      </Suspense>
    </div>
  );
}
