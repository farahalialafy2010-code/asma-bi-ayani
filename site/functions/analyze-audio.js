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
    const audio = body.audio || "";
    const mimeType = body.mimeType || "audio/webm";

    const prompt = `أنت خبير في تحليل الأصوات المحيطة. استمع للصوت المرفق وحدّد نوعه بدقة. صنّف الصوت ضمن الفئات التالية (أو ما يشبهها):\n\n- أصوات دينية (أذان، قرآن)\n- أصوات بشرية (كلام، بكاء طفل/رضيع، بكاء شخص بالغ، ضحك، صراخ)\n- موسيقى\n- أصوات خطر/طوارئ (إنذار، انفجار، إطلاق نار، صراخ استغاثة)\n- مركبات (سيارة، بوق، دراجة نارية)\n- طبيعة (مطر، رعد، رياح، بحر)\n- حيوانات\n- أصوات منزلية (جرس الباب، هاتف، أجهزة)\n- صمت\n\nأعطِ:\n**١) نوع الصوت:** (الفئة الأقرب)\n**٢) الوصف:** (شرح مختصر)\n**٣) تنبيه الأمان:** (هل يوجد خطر يستدعي الانتباه؟)`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: audio } }
            ]
          }],
          generationConfig: { maxOutputTokens: 2048 }
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
