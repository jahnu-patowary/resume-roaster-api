require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse-fork");
const OpenAI = require("openai");

const app = express();
app.use(cors());

const client = new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY,
    baseURL: "https://api.sambanova.ai/v1"
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        const data = await pdfParse(req.file.buffer);
        const resumeText = data.text;

        const response = await client.chat.completions.create({
          model: "Meta-Llama-3.3-70B-Instruct",
            messages: [
                {
                    role: "user",
                    content: `Analyze this resume and provide:
1. OVERALL SCORE (out of 100)
2. SECTIONS DETECTED
3. STRENGTHS
4. WEAKNESSES
5. ATS COMPATIBILITY
6. TOP 5 SUGGESTIONS
7. FUNNY ROAST

Resume:
${resumeText}`
                }
            ]
        });

        const analysis = response.choices[0].message.content;
        res.json({ analysis });
    } catch (error) {
        console.log(error);
        res.status(500).json({ analysis: "Error: " + error.message });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});