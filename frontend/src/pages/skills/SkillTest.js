import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedPage from "../../components/AnimatedPage";
import { useNavigate } from "react-router-dom";

export default function SkillTest() {
const userId = localStorage.getItem("user_id");
const [answers, setAnswers] = useState({});
const [step, setStep] = useState(0);
const [submitted, setSubmitted] = useState(false);
const [result, setResult] = useState(null);
const navigate = useNavigate();

// ⭐ NEW — Start Test & Review Mode
const [started, setStarted] = useState(false);
const [reviewMode, setReviewMode] = useState(false);

// Timer (20 minutes)
const [timeLeft, setTimeLeft] = useState(20 * 60);

useEffect(() => {
if (!started || submitted) return;

const interval = setInterval(() => {
setTimeLeft((t) => {
if (t <= 1) {
clearInterval(interval);
submitTest(true);
}
return t - 1;
});
}, 1000);

return () => clearInterval(interval);
}, [started, submitted]);

const formatTime = (seconds) => {
const m = Math.floor(seconds / 60);
const s = seconds % 60;
return `${m}:${s < 10 ? "0" : ""}${s}`;
};

// ----------------- ALL 25 QUESTIONS (FULL + CORRECT) -----------------
const questions = [
// ------------------ Communication (4) ------------------
{
id: "q1",
category: "communication",
question:
"A student is struggling to understand your explanation. What is the BEST response?",
options: {
a: "Repeat loudly",
b: "Try a different example",
c: "Ignore and continue",
d: "Ask another student to explain",
},
correct: "b",
},
{
id: "q2",
category: "communication",
question:
"During a class discussion, what is an effective teaching behavior?",
options: {
a: "Interrupt students",
b: "Allow constructive debate",
c: "Speak continuously",
d: "Discourage questions",
},
correct: "b",
},
{
id: "q3",
category: "communication",
question: "A student gives a wrong answer. What should you do?",
options: {
a: "Scold the student",
b: "Guide them to the right answer",
c: "Ignore the mistake",
d: "Ask them to sit down",
},
correct: "b",
},
{
id: "q4",
category: "communication",
question: "Teachers should speak at a speed that is:",
options: {
a: "Very fast",
b: "Very slow",
c: "Clear & moderate",
d: "Random",
},
correct: "c",
},

// ------------------ Subject Knowledge (4) ------------------
{
id: "q5",
category: "subject_knowledge",
question: "A good teacher must:",
options: {
a: "Know only syllabus",
b: "Have deep subject knowledge",
c: "Avoid answering doubts",
d: "Depend fully on textbooks",
},
correct: "b",
},
{
id: "q6",
category: "subject_knowledge",
question: "You find a topic you don’t fully know. What do you do?",
options: {
a: "Skip it",
b: "Study & return prepared",
c: "Give random information",
d: "Ask students to learn themselves",
},
correct: "b",
},
{
id: "q7",
category: "subject_knowledge",
question: "Which is MOST essential?",
options: {
a: "Memorizing answers",
b: "Conceptual understanding",
c: "Reading quickly",
d: "Copying notes",
},
correct: "b",
},
{
id: "q8",
category: "subject_knowledge",
question: "A student asks a very advanced question. What should you do?",
options: {
a: "Ignore",
b: "Provide a simple explanation",
c: "Punish them",
d: "Tell them not to ask extra questions",
},
correct: "b",
},

// ------------------ Classroom Management (4) ------------------
{
id: "q9",
category: "classroom_management",
question: "Best way to manage a noisy class?",
options: {
a: "Shout",
b: "Punish all",
c: "Use attention signals",
d: "Walk out",
},
correct: "c",
},
{
id: "q10",
category: "classroom_management",
question: "How to handle distracting students?",
options: {
a: "Speak privately to them",
b: "Insult publicly",
c: "Remove from class",
d: "Ignore",
},
correct: "a",
},
{
id: "q11",
category: "classroom_management",
question: "Best seating plan?",
options: {
a: "Random",
b: "By height",
c: "According to learning needs",
d: "Teacher decides without thinking",
},
correct: "c",
},
{
id: "q12",
category: "classroom_management",
question: "If multiple students misbehave:",
options: {
a: "Punish entire class",
b: "Identify root cause",
c: "Ignore",
d: "Send all to principal",
},
correct: "b",
},

// ------------------ Pedagogy (4) ------------------
{
id: "q13",
category: "pedagogy",
question: "Best teaching approach?",
options: {
a: "One-way lecture",
b: "Interactive learning",
c: "Memorization",
d: "Only homework",
},
correct: "b",
},
{
id: "q14",
category: "pedagogy",
question: "Good lesson planning includes:",
options: {
a: "Random teaching",
b: "Clear objectives",
c: "No examples",
d: "No activities",
},
correct: "b",
},
{
id: "q15",
category: "pedagogy",
question: "To help slow learners:",
options: {
a: "Ignore them",
b: "Provide additional support",
c: "Give punishment",
d: "Ask to study alone",
},
correct: "b",
},
{
id: "q16",
category: "pedagogy",
question: "Most effective evaluation method:",
options: {
a: "Just one final exam",
b: "Only assignments",
c: "Continuous assessment",
d: "No assessment",
},
correct: "c",
},

// ------------------ Digital Literacy (4) ------------------
{
id: "q17",
category: "digital_literacy",
question: "A modern teacher should:",
options: {
a: "Avoid technology",
b: "Use only chalkboard",
c: "Use digital tools where needed",
d: "Depend fully on AI",
},
correct: "c",
},
{
id: "q18",
category: "digital_literacy",
question: "Best use of digital tools:",
options: {
a: "Replace teacher",
b: "Avoid completely",
c: "Enhance teaching",
d: "Distract students",
},
correct: "c",
},
{
id: "q19",
category: "digital_literacy",
question: "Using PPT in class:",
options: {
a: "Should never be used",
b: "Useful when mixed with explanation",
c: "Use only PPT",
d: "Replace textbooks",
},
correct: "b",
},
{
id: "q20",
category: "digital_literacy",
question: "Online tools can:",
options: {
a: "Harm learning",
b: "Enhance engagement",
c: "Confuse students",
d: "Replace practice",
},
correct: "b",
},

// ------------------ Psychology (5) ------------------
{
id: "q21",
category: "psychology",
question: "A shy student should be:",
options: {
a: "Ignored",
b: "Encouraged gently",
c: "Forced to speak",
d: "Punished",
},
correct: "b",
},
{
id: "q22",
category: "psychology",
question: "Motivation improves when:",
options: {
a: "Students are insulted",
b: "Praise is used correctly",
c: "Homework is doubled",
d: "Marks reduced",
},
correct: "b",
},
{
id: "q23",
category: "psychology",
question: "A stressed student should:",
options: {
a: "Be shouted at",
b: "Receive emotional support",
c: "Be ignored",
d: "Get more homework",
},
correct: "b",
},
{
id: "q24",
category: "psychology",
question: "Students learn better when:",
options: {
a: "They sit silently",
b: "They are afraid",
c: "They feel safe",
d: "Teacher dominates",
},
correct: "c",
},
{
id: "q25",
category: "psychology",
question: "Best approach for diverse students:",
options: {
a: "One method for all",
b: "Differentiate teaching",
c: "Ignore differences",
d: "Punish weak students",
},
correct: "b",
},
];

const total = questions.length;
const current = questions[step];

const selectOption = (qid, key) => {
if (reviewMode) return;
setAnswers((prev) => ({ ...prev, [qid]: key }));
};

const next = () => step < total - 1 && setStep(step + 1);
const prev = () => step > 0 && setStep(step - 1);

const submitTest = async (auto = false) => {
if (submitted) return;

setSubmitted(true);

const res = await fetch(
`http://127.0.0.1:5000/api/skills/submit/${userId}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ answers }),
}
);

const data = await res.json();
setResult(data);
};

// ------------------ EARLY RETURN ------------------
if (!userId) {
return (
<div className="p-10 text-center text-red-600 text-xl font-semibold">
You are not logged in.
</div>
);
}

// ------------------ START SCREEN ------------------
if (!started) {
return (
<AnimatedPage>
<div className="max-w-2xl mx-auto p-6 mt-28 bg-white rounded-xl shadow text-center">
<h1 className="text-3xl font-bold mb-4">Skill Assessment Test</h1>

<p className="text-lg text-gray-700 mb-6">
Take a simple 25-question test to evaluate your teaching skills.
</p>

<button
onClick={() => setStarted(true)}
className="bg-green-700 text-white px-6 py-3 rounded-lg text-lg"
>
Start Test
</button>
</div>
</AnimatedPage>
);
}

// ⭐ CATEGORY-WISE SCORE ANALYSIS ⭐
const getCategoryScores = () => {
const scores = {};

questions.forEach((q) => {
if (!scores[q.category]) {
scores[q.category] = { correct: 0, total: 0 };
}

scores[q.category].total += 1;

if (answers[q.id] === q.correct) {
scores[q.category].correct += 1;
}
});

return scores;
};

// ------------------ RESULT SCREEN ------------------
if (submitted && !reviewMode && result) {
return (
<AnimatedPage>
<div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">
<h1 className="text-3xl font-bold mb-4 text-green-700">
Skill Assessment Result
</h1>

<p className="text-lg font-semibold">
  Final Score:{" "}
  <span className="text-green-700">{result.final_score}%</span>
</p>

{/* WEAK CATEGORIES */}
<h2 className="mt-4 font-bold text-xl">Weak Categories:</h2>
<ul className="list-disc ml-6 text-red-600">
  {result.weak_categories?.map((c, i) => (
    <li key={i}>{c.replace("_", " ")}</li>
  ))}
</ul>

{/* ⭐ CATEGORY-WISE SCORE TABLE INSIDE RESULT SCREEN (CORRECT PLACE) */}
<h2 className="mt-8 font-bold text-xl">Category-wise Score</h2>

<table className="w-full mt-3 border text-left">
  <thead>
    <tr className="bg-gray-100">
      <th className="p-2 border">Category</th>
      <th className="p-2 border">Correct</th>
      <th className="p-2 border">Total</th>
      <th className="p-2 border">Score</th>
    </tr>
  </thead>

  <tbody>
    {Object.entries(getCategoryScores()).map(([cat, data]) => {
      const percent = Math.round((data.correct / data.total) * 100);
      return (
        <tr key={cat}>
          <td className="p-2 border capitalize">
            {cat.replace("_", " ")}
          </td>
          <td className="p-2 border">{data.correct}</td>
          <td className="p-2 border">{data.total}</td>
          <td className="p-2 border">
            <span
              className={
                percent >= 75
                  ? "text-green-700 font-semibold"
                  : percent >= 50
                  ? "text-yellow-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {percent}%
            </span>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

{/* REVIEW BUTTON */}
<button
  onClick={() => {
    setReviewMode(true);
    setSubmitted(false);
    setStep(0);
  }}
  className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg"
>
  Review Answers
</button>

<button
  onClick={() => navigate("/teacher/dashboard")}
  className="mt-3 bg-green-700 text-white px-5 py-2 rounded-lg ml-3"
>
  Return to Dashboard
</button>
</div>
</AnimatedPage>
);
}


// ------------------ TEST SCREEN ------------------
return (
<AnimatedPage>
<div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-xl shadow">

{/* HEADER */}
<div className="flex justify-between mb-6">
<h1 className="text-2xl font-bold">
{reviewMode ? "Review Answers" : "Skill Assessment Test"}
</h1>

{!reviewMode && (
<p className="font-semibold text-red-600 text-lg">
⏱ {formatTime(timeLeft)}
</p>
)}
</div>

{/* PROGRESS BAR */}
<div className="w-full bg-gray-200 h-3 rounded mb-6">
<motion.div
initial={{ width: 0 }}
animate={{ width: `${((step + 1) / total) * 100}%` }}
transition={{ duration: 0.3 }}
className="h-3 bg-green-600 rounded"
/>
</div>

{/* QUESTION */}
<h2 className="text-xl font-semibold mb-4">
{step + 1}. {current.question}
</h2>

{/* OPTIONS */}
<div className="space-y-3">
{Object.entries(current.options).map(([key, text]) => {
let className = "w-full block p-3 border rounded ";

if (reviewMode) {
if (key === current.correct) {
className += "bg-green-600 text-white border-green-700";
} else if (answers[current.id] === key) {
className += "bg-red-600 text-white border-red-700";
}
} else {
if (answers[current.id] === key) {
className += "bg-green-600 text-white border-green-700";
} else {
className += "hover:bg-gray-100 cursor-pointer";
}
}

return (
<label
key={key}
className={className}
onClick={() => selectOption(current.id, key)}
>
{text}
</label>
);
})}
</div>

{/* BUTTONS */}
<div className="flex justify-between mt-8">
<button
onClick={prev}
disabled={step === 0}
className="px-6 py-2 bg-gray-300 rounded disabled:opacity-50"
>
Previous
</button>

{reviewMode ? (
  <button
    onClick={() => {
      if (step === total - 1) {
        // ⭐ FIX — RETURN BACK TO RESULT SCREEN
        setReviewMode(false);
        setSubmitted(true);
        return;
      }
      setStep(step + 1);
    }}
    className="px-6 py-2 bg-blue-600 text-white rounded"
  >
    {step === total - 1 ? "Done" : "Next"}
  </button>
) : step === total - 1 ? (
<button
onClick={() => submitTest(false)}
className="px-6 py-2 bg-green-700 text-white rounded"
>
Submit Test
</button>
) : (
<button
onClick={next}
className="px-6 py-2 bg-green-700 text-white rounded"
>
Next
</button>
)}
</div>
</div>
</AnimatedPage>
);
}
