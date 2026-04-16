import {
  GraphNode, GraphEdge, EntityType, EdgeType, InfrastructureGraph
} from "./schemas";

export type { GraphNode, GraphEdge, InfrastructureGraph };
export { EntityType, EdgeType };
import {
  firewallLogs, webServers, databases, operatingSystems, openshiftGateways,
  openshiftServices, openshiftPods, openshiftWorkerNodes, openshiftDataFoundation,
  vmwareAria, xormonStorage, loadBalancers, apiGateways, sslVisibility, firewalls, networkSwitches
} from "../data/mockData";

export function generateImpactGraph(targetIp: string): InfrastructureGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const addNode = (node: GraphNode) => {
    if (!nodes.has(node.id)) {
      if (node.vendor) {
        let slug = node.vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Remap specific vendor slugs aligning with simpleicons structure natively
        const mappings: Record<string, string> = {
          "paloaltonetworks": "paloaltonetworks", "openshift": "redhatopenshift",
          "mssql": "microsoftsqlserver", "tomcat": "apachetomcat",
          "ibm": "ibm", "dell": "dell", "huawei": "huawei", "cisco": "cisco",
          "fortinet": "fortinet", "citrix": "citrix", "vmware": "vmware"
        };
        slug = mappings[slug] || slug;
        node.icon_url = `/assets/icons/vendors/${slug}.svg`;
      } else {
        node.icon_url = `/assets/icons/default-node.svg`;
      }
      nodes.set(node.id, node);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    if (!edges.some(e => e.id === edge.id)) edges.push(edge);
  }

  // --- 0. Synthesize Overarching Logical Clusters ---
  addNode({ id: "cluster-vmware", entity_type: EntityType.CLUSTER, label: "VMware vSphere Cluster", parent_id: null });
  addNode({ id: "cluster-openshift", entity_type: EntityType.CLUSTER, label: "OpenShift Platform", parent_id: null });
  addNode({ id: "zone-network", entity_type: EntityType.CLUSTER, label: "Network & Security Zone", parent_id: null });
  addNode({ id: "zone-storage", entity_type: EntityType.CLUSTER, label: "Storage Fabric", parent_id: null });

  // --- 1. Storage to Compute Mapping ---
  // Storage Nodes
  for (const st of xormonStorage) {
    addNode({
      id: st.datastore, 
      label: st.datastore,
      entity_type: EntityType.STORAGE_VOLUME,
      vendor: st.vendor,
      parent_id: "zone-storage"
    });
  }

  // VMware Nodes (Clusters & VMs)
  for (const vm of vmwareAria) {
    const esxiId = `host-${vm.esxi_host}`;
    addNode({
      id: esxiId,
      label: vm.esxi_host,
      entity_type: EntityType.CLUSTER,
      vendor: "VMware",
      parent_id: "cluster-vmware"
    });

    const vmId = `vm-${vm.vm_name}`;
    addNode({
      id: vmId,
      label: vm.vm_name,
      entity_type: EntityType.VM,
      vendor: "VMware",
      parent_id: esxiId
    });

    if (vm.datastore) {
      addEdge({
        id: `e-vm-st-${vmId}`,
        source_id: vmId,
        target_id: vm.datastore,
        edge_type: EdgeType.DEPENDENCY
      });
    }
  }

  // --- 2. OpenShift Hierarchy ---
  for (const wn of openshiftWorkerNodes) {
    const parentVmId = `vm-${wn.id}`;
    const hasVmParent = nodes.has(parentVmId);

    addNode({
      id: wn.id,
      label: wn.hostname,
      entity_type: EntityType.VM,
      vendor: wn.vendor,
      parent_id: "cluster-openshift"
    });

    if (hasVmParent) {
      addEdge({
        id: `e-ho-${wn.id}`,
        source_id: wn.id,
        target_id: parentVmId,
        edge_type: EdgeType.HOSTED_ON
      });
    }
  }

  for (const pod of openshiftPods) {
    addNode({
      id: pod.id,
      label: pod.pod_name,
      entity_type: EntityType.CONTAINER,
      vendor: pod.vendor,
      parent_id: "cluster-openshift"
    });

    if (pod.node_id) {
      addEdge({
        id: `e-dep-${pod.id}`,
        source_id: pod.id,
        target_id: pod.node_id,
        edge_type: EdgeType.DEPENDENCY
      });
    }

    if (pod.storage_pvc) {
      const odf = openshiftDataFoundation.find(o => o.pvc_name === pod.storage_pvc);
      if (odf) {
        addEdge({
          id: `e-pvc-${pod.id}`,
          source_id: pod.id,
          target_id: odf.backing_store,
          edge_type: EdgeType.DEPENDENCY
        });
      }
    }
  }

  for (const gw of openshiftGateways) {
    addNode({
      id: gw.id,
      label: gw.hostname,
      entity_type: EntityType.GATEWAY,
      vendor: gw.vendor,
      parent_id: "cluster-openshift"
    });

    if (gw.service_id) {
      addEdge({
        id: `e-dep-${gw.id}`,
        source_id: gw.id,
        target_id: gw.service_id,
        edge_type: EdgeType.DEPENDENCY
      });
    }
  }

  for (const svc of openshiftServices) {
    addNode({
      id: svc.id,
      label: svc.name,
      entity_type: EntityType.ROUTE,
      vendor: svc.vendor,
      parent_id: "cluster-openshift"
    });

    if (svc.pod_name) {
      addEdge({
        id: `e-dep-${svc.id}`,
        source_id: svc.id,
        target_id: svc.pod_name,
        edge_type: EdgeType.DEPENDENCY
      });
    }
  }

  // --- 3. Compute and OS Mapping ---
  for (const os of operatingSystems) {
     const osId = os.id;
     let parentId = os.host_id;
     if (os.type === 'vm' && !nodes.has(parentId)) {
         parentId = `vm-${os.host_id.replace("vm-", "")}`;
     }
     
     addNode({
       id: osId,
       label: os.hostname,
       entity_type: EntityType.VM,
       vendor: os.vendor,
       parent_id: nodes.has(parentId) ? parentId : null
     });
  }
  
  for (const db of databases) {
    let parentId = db.os_id; 
    addNode({
      id: db.id,
      label: db.hostname,
      entity_type: EntityType.DATASOURCE,
      vendor: db.vendor,
      parent_id: parentId
    });

    if (db.db_storage) {
      addEdge({
        id: `e-db-st-${db.id}`,
        source_id: db.id,
        target_id: db.db_storage,
        edge_type: EdgeType.DEPENDENCY
      });
    }
  }

  for (const ws of webServers) {
    addNode({
      id: ws.id,
      label: ws.hostname,
      entity_type: EntityType.CONTAINER,
      vendor: ws.vendor,
      parent_id: ws.os_id
    });
  }

  // --- 4. Network & Gateway Edge Mapping ---
  const networkTypes = [
    { list: loadBalancers, type: EntityType.VSERVER },
    { list: apiGateways, type: EntityType.GATEWAY },
    { list: sslVisibility, type: EntityType.GATEWAY },
    { list: firewalls, type: EntityType.FIREWALL_RULE },
    { list: networkSwitches, type: EntityType.NETWORK_INTERFACE }
  ];

  for (const group of networkTypes) {
    for (const item of group.list as any[]) {
      addNode({
        id: item.id,
        label: item.hostname,
        entity_type: group.type,
        vendor: item.vendor,
        parent_id: "zone-network"
      });

      if (item.targets) {
        for (const tIP of item.targets) {
           addEdge({
             id: `e-rt-${item.id}-${tIP}`,
             source_id: item.id,
             target_id: tIP,
             edge_type: EdgeType.ROUTE_PATH
           });
        }
      }
    }
  }

  // IP Resolution Map
  const ipMap = new Map<string, string>();
  const collectIps = (list: any[]) => {
      for(const item of list) {
          if (item.ip_address && item.id) ipMap.set(item.ip_address, item.id);
      }
  }
  collectIps(loadBalancers);
  collectIps(apiGateways);
  collectIps(sslVisibility);
  collectIps(firewalls);
  collectIps(networkSwitches);
  collectIps(webServers);
  collectIps(databases);
  collectIps(openshiftGateways);

  for (const edge of edges) {
     if (ipMap.has(edge.target_id)) {
         edge.target_id = ipMap.get(edge.target_id)!;
     }
  }

  // --- 5. Raw Firewall Log Ingestion (NETFLOW) ---
  for (let i = 0; i < firewallLogs.length; i++) {
    const log = firewallLogs[i];
    if (log.action !== "allow") continue;

    let srcId = ipMap.get(log.src_ip) || "Internet";
    let destId = ipMap.get(log.dest_ip);

    if (destId) {
      if (!nodes.has("Internet")) {
         addNode({
           id: "Internet",
           label: "Internet Boundary",
           entity_type: EntityType.GATEWAY,
           parent_id: null
         });
      }
      addEdge({
        id: `fw-edge-${i}`,
        source_id: srcId,
        target_id: destId,
        edge_type: EdgeType.NETFLOW
      });
    }
  }

  // --- 6. Subgraph Extraction Engine (Search & Focus) ---
  if (targetIp) {
    const q = targetIp.toLowerCase().trim();
    let targetNodeId: string | null = null;
    
    if (ipMap.has(q)) {
      targetNodeId = ipMap.get(q)!;
    } else {
      for (const [id, node] of nodes.entries()) {
        if (id.toLowerCase() === q || node.label.toLowerCase() === q) {
          targetNodeId = id;
          break;
        }
      }
    }

    if (targetNodeId) {
      const subgraphNodes = new Set<string>();
      subgraphNodes.add(targetNodeId);

      // PASS 1: Horizontal (Network Neighbors - 1 Hop)
      edges.forEach(edge => {
        if (edge.source_id === targetNodeId || edge.target_id === targetNodeId) {
          subgraphNodes.add(edge.source_id);
          subgraphNodes.add(edge.target_id);
        }
      });

      // PASS 2 & 3: Unified Vertical Recursion Loop
      let countBefore;
      do {
        countBefore = subgraphNodes.size;

        // PASS 3: Vertical DOWN (Logicals, Physical Dependencies, Hosting)
        edges.forEach(edge => {
          if ([EdgeType.DEPENDENCY, EdgeType.HOSTED_ON].includes(edge.edge_type)) {
            if (subgraphNodes.has(edge.source_id)) {
              subgraphNodes.add(edge.target_id);
            }
          }
        });

        // PASS 2: Vertical UP (Preserve ALL Parent Clusters mapping)
        Array.from(subgraphNodes).forEach(id => {
          const node = nodes.get(id);
          if (node && node.parent_id) {
            subgraphNodes.add(node.parent_id);
          }
        });

      } while (subgraphNodes.size > countBefore);

      const filteredNodes = Array.from(nodes.values()).filter(n => subgraphNodes.has(n.id));
      const filteredEdges = edges.filter(e => subgraphNodes.has(e.source_id) && subgraphNodes.has(e.target_id));

      return { nodes: filteredNodes, edges: filteredEdges, rootNodeId: targetNodeId };
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}
