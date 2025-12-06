// Direct API call to Gemini
export const enhanceText = async (text: string, instruction: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `${instruction}\n\nMetin: ${text}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return text || "Lütfen önce bir tespit metni girin.";
  }
};
// utils/gemini.ts
// utils/gemini.ts
export const enhanceTextSettingWith = async (text: string, instruction: string) => {
  // API Key'in sunucu tarafında güvenli bir şekilde yönetildiğini varsayıyoruz.
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2!;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Hem orijinal metni hem de talimatı birleştirerek tek bir prompt oluşturma.
  const fullPrompt = `Aşağıdaki metni verilen talimatlara göre iyileştir, yeniden yaz veya düzenle. Sadece iyileştirilmiş metni döndür:\n\nMETİN:\n---${text}---\n\nTALİMAT:\n---${instruction}---`;

  const body = {
    // Modelin işleyeceği içerik.
    contents: [{
      parts: [{ text: fullPrompt }]
    }],
    // Metin iyileştirme için genellikle bir araç (tools) gerekli değildir.
    // Eğer bir URL'nin içeriğini okumasını isteseydiniz, 'url_context' kullanılırdı.
    // Bu görev için 'tools' alanını kaldırarak veya boş bırakarak sadeleştiriyoruz.
    tools: [{ url_context: {} }], // İyileştirme görevi için kaldırıldı.

    generationConfig: {
      temperature: 0.2, // Düşük sıcaklık, daha tutarlı ve talimatlara uygun yanıtlar sağlar.
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      // API'den gelen 4xx/5xx hatalarını daha ayrıntılı bir şekilde fırlatma.
      throw new Error(`Gemini API Error (${res.status}): ${err}`);
    }

    const data = await res.json();

    // Başarılı bir yanıt döndüğünde, iyileştirilmiş metni döndürme.
    const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Eğer modelden beklenen metin gelmezse, orijinal metni döndürme (fallback).
    return enhancedText ?? text;

  } catch (error) {
    // Ağ hataları veya diğer beklenmedik hatalar.
    console.error("enhanceTextSettingWith hatası:", error);
    // Hata durumunda orijinal metni döndürme.
    throw new Error(`Metin iyileştirme sırasında bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen Hata"}`);
  }
};
export const enhanceTextMsuteriEkle = async (text: string, instruction: string) => {
  // NOT: 'text' değişkeni artık bir URL olsa bile, modele düz metin olarak gönderilecektir.

  // 1. API Anahtarı kontrolü
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2;
  if (!apiKey) {
    console.error("Gemini API Key bulunamadı.");
    return text || "API Anahtarı eksik.";
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 2. Prompt'u birleştirme (Talimat ve URL/Metin bir arada)
    const fullPrompt = `Aşağıdaki web sitesi URL'sini veya metni analiz et ve verilen talimatlara göre istenen bilgiyi çıkar. Sadece çıkarılan bilgiyi döndür. Bilgi bulunamazsa 'Bilgi bulunamadı.' döndür.\n\nMETİN/URL:\n---${text}---\n\nTALİMAT:\n---${instruction}---`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],

        generationConfig: {
          // 3. ÇOK ÖNEMLİ DÜZELTME: Uydurma riskini azaltmak için düşük sıcaklık.
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log(data);

    // Fallback ile orijinal metni döndürme
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;

  } catch (error) {
    console.error("Gemini API error:", error);
    return text || "Lütfen önce bir tespit metni girin.";
  }
};
export const extractCompanyInfoFromUrl = async (url: string, instruction: string) => {
  // Parametre adını 'text' yerine 'url' olarak değiştirdim,
  // çünkü amacınız bir URL'den veri çekmek.

  // 1. API Anahtarı kontrolü
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2;
  if (!apiKey) {
    console.error("Gemini API Key bulunamadı.");
    return "API Anahtarı eksik.";
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 2. Veri Çıkarma Talimatı (Prompt)
    // Modelden sadece istenen bilgiyi döndürmesini isteyen net bir talimat.
    const extractionPrompt = instruction || `Bu web sitesi içeriğini oku ve şirketin tam ve açık adresini bul. SADECE adresi döndür. Adres bulunamazsa, SADECE 'Adres bulunamadı.' metnini döndür.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              // EN ÖNEMLİ DÜZELTME: URL'yi 'fileData' yapısı ile modele bağlam olarak gönderme
              {
                fileData: {
                  mimeType: 'text/html', // Web siteleri için uygun MIME tipi
                  fileUri: url,         // URL'nin kendisi
                },
              },
              // Modelin URL içeriği üzerinde uygulayacağı talimat.
              { text: extractionPrompt },
            ],
          },
        ],
        // 'tools' alanı artık gerekli değil.

        generationConfig: {
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // Hata mesajını API'den gelen detaylarla birlikte fırlatma
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log(data);

    // Fallback ile orijinal URL'yi döndürmek yerine hata mesajı döndürme
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "İçerik işlenemedi veya bilgi bulunamadı.";

  } catch (error) {
    console.error("Gemini API error:", error);
    return `URL işleme sırasında bir hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen Hata"}`;
  }
};
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

type GeminiOpts = {
  taskText: string;
  url?: string;
  model?: string;
};

export async function runTaskWithGemini(taskText: string, url?: string): Promise<string> {
  return runTaskWithGeminiSafe({ taskText, url });
}
import type { GenerateContentResponse } from "@google/genai";

async function runTaskWithGeminiSafe({
  taskText,
  url,
  model = "gemini-2.5-flash",
}: GeminiOpts): Promise<string> {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY2) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY2 });

  // URL’i sadece bir kez ekle (taskText içinde zaten HEDEF URL varsa tekrar ekleme)
  const alreadyHasTarget = /#\s*HEDEF\s*URL/i.test(taskText);
  const prompt =
    url && !alreadyHasTarget
      ? `${taskText.trim()}\n\n# HEDEF URL\n${url.trim()}`
      : taskText.trim();

  // SDK’de önerilen yerleşim: tools + generationConfig en üstte
  const tools = [{ urlContext: {} }];

  const generationConfig = {
    temperature: 0.2,
    topK: 40,
    topP: 0.95,
    candidateCount: 1,
    stopSequences: [] as string[],
  };


  // Safety çok agresifse bazen boş döner; eğer erişiminiz varsa eşiği yumuşatın:
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];

  const contents = [{ role: "user" as const, parts: [{ text: prompt }] }];

  // Küçük bir retry: boş/safety/unknown finishReason durumlarında 1 kez daha dene
  const attempt = async (): Promise<string> => {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        // generationConfig yerine "config" kullanın
        temperature: 0.35,
        tools: [{ urlContext: {} }],  // <— URL Context aracı
      },
      // 🔽 top-level üretim ayarları
    });
    let out = "";
    let lastChunk: GenerateContentResponse | undefined;

    for await (const chunk of stream) {
      lastChunk = chunk;
      // Bazı SDK sürümlerinde chunk.text yoktur → guard’lı topla
      const t = (chunk as any)?.text;
      if (typeof t === "string" && t.length) out += t;
    }

    // Stream’den hiç .text gelmediyse SON yanıtı candidates/parts’dan derle
    if (!out.trim() && lastChunk?.candidates?.length) {
      let finalText = "";
      for (const c of lastChunk.candidates) {
        const parts = c?.content?.parts ?? [];
        for (const p of parts) {
          if (typeof (p as any)?.text === "string") finalText += (p as any).text;
        }
      }
      out = finalText.trim();
    }

    if (!out) throw new Error("Model görünür metin üretmedi.");
    return out;
  };

  // 1. deneme
  try {
    return await attempt();
  } catch (e) {
    // kısa bekle ve 2. deneme (jitter)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
    return await attempt();
  }
}
