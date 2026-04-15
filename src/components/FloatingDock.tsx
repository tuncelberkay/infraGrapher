"use client";

import React from "react";
import { FileText, Network, Settings, Download } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface FloatingDockProps {
  onGenerateReport: () => void;
}

export default function FloatingDock({ onGenerateReport }: FloatingDockProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-brand-surface/90 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-full p-2 shadow-2xl flex items-center gap-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 text-brand-chartreuse">
          <Network className="w-6 h-6" />
        </div>
        
        <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10 mx-2"></div>
        
        <button 
          onClick={onGenerateReport}
          className="flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium px-5 py-3 rounded-full transition-colors text-sm"
        >
          <FileText className="w-4 h-4 text-brand-chartreuse" />
          Generate Report
        </button>
        
        <button className="flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium px-5 py-3 rounded-full transition-colors text-sm">
          <Download className="w-4 h-4 text-foreground/50" />
          Export JSON
        </button>

        <button className="flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium px-5 py-3 rounded-full transition-colors text-sm">
          <Settings className="w-4 h-4 text-foreground/50" />
          Config
        </button>
        
        <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10 mx-2"></div>
        <ThemeToggle />
      </div>
    </div>
  );
}
