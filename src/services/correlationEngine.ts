import { firewallLogs, webServers, databases, operatingSystems, openshiftMesh, openshiftDataFoundation, vmwareAria, xormonStorage, loadBalancers, apiGateways, sslVisibility, firewalls, networkSwitches } from "../data/mockData";

export interface GraphNode {
  id: string;
  label: string;
  type: "Network" | "Compute" | "Storage" | "Container" | "OS" | "Database" | "WebServer" | "StorageODF" | "LoadBalancer" | "APIGateway" | "SSLVis" | "Firewall" | "Switch";
  vendor?: string;
  health: "healthy" | "degraded" | "online" | "unknown";
  metrics?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  connectionType: "routes_traffic_to" | "runs_on" | "resides_on" | "mounted_to" | "backed_by";
  metrics?: { port?: number };
}

export interface InfrastructureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeId?: string;
}

export function generateImpactGraph(targetIp: string): InfrastructureGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  const addNode = (node: GraphNode) => {
    if (!nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  };

  const addEdge = (edge: GraphEdge) => {
    if (!edges.some(e => e.id === edge.id)) edges.push(edge);
  }

  // Recursive upstream network tracing (L4-L7)
  const checkUpstream = (childId: string, childIp: string) => {
    const lbs = loadBalancers.filter(l => l.targets.includes(childIp));
    lbs.forEach(lb => {
      addNode({ id: lb.id, label: lb.hostname, type: "LoadBalancer", vendor: lb.vendor, health: lb.health as "healthy" | "degraded" });
      addEdge({ id: `routes-${lb.id}-${childId}`, source: lb.id, target: childId, connectionType: "routes_traffic_to" });
      checkUpstream(lb.id, lb.ip_address);
    });

    const gws = apiGateways.filter(g => g.targets.includes(childIp));
    gws.forEach(gw => {
      addNode({ id: gw.id, label: gw.hostname, type: "APIGateway", vendor: gw.vendor, health: gw.health as "healthy" | "degraded" });
      addEdge({ id: `routes-${gw.id}-${childId}`, source: gw.id, target: childId, connectionType: "routes_traffic_to" });
      checkUpstream(gw.id, gw.ip_address);
    });

    const ssls = sslVisibility.filter(s => s.targets.includes(childIp));
    ssls.forEach(ssl => {
      addNode({ id: ssl.id, label: ssl.hostname, type: "SSLVis", vendor: ssl.vendor, health: ssl.health as "healthy" | "degraded" });
      addEdge({ id: `routes-${ssl.id}-${childId}`, source: ssl.id, target: childId, connectionType: "routes_traffic_to" });
      checkUpstream(ssl.id, ssl.ip_address);
    });

    const fws = firewalls.filter(f => f.targets.includes(childIp));
    fws.forEach(fw => {
      addNode({ id: fw.id, label: fw.hostname, type: "Firewall", vendor: fw.vendor, health: fw.health as "healthy" | "degraded" });
      addEdge({ id: `routes-${fw.id}-${childId}`, source: fw.id, target: childId, connectionType: "routes_traffic_to" });
      checkUpstream(fw.id, fw.ip_address);
    });

    const sws = networkSwitches.filter(s => s.targets.includes(childIp));
    sws.forEach(sw => {
      addNode({ id: sw.id, label: sw.hostname, type: "Switch", vendor: sw.vendor, health: sw.health as "healthy" | "degraded" });
      addEdge({ id: `routes-${sw.id}-${childId}`, source: sw.id, target: childId, connectionType: "routes_traffic_to" });
      checkUpstream(sw.id, sw.ip_address);
    });
  };

  // Find associated IP flow in Firewall logs to determine lateral blast radius
  const relatedFlows = firewallLogs.filter(log => log.src_ip === targetIp || log.dest_ip === targetIp || log.src_ip === "10.50.20.15" /* Hack for mock trace flow */);
  
  const involvedIPs = new Set([targetIp]);
  relatedFlows.forEach(flow => {
    if (flow.src_ip !== "0.0.0.0") involvedIPs.add(flow.src_ip);
    involvedIPs.add(flow.dest_ip);
  });

  involvedIPs.forEach(ip => {
    // 1. App/Web Layer
    const webServer = webServers.find(ws => ws.ip_address === ip);
    let osId: string | null = null;
    let pvcName: string | null = null;
    let dbStorage: string | null = null;

    if (webServer) {
      addNode({ id: webServer.id, label: webServer.hostname, type: "WebServer", vendor: webServer.vendor, health: webServer.health as "healthy" | "degraded" | "online" | "unknown" });
      osId = webServer.os_id;
      checkUpstream(webServer.id, webServer.ip_address); // Trigger L4-L7 sweep
    }

    // 2. Database Layer
    const db = databases.find(d => d.ip_address === ip);
    if (db) {
      addNode({ id: db.id, label: db.hostname, type: "Database", vendor: db.vendor, health: db.health as "healthy" | "degraded" | "online" | "unknown" });
      osId = db.os_id;
      if (db.storage_pvc) pvcName = db.storage_pvc;
      if (db.db_storage) dbStorage = db.db_storage;
      checkUpstream(db.id, db.ip_address); // Trigger L4-L7 sweep
    }

    // Connect lateral traffic
    relatedFlows.filter(f => f.src_ip === ip || f.dest_ip === ip).forEach(flow => {
      const srcWs = webServers.find(ws => ws.ip_address === flow.src_ip)?.id;
      const srcDb = databases.find(d => d.ip_address === flow.src_ip)?.id;
      const destWs = webServers.find(ws => ws.ip_address === flow.dest_ip)?.id;
      const destDb = databases.find(d => d.ip_address === flow.dest_ip)?.id;

      const sourceId = srcWs || srcDb;
      const destId = destWs || destDb;

      if (sourceId && destId) {
         addEdge({ id: `flow-${sourceId}-${destId}`, source: sourceId, target: destId, connectionType: "routes_traffic_to", metrics: { port: flow.port } });
      }
    });

    // 3. OS / Container Pruning Layer
    if (osId) {
      const os = operatingSystems.find(o => o.id === osId);
      if (os) {
        const parentId = webServer ? webServer.id : (db ? db.id : null);

        if (os.type === "container") {
          // PRUNE OS LAYER: Direct connect Apps to Pods
          const pod = openshiftMesh.find(p => p.pod_name === os.host_id);
          if (pod) {
             addNode({ id: pod.pod_name, label: pod.pod_name, type: "Container", vendor: pod.vendor, health: pod.health as "healthy" | "degraded" | "online" | "unknown" });
             if (parentId) {
               addEdge({ id: `runs-${parentId}-${pod.pod_name}`, source: parentId, target: pod.pod_name, connectionType: "runs_on" });
             }
             
             // Trace pod node to VMware
             const vm = vmwareAria.find(v => v.vm_name === pod.node);
             if (vm) {
               addNode({ id: vm.vm_name, label: vm.vm_name, type: "Compute", vendor: vm.vendor, health: vm.health as "healthy" | "degraded" | "online" | "unknown" });
               addEdge({ id: `resides-${pod.pod_name}-${vm.vm_name}`, source: pod.pod_name, target: vm.vm_name, connectionType: "resides_on" });
               
               // Trace VM to Datastore
               const storage = xormonStorage.find(s => s.datastore === vm.datastore);
               if (storage) {
                 addNode({ id: storage.datastore, label: storage.datastore, type: "Storage", vendor: storage.vendor, health: storage.state as "healthy" | "degraded" | "online" | "unknown" });
                 addEdge({ id: `mounted-${vm.vm_name}-${storage.datastore}`, source: vm.vm_name, target: storage.datastore, connectionType: "mounted_to" });
               }
             }
          }
        } else if (os.type === "vm") {
          // MAINTAIN OS LAYER for physical / VM infrastructure
          addNode({ id: os.id, label: os.hostname, type: "OS", vendor: os.vendor, health: os.health as "healthy" | "degraded" | "online" | "unknown" });
          if (parentId) {
            addEdge({ id: `runs-${parentId}-${os.id}`, source: parentId, target: os.id, connectionType: "runs_on" });
          }

          const vm = vmwareAria.find(v => v.vm_name === os.host_id);
          if (vm) {
            addNode({ id: vm.vm_name, label: vm.vm_name, type: "Compute", vendor: vm.vendor, health: vm.health as "healthy" | "degraded" | "online" | "unknown" });
            addEdge({ id: `resides-${os.id}-${vm.vm_name}`, source: os.id, target: vm.vm_name, connectionType: "resides_on" });
            
             // Trace VM to Datastore
             const storage = xormonStorage.find(s => s.datastore === vm.datastore);
             if (storage) {
               addNode({ id: storage.datastore, label: storage.datastore, type: "Storage", vendor: storage.vendor, health: storage.state as "healthy" | "degraded" | "online" | "unknown" });
               addEdge({ id: `mounted-${vm.vm_name}-${storage.datastore}`, source: vm.vm_name, target: storage.datastore, connectionType: "mounted_to" });
             }
          }
        }
      }
    }

    // 5. OpenShift Data Foundation / Specific Storage (PVC traces)
    if (pvcName) {
      const odf = openshiftDataFoundation.find(o => o.pvc_name === pvcName);
      if (odf) {
        addNode({ id: odf.vendor, label: `ODF: ${odf.component}`, type: "StorageODF", vendor: odf.vendor, health: odf.health as "healthy" | "degraded" | "online" | "unknown" });
        
        // PVC is connected to the DB that requested it
        if (db) addEdge({ id: `mounted-${db.id}-${odf.vendor}`, source: db.id, target: odf.vendor, connectionType: "mounted_to" });

        // ODF is backed by physical storage
        const physicalStorage = xormonStorage.find(s => s.datastore === odf.backing_store);
        if (physicalStorage) {
           addNode({ id: physicalStorage.datastore, label: physicalStorage.datastore, type: "Storage", vendor: physicalStorage.vendor, health: physicalStorage.state as "healthy" | "degraded" | "online" | "unknown" });
           addEdge({ id: `backed-${odf.vendor}-${physicalStorage.datastore}`, source: odf.vendor, target: physicalStorage.datastore, connectionType: "backed_by" });
        }
      }
    }

    // Direct DB Storage trace (Legacy DBs)
    if (dbStorage) {
      const physicalStorage = xormonStorage.find(s => s.datastore === dbStorage);
      if (physicalStorage && db) {
        addNode({ id: physicalStorage.datastore, label: physicalStorage.datastore, type: "Storage", vendor: physicalStorage.vendor, health: physicalStorage.state as "healthy" | "degraded" | "online" | "unknown" });
        addEdge({ id: `mounted-${db.id}-${physicalStorage.datastore}`, source: db.id, target: physicalStorage.datastore, connectionType: "mounted_to" });
      }
    }
  });

  const rootNodeId = webServers.find(w => w.ip_address === targetIp)?.id || 
                     databases.find(d => d.ip_address === targetIp)?.id || 
                     xormonStorage.find(s => s.datastore === targetIp)?.datastore || 
                     loadBalancers.find(l => l.ip_address === targetIp)?.id ||
                     firewalls.find(f => f.ip_address === targetIp)?.id || undefined;

  return { nodes: Array.from(nodes.values()), edges, rootNodeId };
}
