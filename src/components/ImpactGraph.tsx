"use client";

import React, { useEffect, useRef, useMemo } from "react";
import cytoscape, { ElementDefinition } from "cytoscape";
import dagre from "cytoscape-dagre";
import { useTheme } from "next-themes";

cytoscape.use(dagre);
import { GraphNode, GraphEdge } from "../services/correlationEngine";

interface ImpactGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function ImpactGraph({ nodes, edges }: ImpactGraphProps) {
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
        data: { id: n.id, label: n.label, type: n.type, vendor: n.vendor, parent: n.parent },
        classes: `${nodeClass} ${n.type.toLowerCase()}`
      };
    });

    const cyEdges: ElementDefinition[] = edges.map(e => ({
      data: { id: e.id, source: e.source, target: e.target, label: e.connectionType.replace(/_/g, " ").toUpperCase() }
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
          rankDir: "LR",      // Left to Right
          nodeSep: 40,        // Vertical spacing between nodes in the same column
          edgeSep: 20,
          rankSep: 250,       // Horizontal spacing between columns to let beziers curve gracefully
          padding: 50,
          fit: true,
          animate: true,
          animationDuration: 500
        } as any,
        style: [
          {
            selector: "node",
            style: {
              "background-opacity": 0,
              "border-width": 0,
              "width": 30,
              "height": 30,
              "label": "data(label)",
              "color": isDark ? "#fff" : "#0f172a",
              "font-size": "10px",
              "text-valign": "bottom",
              "text-margin-y": 8
            }
          },
          {
            selector: "node.healthy",
            style: { "color": isDark ? "#D6FF00" : "#059669" }
          },
          {
            selector: "node.degraded",
            style: { "color": isDark ? "#FF0055" : "#E11D48" }
          },
          {
            selector: "node.unknown",
            style: { "color": "#64748B" }
          },
          {
            selector: ":parent",
            style: {
              "shape": "roundrectangle",
              "background-opacity": isDark ? 0.1 : 0.8,
              "background-color": isDark ? "#1C1F26" : "#f1f5f9",
              "border-color": isDark ? "#475569" : "#cbd5e1",
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
            }
          },
          {
            selector: "node[id = 'openshift-cluster']",
            style: {
              "background-image": `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30"><text x="100" y="25" text-anchor="middle" fill="${isDark ? '#94a3b8' : '#64748b'}" font-size="12px" font-family="sans-serif" font-weight="bold">[ oc-prod-us-east-1 ]</text></svg>`)}`,
              "background-position-y": "100%" as any,
              "background-position-x": "50%" as any,
              "background-fit": "none" as any,
              "background-clip": "none" as any
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
              "width": 1.5,
              "line-color": isDark ? "#475569" : "#94a3b8",
              "target-arrow-color": isDark ? "#475569" : "#94a3b8",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              "label": "data(label)",
              "font-size": "9px",
              "color": isDark ? "#94A3B8" : "#64748b",
              "text-background-opacity": 1,
              "text-background-color": isDark ? "#090A0C" : "#FFFFFF"
            }
          }
        ]
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
