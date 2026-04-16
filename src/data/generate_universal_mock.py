import json
import uuid

def generate_id(prefix):
    return f"{prefix}-{str(uuid.uuid4())[:8]}"

def create_entity(id, label, entity_type, vendor_spec, vendor=None, children=None):
    ent = {
        "id": id,
        "label": label,
        "entity_type": entity_type,
        "vendor_spec": vendor_spec
    }
    if vendor:
        ent["vendor"] = vendor
    if children:
        ent["children"] = children
    return ent

def generate_mock():
    # 1. Mainframe setup
    datasource = create_entity("ds-db2-01", "DB2 DataSource", "Database", "IBM_DB2_DS", vendor="IBM")
    mainframe_children = [
        create_entity("lpar-prod-01", "LPAR PROD-1", "VIRTUAL_INSTANCE", "IBM_MAINFRAME_LPAR", vendor="IBM", children=[datasource]),
        create_entity("lpar-dev-01", "LPAR DEV-1", "VIRTUAL_INSTANCE", "IBM_MAINFRAME_LPAR", vendor="IBM")
    ]
    mainframe = create_entity("cec-ibm-z16", "IBM z16 CEC", "CLUSTER", "IBM_MAINFRAME_CEC", vendor="IBM", children=mainframe_children)

    # 2. Netscaler setup
    route = create_entity("rt-nginx", "Ingress Route", "Service", "NETSCALER_ROUTE", vendor="Citrix")
    netscaler_children = [
        create_entity("vsrv-web-01", "vServer Web Prod", "LoadBalancer", "NETSCALER_VSERVER", vendor="Citrix", children=[route]),
        create_entity("vsrv-db-01", "vServer DB Prod", "LoadBalancer", "NETSCALER_VSERVER", vendor="Citrix")
    ]
    netscaler = create_entity("ns-cluster-01", "Netscaler VPX HA", "CLUSTER", "NETSCALER_VPX", vendor="Citrix", children=netscaler_children)

    # 3. Storage array
    storage_children = [
        create_entity("vol-web-data", "NetApp Vol Web", "Storage", "NETAPP_VOLUME", vendor="Dell"),
        create_entity("vol-db-data", "NetApp Vol DB", "Storage", "NETAPP_VOLUME", vendor="Dell")
    ]
    storage_controller = create_entity("netapp-ctrl-a", "NetApp Controller A", "HOST", "NETAPP_CONTROLLER", vendor="Dell", children=storage_children)
    storage = create_entity("storage-agg-01", "NetApp Aggregate", "CLUSTER", "NETAPP_AGGREGATE", vendor="Dell", children=[storage_controller])

    # 4. Networking Core
    fw_rule = create_entity("fw-allow-443", "FW Rule: Allow 443", "Firewall", "CISCO_ACL", vendor="Cisco")
    network_children = [
        create_entity("port-eth1-1", "Eth1/1", "Network", "CISCO_INTERFACE", vendor="Cisco", children=[fw_rule]),
        create_entity("port-eth1-2", "Eth1/2", "Network", "CISCO_INTERFACE", vendor="Cisco")
    ]
    network_card = create_entity("linecard-01", "Line Card 1", "HOST", "CISCO_LINECARD", vendor="Cisco", children=network_children)
    network = create_entity("cisco-spine-01", "Cisco Nexus Spine", "CLUSTER", "CISCO_CHASSIS", vendor="Cisco", children=[network_card])

    # 5. VMware -> OpenShift
    # Note: OCP gateway technically sits outside generic pods, but to illustrate boundary points passing through the box we attach it as a child.
    gateway = create_entity("ocp-gw-ingress", "OpenShift Ingress GW", "Gateway", "OPENSHIFT_GATEWAY", vendor="OpenShift")
    openshift_children = [
        create_entity("pod-frontend", "Frontend Pod", "Container", "OPENSHIFT_POD", vendor="Tomcat", children=[gateway]),
        create_entity("pod-backend", "Backend Pod", "Container", "OPENSHIFT_POD", vendor="OpenShift")
    ]
    openshift_worker = create_entity("ocp-worker-1", "OCP Worker Node", "WorkerNode", "OPENSHIFT_WORKER", vendor="OpenShift", children=openshift_children)
    vmware_cluster = create_entity("vmware-compute-01", "VMware Cluster A", "CLUSTER", "VMWARE_CLUSTER", vendor="VMware", children=[openshift_worker])

    entities = [mainframe, netscaler, storage, network, vmware_cluster]

    # Flow logic: Internet Port -> FW Rule -> vServer -> Route -> Gateway -> Pod -> DataSource -> Volume
    edges = [
        { "id": generate_id("e"), "source": "port-eth1-1", "target": "fw-allow-443", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "fw-allow-443", "target": "vsrv-web-01", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "vsrv-web-01", "target": "rt-nginx", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "rt-nginx", "target": "ocp-gw-ingress", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "ocp-gw-ingress", "target": "pod-frontend", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "pod-frontend", "target": "pod-backend", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "pod-backend", "target": "lpar-prod-01", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "lpar-prod-01", "target": "ds-db2-01", "connectionType": "routes_traffic_to" },
        { "id": generate_id("e"), "source": "ds-db2-01", "target": "vol-db-data", "connectionType": "mounted_to" }
    ]

    payload = { "entities": entities, "edges": edges }
    
    with open("universal_mock.json", "w") as f:
        json.dump(payload, f, indent=2)

if __name__ == "__main__":
    generate_mock()
    print("universal_mock.json generated.")
