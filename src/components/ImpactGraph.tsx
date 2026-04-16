"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import cytoscape, { ElementDefinition } from "cytoscape";
// @ts-ignore
import dagre from "cytoscape-dagre";
import { useTheme } from "next-themes";

cytoscape.use(dagre);
import { GraphNode, GraphEdge } from "../services/correlationEngine";

interface ImpactGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeId?: string;
}

export default function ImpactGraph({ nodes, edges, rootNodeId }: ImpactGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [viewport, setViewport] = useState({ pan: { x: 0, y: 0 }, zoom: 1 });
  const [domNodes, setDomNodes] = useState<any[]>([]);

  const elements = useMemo(() => {
    const cyNodes: ElementDefinition[] = nodes.map(n => {
      let nodeClass = "healthy";
      if (n.health === "degraded") nodeClass = "degraded";
      if (n.health === "unknown") nodeClass = "unknown";

      return {
        data: { id: n.id, label: n.label, type: n.entity_type, vendor: n.vendor, parent: n.parent_id || undefined, icon_url: n.icon_url },
        classes: `${nodeClass} ${n.entity_type.toLowerCase()}`
      };
    });

    const cyEdges: ElementDefinition[] = edges.map(e => ({
      data: { id: e.id, source: e.source_id, target: e.target_id, label: e.edge_type.replace(/_/g, " ").toUpperCase() },
      classes: e.edge_type.toLowerCase().replace(/_/g, "-")
    }));

    return [...cyNodes, ...cyEdges];
  }, [nodes, edges]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    if (elements.length > 0) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: elements,
        layout: {
          name: "dagre",
          rankDir: "LR",
          nodeSep: 100, 
          edgeSep: 50,
          rankSep: 200, 
          padding: 80,
          fit: true,
          animate: true,
          animationDuration: 800
        } as any,
        style: [
          {
            selector: ".target-glow",
            style: {
              "underlay-color": isDark ? "#D6FF00" : "#0ea5e9",
              "underlay-padding": 12 as any,
              "underlay-opacity": 0.6 as any,
              "underlay-shape": "ellipse"
            }
          },
          {
            selector: "node",
            style: {
              "background-opacity": 0,
              "border-width": 0,
              "width": 24, // Reduces internal collision bounds so SVG overlay controls limits completely
              "height": 24,
              "z-index": 20
            }
          },
          {
            selector: "node.healthy",
            style: {  }
          },
          {
            selector: "node.degraded",
            style: {  }
          },
          {
            selector: "node.unknown",
            style: {  }
          },
          {
            selector: ":parent",
            style: {
              "shape": "roundrectangle",
              "background-image": "none",
              "background-color": isDark ? "#cccccc" : "#888888",
              "background-opacity": 0.05,
              "z-index": -1,
              "events": "no",
              "border-color": isDark ? "#888888" : "#888888",
              "border-width": 2,
              "border-style": "dashed",
              "label": "data(label)",
              "color": isDark ? "#F8FAFC" : "#334155",
              "font-size": "12px",
              "font-weight": "bold",
              "text-valign": "top",
              "text-halign": "center",
              "padding": "24px" as any,
              "text-margin-y": 8 as any,
              "text-background-opacity": 0
            }
          },

          {
            selector: "node[vendor]",
            style: { "background-image": "none" }
          },
          {
            selector: "edge",
            style: {
              "width": 2,
              "z-index": 10,
              "line-color": isDark ? "#475569" : "#94a3b8",
              "target-arrow-color": isDark ? "#475569" : "#94a3b8",
              "target-arrow-shape": "triangle",
              "curve-style": "taxi",
              "taxi-turn": 15 as any,
              "taxi-turn-min-distance": 15,
              "label": "data(label)",
              "font-size": "9px",
              "color": isDark ? "#94A3B8" : "#64748b",
              "text-background-opacity": 1,
              "text-background-padding": "2px",
              "text-background-color": isDark ? "#090A0C" : "#FFFFFF"
            }
          },
          {
            selector: "edge.hosted-on",
            style: {
              "width": 3,
              "line-style": "dashed",
              "line-color": isDark ? "#D6FF00" : "#d97706",
              "target-arrow-color": isDark ? "#D6FF00" : "#d97706"
            }
          },
          {
            selector: "edge.dependency",
            style: {
              "width": 3,
              "line-style": "dashed",
              "line-color": isDark ? "#fbbf24" : "#f59e0b",
              "target-arrow-color": isDark ? "#fbbf24" : "#f59e0b"
            }
          }
        ]
      });

      cyRef.current.ready(() => {
        if (rootNodeId) {
          const target = cyRef.current!.$(`#${rootNodeId}`);
          if (target.length > 0) {
            target.addClass('target-glow');
            setTimeout(() => {
              // Fit entire viewport gracefully
              if(cyRef.current) cyRef.current.animate({ fit: { eles: cyRef.current.elements(), padding: 50 }, duration: 800 });
            }, 600);
          }
        }
      });

      // DOM Overlay Synchronization
      const updateDom = () => {
        if (!cyRef.current) return;
        const zoom = cyRef.current.zoom();
        const pan = cyRef.current.pan();
        setViewport({ zoom, pan });
        
        // Differentiate Node Types explicitly natively utilizing CSS selectors properly!
        // Grab EXCLUSIVELY leaf nodes (VMs, Gateways) mapping inverse vectors shielding background arrays natively.
        const reactNodes = cyRef.current.nodes(':childless').map(n => ({
          id: n.id(),
          pos: n.position(),
          data: n.data(),
          classes: n.classes().join(" ")
        }));
        setDomNodes(reactNodes);
      };

      cyRef.current.on('zoom pan render position', updateDom);
      setTimeout(updateDom, 50); // Initial capture
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, isDark]);

  return (
    <div className="w-full h-screen absolute inset-0 z-0 bg-background overflow-hidden relative">
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        {domNodes.map(n => {
          const screenX = n.pos.x * viewport.zoom + viewport.pan.x;
          const screenY = n.pos.y * viewport.zoom + viewport.pan.y;
          const inverseScale = 1 / viewport.zoom;
          const showLabel = viewport.zoom >= 0.6;
          
          let color = "transparent";
          if (n.classes.includes("healthy")) color = isDark ? "#D6FF00" : "#059669";
          if (n.classes.includes("degraded")) color = isDark ? "#FF0055" : "#E11D48";
          if (n.classes.includes("unknown")) color = "#64748B";

          return (
            <div key={n.id} style={{
              position: "absolute",
              left: screenX,
              top: screenY,
              transform: `translate(-50%, -50%) scale(${inverseScale})`,
              display: "flex", flexDirection: "column", alignItems: "center",
              pointerEvents: "auto",
              cursor: "pointer",
              transformOrigin: 'center center'
            }}>
              <div style={{
                width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: `2px solid ${color}`, borderRadius: '4px', background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
              }}>
                <img src={n.data.icon_url || '/assets/icons/default-node.svg'} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              </div>
              <div style={{
                position: 'absolute', top: '55px', left: '50%', transform: 'translateX(-50%)',
                background: isDark ? 'rgba(9, 10, 12, 0.85)' : 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '12px',
                color: isDark ? '#fff' : '#0f172a',
                opacity: showLabel ? 1 : 0, transition: 'opacity 0.2s',
                pointerEvents: 'none'
              }}>
                {n.data.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
