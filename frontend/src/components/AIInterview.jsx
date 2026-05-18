import React, { useState } from "react";
import axios from "axios";
import Timer from "./Timer";
import VoiceInput from "./VoiceInput";
import InterviewResult from "./InterviewResult";

export default function AIInterview({
category,
section,
questions = [],
onContinuePreparation,
onReturnDashboard,
}) {
const [started, setStarted] = useState(false);
const [currentIndex, setCurrentIndex] = useState(0);
const [answer, setAnswer] = useState("");
const [chat, setChat] = useState([]);
const [loading, setLoading] = useState(false);
const [completed, setCompleted] = useState(false);

const [answers, setAnswers] = useState([]);
const [scores, setScores] = useState([]);
const [startTimer, setStartTimer] = useState(false);
const [overallAnalysis, setOverallAnalysis] = useState(null);

const currentQuestion = questions[currentIndex];

// ------------------------------------
// 🔊 AI VOICE SPEAK
// ------------------------------------
const speakText = (text, onEnd) => {
if (!window.speechSynthesis) {
onEnd?.();
return;
}

const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "en-IN";
utterance.rate = 0.95;
utterance.pitch = 1;
utterance.onend = () => onEnd?.();

window.speechSynthesis.cancel();
window.speechSynthesis.speak(utterance);
};

// ------------------------------------
// ⏱️ TIME BASED ON DIFFICULTY
// ------------------------------------
const getTimeLimit = (difficulty) => {
if (difficulty === "easy") return 45;
if (difficulty === "medium") return 60;
return 90;
};

// ------------------------------------
// 🎤 START INTERVIEW
// ------------------------------------
const startInterview = () => {
if (!questions.length) {
alert("No questions available");
return;
}

setStarted(true);
const firstQuestion = questions[0].question;
setChat([{ role: "ai", text: firstQuestion }]);

speakText(firstQuestion, () => setStartTimer(true));
};

// ------------------------------------
// 📝 SUBMIT ANSWER  ✅ FIXED
// ------------------------------------
const submitAnswer = async (auto = false) => {
if (loading) return;

const finalAnswer = auto ? "(No answer provided)" : answer;
if (!auto && !finalAnswer.trim()) return;

setLoading(true);
setStartTimer(false);
setChat((prev) => [...prev, { role: "user", text: finalAnswer }]);
setAnswer("");

try {
// 🔥 FORCE credentials OFF (CORS FIX)
const res = await axios.post(
"http://localhost:5000/api/interview/ai/evaluate",
{
question: currentQuestion.question,
model_answer: currentQuestion.model_answer || "",
candidate_answer: finalAnswer,
},
{ withCredentials: false }
);

const score = res.data?.score ?? 0;
const feedback = res.data?.feedback ?? "No feedback";

const updatedScores = [...scores, score];
const updatedAnswers = [
...answers,
{
question: currentQuestion.question,
answer: finalAnswer,
model_answer: currentQuestion.model_answer,
score,
feedback,
},
];

setScores(updatedScores);
setAnswers(updatedAnswers);
setChat((prev) => [...prev, { role: "ai", text: feedback }]);

const nextIndex = currentIndex + 1;

// ---------------- LAST QUESTION ----------------
if (nextIndex >= questions.length) {
const finalScore =
Math.round(
updatedScores.reduce((a, b) => a + b, 0) / questions.length
) || 0;

try {
const analysisRes = await axios.post(
"http://localhost:5000/api/interview/ai/overall-analysis",
{
category,
section,
final_score: finalScore,
responses: updatedAnswers,
},
{ withCredentials: false }
);
setOverallAnalysis(analysisRes.data);
} catch (e) {
console.error("Overall analysis failed", e);
}

setCompleted(true);
return;
}

// ---------------- NEXT QUESTION ----------------
setTimeout(() => {
setCurrentIndex(nextIndex);
const nextQuestion = questions[nextIndex].question;
setChat((prev) => [...prev, { role: "ai", text: nextQuestion }]);
speakText(nextQuestion, () => setStartTimer(true));
}, 800);

} catch (err) {
console.error("Evaluation request failed:", err);
} finally {
setLoading(false);
}
};

// ------------------------------------
// 🏁 RESULT
// ------------------------------------
if (completed) {
return (
<InterviewResult
category={category}
section={section}
answers={answers}
scores={scores}
overallAnalysis={overallAnalysis}
onContinue={onContinuePreparation}
onReturn={onReturnDashboard}
/>
);
}

// ------------------------------------
// 🎨 UI
// ------------------------------------
return (
<div className="p-6 bg-white rounded-xl shadow-lg">
<h2 className="text-2xl font-bold mb-2">AI Mock Interview</h2>

<p className="text-sm text-gray-600 mb-4">
{category} → {section}
</p>

{!started && (
<button
onClick={startInterview}
className="px-6 py-3 bg-green-700 text-white rounded"
>
🎤 Start Interview
</button>
)}

{started && (
<>
{startTimer && (
<Timer
seconds={getTimeLimit(currentQuestion.difficulty)}
onTimeout={() => submitAnswer(true)}
key={currentIndex}
/>
)}

<div className="border rounded p-4 h-80 overflow-y-auto mb-4">
{chat.map((msg, i) => (
<div
key={i}
className={`mb-3 ${
    msg.role === "ai" ? "text-blue-700" : "text-gray-800"
}`}
>
<strong>{msg.role === "ai" ? "AI:" : "You:"}</strong>{" "}
{msg.text}
</div>
))}
</div>

<VoiceInput onResult={(text) => setAnswer(text)} />

<textarea
value={answer}
onChange={(e) => setAnswer(e.target.value)}
placeholder="Type or speak your answer..."
className="w-full border rounded p-3 mb-3"
rows={4}
disabled={loading}
/>

<button
onClick={() => submitAnswer(false)}
disabled={loading}
className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
>
{loading ? "Evaluating..." : "Submit Answer"}
</button>
</>
)}
</div>
);
}
