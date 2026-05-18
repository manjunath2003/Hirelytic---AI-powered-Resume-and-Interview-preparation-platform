import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AIInterview from "../components/AIInterview";

/**
 * 🔒 FIXED CATEGORY → FILE MAPPING
 */
const CATEGORY_FILE_MAP = {
"Pre-Primary (Nursery–KG)": "pre_primary.json",
"Primary (Grades 1–5)": "primary_1_5.json",
"Middle School (Grades 6–8)": "middle_school_6_8.json",

"High School Teacher (9–10) – State Board": "high_school_9_10_state.json",
"High School Teacher (9–10) – CBSE Board": "high_school_9_10_cbse.json",
"High School Teacher (9–10) – ICSE Board": "high_school_9_10_icse.json",

"High School Teacher (9–12) – State Board": "high_school_9_12_state.json",
"High School Teacher (9–12) – CBSE Board": "high_school_9_12_cbse.json",
"High School Teacher (9–12) – ICSE Board": "high_school_9_12_icse.json",

"Higher Secondary / PUC – PCMB": "higher_secondary_puc_pcmb.json",
"Higher Secondary / PUC – PCMCs": "higher_secondary_puc_pcmcs.json",
"Higher Secondary / PUC – Commerce": "higher_secondary_puc_commerce.json",
};

const CATEGORIES = Object.keys(CATEGORY_FILE_MAP);

export default function InterviewPreparation() {
const navigate = useNavigate();

const [data, setData] = useState(null);
const [selectedCategory, setSelectedCategory] = useState("");
const [openSub, setOpenSub] = useState(null);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [aiLoading, setAiLoading] = useState(false);

// 🎤 AI INTERVIEW STATE
const [interviewMode, setInterviewMode] = useState(false);
const [interviewQuestions, setInterviewQuestions] = useState([]);
const [interviewSection, setInterviewSection] = useState("");

// --------------------------------------------------
// 🔹 LOAD CATEGORY JSON (UNCHANGED)
// --------------------------------------------------
useEffect(() => {
if (!selectedCategory) return;

const fileName = CATEGORY_FILE_MAP[selectedCategory];
if (!fileName) {
setError("Invalid category selected");
return;
}

setLoading(true);
setError("");
setData(null);
setOpenSub(null);
setInterviewMode(false);

fetch(`/categories/${fileName}`)
.then((res) => {
if (!res.ok) throw new Error();
return res.json();
})
.then((json) => setData(json))
.catch(() => setError("Failed to load interview preparation data"))
.finally(() => setLoading(false));
}, [selectedCategory]);

// --------------------------------------------------
// 🤖 GENERATE AI QUESTIONS (UNCHANGED)
// --------------------------------------------------
const generateAIQuestions = async (category, section) => {
try {
setAiLoading(true);
setError("");

const res = await fetch(
"http://localhost:5000/api/interview/ai/generate-questions",
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ category, section, count: 10 }),
}
);

const result = await res.json();

if (!Array.isArray(result?.questions)) {
setError("AI did not return valid questions");
return;
}

setData((prev) => {
if (!prev?.sections?.[section]) return prev;

const existing = prev.sections[section].questions || [];
const existingTexts = new Set(existing.map((q) => q.question));

const uniqueNew = result.questions.filter(
(q) => q?.question && !existingTexts.has(q.question)
);

return {
...prev,
sections: {
...prev.sections,
[section]: {
...prev.sections[section],
questions: [...existing, ...uniqueNew],
},
},
};
});
} catch {
setError("Failed to generate AI questions");
} finally {
setAiLoading(false);
}
};

// --------------------------------------------------
// 🎤 START AI MOCK INTERVIEW (UNCHANGED)
// --------------------------------------------------
const startAIInterview = async (sectionName) => {
try {
setAiLoading(true);
setError("");

const res = await fetch(
"http://localhost:5000/api/interview/ai/generate-questions",
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
category: selectedCategory,
section: sectionName,
count: 10,
}),
}
);

const result = await res.json();

if (!Array.isArray(result?.questions) || result.questions.length === 0) {
setError("AI failed to generate interview questions");
return;
}

setInterviewQuestions(result.questions);
setInterviewSection(sectionName);
setInterviewMode(true);
} catch {
setError("Failed to start AI mock interview");
} finally {
setAiLoading(false);
}
};

// --------------------------------------------------
// 🎤 AI INTERVIEW MODE
// --------------------------------------------------
if (interviewMode) {
return (
<AIInterview
category={selectedCategory}
section={interviewSection}
questions={interviewQuestions}
onContinuePreparation={() => {
setInterviewMode(false);
setOpenSub(interviewSection);
}}
onReturnDashboard={() => {
setInterviewMode(false);
setInterviewQuestions([]);
setInterviewSection("");
navigate("/teacher/dashboard", { replace: true });
}}
/>
);
}

// --------------------------------------------------
// 📚 PREPARATION MODE
// --------------------------------------------------
return (
<div className="bg-white p-6 rounded-xl shadow">
<h2 className="text-2xl font-bold mb-4">Interview Preparation</h2>

{error && <div className="mb-4 text-red-600">{error}</div>}

<label className="font-semibold">Select Category</label>

<select
className="border p-3 rounded w-full mt-2"
value={selectedCategory}
onChange={(e) => setSelectedCategory(e.target.value)}
>
<option value="">-- Select Category --</option>
{CATEGORIES.map((cat) => (
<option key={cat} value={cat}>
{cat}
</option>
))}
</select>

{loading && <p className="mt-4">Loading...</p>}

{data?.sections && (
<div className="mt-6">
{Object.entries(data.sections).map(([sectionName, sectionData]) => (
<div key={sectionName} className="border rounded mt-4">
<button
onClick={() =>
setOpenSub(openSub === sectionName ? null : sectionName)
}
className="w-full px-4 py-3 bg-gray-100 font-semibold text-left"
>
{sectionName}
</button>

{openSub === sectionName && (
<div className="p-4 space-y-6">
<ul className="list-decimal ml-6 space-y-3">
{sectionData.questions?.map((q, i) => (
<li key={i}>
<div className="font-medium">
{q.question}
{q.difficulty && (
<span className="text-sm text-gray-500">
{" "}
({q.difficulty})
</span>
)}
</div>

{q.model_answer && (
<details>
<summary className="text-blue-600 cursor-pointer">
Show model answer
</summary>
<p className="text-sm mt-1">{q.model_answer}</p>
</details>
)}
</li>
))}
</ul>

{/* ✅ SECTION-LEVEL RESOURCES (FIXED) */}
{sectionData.resources && (
<div className="mt-6 border-t pt-4">
<h4 className="font-semibold text-gray-800 mb-2">
📚 Learning Resources
</h4>

{Object.entries(sectionData.resources).map(
([type, items]) => (
<div key={type} className="mb-3">
<p className="text-sm font-medium capitalize text-gray-700">
{type}
</p>
<ul className="list-disc ml-5 text-sm text-blue-600">
{items.map((res, idx) => (
<li key={idx}>
<a
href={res.url}
target="_blank"
rel="noopener noreferrer"
className="hover:underline font-medium"
>
{res.title}
</a>
{res.description && (
<p className="text-xs text-gray-600">
{res.description}
</p>
)}
</li>
))}
</ul>
</div>
)
)}
</div>
)}

<div className="flex gap-3 mt-6">
<button
disabled={aiLoading}
onClick={() =>
generateAIQuestions(selectedCategory, sectionName)
}
className="px-4 py-2 bg-indigo-600 text-white rounded"
>
🤖 {aiLoading ? "Generating..." : "Generate More"}
</button>

<button
onClick={() => startAIInterview(sectionName)}
className="px-4 py-2 bg-green-700 text-white rounded"
>
🎤 Start Mock Interview
</button>
</div>
</div>
)}
</div>
))}
</div>
)}
</div>
);
}
