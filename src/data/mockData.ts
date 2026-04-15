export const firewallLogs = [
  { timestamp: "2026-04-14T21:00:00Z", src_ip: "0.0.0.0", dest_ip: "10.50.20.15", port: 443, action: "allow", policy: "ingress-web" },
  { timestamp: "2026-04-14T21:00:01Z", src_ip: "10.50.20.15", dest_ip: "10.50.20.16", port: 5432, action: "allow", policy: "internal-db" },
  { timestamp: "2026-04-14T21:00:02Z", src_ip: "10.50.30.50", dest_ip: "10.50.30.51", port: 1433, action: "allow", policy: "internal-db-legacy" }
];

export const webServers = [
  { id: "web-02", hostname: "srv-iis-prod", vendor: "IIS", ip_address: "10.50.30.50", os_id: "os-02", health: "degraded", issue: "high_memory" }
];

export const databases = [
  { id: "db-02", hostname: "db-mssql-cluster", vendor: "MsSQL", ip_address: "10.50.30.51", os_id: "os-04", db_storage: "ds-dell-isilon-01", health: "degraded", issue: "lock_wait" },
  { id: "db-03", hostname: "db-oracle-exa-10", vendor: "Oracle", ip_address: "10.50.40.10", os_id: "os-05", db_storage: "ds-ibm-block-01", health: "healthy" }
];

export const operatingSystems = [
  { id: "os-02", hostname: "win-srv-prod-02", vendor: "Windows Server 2022", host_id: "vm-app-02", type: "vm", health: "healthy" },
  { id: "os-04", hostname: "win-srv-sql-04", vendor: "Windows Server 2019", host_id: "vm-db-04", type: "vm", health: "healthy" },
  { id: "os-05", hostname: "rhel-oracle-05", vendor: "RHEL 8", host_id: "vm-oracle-05", type: "vm", health: "healthy" }
];

export const openshiftGateways = [
  { id: "gw-03", hostname: "app.finance.com", ip_address: "10.50.20.15", service_id: "svc-frontend", vendor: "OpenShift", health: "healthy" },
  { id: "gw-04", hostname: "db.finance.com", ip_address: "10.50.20.16", service_id: "svc-database", vendor: "OpenShift", health: "healthy" }
];

export const openshiftServices = [
  { id: "svc-frontend", name: "frontend-svc", pod_name: "pod-frontend-01", vendor: "OpenShift", health: "healthy" },
  { id: "svc-database", name: "database-svc", pod_name: "pod-database-01", vendor: "OpenShift", health: "healthy" }
];

export const openshiftPods = [
  { id: "pod-frontend-01", pod_name: "pod-webapp-tomcat", namespace: "finance-prod", service: "frontend-svc", node_id: "worker-node-1", vendor: "Tomcat", health: "healthy" },
  { id: "pod-database-01", pod_name: "pod-postgres-db", namespace: "finance-prod", service: "database-svc", node_id: "worker-node-2", vendor: "PostgreSQL", storage_pvc: "pvc-finance-db", health: "healthy" }
];

export const openshiftWorkerNodes = [
  { id: "worker-node-1", hostname: "ocp-worker-1", role: "worker", vendor: "OpenShift", health: "healthy" },
  { id: "worker-node-2", hostname: "ocp-worker-2", role: "worker", vendor: "OpenShift", health: "healthy" }
];

export const openshiftDataFoundation = [
  { pvc_name: "pvc-finance-db", vendor: "ODF", component: "Ceph-RBD", backing_store: "ds-huawei-object-01", health: "online" }
];

export const vmwareAria = [
  { vm_name: "worker-node-1", type: "VirtualMachine", esxi_host: "esxi-host-04", vendor: "VMware", datastore: "ds-huawei-block-01", health: "healthy" },
  { vm_name: "worker-node-2", type: "VirtualMachine", esxi_host: "esxi-host-05", vendor: "VMware", datastore: "ds-huawei-block-01", health: "healthy" },
  { vm_name: "vm-app-02", type: "VirtualMachine", esxi_host: "esxi-host-04", vendor: "VMware", datastore: "ds-ibm-block-01", health: "degraded" },
  { vm_name: "vm-db-04", type: "VirtualMachine", esxi_host: "esxi-host-06", vendor: "VMware", datastore: "ds-dell-isilon-01", health: "healthy" },
  { vm_name: "vm-oracle-05", type: "VirtualMachine", esxi_host: "esxi-host-06", vendor: "VMware", datastore: "ds-ibm-block-01", health: "healthy" }
];

export const xormonStorage = [
  { datastore: "ds-huawei-block-01", type: "Block", storage_array: "OceanStor", vendor: "Huawei", state: "online" },
  { datastore: "ds-ibm-block-01", type: "Block", storage_array: "FlashSystem", vendor: "IBM", state: "online" },
  { datastore: "ds-huawei-object-01", type: "Object", storage_array: "OceanStor-Object", vendor: "Huawei", state: "online" },
  { datastore: "ds-dell-isilon-01", type: "NAS", storage_array: "Isilon-Cluster", vendor: "Dell", state: "degraded", issue: "nfs_timeout" }
];

export const loadBalancers = [
  { id: "lb-01", hostname: "lb-netscaler-prod", vendor: "Citrix", ip_address: "10.50.20.10", targets: ["10.50.20.15"], health: "healthy" }
];

export const apiGateways = [
  { id: "gw-01", hostname: "gw-layer7-ext", vendor: "Broadcom", ip_address: "10.50.20.9", targets: ["10.50.20.10"], health: "healthy" },
  { id: "gw-02", hostname: "gw-webmethods-int", vendor: "IBM", ip_address: "10.50.30.9", targets: ["10.50.30.50"], health: "healthy" }
];

export const sslVisibility = [
  { id: "ssl-01", hostname: "ssl-a10-thunder", vendor: "A10Networks", ip_address: "10.50.20.8", targets: ["10.50.20.9"], health: "healthy" }
];

export const firewalls = [
  { id: "fw-01", hostname: "fw-fortigate-edge", vendor: "Fortinet", ip_address: "10.50.20.1", targets: ["10.50.20.8"], health: "healthy", policy: "strict_inspect" },
  { id: "fw-02", hostname: "fw-paloalto-core", vendor: "PaloAltoNetworks", ip_address: "10.50.30.1", targets: ["10.50.30.9"], health: "healthy", policy: "internal_zone" }
];

export const networkSwitches = [
  { id: "sw-01", hostname: "aci-spine-01", vendor: "Cisco", ip_address: "10.0.0.1", targets: ["10.50.20.1"], health: "healthy" },
  { id: "sw-02", hostname: "arista-leaf-02", vendor: "Arista", ip_address: "10.0.0.2", targets: ["10.50.30.1"], health: "healthy" }
];
