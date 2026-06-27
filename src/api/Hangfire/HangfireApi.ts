import { apiFetch } from "@/api/apiBase";

export type HangfireStats = {
  enqueued: number;
  processing: number;
  failed: number;
  scheduled: number;
  succeeded: number;
  queues: { queue: string; enqueued: number; fetched: number }[];
  faturaStatuses?: { status: string; count: number }[];
  irsaliyeStatuses?: { status: string; count: number }[];
};

export type ClearResponse = {
  deleted: number;
  message: string;
};

export type ResetStuckResponse = {
  total: number;
  message: string;
};

export async function getHangfireStats(user: any): Promise<HangfireStats> {
  const r = await apiFetch("/Hangfire/stats", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Hangfire istatistikleri alınamadı");
  return r.json();
}

export async function clearQueues(user: any): Promise<ClearResponse> {
  const r = await apiFetch("/Hangfire/kuyruk", {
    method: "DELETE",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Kuyruk temizlenemedi");
  return r.json();
}

export async function clearFailed(user: any): Promise<ClearResponse> {
  const r = await apiFetch("/Hangfire/basarisizlar", {
    method: "DELETE",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Başarısız işler silinemedi");
  return r.json();
}

export async function resetStuckPackets(user: any): Promise<ResetStuckResponse> {
  const r = await apiFetch("/Hangfire/takili-paketleri-sifirla", {
    method: "POST",
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Takılı paketler sıfırlanamadı");
  return r.json();
}
