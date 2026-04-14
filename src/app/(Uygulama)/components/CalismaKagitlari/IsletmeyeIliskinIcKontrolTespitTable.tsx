"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy } from "@tabler/icons-react";
import CustomHotTable from "@/components/HotTableWrapper";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCardHtml from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCardHtml";
import {
  getIsletmeyeIliskinIcKontrolTespitByDenetlenen,
  IsletmeyeIliskinIcKontrolTespitRow,
  kaydetIsletmeyeIliskinIcKontrolTespit,
  varsayilanaDonIsletmeyeIliskinIcKontrolTespit,
} from "@/api/CalismaKagitlari/IsletmeyeIliskinIcKontrolTespit";
import FormOnayBolumu from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/FormOnayBolumu";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (value: boolean) => void;
  setTamamlanan: (value: number) => void;
  setToplam: (value: number) => void;
}

interface LocalChange {
  durum: string;
  islem: string;
  tespit: string;
  ilgiliBds: string;
}

interface VisualRow {
  pairId: number;
  sira: number;
  bolum: string;
  altBolum: string;
  kontrolSorusu: string;
  yanit: string;
  risk: string;
  aciklama: string;
  aksiyon: string;
  ilgiliBds: string;
  rowTone: "evet" | "hayir";
}

const headerBlue = "#4a6b9c";
const answerBlue = "#6299c8";
const riskRed = "#c85f5f";
const explanationGreen = "#5a8246";
const actionOrange = "#d48142";

const TAB_COLORS = ["#4a6b9c", "#b55353", "#c27d42", "#478265"];
const TAB_LABELS = [
  "1-İç Kontrol Belgesi",
  "2-Risk Kriteri Kılavuzu",
  "3-Özet Puan Paneli",
  "4-BDS Referans",
];

const riskKriteriRows = [
  {
    seviye: "KRİTİK",
    tanim: "Görevler ayrılığı eksikliği, hile riski, varlık güvenliği ihlali",
    etki:
      "Finansal tablolar üzerinde önemli yanlışlık riski çok yüksek. Denetim kapsamı genişletilmeli, substantif prosedürler arttırılmalı.",
    ornekleme: "%50-75",
    bg: "#f8dedd",
    fg: "#8b0000",
  },
  {
    seviye: "YÜKSEK",
    tanim: "Kritik kontrol prosedürünün eksik veya yetersiz olması",
    etki:
      "Önemli hata veya sahtekarlıkları önleyememe riski. Maddi doğrulama prosedürü artırılmalı (BDS 330 §18).",
    ornekleme: "%25-50",
    bg: "#fce8d7",
    fg: "#7c3200",
  },
  {
    seviye: "ORTA",
    tanim: "Yönetişim veya dokümantasyon zayıflığı",
    etki:
      "Kontrol ortamında genel zayıflık; ek analitik prosedürler uygulanabilir.",
    ornekleme: "%10-25",
    bg: "#fbecc2",
    fg: "#7a5700",
  },
  {
    seviye: "DÜŞÜK",
    tanim: "Kontroller işlevsel ve belgelenmiş durumda",
    etki:
      "Minimal risk. Standart prosedür yeterli; BDS 520 analitik inceleme uygulanabilir.",
    ornekleme: "%10-25",
    bg: "#dce9d1",
    fg: "#2d5a1b",
  },
];

const bdsReferansRows = [
  {
    bds: "BDS 315",
    bolum: "§A56-A80",
    konu:
      "Önemli yanlışlık risklerinin belirlenmesi ve değerlendirilmesi — iç kontrol bileşenleri",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 240",
    bolum: "§A2",
    konu: "Hile kaynaklı önemli yanlışlık riskleri — yönetim hilesine ilişkin varsayım",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 265",
    bolum: "§9",
    konu:
      "İç kontroldeki eksikliklerin üst yönetime ve yönetim kuruluna iletilmesi",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 330",
    bolum: "§6-21",
    konu:
      "Değerlendirilen risklere verilen yanıtlar — kontrol testleri ve substantif prosedürler",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 501",
    bolum: "§4-9",
    konu: "Belirli kalemlere ilişkin özel hususlar — stok sayımı ve alacaklar",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 610",
    bolum: "§A1",
    konu: "İç denetim çalışmalarından yararlanma",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 500",
    bolum: "§A14",
    konu:
      "Kanıt kaynağı olarak kontrol fonksiyonu — yetkinlik ve tarafsızlık değerlendirmesi",
    renk: "#e8f0fb",
  },
  {
    bds: "BDS 520",
    bolum: "Tümü",
    konu:
      "Analitik prosedürler — düşük risk seviyelerinde etkin denetim yaklaşımı",
    renk: "#e8f0fb",
  },
];

function getRiskBackground(seviye: string): string {
  const n = seviye.toLocaleLowerCase("tr-TR");
  if (n.includes("kritik")) return "#ffdce0"; // Soft Kırmızı
  if (n.includes("yüksek")) return "#ffebcc"; // Soft Turuncu
  if (n.includes("orta")) return "#fff9db";   // Soft Sarı
  if (n.includes("düşük")) return "#e3f9e5";   // Soft Yeşil
  return "";
}

const riskRenderer = (instance: any, td: HTMLElement, row: number, col: number, prop: any, value: any, cellProperties: any) => {
  const bg = getRiskBackground(String(value || ""));
  if (bg) {
    td.style.setProperty("background-color", bg, "important");
  } else {
    td.style.removeProperty("background-color");
  }
  td.style.fontWeight = "bold";
  td.style.textAlign = "center";
  td.style.verticalAlign = "middle";
  td.innerText = value || "";
  return td;
};

function escapeHtml(value: string | null | undefined): string {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const IsletmeyeIliskinIcKontrolTespitTable: React.FC<Props> = ({
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [rows, setRows] = useState<IsletmeyeIliskinIcKontrolTespitRow[]>([]);
  const [localChanges, setLocalChanges] = useState<Record<number, LocalChange>>({});
  const [initialSnapshot, setInitialSnapshot] = useState<Record<number, LocalChange>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const hotRef1 = React.useRef<any>(null);
  const hotRef3 = React.useRef<any>(null);

  const [selectedCellInfo, setSelectedCellInfo] = React.useState<{ label: string; value: string } | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [targetUrl, setTargetUrl] = React.useState<string | null>(null);
  const [pendingTabChange, setPendingTabChange] = React.useState<number | null>(null);

  const router = useRouter();

  const isReadOnly =
    user.rol?.includes("KaliteKontrol") || user.rol?.includes("SorumluDenetci");

  const fetchData = async () => {
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setLoading(true);
    try {
      const data = await getIsletmeyeIliskinIcKontrolTespitByDenetlenen(
        user.denetciId,
        user.denetlenenId,
        user.yil
      );
      const snapshot: Record<number, LocalChange> = {};
      data.forEach((row) => {
        const durum = row.durum ?? "Evet";
        snapshot[row.id] = {
          durum,
          islem: row.islem ?? "",
          tespit:
            row.tespit ??
            (durum === "Evet" ? row.evetIcerik ?? "" : row.hayirIcerik ?? ""),
          ilgiliBds: row.ilgiliBds ?? "",
        };
      });
      setRows(data);
      setLocalChanges(snapshot);
      setInitialSnapshot(snapshot);
      setToplam(data.length);
      setTamamlanan(data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.denetciId, user.denetlenenId, user.yil]);

  useEffect(() => {
    if (!isClickedVarsayilanaDon || !user.denetciId || !user.denetlenenId || !user.yil)
      return;
    const run = async () => {
      const ok = await varsayilanaDonIsletmeyeIliskinIcKontrolTespit(
        user.denetciId!,
        user.denetlenenId!,
        user.yil!
      );
      setIsClickedVarsayilanaDon(false);
      if (ok) await fetchData();
    };
    run();
  }, [isClickedVarsayilanaDon, user.denetciId, user.denetlenenId, user.yil]);

  // Tek tıkla metin düzenleme hookları artık doğrudan tablo bileşenine prop olarak geçiliyor.
  // Bu useEffect sadece salt okunur kontrolü veya diğer başlangıç işlemleri için bırakılabilir
  // ancak şu an içi boşaltıldı.
  useEffect(() => {
    // Boş
  }, [rows, isReadOnly]);

  const dirtyRowIds = useMemo(
    () =>
      rows
        .filter((row) => {
          const cur = localChanges[row.id];
          const ini = initialSnapshot[row.id];
          return (
            cur &&
            ini &&
            (cur.durum !== ini.durum ||
              cur.islem.trim() !== ini.islem.trim() ||
              cur.tespit.trim() !== ini.tespit.trim() ||
              cur.ilgiliBds.trim() !== ini.ilgiliBds.trim())
          );
        })
        .map((row) => row.id),
    [rows, localChanges, initialSnapshot]
  );

  const riskCounts = useMemo(() => {
    const counts = { kritik: 0, yuksek: 0, orta: 0, dusuk: 0 };
    rows.forEach((row) => {
      const change = localChanges[row.id];
      const isEvet = (change?.durum ?? row.durum ?? "Evet") === "Evet";
      const risk = isEvet
        ? (row.evetRiskSeviyesi ?? "-")
        : (row.hayirRiskSeviyesi ?? "-");
      
      const n = risk.toLocaleLowerCase("tr-TR");
      if (n.includes("kritik")) counts.kritik++;
      else if (n.includes("yüksek")) counts.yuksek++;
      else if (n.includes("orta")) counts.orta++;
      else if (n.includes("düşük")) counts.dusuk++;
    });
    return counts;
  }, [rows, localChanges]);

  const dirtyRef = useRef(dirtyRowIds);
  useEffect(() => {
    dirtyRef.current = dirtyRowIds;
  }, [dirtyRowIds]);

  // Sayfadan ayrılma koruması (Tarayıcı yenileme/kapatma)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current.length > 0) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Menü/Sayfa İçi Link Tıklama Koruması
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Tıklanan öğenin kendisi veya herhangi bir üst öğesi bir 'a' etiketi mi?
      const target = (e.target as HTMLElement).closest("a");
      
      if (target && target.href && dirtyRef.current.length > 0) {
        try {
          const targetUrlObj = new URL(target.href);
          const currentUrlObj = new URL(window.location.href);

          // Sadece aynı kök dizindeki farklı sayfalar için (Menü geçişleri vb.)
          const targetPath = targetUrlObj.pathname.replace(/\/$/, "");
          const currentPath = currentUrlObj.pathname.replace(/\/$/, "");

          if (targetUrlObj.origin === currentUrlObj.origin && targetPath !== currentPath) {
            e.preventDefault();
            e.stopPropagation();
            setTargetUrl(target.href);
            setConfirmDialogOpen(true);
          }
        } catch (err) {
          // URL ayrıştırma hatası
        }
      }
    };

    window.addEventListener("click", handleAnchorClick, true);
    return () => window.removeEventListener("click", handleAnchorClick, true);
  }, []);

  const handleConfirmNavigation = () => {
    setConfirmDialogOpen(false);
    if (targetUrl) {
      router.push(targetUrl);
      setTargetUrl(null);
    } else if (pendingTabChange !== null) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
  };

  const handleCancelNavigation = () => {
    setConfirmDialogOpen(false);
    setTargetUrl(null);
    setPendingTabChange(null);
  };

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const cur = localChanges[row.id];
        const keyword = searchTerm.trim().toLocaleLowerCase("tr-TR");
        if (!keyword) return true;
        return [row.bolum, row.konu, cur?.islem, cur?.tespit, cur?.ilgiliBds, row.evetIcerik, row.hayirIcerik]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(keyword);
      }),
    [rows, localChanges, searchTerm]
  );

  // Single row per question — yanit reflects current user selection
  const visualRows = useMemo<VisualRow[]>(
    () =>
      filteredRows.map((row, index) => {
        const local = localChanges[row.id];
        const durum = local?.durum ?? "Evet";
        const isEvet = durum === "Evet";
        
        // Şablon değerleri
        const templateAciklama = isEvet ? (row.evetIcerik ?? "") : (row.hayirIcerik ?? "");
        const templateDenetimAdimi = isEvet ? (row.evetDenetimAksiyonu ?? "") : (row.hayirDenetimAksiyonu ?? "");

        return {
          pairId: row.id,
          sira: row.satirNo ?? index + 1,
          bolum: row.bolum ?? "-",
          altBolum: row.konu ?? "Genel",
          kontrolSorusu: local?.islem ?? row.islem ?? "",
          yanit: durum,
          risk: isEvet
            ? (row.evetRiskSeviyesi ?? "-")
            : (row.hayirRiskSeviyesi ?? "-"),
          aciklama: local?.tespit ?? templateAciklama,
          aksiyon: local?.ilgiliBds ?? templateDenetimAdimi,
          ilgiliBds: local?.ilgiliBds ?? row.ilgiliBds ?? "",
          rowTone: isEvet ? "evet" : "hayir",
        };
      }),
    [filteredRows, localChanges, rows]
  );

  // Özet Puan Paneli aggregations (updates live when YANIT changes)
  const ozetData = useMemo(() => {
    const total = rows.length;
    const evetCount = rows.filter(
      (r) => (localChanges[r.id]?.durum ?? "Evet") === "Evet"
    ).length;
    const hayirCount = total - evetCount;

    const riskDist = { kritik: 0, yuksek: 0, orta: 0, dusuk: 0, diger: 0 };
    rows.forEach((row) => {
      const durum = localChanges[row.id]?.durum ?? "Evet";
      const risk = (
        durum === "Evet"
          ? (row.evetRiskSeviyesi ?? "")
          : (row.hayirRiskSeviyesi ?? "")
      ).toLocaleLowerCase("tr-TR");
      if (risk.includes("kritik")) riskDist.kritik++;
      else if (risk.includes("yüksek")) riskDist.yuksek++;
      else if (risk.includes("orta")) riskDist.orta++;
      else if (risk.includes("düşük")) riskDist.dusuk++;
      else riskDist.diger++;
    });

    const sectionsMap: Record<
      string,
      { bolum: string; total: number; evet: number; hayir: number }
    > = {};
    rows.forEach((row) => {
      const bolum = row.bolum ?? "Diğer";
      if (!sectionsMap[bolum])
        sectionsMap[bolum] = { bolum, total: 0, evet: 0, hayir: 0 };
      sectionsMap[bolum].total++;
      const durum = localChanges[row.id]?.durum ?? "Evet";
      if (durum === "Evet") sectionsMap[bolum].evet++;
      else sectionsMap[bolum].hayir++;
    });

    return {
      total,
      evetCount,
      hayirCount,
      riskDist,
      sections: Object.values(sectionsMap),
    };
  }, [rows, localChanges]);

  const buildHtmlAsync = async () => {
    const createdAt = new Date().toLocaleString("tr-TR");
    
    // Tab 0: İç Kontrol Belgesi
    const body0 = rows
      .map((row, index) => {
        const cur = localChanges[row.id];
        return `<tr><td style="text-align:center">${row.satirNo ?? index + 1}</td><td>${escapeHtml(row.bolum)}</td><td>${escapeHtml(row.konu)}</td><td>${escapeHtml(cur?.islem)}</td><td style="text-align:center">${escapeHtml(cur?.durum)}</td><td>${escapeHtml(cur?.tespit)}</td><td>${escapeHtml(cur?.ilgiliBds)}</td></tr>`;
      })
      .join("");

    // Tab 1: Risk Kriteri Kılavuzu
    const body1 = riskKriteriRows.map(r => `
      <tr>
        <td style="background-color:${r.bg}; color:${r.fg}; font-weight:bold">${r.seviye}</td>
        <td>${escapeHtml(r.tanim)}</td>
        <td>${escapeHtml(r.etki)}</td>
        <td style="text-align:center">${escapeHtml(r.ornekleme)}</td>
      </tr>
    `).join("");

    // Tab 2: Özet Puan Paneli
    const riskDistBody = `
      <tr><td>Kritik</td><td style="text-align:center">${ozetData.riskDist.kritik}</td></tr>
      <tr><td>Yüksek</td><td style="text-align:center">${ozetData.riskDist.yuksek}</td></tr>
      <tr><td>Orta</td><td style="text-align:center">${ozetData.riskDist.orta}</td></tr>
      <tr><td>Düşük</td><td style="text-align:center">${ozetData.riskDist.dusuk}</td></tr>
    `;

    const sectionSummaryBody = ozetData.sections.map(s => `
      <tr>
        <td>${escapeHtml(s.bolum)}</td>
        <td style="text-align:center">${s.total}</td>
        <td style="text-align:center; color:green">${s.evet}</td>
        <td style="text-align:center; color:red">${s.hayir}</td>
      </tr>
    `).join("");

    // Tab 3: BDS Referanslar
    const body3 = bdsReferansRows.map(r => `
      <tr>
        <td style="font-weight:bold">${escapeHtml(r.bds)}</td>
        <td style="color:#478265">${escapeHtml(r.bolum)}</td>
        <td>${escapeHtml(r.konu)}</td>
      </tr>
    `).join("");

    return `
      <!doctype html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>İç Kontrol Tespit Raporu</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          h2 { color: #b55353; border-bottom: 2px solid #b55353; padding-bottom: 5px; margin-top: 30px; }
          h3 { color: #333; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #c9c9c9; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary-box { display: flex; gap: 20px; margin-bottom: 20px; }
          .stat-item { border: 1px solid #ddd; padding: 10px; border-radius: 5px; flex: 1; text-align: center; }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0;">İŞLETMEYE İLİŞKİN İÇ KONTROL TESPİT BELGESİ</h1>
          <div style="margin-top: 10px; font-weight: bold;">
            ${escapeHtml(user.denetlenenFirmaAdi)} - ${escapeHtml(String(user.yil ?? ""))}
          </div>
          <div style="color: #666;">Rapor Tarihi: ${createdAt}</div>
        </div>

        <h2>1. İÇ KONTROL TESPİT BELGESİ (SORU VE YANITLAR)</h2>
        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Bölüm</th>
              <th>Alt Bölüm</th>
              <th>Kontrol Sorusu</th>
              <th>Yanıt</th>
              <th>Açıklama</th>
              <th>İlgili BDS</th>
            </tr>
          </thead>
          <tbody>
            ${body0}
          </tbody>
        </table>

        <div style="page-break-before: always;"></div>

        <h2>2. RİSK KRİTERİ KILAVUZU</h2>
        <table>
          <thead>
            <tr>
              <th>Risk Seviyesi</th>
              <th>Tanım / Kontrol Durumu</th>
              <th>Denetim Etkisi</th>
              <th>Örnekleme</th>
            </tr>
          </thead>
          <tbody>
            ${body1}
          </tbody>
        </table>

        <div style="page-break-before: always;"></div>

        <h2>3. ÖZET PUAN VE RİSK ANALİZİ</h2>
        <div class="summary-box">
          <div class="stat-item"><b>Toplam Soru</b><br/>${ozetData.total}</div>
          <div class="stat-item"><b style="color:green">Evet Sayısı</b><br/>${ozetData.evetCount}</div>
          <div class="stat-item"><b style="color:red">Hayır Sayısı</b><br/>${ozetData.hayirCount}</div>
        </div>

        <h3>3.1. Risk Dağılım Özeti</h3>
        <table style="width: 50%;">
          <thead><tr><th>Risk Seviyesi</th><th>Sayı</th></tr></thead>
          <tbody>${riskDistBody}</tbody>
        </table>

        <h3>3.2. Bölüm Bazlı Yanıt Dağılımı</h3>
        <table>
          <thead>
            <tr>
              <th>Bölüm</th>
              <th>Toplam Soru</th>
              <th>Evet</th>
              <th>Hayır</th>
            </tr>
          </thead>
          <tbody>
            ${sectionSummaryBody}
          </tbody>
        </table>

        <div style="page-break-before: always;"></div>

        <h2>4. BAĞIMSIZ DENETİM STANDARTLARI (BDS) REFERANSLARI</h2>
        <table>
          <thead>
            <tr>
              <th>BDS</th>
              <th>Bölüm</th>
              <th>Konu</th>
            </tr>
          </thead>
          <tbody>
            ${body3}
          </tbody>
        </table>

        <div style="margin-top: 50px; border-top: 1px solid #ccc; pt: 10px; font-size: 10px; color: #999;">
          Bu belge denetim kanıtı niteliğindedir ve denetim dosyası kapsamında arşivlenmelidir.
        </div>
      </body>
      </html>
    `;
  };


  // Stabil Callback'ler (Sonsuz döngüyü önlemek için)
  const handleSelection1 = useCallback((r: number, c: number) => {
    const hot = hotRef1.current?.hotInstance;
    if (hot) {
      const value = hot.getDataAtCell(r, c) || "";
      const label = hot.getColHeader(c) || "";
      setSelectedCellInfo((prev) => {
        if (prev?.label === label && prev?.value === value) return prev;
        return { label, value };
      });
    }
  }, []);

  const handleSelection3 = useCallback((r: number, c: number) => {
    const hot = hotRef3.current?.hotInstance;
    if (hot) {
      const value = hot.getDataAtCell(r, c) || "";
      const label = hot.getColHeader(c) || "";
      setSelectedCellInfo((prev) => {
        if (prev?.label === label && prev?.value === value) return prev;
        return { label, value };
      });
    }
  }, []);

  const handleKeyDown1 = useCallback(function(this: any, event: any) {
    if (event.keyCode === 13) {
      const editor = this.getActiveEditor();
      if (editor && editor.isOpened()) {
        const selected = this.getSelected();
        if (selected) {
          const col = selected[0][1];
          if (col === 6 || col === 7) {
            event.stopImmediatePropagation();
          }
        }
      }
    }
  }, []);

  const handleKeyDown3 = useCallback(function(this: any, event: any) {
    if (event.keyCode === 13) {
      const editor = this.getActiveEditor();
      if (editor && editor.isOpened()) {
        const selected = this.getSelected();
        if (selected) {
          const col = selected[0][1];
          if (col === 5) {
            event.stopImmediatePropagation();
          }
        }
      }
    }
  }, []);

  const hotData1 = useMemo(() => {
    return visualRows.map((v) => [
      v.sira,
      v.bolum,
      v.altBolum,
      v.kontrolSorusu,
      v.yanit,
      v.risk,
      v.aciklama,
      v.aksiyon,
      v.ilgiliBds,
      v.pairId,
    ]);
  }, [visualRows]);

  const hotData3 = useMemo(() => {
    return visualRows.map((v) => {
      const aksiyonGerekli = (v.risk.toLocaleLowerCase("tr-TR").includes("yüksek") || v.risk.toLocaleLowerCase("tr-TR").includes("kritik")) ? "Evet" : "—";
      return [
        v.sira,
        v.kontrolSorusu,
        v.yanit,
        v.risk,
        aksiyonGerekli,
        v.aksiyon,
        v.pairId,
      ];
    });
  }, [visualRows]);


  const hotColumns1 = useMemo(() => [
    { readOnly: true, width: 50 }, // 0: Sıra
    { readOnly: true, width: 80 }, // 1: Bölüm
    { readOnly: true, width: 120 }, // 2: Alt Bölüm
    { type: "text", width: 300 }, // 3: Kontrol Sorusu
    { type: "dropdown", source: ["Evet", "Hayır"], width: 100 }, // 4: Yanıt
    { readOnly: true, width: 120, renderer: riskRenderer }, // 5: Risk Seviyesi
    { type: "text", width: 350 }, // 6: Açıklama Metni
    { type: "text", width: 350 }, // 7: Denetim Adımı
    { readOnly: true, width: 120 }, // 8: İlgili BDS
  ], []);

  const hotColumns3 = useMemo(() => [
    { readOnly: true, width: 50 }, // 0: No
    { type: "text", width: 300 }, // 1: Kontrol Sorusu
    { type: "dropdown", source: ["Evet", "Hayır"], width: 120 }, // 2: Seçilen Yanıt
    { readOnly: true, width: 150, renderer: riskRenderer }, // 3: Hesaplanan Risk
    { readOnly: true, width: 120 }, // 4: Aksiyon Gerekli
    { type: "text", width: 350 }, // 5: Denetim Adımı
  ], []);

  const handleHotChange = useCallback((changes: any[] | null, source: string, tab: number) => {
    if (!changes || source === "loadData") return;

    const hot = tab === 0 ? hotRef1.current?.hotInstance : hotRef3.current?.hotInstance;
    if (!hot) return;

    setLocalChanges((prev) => {
      const next = { ...prev };
      changes.forEach(([row, prop, oldVal, newVal]) => {
        if (oldVal === newVal) return;

        const rowData = hot.getSourceDataAtRow(row);
        if (!rowData) return;

        const pairId = tab === 0 ? rowData[9] : rowData[6];
        if (!pairId || !next[pairId]) return;

        const srcRow = rows.find((r) => r.id === pairId);
        if (!srcRow) return;

        next[pairId] = { ...next[pairId] };

        if (tab === 0) {
          if (prop === 3) next[pairId].islem = newVal;
          if (prop === 4) {
            next[pairId].durum = newVal;
            next[pairId].tespit = newVal === "Evet" ? (srcRow.evetIcerik ?? "") : (srcRow.hayirIcerik ?? "");
            next[pairId].ilgiliBds = newVal === "Evet" ? (srcRow.evetDenetimAksiyonu ?? "") : (srcRow.hayirDenetimAksiyonu ?? "");
          }
          if (prop === 6) next[pairId].tespit = newVal;
          if (prop === 7) next[pairId].ilgiliBds = newVal;
        } else if (tab === 2) {
          if (prop === 1) next[pairId].islem = newVal;
          if (prop === 2) {
            next[pairId].durum = newVal;
            next[pairId].tespit = newVal === "Evet" ? (srcRow.evetIcerik ?? "") : (srcRow.hayirIcerik ?? "");
            next[pairId].ilgiliBds = newVal === "Evet" ? (srcRow.evetDenetimAksiyonu ?? "") : (srcRow.hayirDenetimAksiyonu ?? "");
          }
          if (prop === 5) next[pairId].ilgiliBds = newVal;
        }
      });
      return next;
    });
  }, [rows]);

  const handleTabChange = (newIndex: number) => {
    if (dirtyRowIds.length > 0) {
      setPendingTabChange(newIndex);
      setConfirmDialogOpen(true);
      return;
    }
    setActiveTab(newIndex);
  };

  const handleSave = async () => {
    setSaveAttempted(true);
    if (!user.denetciId || !user.denetlenenId || !user.yil) return;
    setSaving(true);
    const ok = await kaydetIsletmeyeIliskinIcKontrolTespit({
      denetciId: user.denetciId,
      denetlenenId: user.denetlenenId,
      yil: user.yil,
      satirlar: rows.map((r) => {
        const cur = localChanges[r.id];
        return {
          id: r.id,
          durum: cur?.durum ?? r.durum,
          islem: cur?.islem ?? r.islem,
          tespit: cur?.tespit ?? r.tespit,
          ilgiliBds: cur?.ilgiliBds ?? r.ilgiliBds,
        };
      }),
    });
    if (ok) {
      const snapshot: Record<number, LocalChange> = {};
      rows.forEach((row) => {
        const cur = localChanges[row.id];
        snapshot[row.id] = {
          durum: cur?.durum ?? row.durum,
          islem: cur?.islem ?? row.islem ?? "",
          tespit: cur?.tespit ?? row.tespit ?? "",
          ilgiliBds: cur?.ilgiliBds ?? row.ilgiliBds ?? "",
        };
      });
      setInitialSnapshot(snapshot);
      setOpenSnackbar(true);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={0}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "background.paper",
          pt: 1,
          pb: 0.5,
          px: 2,
          mx: -2,
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          mb: 0,
        }}
      >
        {/* ─── RİSK ÖZET PANELİ ────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, px: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", maxWidth: 400, lineHeight: 1.2 }}>
            Tüm sorular için evet/hayır risk matrisini ve seçilen yanıtlara göre oluşan hesaplanmış risk değerleri:
          </Typography>
          <Stack direction="row" spacing={1}>
            {[
              { label: "KRİTİK", count: riskCounts.kritik, bg: "#ffdce0", color: "#c53030" },
              { label: "YÜKSEK", count: riskCounts.yuksek, bg: "#ffebcc", color: "#dd6b20" },
              { label: "ORTA", count: riskCounts.orta, bg: "#fff9db", color: "#b7791f" },
              { label: "DÜŞÜK", count: riskCounts.dusuk, bg: "#e3f9e5", color: "#2f855a" },
            ].map((item) => (
              <Box key={item.label} sx={{ 
                px: 1.5, py: 0.3, borderRadius: 1, backgroundColor: item.bg, border: "1px solid", borderColor: "rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: 1, minWidth: 80, justifyContent: "center"
              }}>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: "0.65rem", color: item.color }}>{item.label}:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, fontSize: "0.85rem", color: item.color }}>{item.count}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stepper activeStep={activeTab} alternativeLabel sx={{ p: 0.5 }}>
          {TAB_LABELS.map((label, index) => (
            <Step
              key={label}
              onClick={() => handleTabChange(index)}
              sx={{
                cursor: "pointer",
                "& .MuiStepLabel-label": {
                  fontWeight: index === activeTab ? 800 : 500,
                  fontSize: "0.8rem",
                  color: index === activeTab ? "primary.main" : "text.secondary",
                  mt: 0.5,
                },
                "& .MuiStepIcon-root": {
                  transition: "transform 0.2s ease",
                  transform: index === activeTab ? "scale(1.1)" : "scale(0.9)",
                },
              }}
            >
              <StepLabel sx={{ cursor: "pointer" }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* ─── TAB 0: İç Kontrol Belgesi ─────────────────────────── */}
      {activeTab === 0 && (
        <>
          <Box sx={{ pb: 1 }} />

          <Box>
            <Box
              sx={{
                px: 2,
                py: 0.7,
              }}
            >
            <Box sx={{ 
              mt: 1, 
              "& .htCore td": { 
                verticalAlign: "middle !important", 
                fontSize: "0.85rem",
                whiteSpace: "nowrap !important",
                textOverflow: "ellipsis",
                overflow: "hidden"
              },
              "& .risk-kritik": { backgroundColor: "#ffdce0 !important", fontWeight: "bold", textAlign: "center" },
              "& .risk-yuksek": { backgroundColor: "#ffebcc !important", fontWeight: "bold", textAlign: "center" },
              "& .risk-orta": { backgroundColor: "#fff9db !important", fontWeight: "bold", textAlign: "center" },
              "& .risk-dusuk": { backgroundColor: "#e3f9e5 !important", fontWeight: "bold", textAlign: "center" },
              "& .handsontable .handsontableInput": { fontSize: "0.85rem", lineHeight: "1.4" }
            }}>
              <CustomHotTable
                ref={hotRef1}
                data={hotData1}
                colHeaders={["Sıra", "Böl.", "Alt Bölüm", "Kontrol Sorusu", "YANIT (E/H)", "RİSK SEVİYESİ", "Açıklama Metni", "Denetim Adımı", "İlgili BDS"]}
                columns={hotColumns1}
                afterChange={(changes: any, source: string) => handleHotChange(changes, source, 0)}
                afterSelectionEnd={handleSelection1}
                beforeKeyDown={handleKeyDown1}
                dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
                columnSorting={true}
                filters={true}
                manualColumnResize={true}
                autoRowSize={false}
                rowHeights={40}
                stretchH="all"
                height="60vh"
                hiddenColumns={{ columns: [9], indicators: false }}
                className="ht-theme-horizon"
                licenseKey="non-commercial-and-evaluation"
                readOnly={isReadOnly}
              />
            </Box>
          </Box>
        </Box>
      </>
    )}

      {/* ─── TAB 1: Risk Kriteri Kılavuzu ──────────────────────── */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ bgcolor: "rgba(0,0,0,0.03)", px: 2, py: 0.8 }}>
            Bu kılavuz, her risk seviyesinin tanımını, etkisini ve önerilen örnekleme oranını göstermektedir.
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Risk Seviyesi", "Tanım / Kontrol Durumu", "Denetim Etkisi", "Örnekleme"].map(
                    (h) => (
                      <TableCell
                        key={h}
                        sx={{
                          bgcolor: "#b55353",
                          color: "#fff",
                          fontWeight: 800,
                          borderColor: "#c9c9c9",
                        }}
                      >
                        {h}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {riskKriteriRows.map((r) => (
                  <TableRow key={r.seviye}>
                    <TableCell
                      sx={{
                        bgcolor: r.bg,
                        color: r.fg,
                        fontWeight: 700,
                        borderColor: "#c9c9c9",
                        minWidth: 100,
                      }}
                    >
                      {r.seviye}
                    </TableCell>
                    <TableCell sx={{ bgcolor: r.bg, color: r.fg, borderColor: "#c9c9c9" }}>
                      {r.tanim}
                    </TableCell>
                    <TableCell sx={{ bgcolor: r.bg, color: r.fg, borderColor: "#c9c9c9" }}>
                      {r.etki}
                    </TableCell>
                    <TableCell
                      sx={{
                        bgcolor: r.bg,
                        color: r.fg,
                        fontWeight: 700,
                        textAlign: "center",
                        borderColor: "#c9c9c9",
                      }}
                    >
                      {r.ornekleme}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
              Kontrol Ortamı Bileşenleri
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap">
              {[
                { label: "Kontrol Ortamı", desc: "Yönetim tutumu, etik değerler, yetkinlik" },
                { label: "Risk Değerlendirme", desc: "İşletmenin risk tanımlama ve analiz süreci" },
                { label: "Kontrol Faaliyetleri", desc: "Politikalar, prosedürler, onay mekanizmaları" },
                { label: "Bilgi & İletişim", desc: "Raporlama akışı, veri kalitesi" },
                { label: "İzleme", desc: "Sürekli değerlendirme, iç denetim" },
              ].map((c) => (
                <Paper
                  key={c.label}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: "#b55353",
                    minWidth: 160,
                    flex: "1 1 160px",
                  }}
                >
                  <Typography variant="body2" fontWeight={800} color="#b55353">
                    {c.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.desc}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* ─── TAB 2: Özet Puan Paneli ───────────────────────────── */}
      {activeTab === 2 && (
        <Stack spacing={2}>
          <Box>
            <Box sx={{ bgcolor: "rgba(0,0,0,0.03)", px: 2, py: 0.8 }}>
              Tüm sorular için evet/hayır risk matrisini ve seçilen yanıtlara göre oluşan hesaplanmış risk değerlerini gösterir.
            </Box>
            <Box sx={{ 
              mt: 2, 
              "& .htCore td": { 
                verticalAlign: "middle !important", 
                fontSize: "0.85rem",
                whiteSpace: "nowrap !important",
                textOverflow: "ellipsis",
                overflow: "hidden"
              } 
            }}>
              <CustomHotTable
                ref={hotRef3}
                data={hotData3}
                colHeaders={["No", "Kontrol Sorusu", "SEÇİLEN YANIT", "HESAPLANAN RİSK", "AKSİYON GEREKLİ?", "Denetim Adımı"]}
                columns={hotColumns3}
                afterChange={(changes: any, source: string) => handleHotChange(changes, source, 2)}
                afterSelectionEnd={handleSelection3}
                beforeKeyDown={handleKeyDown3}
                dropdownMenu={["filter_by_condition", "filter_by_value", "filter_action_bar"]}
                columnSorting={true}
                filters={true}
                manualColumnResize={true}
                autoRowSize={false}
                rowHeights={40}
                stretchH="all"
                height="60vh"
                hiddenColumns={{ columns: [6], indicators: false }}
                className="ht-theme-horizon"
                licenseKey="non-commercial-and-evaluation"
                readOnly={isReadOnly}
              />
            </Box>
          </Box>
        </Stack>
      )}

      {/* ─── TAB 3: BDS Referans ───────────────────────────────── */}
      {activeTab === 3 && (
        <Stack spacing={2}>
          <Box>
            <Box
              sx={{
                bgcolor: "#d8f3dc",
                color: "#1b4332",
                px: 2,
                py: 0.8,
              }}
            >
              Bağımsız Denetim Standartları — İşletmeye İlişkin İç Kontrol Tespit Belgesi kapsamında
              atıfta bulunulan standartlar ve ilgili bölümler.
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["BDS", "Bölüm", "Konu"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          bgcolor: "#478265",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          borderColor: "#c9c9c9",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bdsReferansRows.map((r, i) => (
                    <TableRow
                      key={r.bds}
                      sx={{ bgcolor: i % 2 === 0 ? "#f0f7f3" : "#ffffff" }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: "#1b4332",
                          borderColor: "#c9c9c9",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.bds}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: "#478265",
                          borderColor: "#c9c9c9",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.bolum}
                      </TableCell>
                      <TableCell sx={{ borderColor: "#c9c9c9" }}>{r.konu}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      )}

      {/* Global Navigation and Save Bar - Now above Global Actions */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          pb: 2,
          px: 3,
          borderTop: "1px solid #e0e0e0",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<IconArrowLeft size={20} />}
          onClick={() => handleTabChange(activeTab - 1)}
          disabled={activeTab === 0}
          sx={{ minWidth: 120, order: { xs: 2, sm: 1 } }}
        >
          Geri
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: { xs: "100%", sm: "auto" }, order: { xs: 1, sm: 2 } }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconDeviceFloppy size={20} />}
            disabled={saving || dirtyRowIds.length === 0}
            onClick={handleSave}
            sx={{
              minWidth: 180,
              boxShadow: dirtyRowIds.length > 0 ? "0 4px 12px rgba(25, 118, 210, 0.3)" : "none",
              fontWeight: 700,
            }}
          >
            {saving
              ? "Kaydediliyor..."
              : dirtyRowIds.length > 0
              ? "Değişiklikleri Kaydet"
              : "Tüm Değişiklikler Kaydedildi"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            endIcon={<IconArrowRight size={20} />}
            onClick={() => handleTabChange(activeTab + 1)}
            disabled={activeTab === TAB_LABELS.length - 1}
            sx={{ minWidth: 120 }}
          >
            İleri
          </Button>
        </Stack>
      </Box>

      {/* Global Actions - Now at the very bottom */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <BelgeKontrolCard
            controller="IsletmeyeIliskinIcKontrolTespit"
            hazirlayan="Hazırlayan"
            fetch={fetchData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <BelgeKontrolCard
            controller="IsletmeyeIliskinIcKontrolTespit"
            onaylayan="Onaylayan"
            fetch={fetchData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <BelgeKontrolCard
            controller="IsletmeyeIliskinIcKontrolTespit"
            kaliteKontrol="Kalite Kontrol"
            fetch={fetchData}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <IslemlerCardHtml
            controller="IsletmeyeIliskinIcKontrolTespit"
            buildHtmlAsync={buildHtmlAsync}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled" sx={{ width: "100%" }}>
          Tüm değişiklikler başarıyla kaydedildi!
        </Alert>
      </Snackbar>

      {/* ─── GEZİNTİ KORUMASI DİALOGU ────────────────────────── */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelNavigation}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 800 }}>
          Kaydedilmemiş Değişiklikler
        </DialogTitle>
        <DialogContent>
          <Typography>
            Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinize emin misiniz? Değişiklikleriniz kaybolacaktır.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelNavigation} variant="outlined" color="inherit">
            Sayfada Kal
          </Button>
          <Button
            onClick={handleConfirmNavigation}
            variant="contained"
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": { backgroundColor: "#b71c1c" },
              color: "#fff",
              fontWeight: "bold"
            }}
            autoFocus
          >
            Ayrıl (Kaydetme)
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default IsletmeyeIliskinIcKontrolTespitTable;
