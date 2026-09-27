exports.handler = async (event) => {
if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
try {
const { audio, mimeType } = JSON.parse(event.body || '{}');
if (!audio) {
return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'لا يوجد صوت للتحليل.' };
}
const prompt = 'أنت مساعد ذكي للصُّم. استمع لهذا الصوت المحيط وحدّد باللغة العربية نوع الصوت (مثل: موسيقى، بكاء طفل، بكاء شخص بالغ، أذان، انفجار، إنذار، جرس باب، سيارة، حيوان، صمت... أو ما يشبهها) واذكر تنبيه خطر واضح إن كان الصوت يدل على خطر أو طارئ. كن مختصراً وواضحاً.';
const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType || 'audio/webm', data: audio } }] }], generationConfig: { maxOutputTokens: 2048 } })
});
const data = await resp.json();
const out = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || 'تعذّر التحليل.';
return { statusCode: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: out };
} catch (e) {
return { statusCode: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: 'خطأ: ' + e.message };
}
};
