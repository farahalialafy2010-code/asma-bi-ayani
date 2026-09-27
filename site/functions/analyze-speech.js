exports.handler = async (event) => {
if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
try {
const { text } = JSON.parse(event.body || '{}');
if (!text || !text.trim()) {
return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'لا يوجد نص للتحليل.' };
}
const prompt = 'أنت مساعد ذكي للصُّم. حلّل النص التالي وأعطِ باللغة العربية: (١) المشاعر والنبرة بوضوح، (٢) تنبيه الأمان إن وُجد أي خطر أو تهديد أو استغاثة. كن مختصراً وواضحاً.\n\nالنص:\n' + text;
const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 512 } })
});
const data = await resp.json();
const out = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || 'تعذّر التحليل.';
return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: out };
} catch (e) {
return { statusCode: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'خطأ: ' + e.message };
}
};
