exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "text/plain; charset=utf-8"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const text = body.text || "";

    const prompt = `أنت خبير في تحليل المشاعر ونبرة الكلام باللغة العربية. حلّل النص التالي وأعطِ:\n\n**١) المشاعر والنبرة:**\n- النبرة العامة\n- المشاعر الظاهرة\n\n**٢) تنبيه الأمان:**\n- هل يوجد خطر أو تهديد أو طلب مساعدة؟\n\nالنص: "${text}"`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512 }
        })
      }
    );

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "تعذّر التحليل.";

    return { statusCode: 200, headers, body: result };
  } catch (err) {
    return { statusCode: 200, headers, body: "تعذّر التحليل." };
  }
};
