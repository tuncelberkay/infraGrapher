import { InfrastructureGraph, GraphNode } from "./correlationEngine";

const SYSTEM_PROMPT = `Rol: Bir BT Değişiklik Danışma Kurulu (CAB) Analistisiniz. Amacınız, altyapı topoloji grafiğini net ve iş odaklı bir etki raporuna çevirmektir. Raporu TÜRKÇE yazmalısınız.

Görev:
Aşağıda sağlanan JSON grafiğine ve rootNodeId değerine dayanarak, teknik olmayan paydaşlar (ör. CAB ekibi) için bir Etki Analizi Raporu taslağı oluşturun. Hedef sistem kapatıldığında veya değiştirildiğinde hangi iş hizmetlerinin, ağ yollarının veya uygulamaların çevrimdışı olacağını açıklayın.

KESİN DEĞİŞİKLİK YÖNETİMİ (CAB) MANTIĞI:
1. Hedefin üzerinde (yukarı yönlü) çalışan sistemleri iyi analiz edin:
   - Eğer bir Uygulama / Veritabanı kesilirse, altındaki donanımlar (Sunucu/Depolama) etkilenmez.
   - EĞER bir Donanım, Depolama (Ör: Huawei Block) veya İşletim Sistemi kesilirse, onun üzerinde koşan tüm VM'ler (Sanal Makineler), Pod/Container yapıları ve Uygulamalar KESİNTİYE UĞRAR (Hard Outage).
2. Hedefin alt yönündeki (downstream) donanım ve altyapı hizmet kesintisi yaşamayacağı için rapora 'kesintiye uğrayacak' sistemler arasında yazılmaz.

Şunları kapsadığından emin olun:
* Hedef Noktası (Epicenter)
* İş Hizmeti Kesintisi (Açıkça bozulan uygulamalar)
* Genel Risk Değerlendirmesi
`;

export async function generateImpactReport(graph: InfrastructureGraph, enableLLM: boolean = false): Promise<string> {
  const fallbackRenderer = (g: InfrastructureGraph) => {
    let report = "# Yönetici Değişiklik Etki Raporu (Çevrimdışı Mod)\n";
    report += "## Etkilenen Altyapıya Genel Bakış\n\n";

    if (!g.rootNodeId) {
      return report + "> **Hata**: Tarama için merkez düğüm (Root Node) tanımlanamadı.\n";
    }

    report += `> **Uyarı**: Bu rapor, Hedef ID: \`${g.rootNodeId}\` üzerindeki bir kesintiden kaynaklanan yukarı yönlü ardışık etki alanını ayrıntılandırır.\n\n`;

    // DAG Upstream Traversal Algorithm
    // We want to find all nodes that physically/logically depend on the target node.
    // Edge structure: A depends on B implies edge(source: A, target: B).
    // So if B fails, A fails.
    // We must find all nodes A where B is the target, recursively.
    
    const affectedNodeIds = new Set<string>();
    affectedNodeIds.add(g.rootNodeId);

    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      g.edges.forEach(edge => {
        // If the target of this edge is already marked as affected, 
        // the source of this edge ALSO becomes affected.
        // (e.g., source: LoadBalancer, target: WebServer. WebServer fails -> LB fails).
        if (affectedNodeIds.has(edge.target) && !affectedNodeIds.has(edge.source)) {
          affectedNodeIds.add(edge.source);
          foundNew = true;
        }
      });
    }

    const affectedNodes = g.nodes.filter(n => affectedNodeIds.has(n.id) && n.id !== g.rootNodeId);

    const networks = affectedNodes.filter(n => ['Switch', 'Firewall', 'SSLVis', 'APIGateway', 'LoadBalancer'].includes(n.type));
    const servers = affectedNodes.filter(n => ['WebServer', 'Database'].includes(n.type));
    const infra = affectedNodes.filter(n => ['Compute', 'Storage', 'StorageODF', 'Container', 'OS'].includes(n.type));

    report += "### 🖥️ Son Kullanıcı Hizmet Kesintisi (Uygulama Katmanı)\n";
    if (servers.length === 0) report += "- Kesintiye uğrayan temel uygulama sunucusu yok.\n";
    servers.forEach(n => report += `- **${n.label}** (${n.type}): Tam Hizmet Kesintisi. Aktif hizmetler erişilemez olacak.\n`);
    
    report += "\n### ⚙️ Kesintiye Uğrayan Altyapı Bileşenleri (VM / Container / OS)\n";
    if (infra.length === 0) report += "- Kesintiye uğrayan altyapı veya donanım bileşeni yok.\n";
    infra.forEach(n => report += `- **${n.label}** (${n.type}): Hedefe bağımlı olduğu için (yukarı yönlü) donanımsal/mantıksal kesinti yaşayacak.\n`);

    report += "\n---\n**Değişiklik Danışma Eylemi Gereklidir:** Hedef düğümün bakım penceresi sırasında yaşanacak uygulama kesintileri için gerekli tüm ekiplerle iletişim kurulduğundan emin olun.";

    return report;
  };

  if (!enableLLM) {
    return fallbackRenderer(graph);
  }

  const llmUrl = process.env.LLM_API_URL;
  const llmKey = process.env.LLM_API_KEY;
  const llmModelName = process.env.LLM_MODEL_NAME || "llama3";

  if (!llmUrl) {
    return fallbackRenderer(graph);
  }

  try {
    const promptContext = JSON.stringify(graph, null, 2);

    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(llmKey ? { 'Authorization': `Bearer ${llmKey}` } : {})
      },
      body: JSON.stringify({
        model: llmModelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Please analyze the following directed infrastructure graph. The root vector is ${graph.rootNodeId}. Ignore unaffected downstream hardware:\n\n${promptContext}` }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return `Failed to fetch response from internal LLM Model (${response.status}): ${errText}\n\n${fallbackRenderer(graph)}`;
    }

    const data = await response.json();
    return data?.message?.content || data?.choices?.[0]?.message?.content || fallbackRenderer(graph);
  } catch (error: unknown) {
    console.error("LLM Generation Error:", error);
    return fallbackRenderer(graph);
  }
}
