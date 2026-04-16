"use client";

import React, { useEffect, useRef, useMemo } from "react";
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
              "background-image": "data(icon_url)",
              "background-fit": "contain",
              "background-clip": "none",
              "border-width": 2,
              "border-style": "solid",
              "border-color": "transparent", // Placeholder border for health
              "width": 48,
              "height": 48,
              "z-index": 20,
              "label": "data(label)",
              "color": isDark ? "#fff" : "#0f172a",
              "font-size": "10px",
              "text-valign": "bottom",
              "text-margin-y": 8,
              "text-background-opacity": 1,
              "text-background-padding": "3px",
              "text-background-color": isDark ? "#090A0C" : "#FFFFFF"
            }
          },
          {
            selector: "node.healthy",
            style: { "border-color": isDark ? "#D6FF00" : "#059669", "color": isDark ? "#D6FF00" : "#059669" }
          },
          {
            selector: "node.degraded",
            style: { "border-color": isDark ? "#FF0055" : "#E11D48", "color": isDark ? "#FF0055" : "#E11D48" }
          },
          {
            selector: "node.unknown",
            style: { "border-color": "#64748B", "color": "#64748B" }
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
            selector: "node[vendor = 'OpenShift']",
            style: { "background-image": "/icons/redhatopenshift.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'VMware']",
            style: { "background-image": "/icons/vmware.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Huawei']",
            style: { "background-image": "/icons/huawei.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'IBM']",
            style: { "background-image": "/icons/ibm.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Dell']",
            style: { "background-image": "/icons/dell.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'ODF']",
            style: { "background-image": "/icons/ceph.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Tomcat']",
            style: { "background-image": "/icons/apachetomcat.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'IIS']",
            style: { "background-image": "/icons/microsoft.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Oracle']",
            style: { "background-image": "/icons/oracle.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'PostgreSQL']",
            style: { "background-image": "/icons/postgresql.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'MsSQL']",
            style: { "background-image": "/icons/microsoftsqlserver.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'MySQL']",
            style: { "background-image": "/icons/mysql.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'MongoDB']",
            style: { "background-image": "/icons/mongodb.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'RHEL 9']",
            style: { "background-image": "/icons/redhat.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'RHEL 8']",
            style: { "background-image": "/icons/redhat.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Windows Server 2022']",
            style: { "background-image": "/icons/windows.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Windows Server 2019']",
            style: { "background-image": "/icons/windows.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Arista']",
            style: { "background-image": "/icons/arista.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Cisco']",
            style: { "background-image": "/icons/cisco.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Fortinet']",
            style: { "background-image": "/icons/fortinet.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'PaloAltoNetworks']",
            style: { "background-image": "/icons/paloaltonetworks.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'A10Networks']",
            style: { "background-image": "/icons/serverless.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Broadcom']",
            style: { "background-image": "/icons/broadcom.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
          },
          {
            selector: "node[vendor = 'Citrix']",
            style: { "background-image": "/icons/citrix.svg", "background-fit": "cover", "border-width": 0, "background-image-opacity": 1 }
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
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [elements, isDark]);

  return (
    <div className="w-full h-screen absolute inset-0 z-0 bg-background">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
