const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function hesaplaOnemlilik(netSatislar: number) {
  return await fetch(`${API_BASE_URL}/api/BulguRiskiBelirlemeBelge/HesaplaOnemlilik?netSatislar=${netSatislar}`).then(r => r.json()).catch(() => ({ pm: 0, om: 0, esik: 0 }));
}

export async function hesaplaDoğalRisk(data: any) {
  return await fetch(`${API_BASE_URL}/api/BulguRiskiBelirlemeBelge/HesaplaDoğalRisk`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()).catch(() => ({ dr: 0 }));
}

export async function hesaplaKontrolRiski(data: any) {
  return await fetch(`${API_BASE_URL}/api/BulguRiskiBelirlemeBelge/HesaplaKontrolRiski`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()).catch(() => ({ kr: 0 }));
}

export async function hesaplaOrVeProsedur(dr: number, kr: number) {
  return await fetch(`${API_BASE_URL}/api/BulguRiskiBelirlemeBelge/HesaplaOrVeProsedur?dr=${dr}&kr=${kr}`).then(r => r.json()).catch(() => ({ or: 0 }));
}
