import { apiFetch } from "@/api/apiBase";

// ── Veri Taşıma (Migration) DTOs ──────────────────────────────────────────────

export interface OldSystemCustomerDto {
  id: number;
  firmaAdi: string;
  vergiNo?: string;
  /** Backend taşınmış mı bilgisini bu alanla dönebilir */
  migrated?: boolean;
}

export interface MigrationLogDto {
  dosyaAdi?: string;
  toplamFisBasligi?: number;
  toplamDetayKayit?: number;
  toplamBorc?: number;
  toplamAlacak?: number;
  netFark?: number;
  detayIslemHizi?: number;
  islemSuresi?: string;
  basarili: boolean;
  mesaj?: string;
}

// ── Veri Taşıma API fonksiyonları ─────────────────────────────────────────────

/**
 * GET /api/migration/old-customers
 * Eski sistemdeki müşteri listesini döner. Taşınmış olanlar migrated=true ile işaretlenmiş olabilir.
 */
export const getMigrationOldCustomers = async (): Promise<OldSystemCustomerDto[]> => {
  try {
    const response = await apiFetch(`/migration/old-customers`, {
      method: "GET",
    });
    if (response.ok) {
      const data = await response.json();
      return data || [];
    } else {
      console.error(`❌ getMigrationOldCustomers: HTTP ${response.status}`);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getMigrationOldCustomers hata:", error);
    return [];
  }
};

/**
 * POST /api/migration/migrate-customer
 * Seçilen eski müşteriyi belirtilen yıla ait verilerle taşır.
 * Body: { oldCustomerId, year }
 * Response: MigrationLogDto
 */
export const migrateCustomer = async (body: {
  oldCustomerId: number;
  year: number;
}): Promise<MigrationLogDto> => {
  const response = await apiFetch(`/migration/migrate-customer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let msg = "Veri taşıma başarısız.";
    try {
      msg = await response.text();
    } catch {}
    throw new Error(msg);
  }
  return await response.json();
};

// ── Mevcut DataTransfer DTOs ──────────────────────────────────────────────────

export interface DenetciDto {
  id: number;
  firmaAdi: string;
  firmaUnvani: string;
  vergiNo: string;
  vergiDairesi: string;
  il: string;
  ilce?: string;
  adres: string;
  tel: string;
  fax?: string;
  web?: string;
  email: string;
  ticaretSicilNo: string;
  aciklama?: string;
  aktifmi: boolean;
  arsivId?: number;
  kayitTarihi: string;
}

/**
 * Get the list of auditors from the old database (Public endpoint)
 * This endpoint is public ([AllowAnonymous]) and doesn't require authentication
 */
export const getOldDbDenetciler = async (): Promise<DenetciDto[]> => {
  try {
    console.log("🔄 getOldDbDenetciler: DataTransfer/Denetciler endpoint'ine istek yapılıyor...");
    const response = await apiFetch(`/DataTransfer/Denetciler`, {
      method: "GET",
      ignoreCustomHeaders: false,
      credentials: 'omit', // ✅ Don't send auth credentials for public endpoints
    } as any);

    console.log("📊 getOldDbDenetciler: Response status:", response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ getOldDbDenetciler: Veri başarıyla alındı, count:", data?.length || 0);
      console.log("📋 getOldDbDenetciler: Raw data sample:", data?.[0]);

      // ✅ Property naming: Backend PascalCase döndürüyor, frontend camelCase bekliyor
      if (Array.isArray(data)) {
        const mappedData = data.map((item: any) => ({
          id: item.id,
          firmaAdi: item.firmaAdi || item.FirmaAdi || "",
          firmaUnvani: item.firmaUnvani || item.FirmaUnvani || "",
          adres: item.adres || item.Adres || "",
          il: item.il || item.Il || "",
          tel: item.tel || item.Tel || "",
          fax: item.fax || item.Fax || "",
          email: item.email || item.Email || "",
          web: item.web || item.Web || "",
          vergiNo: item.vergiNo || item.VergiNo || "",
          vergiDairesi: item.vergiDairesi || item.VergiDairesi || "",
          ticaretSicilNo: item.ticaretSicilNo || item.TicaretSicilNo || "",
          aktifmi: item.aktifmi !== undefined ? item.aktifmi : item.Aktifmi,
          ...item
        }));
        console.log("✅ getOldDbDenetciler: Mapped data sample:", mappedData?.[0]);
        return mappedData;
      }
      return data;
    } else {
      const errorText = await response.text();
      console.error("❌ getOldDbDenetciler: HTTP error", response.status, errorText);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getOldDbDenetciler: Exception error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return [];
  }
};

/**
 * Get the list of companies from the old database (Public endpoint)
 */
export const getOldDbCompanies = async (): Promise<any[]> => {
  try {
    console.log("🔄 getOldDbCompanies: DataTransfer/old-companies endpoint'ine istek yapılıyor...");
    const response = await apiFetch(`/DataTransfer/old-companies`, {
      method: "GET",
      ignoreCustomHeaders: false,
      credentials: 'omit', // ✅ Don't send auth credentials for public endpoints
    } as any);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ getOldDbCompanies: Şirketler başarıyla getirildi:", data);
      return data || [];
    } else {
      console.error(`❌ getOldDbCompanies: HTTP ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getOldDbCompanies: Exception error:", error);
    return [];
  }
};

/**
 * Get the years available for a specific company from the old database (Public endpoint)
 */
export const getOldDbCompanyYears = async (oldCompanyId: number): Promise<number[]> => {
  try {
    console.log("🔄 getOldDbCompanyYears: DataTransfer/old-company-years endpoint'ine istek yapılıyor...");
    const response = await apiFetch(`/DataTransfer/old-company-years/${oldCompanyId}`, {
      method: "GET",
      ignoreCustomHeaders: false,
      credentials: 'omit', // ✅ Don't send auth credentials for public endpoints
    } as any);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ getOldDbCompanyYears: Yıllar başarıyla getirildi:", data);
      return data || [];
    } else {
      console.error(`❌ getOldDbCompanyYears: HTTP ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getOldDbCompanyYears: Exception error:", error);
    return [];
  }
};

/**
 * Get the list of migration tables (Public endpoint)
 */
export const getDataTransferTables = async (): Promise<any[]> => {
  try {
    console.log("🔄 getDataTransferTables: DataTransfer/tables endpoint'ine istek yapılıyor...");
    const response = await apiFetch(`/DataTransfer/tables`, {
      method: "GET",
      ignoreCustomHeaders: false,
      credentials: 'omit', // ✅ Don't send auth credentials for public endpoints
    } as any);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ getDataTransferTables: Tablolar başarıyla getirildi:", data);
      return data || [];
    } else {
      console.error(`❌ getDataTransferTables: HTTP ${response.status} ${response.statusText}`);
      return [];
    }
  } catch (error: any) {
    console.error("❌ getDataTransferTables: Exception error:", error);
    return [];
  }
};
