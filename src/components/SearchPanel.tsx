"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchPanelProps {
  isLoading: boolean;
  onAnalyze: (ip: string) => void;
  defaultIp?: string;
}

export default function SearchPanel({ isLoading, onAnalyze, defaultIp = "10.50.20.15" }: SearchPanelProps) {
  const [ip, setIp] = useState(defaultIp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ip) onAnalyze(ip);
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-brand-surface/80 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 shadow-2xl flex items-center gap-2 transition-all hover:border-white/20">
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="pl-4 pr-3 text-brand-chartreuse">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            disabled={isLoading}
            placeholder="Target IP or Hostname"
            className="w-64 bg-transparent text-foreground font-mono text-sm focus:outline-none placeholder:text-foreground/30"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-brand-chartreuse hover:bg-white text-black font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ml-2"
          >
            {isLoading ? "Scanning..." : "Execute"}
          </button>
        </form>
      </div>
    </div>
  );
}
