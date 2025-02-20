import "print-friendly";
import "print-friendly/index.css";
import "./print-friendly.css";
import "./rapor.css";
import React, { useEffect, useState } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import DOMPurify from "dompurify";
import {
  getHissedarlarByDenetlenenIdYil,
  getSubelerByDenetlenenId,
} from "@/api/Musteri/MusteriIslemleri";
import {
  getDipnot25,
  getDipnot34,
  getDipnotAnaHesaplar,
} from "@/api/DenetimRaporu/DenetimRaporu";
import {
  getVergiVarligi,
  getVergiYukumlulugu,
} from "@/api/Hesaplamalar/Hesaplamalar";

interface FormatDipnotHesaplar {
  dipnotNo: number;
  tabloNo: number;
  yil: number;
  formatNumber: (value: number) => string;
  sw1?: string;
  sw2?: string;
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

interface VeriGorus {
  id: number;
  baslik: string;
  text: string;
}

interface VeriDipnot {
  dipnotKodu: number;
  veriler: any[];
}

interface VeriSubeler {
  unvan: string;
  subeAdi: string;
  adres: string;
}

interface VeriHissedarlar {
  hissedarAdi: string;
  hisseTutari: number;
  paySayisi: number;
  hisseOrani: number;
}

interface VeriVergiVarlik {
  hesapAdi: string;
  geciciFarkVarlik: number;
  ertelenenVergiVarlik: number;
}

interface VeriVergiYukumluluk {
  hesapAdi: string;
  geciciFarkYukumluluk: number;
  ertelenenVergiYukumlulugu: number;
}

interface VeriDipnot25 {
  baslik: string;
  yil: number;
  adet: number;
  tutar: number;
}

interface VeriDipnot34 {
  baslik: string;
  cariDonem: string;
  oncekiDonem: string;
}

interface VeriDipnotHesaplar {
  dipnotNo: number;
  tabloNo: number;
  hesaplarBobi: any[];
}

interface RaporProps {
  kapakImage: string;
  firmaLogoImage: string;
  dikeyKonum: string;
  yatayKonum: string;
  fdt: VeriFT[];
  kzt: VeriFT[];
  nat: VeriFT[];
  dipnotVeriler: VeriDipnot[];
  gorusVeriler: VeriGorus[];
  detayHesaplar: boolean;
}

const Report: React.FC<RaporProps> = ({
  kapakImage,
  firmaLogoImage,
  dikeyKonum,
  yatayKonum,
  fdt,
  kzt,
  nat,
  dipnotVeriler,
  gorusVeriler,
  detayHesaplar,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const TransformDipnotHesaplar = (
    rows: VeriDipnotHesaplar[],
    { dipnotNo, tabloNo, yil, formatNumber, sw1, sw2 }: FormatDipnotHesaplar
  ) => {
    const result = Object.values(
      rows
        .filter(
          (veri) => veri.dipnotNo === dipnotNo && veri.tabloNo === tabloNo
        )
        .reduce((acc, curr) => {
          curr.hesaplarBobi.forEach((element) => {
            const key = element.detayHesapAdi;
            if (!acc[key]) {
              acc[key] = {
                detayHesapAdi: key,
                detayKodu: element.detayKodu,
                cariYil: 0,
                oncekiYil: 0,
              };
            }

            if (element.yil === yil) {
              acc[key].cariYil = element.kontrolBakiye;
            } else {
              acc[key].oncekiYil = element.kontrolBakiye;
            }
          });
          return acc;
        }, {} as Record<string, { detayKodu: string; detayHesapAdi: string; cariYil: string | number; oncekiYil: string | number }>)
    );

    let cariYilToplam = result.reduce((sum, item) => {
      if (sw1 && sw2) {
        if (item.detayKodu.startsWith(sw1) || item.detayKodu.startsWith(sw2)) {
          return sum + Number(item.cariYil);
        }
      } else {
        return sum + Number(item.cariYil);
      }
      return sum;
    }, 0);

    let oncekiYilToplam = result.reduce((sum, item) => {
      if (sw1 && sw2) {
        if (item.detayKodu.startsWith(sw1) || item.detayKodu.startsWith(sw2)) {
          return sum + Number(item.oncekiYil);
        }
      } else {
        return sum + Number(item.oncekiYil);
      }
      return sum;
    }, 0);

    result.push({
      detayHesapAdi: "Toplam",
      detayKodu: "",
      cariYil: cariYilToplam,
      oncekiYil: oncekiYilToplam,
    });

    result.forEach((item) => {
      if (
        typeof item.cariYil === "number" &&
        typeof item.oncekiYil === "number"
      ) {
        if (item.cariYil < 0) {
          item.cariYil = "(" + formatNumber(Math.abs(item.cariYil)) + ")";
        } else {
          item.cariYil = formatNumber(item.cariYil);
        }

        if (item.oncekiYil < 0) {
          item.oncekiYil = "(" + formatNumber(Math.abs(item.oncekiYil)) + ")";
        } else {
          item.oncekiYil = formatNumber(item.oncekiYil);
        }

        if (item.cariYil == "0,00") {
          item.cariYil = "-";
        }
        if (item.oncekiYil == "0,00") {
          item.oncekiYil = "-";
        }
      }
    });

    return result;
  };

  const [subelerRows, setSubelerRows] = useState<VeriSubeler[]>([]);
  const fetchDataSubeler = async () => {
    try {
      const subelerVerileri = await getSubelerByDenetlenenId(
        user.token || "",
        user.denetlenenId || 0
      );
      const newRows = subelerVerileri.map((subeler: any) => ({
        id: subeler.id,
        unvan: subeler.unvan,
        subeAdi: subeler.subeAdi,
        adres: subeler.adres,
      }));
      setSubelerRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [hissedarlarRows, setHissedarlarRows] = useState<VeriHissedarlar[]>([]);
  const fetchDataHissedarlar = async () => {
    try {
      const hissedarlarVerileri = await getHissedarlarByDenetlenenIdYil(
        user.token || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      const newRows = hissedarlarVerileri.map((hissedar: any) => ({
        id: hissedar.id,
        hissedarAdi: hissedar.hissedarAdi,
        hisseTutari: hissedar.hisseTutari,
        paySayisi: hissedar.paySayisi,
        hisseOrani: hissedar.hisseOrani,
      }));
      setHissedarlarRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [hissedarlarOncekiRows, setHissedarlarOncekiRows] = useState<
    VeriHissedarlar[]
  >([]);
  const fetchDataHissedarlarOnceki = async () => {
    try {
      const hissedarlarOncekiVerileri = await getHissedarlarByDenetlenenIdYil(
        user.token || "",
        user.denetlenenId || 0,
        user.yil ? user.yil - 1 : 0
      );
      const newRows = hissedarlarOncekiVerileri.map((hissedar: any) => ({
        id: hissedar.id,
        hissedarAdi: hissedar.hissedarAdi,
        hisseTutari: hissedar.hisseTutari,
        paySayisi: hissedar.paySayisi,
        hisseOrani: hissedar.hisseOrani,
      }));
      setHissedarlarOncekiRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const hissedarlarBirlesik = hissedarlarRows.map((cariHissedar) => {
    const oncekiHissedar = hissedarlarOncekiRows.find(
      (onceki) => onceki.hissedarAdi === cariHissedar.hissedarAdi
    );

    return {
      hissedarAdi: cariHissedar.hissedarAdi,
      cariHisseTutari: formatNumber(cariHissedar.hisseTutari),
      cariPaySayisi: cariHissedar.paySayisi,
      cariHisseOrani: formatNumber(cariHissedar.hisseOrani),
      oncekiHisseTutari: oncekiHissedar
        ? formatNumber(oncekiHissedar.hisseTutari)
        : "-",
      oncekiPaySayisi: oncekiHissedar?.paySayisi || "-",
      oncekiHisseOrani: oncekiHissedar
        ? formatNumber(oncekiHissedar.hisseOrani)
        : "-",
    };
  });

  const [vergiVarlikRows, setVergiVarlikRows] = useState<VeriVergiVarlik[]>([]);
  const fetchDataVergiVarlik = async () => {
    try {
      const vergiVarligiVerileri = await getVergiVarligi(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      const newRows = vergiVarligiVerileri.map((veri: any) => ({
        hesapAdi: veri.hesapAdi,
        geciciFarkVarlik: veri.geciciFarkVarlik,
        ertelenenVergiVarlik: veri.ertelenenVergiVarlik,
      }));
      setVergiVarlikRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [vergiVarlikOncekiRows, setVergiVarlikOncekiRows] = useState<
    VeriVergiVarlik[]
  >([]);
  const fetchDataVergiVarlikOnceki = async () => {
    try {
      const vergiVarligiVerileriOnceki = await getVergiVarligi(
        user.token || "",
        user.denetciId || 0,
        user.yil ? user.yil - 1 : 0,
        user.denetlenenId || 0
      );
      const newRows = vergiVarligiVerileriOnceki.map((veri: any) => ({
        hesapAdi: veri.hesapAdi,
        geciciFarkVarlik: veri.geciciFarkVarlik,
        ertelenenVergiVarlik: veri.ertelenenVergiVarlik,
      }));
      setVergiVarlikOncekiRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const vergiVarlikBirlesik = vergiVarlikRows.map((cariVergiVarlik) => {
    const oncekiVergiVarlik = vergiVarlikOncekiRows.find(
      (onceki) => onceki.hesapAdi === cariVergiVarlik.hesapAdi
    );

    return {
      hesapAdi: cariVergiVarlik.hesapAdi,
      cariGeciciFarkVarlik: formatNumber(cariVergiVarlik.geciciFarkVarlik),
      cariErtelenenVergiVarlik: formatNumber(
        cariVergiVarlik.ertelenenVergiVarlik
      ),
      oncekiGeciciFarkVarlik: oncekiVergiVarlik
        ? formatNumber(oncekiVergiVarlik.geciciFarkVarlik)
        : "-",
      oncekiErtelenenVergiVarlik: oncekiVergiVarlik
        ? formatNumber(oncekiVergiVarlik.ertelenenVergiVarlik)
        : "-",
    };
  });

  const [vergiYukumlulukRows, setVergiYukumlulukRows] = useState<
    VeriVergiYukumluluk[]
  >([]);
  const fetchDataVergiYukumluluk = async () => {
    try {
      const vergiYukumlulukVerileri = await getVergiYukumlulugu(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      const newRows = vergiYukumlulukVerileri.map((veri: any) => ({
        hesapAdi: veri.hesapAdi,
        geciciFarkYukumluluk: veri.geciciFarkYukumluluk,
        ertelenenVergiYukumlulugu: veri.ertelenenVergiYukumlulugu,
      }));
      setVergiYukumlulukRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [vergiYukumlulukOncekiRows, setVergiYukumlulukOncekiRows] = useState<
    VeriVergiYukumluluk[]
  >([]);
  const fetchDataVergiYukumlulukOnceki = async () => {
    try {
      const vergiYukumlulukVerileriOnceki = await getVergiYukumlulugu(
        user.token || "",
        user.denetciId || 0,
        user.yil ? user.yil - 1 : 0,
        user.denetlenenId || 0
      );
      const newRows = vergiYukumlulukVerileriOnceki.map((veri: any) => ({
        hesapAdi: veri.hesapAdi,
        geciciFarkYukumluluk: veri.geciciFarkYukumluluk,
        ertelenenVergiYukumlulugu: veri.ertelenenVergiYukumlulugu,
      }));
      setVergiYukumlulukOncekiRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const vergiYukumlulukBirlesik = vergiYukumlulukRows.map(
    (cariVergiYukumluluk) => {
      const oncekiVergiYukumluluk = vergiYukumlulukOncekiRows.find(
        (onceki) => onceki.hesapAdi === cariVergiYukumluluk.hesapAdi
      );

      return {
        hesapAdi: cariVergiYukumluluk.hesapAdi,
        cariGeciciFarkYukumluluk: formatNumber(
          cariVergiYukumluluk.geciciFarkYukumluluk
        ),
        cariErtelenenVergiYukumluluk: formatNumber(
          cariVergiYukumluluk.ertelenenVergiYukumlulugu
        ),
        oncekiGeciciFarkYukumluluk: oncekiVergiYukumluluk
          ? formatNumber(oncekiVergiYukumluluk.geciciFarkYukumluluk)
          : "-",
        oncekiErtelenenVergiYukumluluk: oncekiVergiYukumluluk
          ? formatNumber(oncekiVergiYukumluluk.ertelenenVergiYukumlulugu)
          : "-",
      };
    }
  );

  const [dipnot25Rows, setDipnot25Rows] = useState<VeriDipnot25[]>([]);
  const fetchDataDipnot25 = async () => {
    try {
      const dipnot25Verileri = await getDipnot25(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      const newRows = dipnot25Verileri.map((veri: any) => ({
        baslik: veri.baslik,
        yil: veri.yil,
        adet: veri.adet,
        tutar: veri.tutar,
      }));
      setDipnot25Rows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [dipnot34Rows, setDipnot34Rows] = useState<VeriDipnot34[]>([]);
  const fetchDataDipnot34 = async () => {
    try {
      const dipnot34Verileri = await getDipnot34(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );

      const newRows = dipnot34Verileri.map((veri: any) => ({
        baslik: veri.baslik,
        cariDonem: veri.cariDonem,
        oncekiDonem: veri.oncekiDonem,
      }));
      setDipnot34Rows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [dipnotHesaplarRows, setDipnotHesaplarRows] = useState<
    VeriDipnotHesaplar[]
  >([]);
  const fetchDataDipnotHesaplar = async () => {
    try {
      if (detayHesaplar) {
      } else {
        const dipnotVerileri = await getDipnotAnaHesaplar(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          user.denetimTuru || ""
        );

        const newRows = dipnotVerileri.map((veri: any) => ({
          dipnotNo: veri.dipnotNo,
          tabloNo: veri.tabloNo,
          hesaplarBobi: veri.hesaplarBobi,
        }));
        setDipnotHesaplarRows(newRows);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchDataSubeler();
    fetchDataHissedarlar();
    fetchDataHissedarlarOnceki();
    fetchDataVergiVarlik();
    fetchDataVergiVarlikOnceki();
    fetchDataVergiYukumluluk();
    fetchDataVergiYukumlulukOnceki();
    fetchDataDipnot25();
    fetchDataDipnot34();
    fetchDataDipnotHesaplar();
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
          <h2>
            HESAP DÖNEMİNE AİT FİNANSAL TABLOLAR VE BAĞIMSIZ DENETÇİ RAPORU
          </h2>
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
          <h2>Bağımsız Denetim Raporu</h2>
          <h2>{user.denetlenenFirmaAdi}</h2>
          <h2>Ortak Kurulu&apos;na</h2>
        </div>
      </div>
      {/* Görüş */}
      <div className="page">
        <div
          style={{ textAlign: "justify" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(gorusVeriler[0].text),
          }}
        ></div>
      </div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
      <div className="seperator48"></div>
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
                  <td className="text-right">{formatNumber(row.tutarYil1)}</td>
                  <td className="text-right">{formatNumber(row.tutarYil2)}</td>
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
                  <td className="text-right">{formatNumber(row.tutarYil1)}</td>
                  <td className="text-right">{formatNumber(row.tutarYil2)}</td>
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
                  <td className="text-right">{formatNumber(row.tutarYil1)}</td>
                  <td className="text-right">{formatNumber(row.tutarYil2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="seperator48"></div>
      </div>
      {/* Dipnotlar */}
      <div className="page">
        {/* Dipnot 1 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 1 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 1)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        <div
          style={{ textAlign: "justify" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              dipnotVeriler
                .find((veri: any) => veri.dipnotKodu == 1)
                ?.veriler.slice(1)[0].text
            ),
          }}
        ></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ünvan</th>
              <th>Şube Adı</th>
              <th>Adres</th>
            </tr>
          </thead>
          <tbody>
            {subelerRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row.unvan}</td>
                <td>{row.subeAdi}</td>
                <td>{row.adres}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{ textAlign: "justify" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              dipnotVeriler
                .find((veri: any) => veri.dipnotKodu == 1)
                ?.veriler.slice(1)[1].text
            ),
          }}
        ></div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Hissedar Adı</th>
              <th style={{ textAlign: "center" }}>Hisse Tutarı</th>
              <th style={{ textAlign: "center" }}>Hisse Sayısı</th>
              <th style={{ textAlign: "center" }}>Hisse Oranı</th>
            </tr>
          </thead>
          <tbody>
            {hissedarlarRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td>{row.hissedarAdi}</td>
                <td className="text-right">{formatNumber(row.hisseTutari)}</td>
                <td style={{ textAlign: "center" }}>{row.paySayisi}</td>
                <td className="text-right">{formatNumber(row.hisseOrani)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{ textAlign: "justify" }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              dipnotVeriler
                .find((veri: any) => veri.dipnotKodu == 1)
                ?.veriler.slice(1)[2].text
            ),
          }}
        ></div>
        <div className="seperator24"></div>
        {/* Dipnot 2 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 2 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 2)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 2)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        <div className="seperator24"></div>
        {/* Dipnot 3 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 3 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 3)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 3,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 3)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nakit ve Nakit Benzerleri</th>
                    <th style={{ textAlign: "center" }}>{user.yil}</th>
                    <th style={{ textAlign: "center" }}>
                      {user.yil ? user.yil - 1 : 0}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {TransformDipnotHesaplar(dipnotHesaplarRows, {
                    dipnotNo: 3,
                    tabloNo: 1,
                    yil: user.yil || 0,

                    formatNumber,
                  }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                    <tr key={index}>
                      <td>{detayHesapAdi}</td>
                      <td style={{ textAlign: "right" }}>{cariYil}</td>
                      <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="seperator24"></div>
            </>
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 4 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 4 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 4)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 4,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 4)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 4,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some((item) => item.detayKodu?.startsWith("1")) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Finansal Varlık Ve Yatırımlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 4,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "1",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 4,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some((item) => item.detayKodu?.startsWith("2")) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Finansal Varlık Ve Yatırımlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 4,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "2",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 5 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 5 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 5)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 5,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 5,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 5)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 5,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Ticari Alacaklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 5,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 5,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Ticari Alacaklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 5,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 5,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Ticari Borçlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 5,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 5,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Ticari Borçlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 5,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 6 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 6 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 6)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 6,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 6,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 6)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 6,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Diğer Alacaklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 6,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 6,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Diğer Alacaklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 6,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 6,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Diğer Borçlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 6,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 6,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Diğer Borçlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 6,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 7 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 7 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 7)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 7,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 7,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 7)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index == 0 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 7,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Stoklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 7,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 7,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>İlişkili Olmayan Taraflardan Stoklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 7,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 7)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index != 0 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            <div className="seperator24"></div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 8 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 8 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 8)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 8,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 8,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 8)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 8,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Canlı Varlıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 8,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 8,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>İlişkili Olmayan Taraflardan Stoklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 8,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 9 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 9 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 9)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 9,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 9,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 9)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 9,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Peşin Ödenmiş Giderler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 9,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 9,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Alınan Avanslar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 9,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 10 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 10 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 10)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 10,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 10,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 10)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 10,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Peşin Ödenmiş Vergi ve Benzerleri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 10,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 10,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Peşin Ödenen Vergiler Ve Fonlar(U.V)</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 10,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 11 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 11 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 11)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 11,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 11,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 11)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 11,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Canlı Varlıklar(Dönen)</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 11,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 11,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Canlı Varlıklar(Duran)</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 11,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 12 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 12 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 12)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 12,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 12,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 12)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 12,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli - Diğer Dönen Duran Varlıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 12,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 12,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli - Diğer Dönen Duran Varlıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 12,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 12,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli -</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 12,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 12,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli -</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 12,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 13 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 13 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 13)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 13,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 13,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 13)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 13,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Satış Amacıyla Elde Tutulan Varlıklar Girişi</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 13,
                      tabloNo: 1,
                      yil: user.yil || 0,

                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 13,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Satış Amacıyla Elde Tutulan Varlıklar Çıkışı</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 13,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 14 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 14 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 14)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 14,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 14,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 14)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 14,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Yatırım Amaçlı Gayrimenkuller</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 14,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 14,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 14,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 15 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 15 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 15)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 15)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 16 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 16 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 16)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 16)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 17 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 17 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 17)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 17,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 17,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 17)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 17,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Özkaynak Yöntemiyle Değerlenen Yatırımlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 17,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 17,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 17,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 18 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 18 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 18)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 18)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {vergiVarlikBirlesik.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vergi Varlık</th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil}
                  </th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : 0}
                  </th>
                </tr>
                <tr>
                  <th>Geçici Farkın Nedeni</th>
                  <th style={{ textAlign: "center" }}>Geçici Fark Varlık</th>
                  <th style={{ textAlign: "center" }}>
                    Ertelenen Vergi Varlığı
                  </th>
                  <th style={{ textAlign: "center" }}>Geçici Fark Varlık</th>
                  <th style={{ textAlign: "center" }}>
                    Ertelenen Vergi Varlığı
                  </th>
                </tr>
              </thead>
              <tbody>
                {vergiVarlikBirlesik.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.hesapAdi}</td>
                    <td className="text-right">{row.cariGeciciFarkVarlik}</td>
                    <td className="text-right">
                      {row.cariErtelenenVergiVarlik}
                    </td>
                    <td className="text-right">{row.oncekiGeciciFarkVarlik}</td>
                    <td className="text-right">
                      {row.oncekiErtelenenVergiVarlik}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="seperator24"></div>
          </>
        )}
        {vergiYukumlulukBirlesik.length > 0 && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vergi Yüküklülük</th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil}
                  </th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : 0}
                  </th>
                </tr>
                <tr>
                  <th>Geçici Farkın Nedeni</th>
                  <th style={{ textAlign: "center" }}>
                    Geçici Fark Yükümlülük
                  </th>
                  <th style={{ textAlign: "center" }}>
                    Ertelenen Vergi Yükümlülüğü
                  </th>
                  <th style={{ textAlign: "center" }}>
                    Geçici Fark Yükümlülük
                  </th>
                  <th style={{ textAlign: "center" }}>
                    Ertelenen Vergi Yükümlülüğü
                  </th>
                </tr>
              </thead>
              <tbody>
                {vergiYukumlulukBirlesik.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.hesapAdi}</td>
                    <td className="text-right">
                      {row.cariGeciciFarkYukumluluk}
                    </td>
                    <td className="text-right">
                      {row.cariErtelenenVergiYukumluluk}
                    </td>
                    <td className="text-right">
                      {row.oncekiGeciciFarkYukumluluk}
                    </td>
                    <td className="text-right">
                      {row.oncekiErtelenenVergiYukumluluk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 19 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 19 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 19)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 19,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 19,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 19)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 19,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Finansal Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 19,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 19,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Finansal Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 19,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 19,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Finansal Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 19,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 19,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Finansal Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 19,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 20 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 20 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 20)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 20,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 20,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 20)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 20,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Devam Eden İnşa Sözleşmelerinden Borçlar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 20,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 20,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 20,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 21 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 21 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 21)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 21,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 21,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 21)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 21,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Alınan Avanslar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 21,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 21,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Alınan Avanslar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 21,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 21,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Alınan Avanslar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 21,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 21,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Alınan Avanslar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 21,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 22 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 22 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 22)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 22,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 22,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 22)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 22,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Kısa Vadeli Çalışanlara Sağlanan Faydalar Kapsamında
                        Borçlar
                      </th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 22,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 22,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Uzun Vadeli Çalışanlara Sağlanan Faydalar Kapsamında
                        Borçlar
                      </th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 22,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 22,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 22,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 22,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 22,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 23 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 23 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 23)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 23,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 23,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 23)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index == 0 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 23,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Karşılıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 23,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 23,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Karşılıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 23,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 23,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kısa Vadeli Karşılıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 23,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 23,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Uzun Vadeli Karşılıklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 23,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 23)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index != 0 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 24 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 24 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 24)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 24,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 24,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 24)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 24,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Çalışanlara Sağlanan Faydalara İlişkin Karşılıklar
                      </th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 24,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 24,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 24,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 25 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 25 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 25)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnot25Rows.length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 25)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            <table className="data-table">
              <thead>
                <tr>
                  <th></th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil}
                  </th>
                  <th colSpan={2} style={{ textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : 0}
                  </th>
                </tr>
                <tr>
                  <th>Hukuksal Durum</th>
                  <th style={{ textAlign: "center" }}>Adet</th>
                  <th style={{ textAlign: "center" }}>Tutar</th>
                  <th style={{ textAlign: "center" }}>Adet</th>
                  <th style={{ textAlign: "center" }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Şirket tarafından açılan ve halen devam eden davalar</td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından açılan ve halen devam eden davalar" &&
                          x.yil == user.yil
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından açılan ve halen devam eden davalar" &&
                          x.yil == user.yil
                      )[0].tutar
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından açılan ve halen devam eden davalar" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından açılan ve halen devam eden davalar" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].tutar
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Şirket tarafından yürütülen icra takipleri</td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından yürütülen icra takipleri" &&
                          x.yil == user.yil
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından yürütülen icra takipleri" &&
                          x.yil == user.yil
                      )[0].tutar
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından yürütülen icra takipleri" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket tarafından yürütülen icra takipleri" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].tutar
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Şirket aleyhine açılan ve halen devam eden davalar</td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine açılan ve halen devam eden davalar" &&
                          x.yil == user.yil
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine açılan ve halen devam eden davalar" &&
                          x.yil == user.yil
                      )[0].tutar
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine açılan ve halen devam eden davalar" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine açılan ve halen devam eden davalar" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].tutar
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Şirket aleyhine yürütülen icra takipleri</td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine yürütülen icra takipleri" &&
                          x.yil == user.yil
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine yürütülen icra takipleri" &&
                          x.yil == user.yil
                      )[0].tutar
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine yürütülen icra takipleri" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].adet
                    }
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {formatNumber(
                      dipnot25Rows.filter(
                        (x) =>
                          x.baslik ==
                            "Şirket aleyhine yürütülen icra takipleri" &&
                          x.yil == (user.yil ?? 1) - 1
                      )[0].tutar
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="seperator24"></div>
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 26 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 26 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 26)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 26,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 26,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 26)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 26,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diğer Kısa Vadeli Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 26,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 26,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diğer Uzun Vadeli Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 26,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 26,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("1") ||
                item.detayKodu?.startsWith("3")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diğer Kısa Vadeli Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 26,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "1",
                      sw2: "3",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("1") ||
                          detayKodu.startsWith("3") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 26,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).some(
              (item) =>
                item.detayKodu?.startsWith("2") ||
                item.detayKodu?.startsWith("4")
            ) && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Diğer Uzun Vadeli Yükümlülükler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 26,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                      sw1: "2",
                      sw2: "4",
                    }).map(
                      (
                        { detayKodu, detayHesapAdi, cariYil, oncekiYil },
                        index
                      ) =>
                        (detayKodu.startsWith("2") ||
                          detayKodu.startsWith("4") ||
                          detayHesapAdi == "Toplam") && (
                          <tr key={index}>
                            <td>{detayHesapAdi}</td>
                            <td style={{ textAlign: "right" }}>{cariYil}</td>
                            <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 27 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 27 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 27)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 27,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 27,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 27)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index == 0 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 27,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Sermaye</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 27,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 27)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index == 2 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 27)
              ?.veriler.slice(1)
              .map(
                (element, index) =>
                  index == 1 && (
                    <div
                      key={index}
                      style={{ textAlign: "justify" }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(element.text),
                      }}
                    ></div>
                  )
              )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ödenmiş Sermaye</th>
                  <th colSpan={3} style={{ textAlign: "center" }}>
                    {user.yil}
                  </th>
                  <th colSpan={3} style={{ textAlign: "center" }}>
                    {user.yil ? user.yil - 1 : 0}
                  </th>
                </tr>
                <tr>
                  <th>Hissedar Adı</th>
                  <th style={{ textAlign: "center" }}>Hisse Tutarı</th>
                  <th style={{ textAlign: "center" }}>Hisse Sayısı</th>
                  <th style={{ textAlign: "center" }}>Hisse Oranı</th>
                  <th style={{ textAlign: "center" }}>Hisse Tutarı</th>
                  <th style={{ textAlign: "center" }}>Hisse Sayısı</th>
                  <th style={{ textAlign: "center" }}>Hisse Oranı</th>
                </tr>
              </thead>
              <tbody>
                {hissedarlarBirlesik.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.hissedarAdi}</td>
                    <td className="text-right">{row.cariHisseTutari}</td>
                    <td style={{ textAlign: "center" }}>{row.cariPaySayisi}</td>
                    <td className="text-right">{row.cariHisseOrani}</td>
                    <td className="text-right">{row.oncekiHisseTutari}</td>
                    <td style={{ textAlign: "center" }}>
                      {row.oncekiPaySayisi}
                    </td>
                    <td className="text-right">{row.oncekiHisseOrani}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="seperator24"></div>
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 27,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Yedekler ve Diğer Özkaynaklar</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 27,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 28 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 28 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 28)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 28,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 28,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 28)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 28,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Hasılat</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 28,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 28,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Satışların Maliyeti(-)</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 28,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 29 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 29 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 29)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 29,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 29)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 29,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Faaliyet Giderleri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 29,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 30 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 30 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 30)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 30,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 30,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 30)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 30,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Esas Faaliyetlerden Diğer Gelirler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 30,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 30,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Esas Faaliyetlerden Diğer Giderler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 30,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 31 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 31 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 31)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 31,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 31,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 31)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 31,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Yatırım Faaliyetlerinden Gelirler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 31,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 31,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Yatırım Faaliyetlerinden Giderler</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 31,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 32 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 32 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 32)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 32,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 32,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 32)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 32,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Finansman Gelirleri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 32,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 32,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Finansman Giderleri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 32,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 33 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 33 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 33)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 33,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ||
        TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 33,
          tabloNo: 2,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 33)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 33,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vergi Geliri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 33,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 33,
              tabloNo: 2,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Vergi Gideri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 33,
                      tabloNo: 2,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 34 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 34 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 34)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnot34Rows.length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 34)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pay Başına Kazanç</th>
                  <th style={{ textAlign: "center" }}>Cari Dönem</th>
                  <th style={{ textAlign: "center" }}>Önceki Dönem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dönem Düzeltilmiş Net Kar/Zararı</td>
                  <td
                    style={{
                      textAlign:
                        dipnot34Rows.filter(
                          (x) => x.baslik == "Dönem Düzeltilmiş Net Kar/Zararı"
                        )[0].cariDonem == "-"
                          ? "center"
                          : "right",
                    }}
                  >
                    {
                      dipnot34Rows.filter(
                        (x) => x.baslik == "Dönem Düzeltilmiş Net Kar/Zararı"
                      )[0].cariDonem
                    }
                  </td>
                  <td
                    style={{
                      textAlign:
                        dipnot34Rows.filter(
                          (x) => x.baslik == "Dönem Düzeltilmiş Net Kar/Zararı"
                        )[0].oncekiDonem == "-"
                          ? "center"
                          : "right",
                    }}
                  >
                    {
                      dipnot34Rows.filter(
                        (x) => x.baslik == "Dönem Düzeltilmiş Net Kar/Zararı"
                      )[0].oncekiDonem
                    }
                  </td>
                </tr>
                <tr>
                  <td>Hisse Sayısı</td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot34Rows.filter((x) => x.baslik == "Hisse Sayısı")[0]
                        .cariDonem
                    }
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {
                      dipnot34Rows.filter((x) => x.baslik == "Hisse Sayısı")[0]
                        .oncekiDonem
                    }
                  </td>
                </tr>
                <tr>
                  <td>Pay Başına Kazanç</td>
                  <td
                    style={{
                      textAlign:
                        dipnot34Rows.filter(
                          (x) => x.baslik == "Pay Başına Kazanç"
                        )[0].cariDonem == "-"
                          ? "center"
                          : "right",
                    }}
                  >
                    {
                      dipnot34Rows.filter(
                        (x) => x.baslik == "Pay Başına Kazanç"
                      )[0].cariDonem
                    }
                  </td>
                  <td
                    style={{
                      textAlign:
                        dipnot34Rows.filter(
                          (x) => x.baslik == "Pay Başına Kazanç"
                        )[0].oncekiDonem == "-"
                          ? "center"
                          : "right",
                    }}
                  >
                    {
                      dipnot34Rows.filter(
                        (x) => x.baslik == "Pay Başına Kazanç"
                      )[0].oncekiDonem
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <div style={{ textAlign: "justify" }}>Yoktur.</div>
        )}
        {/* Dipnot 35 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 35 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 35)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 35,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 35)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 35,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Kâr veya Zarar Olarak Yeniden Sınıflandırılmayacak Gelir
                        / Giderler
                      </th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 35,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 36 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 36 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 36)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 36,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 36)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 36,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 36,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 37 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 37 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 37)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {TransformDipnotHesaplar(dipnotHesaplarRows, {
          dipnotNo: 37,
          tabloNo: 1,
          yil: user.yil || 0,
          formatNumber,
        }).length > 1 ? (
          <>
            {dipnotVeriler
              .find((veri: any) => veri.dipnotKodu == 37)
              ?.veriler.slice(1)
              .map((element, index) => (
                <div
                  key={index}
                  style={{ textAlign: "justify" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(element.text),
                  }}
                ></div>
              ))}
            {TransformDipnotHesaplar(dipnotHesaplarRows, {
              dipnotNo: 37,
              tabloNo: 1,
              yil: user.yil || 0,
              formatNumber,
            }).length > 1 && (
              <>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>İlişkili Taraf Varlık / Yükümlülükleri</th>
                      <th style={{ textAlign: "center" }}>{user.yil}</th>
                      <th style={{ textAlign: "center" }}>
                        {user.yil ? user.yil - 1 : 0}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TransformDipnotHesaplar(dipnotHesaplarRows, {
                      dipnotNo: 37,
                      tabloNo: 1,
                      yil: user.yil || 0,
                      formatNumber,
                    }).map(({ detayHesapAdi, cariYil, oncekiYil }, index) => (
                      <tr key={index}>
                        <td>{detayHesapAdi}</td>
                        <td style={{ textAlign: "right" }}>{cariYil}</td>
                        <td style={{ textAlign: "right" }}>{oncekiYil}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="seperator24"></div>
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: "justify" }}>Yoktur.</div>
            <div className="seperator24"></div>
          </>
        )}
        {/* Dipnot 38 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 38)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 38)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 38.1 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38.1 - 1- KREDİ RİSKİ
                
            `),
            }}
          ></h3>
        </div>
        {/* Dipnot 38.2 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38.2 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 38.1)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 38.1)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 38.3 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38.3 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 38.2)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 38.2)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 38.4 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38.4 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 38.3)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 38.3)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 38.5 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 38.5 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 38.4)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 38.4)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 39 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 39 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 39)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 39)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
        {/* Dipnot 40 */}
        <div className="text-center">
          <h3
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(`DİPNOT 40 -
                ${dipnotVeriler
                  .find((veri: any) => veri.dipnotKodu == 40)
                  ?.veriler[0].text.toLocaleUpperCase("tr-TR")}
            `),
            }}
          ></h3>
        </div>
        {dipnotVeriler
          .find((veri: any) => veri.dipnotKodu == 40)
          ?.veriler.slice(1)
          .map((element, index) => (
            <div
              key={index}
              style={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(element.text),
              }}
            ></div>
          ))}
      </div>
    </div>
  );
};

export default Report;
