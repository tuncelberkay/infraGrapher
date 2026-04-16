import os
import sys
import re
import urllib.request
import urllib.error

def clean_vendor(name):
    # simpleicons uses precise lowercase slugs
    if not name:
        return ""
    slug = name.lower()
    # Handle known aliases inside our mock arrays
    slug = slug.replace("paloaltonetworks", "paloaltonetworks")
    slug = slug.replace("ibm", "ibm")
    slug = slug.replace("dell", "dell") 
    slug = slug.replace("huawei", "huawei")
    slug = slug.replace("cisco", "cisco")
    slug = slug.replace("fortinet", "fortinet")
    slug = slug.replace("citrix", "citrix")
    slug = slug.replace("openshift", "redhatopenshift")
    slug = slug.replace("vmware", "vmware")
    slug = slug.replace("mssql", "microsoftsqlserver")
    slug = slug.replace("postgresql", "postgresql")
    slug = slug.replace("tomcat", "apachetomcat")
    slug = slug.replace("iis", "iis")
    slug = slug.replace("oracle", "oracle")
    # Clean standard string formats natively dropping characters
    slug = re.sub(r'[^a-z0-9]', '', slug)
    return slug

def ensure_folders():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    vendor_dir = os.path.join(base_dir, "public", "assets", "icons", "vendors")
    os.makedirs(vendor_dir, exist_ok=True)
    return vendor_dir

def download_icon(vendor):
    if not vendor:
        return
        
    slug = clean_vendor(vendor)
    if not slug:
        return
        
    vendor_dir = ensure_folders()
    file_path = os.path.join(vendor_dir, f"{slug}.svg")
    
    if os.path.exists(file_path):
        print(f"[*] Icon for '{vendor}' ({slug}.svg) already exists locally.")
        return
        
    url = f"https://cdn.simpleicons.org/{slug}"
    
    try:
        print(f"[*] Fetching icon for '{vendor}' via ({url})...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            svg_data = response.read()
            with open(file_path, 'wb') as f:
                f.write(svg_data)
            print(f"[+] Successfully downloaded '{slug}.svg'")
    except urllib.error.HTTPError as e:
        print(f"[-] Could not find icon for '{vendor}' ({url}): {e.code}")
    except Exception as e:
        print(f"[-] Error downloading '{vendor}': {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            vendors = ["VMware", "Huawei", "OpenShift", "Citrix", "Cisco", "Fortinet", "PaloAltoNetworks", "IBM", "Dell", "Oracle", "PostgreSQL", "Tomcat", "MsSQL"]
            for v in vendors:
                download_icon(v)
        else:
            download_icon(sys.argv[1])
    else:
        print("Usage: python icon_manager.py 'VendorName'")
