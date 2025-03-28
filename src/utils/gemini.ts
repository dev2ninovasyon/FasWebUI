// Direct API call to Gemini
export const enhanceText = async (text: string, instruction: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
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
