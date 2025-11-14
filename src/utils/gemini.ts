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
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY2!;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
console.log("veri"+instruction)

  const body = {
    contents: [{ parts: [{ text: instruction }] }],
    // URL Context aracı açık (URL içermezseniz devreye girmez)
    tools: [{ url_context: {} }], // REST'te snake_case
    generationConfig: {
      temperature: 0.15,
      thinkingConfig: { thinkingBudget: 0 }, // 2.5 Flash'ta 0 ile düşünme kapatılır
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API 400: ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? text;
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
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
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



