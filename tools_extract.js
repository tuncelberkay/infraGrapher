const fs = require('fs');
const si = require('simple-icons');

const targets = {
    'redhatopenshift': 'redhatopenshift',
    'vmware': 'vmware',
    'huawei': 'huawei',
    'ibm': 'ibm',
    'dell': 'dell',
    'ceph': 'ceph',
    'apachetomcat': 'apachetomcat',
    'microsoft': 'microsoft',
    'oracle': 'oracle',
    'postgresql': 'postgresql',
    'microsoftsqlserver': 'microsoftsqlserver',
    'mysql': 'mysql',
    'mongodb': 'mongodb',
    'redhat': 'redhat',
    'windows': 'windows11',
    'arista': 'arista',
    'cisco': 'cisco',
    'fortinet': 'fortinet',
    'paloaltonetworks': 'paloaltonetworks',
    'serverless': 'serverless',
    'broadcom': 'broadcom',
    'citrix': 'citrix'
};

if (!fs.existsSync('public/icons')) fs.mkdirSync('public/icons', {recursive: true});

for (let [filename, slug] of Object.entries(targets)) {
   let icon = si[`si${slug.charAt(0).toUpperCase() + slug.slice(1)}`];
   if (!icon) {
       // try exact match or iterating
       const key = Object.keys(si).find(k => k.toLowerCase() === `si${slug.toLowerCase()}`);
       if (key) icon = si[key];
   }
   
   if (icon) {
      let svg = icon.svg;
      svg = svg.replace('<svg ', `<svg fill="#${icon.hex}" `);
      fs.writeFileSync(`public/icons/${filename}.svg`, svg);
      console.log(`Wrote ${filename}.svg`);
   } else {
      console.log(`MISSING: ${slug}`);
      // Fallback
      fs.writeFileSync(`public/icons/${filename}.svg`, `<svg viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>`);
   }
}
