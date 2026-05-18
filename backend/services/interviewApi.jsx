import axios from "axios";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// --------------------------------------------------
// 🤖 AI INTERVIEW EVALUATION SERVICE
// --------------------------------------------------
export async function evaluateInterviewAnswer({
question,
model_answer,
candidate_answer,
difficulty = "medium",
}) {
if (!GROQ_API_KEY) {
throw new Error("GROQ_API_KEY missing in environment");
}

const prompt = `
You are an experienced school interview panelist.

INTERVIEW QUESTION:
${question}

MODEL ANSWER (reference):
${model_answer}

CANDIDATE ANSWER:
${candidate_answer}

TASK:
1. Give short, professional feedback (max 2 lines)
2. Score the answer from 0 to 100
3. Be fair and realistic (school/college interview style)

Return ONLY valid JSON:
{
"feedback": "string",
"score": number
}
`;

const response = await axios.post(
GROQ_URL,
{
    model: "llama3-8b-8192",
    messages: [
    { role: "system", content: "You are a strict interview evaluator." },
    { role: "user", content: prompt },
    ],
    temperature: 0.4,
},
{
    headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json",
    },
}
);

const text = response.data.choices[0].message.content;

// 🧠 SAFE JSON PARSE
let parsed;
try {
parsed = JSON.parse(text);
} catch {
throw new Error("AI returned invalid JSON");
}

return {
feedback: parsed.feedback || "Good attempt.",
score: Number(parsed.score) || 0,
};
}
