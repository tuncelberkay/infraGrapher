from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class EntityType(str, Enum):
    CLUSTER = "CLUSTER"
    VM = "VM"
    BARE_METAL = "BARE_METAL"
    GATEWAY = "GATEWAY"
    ROUTE = "ROUTE"
    DATASOURCE = "DATASOURCE"
    VSERVER = "VSERVER"
    LPAR = "LPAR"
    FIREWALL_RULE = "FIREWALL_RULE"
    NETWORK_INTERFACE = "NETWORK_INTERFACE"
    CONTAINER = "CONTAINER"
    STORAGE_VOLUME = "STORAGE_VOLUME"
    STORAGE_CONTROLLER = "STORAGE_CONTROLLER"

class EdgeType(str, Enum):
    NETFLOW = "NETFLOW"
    ROUTE_PATH = "ROUTE_PATH"
    DEPENDENCY = "DEPENDENCY"

class GraphNode(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str
    entity_type: EntityType
    vendor: Optional[str] = None
    parent_id: Optional[str] = Field(None, description="ID of the parent node for clustering/nesting")

class GraphEdge(BaseModel):
    id: str = Field(..., description="Unique identifier for the edge")
    source_id: str
    target_id: str
    edge_type: EdgeType

class FlatGraphModel(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
