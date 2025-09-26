import "print-friendly";
import "print-friendly/index.css";
import "./print-friendly.css";
import "./rapor.css";
import React, { useEffect, useState } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
  getDikeyAnaliz,
  getKarsilastirmaliAnaliz,
} from "@/api/Analizler/Analizler";

interface Veri {
  id: number;
  islem: string;
  tespit: string;
  baslikId?: number;
  kullaniciId?: number;
  standartMi: boolean;
}

interface VeriFT {
  id: number;
  parentId?: number | null;
  kalemAdi: string;
  dipnot: string;
  formul: string;
  tutarYil1: number;
  tutarYil2: number;
  tutarYil3: number;
}

interface VeriFT2 {
  id: number;
  dikeyKalemId: number;
  yatayKalemId: number;
  dikeyKalemAdi: string;
  yatayKalemAdi: string;
  formul: number;
  tutar: number;
  kalemOzkaynakId: number;
  formulOzkaynakNavigationId: number;
}

interface VeriKA {
  id: number;
  tabloAdi: string;
  kalemId: number | null;
  kalemParentId: number | null;
  parentId: number | null;
  adi: string;
  kebirKodu: number | null;
  tutarCariDonem: number;
  tutarOncekiDonem: number;
  mutlak: number;
  yuzde: number;
  reel: number;
}

interface VeriDA {
  id: number;
  tabloAdi: string;
  kalemId: number | null;
  kalemParentId: number | null;
  parentId: number | null;
  adi: string;
  kebirKodu: number | null;
  tutarCariDonem: number;
  oranGenelCariDonem: number;
  oranGrupCariDonem: number;
  tutarOncekiDonem: number;
  oranGenelOncekiDonem: number;
  oranGrupOncekiDonem: number;
}

interface RaporProps {
  kapakImage: string;
  firmaLogoImage: string;
  dikeyKonum: string;
  yatayKonum: string;
  fdt: VeriFT[];
  kzt: VeriFT[];
  nat: VeriFT[];
  ozktCari: VeriFT2[];
  ozktOnceki: VeriFT2[];
  ozkDikeyCari: VeriFT2[];
  ozkDikeyOnceki: VeriFT2[];
  ozkYatayCari: VeriFT2[];
  ozkYatayOnceki: VeriFT2[];
  veriler: Veri[];
}

const Rapor: React.FC<RaporProps> = ({
  kapakImage,
  firmaLogoImage,
  dikeyKonum,
  yatayKonum,
  fdt,
  kzt,
  nat,
  ozktCari,
  ozktOnceki,
  ozkDikeyCari,
  ozkDikeyOnceki,
  ozkYatayCari,
  ozkYatayOnceki,
  veriler,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const [titleKA, setTitleKA] = useState("");
  const [titleKA2, setTitleKA2] = useState("");

  const [kalemDataKA, setKalemDataKA] = React.useState<VeriKA[]>([]);
  const [hesapDataKA, setHesapDataKA] = React.useState<VeriKA[]>([]);

  const [kalemDataKA2, setKalemDataKA2] = React.useState<VeriKA[]>([]);
  const [hesapDataKA2, setHesapDataKA2] = React.useState<VeriKA[]>([]);

  const fetchDataKarsilastirmaliAnaliz = async () => {
    try {
      const karsilastirmaliAnalizTablosu = await getKarsilastirmaliAnaliz(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      setTitleKA(karsilastirmaliAnalizTablosu[0]?.adi);

      let control = true;
      const kalemList: VeriKA[] = [];
      const hesapList: VeriKA[] = [];

      const kalemList2: VeriKA[] = [];
      const hesapList2: VeriKA[] = [];

      karsilastirmaliAnalizTablosu.forEach((veri: VeriKA) => {
        const newRow = {
          id: veri.id,
          tabloAdi: veri.tabloAdi,
          kalemId: veri.kalemId !== undefined ? veri.kalemId : null,
          kalemParentId:
            veri.kalemParentId !== undefined ? veri.kalemParentId : null,
          parentId: veri.parentId !== undefined ? veri.parentId : null,
          adi: veri.adi,
          kebirKodu: veri.kebirKodu !== undefined ? veri.kebirKodu : null,
          tutarCariDonem: veri.tutarCariDonem,
          tutarOncekiDonem: veri.tutarOncekiDonem,
          mutlak: veri.mutlak,
          yuzde: veri.yuzde,
          reel: veri.reel,
        };
        if (newRow.tabloAdi == "finansaldurum") {
          if (newRow.kalemId !== null) {
            kalemList.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList.push(newRow);
          }
        } else if (newRow.tabloAdi == "karzarar") {
          if (newRow.kalemId !== null) {
            if (control) {
              setTitleKA2(newRow.adi);

              control = false;
            }
            kalemList2.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList2.push(newRow);
          }
        }
      });

      setKalemDataKA(kalemList);
      setHesapDataKA(hesapList);
      setKalemDataKA2(kalemList2);
      setHesapDataKA2(hesapList2);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  // ---- Karşılaştırmalı Analiz yardımcıları ----
  const renderKArows = (
    rows: VeriKA[],
    accounts: VeriKA[],
    parentId: number | null,
    level = 0
  ) =>
    rows
      .filter((r) => r.kalemParentId === parentId)
      .map((r) => {
        // kalem için 0 kontrolü
        const isAllZero =
          (r.tutarOncekiDonem ?? 0) === 0 &&
          (r.tutarCariDonem ?? 0) === 0 &&
          (r.mutlak ?? 0) === 0 &&
          (r.yuzde ?? 0) === 0 &&
          (r.reel ?? 0) === 0;

        if (isAllZero) return null;

        return (
          <React.Fragment key={r.id}>
            <tr>
              <td style={{ paddingLeft: level * 32 + 10 }}>{r.adi}</td>
              <td style={{ textAlign: "right" }}>
                {formatNumber(r.tutarOncekiDonem)}
              </td>
              <td style={{ textAlign: "right" }}>
                {formatNumber(r.tutarCariDonem)}
              </td>
              <td style={{ textAlign: "right" }}>{formatNumber(r.mutlak)}</td>
              <td style={{ textAlign: "right" }}>%{formatNumber(r.yuzde)}</td>
              <td style={{ textAlign: "right" }}>%{formatNumber(r.reel)}</td>
            </tr>

            {accounts
              .filter((h) => h.parentId === r.kalemId)
              .map((h) => {
                // hesap için 0 kontrolü
                const accAllZero =
                  (h.tutarOncekiDonem ?? 0) === 0 &&
                  (h.tutarCariDonem ?? 0) === 0 &&
                  (h.mutlak ?? 0) === 0 &&
                  (h.yuzde ?? 0) === 0 &&
                  (h.reel ?? 0) === 0;

                if (accAllZero) return null;

                return (
                  <tr key={`acc-${h.id}`}>
                    <td
                      style={{
                        paddingLeft: (level + 1) * 32 + 10,
                        fontStyle: "italic",
                      }}
                    >
                      {(h.kebirKodu ?? "") + " - " + h.adi}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatNumber(h.tutarOncekiDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatNumber(h.tutarCariDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {formatNumber(h.mutlak)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.yuzde)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.reel)}
                    </td>
                  </tr>
                );
              })}

            {/* Çocuk kalemler */}
            {renderKArows(rows, accounts, r.kalemId, level + 1)}
          </React.Fragment>
        );
      });

  const [titleDA, setTitleDA] = useState("");
  const [titleDA2, setTitleDA2] = useState("");

  const [kalemDataDA, setKalemDataDA] = React.useState<VeriDA[]>([]);
  const [hesapDataDA, setHesapDataDA] = React.useState<VeriDA[]>([]);

  const [kalemDataDA2, setKalemDataDA2] = React.useState<VeriDA[]>([]);
  const [hesapDataDA2, setHesapDataDA2] = React.useState<VeriDA[]>([]);

  const fetchDataDikeyAnaliz = async () => {
    try {
      const karsilastirmaliAnalizTablosu = await getDikeyAnaliz(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );

      setTitleDA(karsilastirmaliAnalizTablosu[0]?.adi);

      let control = true;
      const kalemList: VeriDA[] = [];
      const hesapList: VeriDA[] = [];

      const kalemList2: VeriDA[] = [];
      const hesapList2: VeriDA[] = [];

      karsilastirmaliAnalizTablosu.forEach((veri: VeriDA) => {
        const newRow = {
          id: veri.id,
          tabloAdi: veri.tabloAdi,
          kalemId: veri.kalemId !== undefined ? veri.kalemId : null,
          kalemParentId:
            veri.kalemParentId !== undefined ? veri.kalemParentId : null,
          parentId: veri.parentId !== undefined ? veri.parentId : null,
          adi: veri.adi,
          kebirKodu: veri.kebirKodu !== undefined ? veri.kebirKodu : null,
          tutarCariDonem: veri.tutarCariDonem,
          oranGenelCariDonem: veri.oranGenelCariDonem,
          oranGrupCariDonem: veri.oranGrupCariDonem,
          tutarOncekiDonem: veri.tutarOncekiDonem,
          oranGenelOncekiDonem: veri.oranGenelOncekiDonem,
          oranGrupOncekiDonem: veri.oranGrupOncekiDonem,
        };
        if (newRow.tabloAdi == "finansaldurum") {
          if (newRow.kalemId !== null) {
            kalemList.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList.push(newRow);
          }
        } else if (newRow.tabloAdi == "karzarar") {
          if (newRow.kalemId !== null) {
            if (control) {
              setTitleDA2(newRow.adi);

              control = false;
            }
            kalemList2.push(newRow);
          }
          if (newRow.parentId !== null) {
            hesapList2.push(newRow);
          }
        }
      });

      setKalemDataDA(kalemList);
      setHesapDataDA(hesapList);
      setKalemDataDA2(kalemList2);
      setHesapDataDA2(hesapList2);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  // ---- Dikey Analiz yardımcıları ----
  const renderDArows = (
    rows: VeriDA[],
    accounts: VeriDA[],
    parentId: number | null,
    level = 0
  ) =>
    rows
      .filter((r) => r.kalemParentId === parentId)
      .map((r) => {
        // kalem için 0 kontrolü
        const isAllZero =
          (r.tutarCariDonem ?? 0) === 0 &&
          (r.oranGenelCariDonem ?? 0) === 0 &&
          (r.oranGrupCariDonem ?? 0) === 0 &&
          (r.tutarOncekiDonem ?? 0) === 0 &&
          (r.oranGenelOncekiDonem ?? 0) === 0 &&
          (r.oranGrupOncekiDonem ?? 0) === 0;

        if (isAllZero) return null;

        return (
          <React.Fragment key={r.id}>
            <tr>
              <td style={{ paddingLeft: level * 32 + 10 }}>{r.adi}</td>

              {/* Cari dönem */}
              <td style={{ textAlign: "right" }}>
                {formatNumber(r.tutarCariDonem)}
              </td>
              <td style={{ textAlign: "right" }}>
                %{formatNumber(r.oranGenelCariDonem)}
              </td>
              <td style={{ textAlign: "right" }}>
                %{formatNumber(r.oranGrupCariDonem)}
              </td>

              {/* Önceki dönem */}
              <td style={{ textAlign: "right" }}>
                {formatNumber(r.tutarOncekiDonem)}
              </td>
              <td style={{ textAlign: "right" }}>
                %{formatNumber(r.oranGenelOncekiDonem)}
              </td>
              <td style={{ textAlign: "right" }}>
                %{formatNumber(r.oranGrupOncekiDonem)}
              </td>
            </tr>

            {accounts
              .filter((h) => h.parentId === r.kalemId)
              .map((h) => {
                // hesap için 0 kontrolü
                const accAllZero =
                  (h.tutarCariDonem ?? 0) === 0 &&
                  (h.oranGenelCariDonem ?? 0) === 0 &&
                  (h.oranGrupCariDonem ?? 0) === 0 &&
                  (h.tutarOncekiDonem ?? 0) === 0 &&
                  (h.oranGenelOncekiDonem ?? 0) === 0 &&
                  (h.oranGrupOncekiDonem ?? 0) === 0;

                if (accAllZero) return null;

                return (
                  <tr key={`da-acc-${h.id}`}>
                    <td
                      style={{
                        paddingLeft: (level + 1) * 32 + 10,
                        fontStyle: "italic",
                      }}
                    >
                      {(h.kebirKodu ?? "") + " - " + h.adi}
                    </td>

                    {/* Cari dönem */}
                    <td style={{ textAlign: "right" }}>
                      {formatNumber(h.tutarCariDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.oranGenelCariDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.oranGrupCariDonem)}
                    </td>

                    {/* Önceki dönem */}
                    <td style={{ textAlign: "right" }}>
                      {formatNumber(h.tutarOncekiDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.oranGenelOncekiDonem)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      %{formatNumber(h.oranGrupOncekiDonem)}
                    </td>
                  </tr>
                );
              })}

            {/* Çocuk kalemler */}
            {renderDArows(rows, accounts, r.kalemId, level + 1)}
          </React.Fragment>
        );
      });

  useEffect(() => {
    fetchDataKarsilastirmaliAnaliz();
    fetchDataDikeyAnaliz();
  }, []);

  return (
    <div id="report" className="page-container">
      <div
        className="page"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
        }}
      >
        {firmaLogoImage && (
          <img
            id="logoImg"
            src={firmaLogoImage}
            alt="Logo"
            style={{
              position: "absolute",
              top: dikeyKonum == "Ust" ? 0 : undefined,
              left:
                yatayKonum == "Sol" ? 0 : yatayKonum == "Orta" ? 0 : undefined,
              bottom: dikeyKonum == "Alt" ? 0 : undefined,
              right:
                yatayKonum == "Sag" ? 0 : yatayKonum == "Orta" ? 0 : undefined,
              marginLeft: yatayKonum == "Orta" ? "auto" : undefined,
              marginRight: yatayKonum == "Orta" ? "auto" : undefined,
              width: "25%",
              height: "auto",
              objectFit: "contain",
              zIndex: 100,
            }}
          />
        )}
        {kapakImage && (
          <img
            id="kapakImg"
            src={kapakImage}
            alt="Kapak"
            style={{
              width: "100%",
              height: "27cm",
              objectFit: "cover",
            }}
          />
        )}
        <div
          className="text-center"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <h1>{user.denetlenenFirmaAdi}</h1>
          <h2>
            1 Ocak {user.yil} - 31 Aralık {user.yil}
          </h2>
          <h2>HESAP DÖNEMİNE AİT FAALİYET RAPORU</h2>
        </div>
      </div>
      <div
        className="page"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <h2>Faaliyet Raporu</h2>
          <h2>{user.denetlenenFirmaAdi}</h2>
          <h2>Ortak Kurulu&apos;na</h2>
        </div>
      </div>
      {/* Faaliyet Raporu */}
      <div className="page">
        <div className="text-center">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "50%" }}>İşlem</th>
                <th style={{ width: "50%" }}>Tespit</th>
              </tr>
            </thead>
            <tbody>
              {veriler
                .filter((v) => v.baslikId === undefined)
                .map((parent, pIndex) => (
                  <React.Fragment key={`p-${pIndex}`}>
                    <tr>
                      <td>{parent.islem}</td>
                      <td>{parent.tespit}</td>
                    </tr>
                    {veriler
                      .filter((child) => child.baslikId === parent.id)
                      .map((child, cIndex) => (
                        <tr key={`c-${pIndex}-${cIndex}`}>
                          <td>{child.islem}</td>
                          <td>{child.tespit}</td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
      </div>
      {/* Finansal Tablolar*/}
      <div className="page">
        {/* Finansal Durum Tablosu */}
        <div className="text-center">
          <h3>FİNANSAL DURUM TABLOSU</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kalem Adı</th>
                <th style={{ textAlign: "center" }}>Dipnot</th>
                <th style={{ textAlign: "center" }}>{user.yil || ""}</th>
                <th style={{ textAlign: "center" }}>
                  {user.yil ? user.yil - 1 : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {fdt.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.kalemAdi}</td>
                  <td style={{ textAlign: "center" }}>{row.dipnot}</td>
                  <td className="text-right">
                    {row.tutarYil1 > 0
                      ? formatNumber(row.tutarYil1)
                      : row.tutarYil1 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil1))})`}
                  </td>
                  <td className="text-right">
                    {row.tutarYil2 > 0
                      ? formatNumber(row.tutarYil2)
                      : row.tutarYil2 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil2))})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
        {/* Kar Zarar Tablosu */}
        <div className="text-center">
          <h3>KAR ZARAR TABLOSU</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kalem Adı</th>
                <th style={{ textAlign: "center" }}>Dipnot</th>
                <th style={{ textAlign: "center" }}>{user.yil || ""}</th>
                <th style={{ textAlign: "center" }}>
                  {user.yil ? user.yil - 1 : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {kzt.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.kalemAdi}</td>
                  <td style={{ textAlign: "center" }}>{row.dipnot}</td>
                  <td className="text-right">
                    {row.tutarYil1 > 0
                      ? formatNumber(row.tutarYil1)
                      : row.tutarYil1 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil1))})`}
                  </td>
                  <td className="text-right">
                    {row.tutarYil2 > 0
                      ? formatNumber(row.tutarYil2)
                      : row.tutarYil2 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil2))})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
        {/* Nakit Akış Tablosu */}
        <div className="text-center">
          <h3>NAKİT AKIŞ TABLOSU</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kalem Adı</th>
                <th style={{ textAlign: "center" }}>Dipnot</th>
                <th style={{ textAlign: "center" }}>{user.yil || ""}</th>
                <th style={{ textAlign: "center" }}>
                  {user.yil ? user.yil - 1 : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {nat.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.kalemAdi}</td>
                  <td style={{ textAlign: "center" }}>{row.dipnot}</td>
                  <td className="text-right">
                    {row.tutarYil1 > 0
                      ? formatNumber(row.tutarYil1)
                      : row.tutarYil1 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil1))})`}
                  </td>
                  <td className="text-right">
                    {row.tutarYil2 > 0
                      ? formatNumber(row.tutarYil2)
                      : row.tutarYil2 == 0
                      ? "-"
                      : `(${formatNumber(Math.abs(row.tutarYil2))})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
        {/* Özkaynak Tablosu */}
        <div className="text-center">
          <h3>ÖZKAYNAK TABLOSU</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kalem Adı ({user.yil})</th>
                {ozkYatayCari.map((yatay) => (
                  <th key={yatay.yatayKalemId} style={{ textAlign: "center" }}>
                    {yatay.yatayKalemAdi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ozkDikeyCari.map((dikey) => (
                <tr key={dikey.dikeyKalemId}>
                  {/* Dikey Kalem Adı */}
                  <td>{dikey.dikeyKalemAdi}</td>

                  {/* Yatay Kalemler için tutarları göstermek */}
                  {ozkYatayCari.map((yatay) => {
                    const ilgiliVeri = ozktCari.find(
                      (row) =>
                        row.dikeyKalemId === dikey.dikeyKalemId &&
                        row.yatayKalemId === yatay.yatayKalemId
                    );

                    return (
                      <td key={yatay.yatayKalemId} className="text-right">
                        {ilgiliVeri
                          ? ilgiliVeri.tutar > 0
                            ? formatNumber(ilgiliVeri.tutar)
                            : ilgiliVeri.tutar == 0
                            ? "-"
                            : `(${formatNumber(Math.abs(ilgiliVeri.tutar))})`
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="seperator48"></div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kalem Adı ({user.yil ? user.yil - 1 : 0})</th>
                {ozkYatayOnceki.map((yatay) => (
                  <th key={yatay.yatayKalemId} style={{ textAlign: "center" }}>
                    {yatay.yatayKalemAdi}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ozkDikeyOnceki.map((dikey) => (
                <tr key={dikey.dikeyKalemId}>
                  {/* Dikey Kalem Adı */}
                  <td>{dikey.dikeyKalemAdi}</td>

                  {/* Yatay Kalemler için tutarları göstermek */}
                  {ozkYatayOnceki.map((yatay) => {
                    const ilgiliVeri = ozktOnceki.find(
                      (row) =>
                        row.dikeyKalemId === dikey.dikeyKalemId &&
                        row.yatayKalemId === yatay.yatayKalemId
                    );

                    return (
                      <td key={yatay.yatayKalemId} className="text-right">
                        {ilgiliVeri
                          ? ilgiliVeri.tutar > 0
                            ? formatNumber(ilgiliVeri.tutar)
                            : ilgiliVeri.tutar == 0
                            ? "-"
                            : `(${formatNumber(Math.abs(ilgiliVeri.tutar))})`
                          : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
      </div>
      {/* Karşılaştırmalı Analiz*/}
      {kalemDataKA.length > 0 && (
        <div className="page">
          <div className="text-center" style={{ marginBottom: 8 }}>
            <h3>KARŞILAŞTIRMALI ANALİZ – FİNANSAL DURUM</h3>
          </div>
          <div className="table-container">
            <table className="table-plain">
              <thead className="sticky">
                <tr>
                  <th style={{ width: "50%", textAlign: "left" }}>{titleKA}</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil || ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>Mutlak</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Yüzde</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Reel</th>
                </tr>
              </thead>
              <tbody>
                {renderKArows(
                  kalemDataKA,
                  hesapDataKA,
                  kalemDataKA[0]?.kalemId ?? null
                )}
              </tbody>
            </table>
          </div>
          <div className="seperator48"></div>
        </div>
      )}
      {kalemDataKA2.length > 0 && (
        <div className="page">
          <div className="text-center" style={{ marginBottom: 8 }}>
            <h3>KARŞILAŞTIRMALI ANALİZ – KAR/ZARAR</h3>
          </div>
          <div className="table-container">
            <table className="table-plain">
              <thead className="sticky">
                <tr>
                  <th style={{ width: "50%", textAlign: "left" }}>
                    {titleKA2}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil || ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>Mutlak</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Yüzde</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Reel</th>
                </tr>
              </thead>
              <tbody>
                {renderKArows(
                  kalemDataKA2,
                  hesapDataKA2,
                  kalemDataKA2[0]?.kalemId ?? null
                )}
              </tbody>
            </table>
          </div>
          <div className="seperator48"></div>
        </div>
      )}
      {/* Dikey Analiz */}
      {kalemDataDA.length > 0 && (
        <div className="page">
          <div className="text-center" style={{ marginBottom: 8 }}>
            <h3>DİKEY ANALİZ – FİNANSAL DURUM</h3>
          </div>
          <div className="table-container">
            <table className="table-plain">
              <thead className="sticky">
                <tr>
                  <th style={{ width: "40%", textAlign: "left" }}>{titleDA}</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil || ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Genel</th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Grup</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Genel</th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Grup</th>
                </tr>
              </thead>
              <tbody>
                {renderDArows(
                  kalemDataDA,
                  hesapDataDA,
                  kalemDataDA[0]?.kalemId ?? null
                )}
              </tbody>
            </table>
          </div>
          <div className="seperator48"></div>
        </div>
      )}
      {kalemDataDA2.length > 0 && (
        <div className="page">
          <div className="text-center" style={{ marginBottom: 8 }}>
            <h3>DİKEY ANALİZ – KAR/ZARAR</h3>
          </div>
          <div className="table-container">
            <table className="table-plain">
              <thead className="sticky">
                <tr>
                  <th style={{ width: "40%", textAlign: "left" }}>
                    {titleDA2}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil || ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Genel</th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Grup</th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : ""}
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Genel</th>
                  <th style={{ width: "10%", textAlign: "center" }}>% Grup</th>
                </tr>
              </thead>
              <tbody>
                {renderDArows(
                  kalemDataDA2,
                  hesapDataDA2,
                  kalemDataDA2[0]?.kalemId ?? null
                )}
              </tbody>
            </table>
          </div>
          <div className="seperator48"></div>
        </div>
      )}
    </div>
  );
};

export default Rapor;
