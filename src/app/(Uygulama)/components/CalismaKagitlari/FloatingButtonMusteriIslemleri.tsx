import React, { useEffect, useState } from "react";
import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import { enhanceText } from "@/utils/gemini";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface FloatingButtonProps {
  control?: boolean;
  text?: string;
  isHovered?: boolean;
  setIsHovered: (b: boolean) => void;
  handleClick: () => void;
  onJson?: (data: any) => void;
  onClear?: () => void;        // <— eklendi
}


const messages = {
  welcome: "Firma bilgilerini doldurmanıza yardımcı olabilirim",
  empty: "Web adresi girin, sonra size yardımcı olabilirim",
  working: "Bilgiler üzerinde çalışıyorum...",
  done: "İşte Firma bilgileri!",
};
// Boş olmayan string kontrolü
const nonEmpty = (v: any) => typeof v === "string" && v.trim().length > 0;

// JSON’da doldurulabilir alan var mı? (temel alanları say)
const countFoundFields = (p: any) => {
  if (!p || typeof p !== "object") return 0;
  const i = p?.iletisim ?? {};
  const s = p?.sosyalMedya ?? {};
  const list = [
    p.sirketAdi,
    p.slogan,
    p.hakkindaOzet,
    String(p.kurulusYili ?? "").trim(),
    i.adres,
    i.telefon,
    i.eposta,
    i.haritaLinki,
    s.linkedin,
    s.twitter_x,
    s.facebook,
    s.instagram,
    ...(Array.isArray(p.anahtarHizmetler) ? p.anahtarHizmetler : []),
    p.analizEdilenUrl,
  ];
  return list.filter(nonEmpty).length;
};

// Kullanıcıya gösterilecek mesajı üret
const buildUserMessage = (foundCount: number) => {
  if (foundCount > 0) {
    return "Şirket ile ilgili bulabildiğim bilgileri forma doldurdum. Kalan alanları siz doldurabilirsiniz.";
  }
  return "Üzgünüm, bu web sayfasında doldurabileceğim net şirket bilgisi bulamadım. Bilgileri sizin girmeniz gerekiyor.";
};

export const FloatingButtonMusteriIslemleri: React.FC<FloatingButtonProps> = ({
  control,
  text,
  isHovered,
  setIsHovered,
  handleClick,
  onJson,
  onClear,  
}) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  const [message, setMessage] = useState(messages.welcome);
  const [loaded, setLoaded] = useState(false);
  const [aiText, setAiText] = useState("");
  const [control2, setControl2] = useState(false);

  const normalizeUrl = (val?: string) => {
    if (!val) return "";
    return val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
  };

  const isValidUrl = (val?: string) => {
    if (!val) return false;
    try {
      const u = new URL(normalizeUrl(val));
      return !!u.hostname && u.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const buildJsonPrompt = (url: string) => `GÖREV
Sağlanan URL'deki web sitesine erişim sağla. Sitenin içeriğini oku ve analiz et. Bu içerikten halka açık şirket bilgilerini çıkararak belirtilen JSON formatında sun.
ROL
Sen, web sitelerine erişim sağlayabilen, içeriklerini analiz edip halka açık bilgileri yapılandırılmış JSON formatına dönüştüren uzman bir veri çıkarım asistanısın.
İŞ AKIŞI
URL'ye Eriş: Aşağıda # HEDEF URL bölümünde verilen adrese web erişim aracını kullanarak git.
İçeriği Oku: Sayfanın metin içeriğini al.
Bilgileri Çıkar: Okuduğun içerikten, istenen JSON şemasındaki alanlara karşılık gelen bilgileri bul.
JSON Oluştur: Çıkardığın bilgileri kullanarak, kurallara uygun şekilde JSON çıktısını oluştur.
KURALLAR
Sadece Erişilen İçeriği Kullan: Dışarıdan veya kendi bilginden veri ekleme. Tüm bilgiler erişilen URL'nin içeriğinden alınmalıdır.
Bilgi Bulunamazsa null Kullan: Eğer istenen bir bilgi metinde mevcut değilse, o alanın değeri olarak null ata.
Kesin JSON Çıktısı: Cevabın SADECE ve SADECE geçerli bir JSON objesi olmalıdır. Öncesinde veya sonrasında herhangi bir açıklama, yorum veya metin ekleme.
Şemaya Tam Uyum: Aşağıda belirtilen JSON şemasının anahtar (key) isimlerini ve yapısını birebir koru.
Erişim Hatası Durumu: Eğer sağlanan URL'ye erişilemedi veya içerik okunamadıysa, şu JSON'u döndür:
{
"hata": "URL'ye erişilemedi veya içerik alınamadı.",
"url": "[Sağlanan URL]"
}
İSTENEN JSON ŞEMASI
{
"sirketAdi": "Şirketin tam yasal veya ticari adı.",
"slogan": "Şirketin web sitesinde geçen sloganı veya mottosu.",
"hakkindaOzet": "Şirket hakkında genel bir özet veya 'Hakkımızda' bölümünden kısa bir metin.",
"kurulusYili": "Şirketin kurulduğu yıl (Sadece sayı olarak, örn: 2005).",
"iletisim": {
"adres": "Şirketin tam ve açık adresi.",
"telefon": "Genel iletişim telefon numarası.",
"eposta": "Genel iletişim e-posta adresi.",
"haritaLinki": "Google Maps veya benzeri bir harita linki (varsa)."
},
"sosyalMedya": {
"linkedin": "LinkedIn sayfasının tam URL'si.",
"twitter_x": "Twitter (X) profilinin tam URL'si.",
"facebook": "Facebook sayfasının tam URL'si.",
"instagram": "Instagram profilinin tam URL'si."
},
"anahtarHizmetler": [
"Listelenen ana hizmet veya ürün 1",
"Listelenen ana hizmet veya ürün 2"
],
"analizEdilenUrl": "Bilginin çıkarıldığı web sitesinin tam URL'si."
}
# HEDEF URL
${url}`;

const handleJsonClick = async () => {
  // 1) önce formu temizle
  if (typeof onClear === "function") {
    onClear();
    await Promise.resolve();   // state flush (opsiyonel ama faydalı)
  }

  const url = normalizeUrl(text);
  if (!isValidUrl(url)) {
    setControl2(false);
    setMessage(messages.empty);
    setAiText("");
    return;
  }

  try {
    setControl2(true);
    setMessage(messages.working);
    setAiText("");

    const raw = await enhanceText("", buildJsonPrompt(url));
    const out = (raw || "").trim();
    setAiText(out);

    // JSON parse
    let parsed: any;
    try {
      parsed = JSON.parse(out);
    } catch {
      const picked = extractFirstJsonObject(out);
      if (!picked) throw new Error("JSON bulunamadı");
      parsed = JSON.parse(picked);
    }


    setMessage(messages.done);
     onJson?.(parsed);
      const filledCount = countFoundFields(parsed);
      setMessage(messages.done);
      setAiText(buildUserMessage(filledCount));
  } catch (err) {
    console.error("Gemini fetch/parse error:", err);
    setControl2(false);
    setMessage("Çıktı JSON formatında değil, metin gösterildi.");
  }
};

const stripCodeFences = (t: string) =>
  t.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

// Basit ama sağlam çıkarıcı: ilk '{' ile SON eşleşen '}' arası
const extractFirstJsonObject = (t: string): string | null => {
  const s = stripCodeFences(t);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1).trim();
};
  useEffect(() => {
    if (!control2) {
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [control2, text]);

  useEffect(() => {
    if ((text?.length || 0) < 3) {
      setControl2(false);
      setAiText("");
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
    if (!control2) {
      setMessage((text?.length || 0) > 3 ? messages.welcome : messages.empty);
    }
  }, [text, control2]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        right: 24,
        zIndex: 1000,
        cursor: "pointer",
        pointerEvents: control ? "visible" : "all",
        opacity: loaded ? 1 : 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={control ? () => {} : () => handleClick()}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "float 2s linear infinite",
          "@keyframes float": { "50%": { transform: "translateY(-2px)" } },
          width: 72,
        }}
      >
        <Typography
          align="center"
          variant="h6"
          color={
            customizer.activeMode == "dark"
              ? theme.palette.common.white
              : theme.palette.common.black
          }
          marginBottom={0.5}
        >
          Fas AI
        </Typography>
      </Box>

      <Box
        sx={{
          position: "fixed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          backgroundColor: "white",
          borderRadius: "100%",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://widget.galichat.com/chat/6691wb9cakfml2mjro2x19"
          scrolling="no"
          style={{ pointerEvents: "none", border: 0, width: 63, height: 63, transition: "all 0.3s ease-in-out" }}
          onLoad={() => {
            const timer = setTimeout(() => setLoaded(true), 1000);
            return () => clearTimeout(timer);
          }}
        />
      </Box>

      <Paper
        elevation={4}
        sx={{
          display: "flex",
          alignItems: "start",
          justifyContent: isHovered ? "start" : "center",
          flexDirection: "column",
          width: isHovered ? 412 : 56,
          height: isHovered
            ? control && control2 && (text?.length || 0) > 3
              ? 424
              : 72
            : 72,
          borderRadius: "28px",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
          padding: isHovered ? "0 16px" : 0,
          ml: isHovered ? 0 : 1,
          zIndex: 1000,
        }}
      >
        {isHovered && (
          <>
            <Typography
              variant="body1"
              fontWeight="bold"
              noWrap
              height={26}
              marginY={3}
              marginLeft={7.2}
              onClick={handleJsonClick}
            >
              {control || (text?.length || 0) > 3 ? message : messages.welcome}
            </Typography>

            {control && control2 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1,
                  mb: 2,
                  width: "100%",
                }}
              >
                <Divider sx={{ width: "100%" }} />
                <CustomTextField
                  id="AiText"
                  multiline
                  rows={13}
                  variant="outlined"
                  fullWidth
                  value={aiText}
                  onChange={(e: any) => setAiText(e.target.value)}
                />
              </Box>
            ) : null}
          </>
        )}
      </Paper>
    </Box>
  );
};

