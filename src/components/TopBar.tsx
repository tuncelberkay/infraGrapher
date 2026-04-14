"use client";

import React from "react";
import { Network, FileText } from "lucide-react";

interface TopBarProps {
  isLoading: boolean;
  onAnalyze: (ip: string) => void;
}

export default function TopBar({ isLoading, onAnalyze }: TopBarProps) {
  const [ip, setIp] = React.useState("10.50.20.15");

  const handleCreateReport = () => {
    if (!ip) return;
    window.open(`/report?ip=${encodeURIComponent(ip)}`, "_blank");
  };

  return (
    <div className="absolute top-0 left-0 w-full h-16 z-10 border-b border-[#333] bg-[#0a0a0a]/90 backdrop-blur-sm shadow-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Network className="text-brand-critical w-6 h-6" />
        <h1 className="text-white font-mono uppercase tracking-widest text-lg m-0">Durugörü: Infra Analysis</h1>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-[10px] text-brand-cyan font-mono uppercase hidden sm:block">Hedef IP / Hostname</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-48 bg-transparent border border-[#333] px-3 py-1.5 text-white font-mono text-sm focus:border-brand-cyan focus:outline-none transition-colors"
          />
          <button 
            onClick={() => onAnalyze(ip)}
            disabled={isLoading}
            className="bg-brand-cyan hover:bg-white text-black font-mono font-bold px-6 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
          >
            {isLoading ? "Taranıyor..." : "Çalıştır"}
          </button>
        </div>
      </div>

      <div>
        <button 
          onClick={handleCreateReport}
          className="flex items-center gap-2 border border-brand-amber text-brand-amber hover:bg-brand-amber hover:text-black font-mono font-bold px-4 py-1.5 transition-colors uppercase text-sm"
        >
          <FileText className="w-4 h-4" />
          Rapor Oluştur
        </button>
      </div>
    </div>
  );
}
