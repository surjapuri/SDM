// --- QRaksha AI Scam Check Function with Dynamic RAG ---
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

// .env फ़ाइल से सुरक्षित रूप से API KEY लोड होगी
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.aiScamCheck = onRequest({ cors: true }, async (req, res) => {
    try {
        const { scannedData } = req.body;
        if (!scannedData) {
            return res.status(400).json({ error: "स्कैन किया गया डेटा गायब है।" });
        }

        // 1. rag-corpus/ folder से सभी फ़ाइलों को dynamically रीड करना
        let ragContext = "";
        const corpusPath = path.join(__dirname, "../rag-corpus");
        
        try {
            if (fs.existsSync(corpusPath)) {
                const files = fs.readdirSync(corpusPath);
                files.forEach(file => {
                    if (file.endsWith(".txt") || file.endsWith(".json")) {
                        const fileContent = fs.readFileSync(path.join(corpusPath, file), "utf8");
                        ragContext += `\n--- Context from ${file} ---\n${fileContent}\n`;
                    }
                });
            }
        } catch (readError) {
            logger.error("RAG Corpus Reading Error:", readError);
            // Context खाली रहेगा पर फंक्शन क्रैश नहीं होगा
        }

        // 2. System Instructions तैयार करना (RAG Context के साथ)
        const systemInstruction = `
तुम QRaksha ऐप के सुरक्षा इंजन हो। तुम्हें दिए गए QR कोड, URL, या UPI ID का सेफ्टी ऑडिट करना है।
तुम्हारे पास नीचे दिए गए साइबर फ्रॉड पैटर्न्स का लाइव संदर्भ (RAG Context) है। इस डेटा का उपयोग करके आने वाले इनपुट का बारीकी से विश्लेषण करो:

${ragContext}

जवाब केवल इस JSON फॉर्मेट में होना चाहिए, इसके अलावा कोई टेक्स्ट नहीं:
{
  "riskScore": (0 से 100),
  "riskLevel": "SAFE" | "SUSPICIOUS" | "HIGH_RISK",
  "reasonHindi": "हिंदी में स्पष्ट और सटीक कारण",
  "detectedPatterns": ["मैच हुए पैटर्न्स की लिस्ट"]
}
`;

        // 3. Gemini 2.5 Flash मॉडल को कॉल करना
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `कृपया इस डेटा का सेफ्टी ऑडिट करें: "${scannedData}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json"
            }
        });

        return res.status(200).json(JSON.parse(response.text));

    } catch (error) {
        logger.error("AI Scam Check Error:", error);
        return res.status(500).json({
            riskScore: 50,
            riskLevel: "SUSPICIOUS",
            reasonHindi: "सर्वर व्यस्त है, कृपया सावधानी से आगे बढ़ें।"
        });
    }
});
