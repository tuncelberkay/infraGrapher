export enum EntityType {
  CLUSTER = "CLUSTER",
  VM = "VM",
  BARE_METAL = "BARE_METAL",
  GATEWAY = "GATEWAY",
  ROUTE = "ROUTE",
  DATASOURCE = "DATASOURCE",
  VSERVER = "VSERVER",
  LPAR = "LPAR",
  FIREWALL_RULE = "FIREWALL_RULE",
  NETWORK_INTERFACE = "NETWORK_INTERFACE",
  CONTAINER = "CONTAINER",
  STORAGE_VOLUME = "STORAGE_VOLUME",
  STORAGE_CONTROLLER = "STORAGE_CONTROLLER"
}

export enum EdgeType {
  NETFLOW = "NETFLOW",
  ROUTE_PATH = "ROUTE_PATH",
  DEPENDENCY = "DEPENDENCY",
  HOSTED_ON = "HOSTED_ON"
}

export interface GraphNode {
  id: string;
  label: string;
  entity_type: EntityType;
  vendor?: string;
  parent_id: string | null;
  health?: string;
  icon_url?: string;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  edge_type: EdgeType;
}

export interface InfrastructureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootNodeId?: string;
}
