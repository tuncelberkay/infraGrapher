"use client";

import React, { useEffect, useRef, useMemo } from "react";
import cytoscape, { ElementDefinition } from "cytoscape";
import { GraphNode, GraphEdge } from "../services/correlationEngine";

interface ImpactGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function ImpactGraph({ nodes, edges }: ImpactGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const elements = useMemo(() => {
    const cyNodes: ElementDefinition[] = nodes.map(n => {
      let nodeClass = "healthy";
      if (n.health === "degraded") nodeClass = "degraded";
      if (n.health === "unknown") nodeClass = "unknown";

      return {
        data: { id: n.id, label: n.label, type: n.type, vendor: n.vendor },
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
          name: "cose",
          idealEdgeLength: 150,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 50,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: function() { return 400000; },
          edgeElasticity: function() { return 100; },
          nestingFactor: 5
        },
        style: [
          {
            selector: "node",
            style: {
              "background-opacity": 0,
              "border-width": 0,
              "width": 30,
              "height": 30,
              "label": "data(label)",
              "color": "#fff",
              "font-size": "10px",
              "text-valign": "bottom",
              "text-margin-y": 8
            }
          },
          {
            selector: "node.healthy",
            style: { "color": "#00e5ff" }
          },
          {
            selector: "node.degraded",
            style: { "color": "#ff3366" }
          },
          {
            selector: "node.unknown",
            style: { "color": "#ffaa00" }
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
              "line-color": "#444",
              "target-arrow-color": "#444",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              "label": "data(label)",
              "font-size": "8px",
              "color": "#888",
              "text-background-opacity": 1,
              "text-background-color": "#0a0a0a"
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
  }, [elements]);

  return (
    <div className="w-full h-screen absolute inset-0 z-0 bg-[#0a0a0a]">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
