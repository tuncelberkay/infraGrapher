"use client";

import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function TestGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        {
          data: { id: "cluster-1", label: "Parent Container" },
          classes: "parent-box"
        },
        {
          data: { id: "child-a", parent: "cluster-1", label: "Child A" },
          position: { x: 50, y: 50 }
        },
        {
          data: { id: "child-b", parent: "cluster-1", label: "Child B" },
          position: { x: 200, y: 50 }
        },
        {
          data: { id: "edge-1", source: "child-a", target: "child-b" }
        }
      ],
      layout: {
        name: "preset" // Preset layout uses exact coordinates specified above
      },
      style: [
        {
          selector: ".parent-box",
          style: {
            "shape": "roundrectangle",
            "background-color": "rgba(255, 0, 0, 0.05)",
            "border-color": "red",
            "border-width": 2,
            "label": "data(label)",
            "text-valign": "top",
            "text-halign": "center",
            "padding": "20px" as any,
            "color": "white"
          }
        },
        {
          selector: 'node[id != "cluster-1"]',
          style: {
            "background-color": "#3b82f6",
            "label": "data(label)",
            "color": "white",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "width": 30,
            "height": 30
          }
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#94a3b8",
            "target-arrow-color": "#94a3b8",
            "target-arrow-shape": "triangle"
          }
        }
      ]
    });

    cy.fit(undefined, 50);

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", backgroundColor: "#0f172a" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
