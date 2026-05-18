import React from "react";

export default function InterviewResult({
category = "",
section = "",
answers = [],
scores = [],
overallAnalysis = null,
onContinue,
onReturn,
}) {
const totalScore = Array.isArray(scores) && scores.length
? scores.reduce((a, b) => a + b, 0)
: 0;

const finalScore = Array.isArray(scores) && scores.length
? Math.round(totalScore / scores.length)
: 0;

return (
<div className="p-6 bg-white rounded-xl shadow-lg">
<h2 className="text-2xl font-bold mb-2">
Interview Result 🎉
</h2>

<p className="text-sm text-gray-600 mb-4">
{category} {section && `→ ${section}`}
</p>

{/* FINAL SCORE */}
<div className="text-center mb-6">
<p className="text-lg">
    Final Score:{" "}
    <strong
    className={
        finalScore >= 75
        ? "text-green-700"
        : finalScore >= 50
        ? "text-yellow-600"
        : "text-red-600"
    }
    >
    {finalScore}/100
    </strong>
</p>

<p className="text-sm text-gray-500 mt-1">
    {finalScore >= 75
    ? "Excellent performance"
    : finalScore >= 50
    ? "Good, needs improvement"
    : "Needs significant improvement"}
</p>
</div>

{/* ANSWER BREAKDOWN */}
<div className="border rounded p-4 max-h-80 overflow-y-auto mb-6">
{answers.length === 0 && (
    <p className="text-gray-500 text-center">
    No answers recorded
    </p>
)}

{answers.map((a, i) => (
    <div key={i} className="mb-5 border-b pb-3 last:border-b-0">
    <p className="font-semibold mb-1">
        {i + 1}. {a?.question || "Question not available"}
    </p>

    <p className="text-gray-700 mb-1">
        <strong>Your Answer:</strong>{" "}
        {a?.answer?.trim()
        ? a.answer
        : "(No answer provided)"}
    </p>

    <p className="text-blue-700 mb-1">
        <strong>AI Feedback:</strong>{" "}
        {a?.feedback || "No feedback generated"}
    </p>

    <p className="text-sm text-gray-500">
        Score: {a?.score ?? 0}/100
    </p>
    </div>
))}
</div>

{/* OVERALL INTERVIEW ANALYSIS */}
{overallAnalysis && (
<div className="mt-8 border-t pt-6 space-y-6">

    {/* WEAK SKILLS */}
    {Array.isArray(overallAnalysis.overall_weak_skills) &&
    overallAnalysis.overall_weak_skills.length > 0 && (
        <div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">
            Weak Skills & Concepts
        </h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
            {overallAnalysis.overall_weak_skills.map((skill, i) => (
            <li key={i}>{skill}</li>
            ))}
        </ul>
        </div>
    )}

    {/* RECOMMENDED LEARNING */}
    {Array.isArray(overallAnalysis.recommended_learning_areas) &&
    overallAnalysis.recommended_learning_areas.length > 0 && (
        <div>
        <h3 className="text-lg font-semibold text-indigo-700 mb-2">
            Recommended Learning Areas
        </h3>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
            {overallAnalysis.recommended_learning_areas.map((area, i) => (
            <li key={i}>{area}</li>
            ))}
        </ul>
        </div>
    )}

    {/* IMPROVEMENT SUMMARY */}
    {overallAnalysis.overall_improvement_summary && (
    <div>
        <h3 className="text-lg font-semibold text-green-700 mb-2">
        Overall Improvement Summary
        </h3>
        <p className="text-gray-700 leading-relaxed">
        {overallAnalysis.overall_improvement_summary}
        </p>
    </div>
    )}
</div>
)}

{/* ACTION BUTTONS */}
<div className="flex justify-center gap-4 mt-8">
<button
    onClick={onContinue}
    className="px-5 py-2 bg-indigo-600 text-white rounded"
>
    Continue Preparation
</button>

<button
    onClick={onReturn}
    className="px-5 py-2 bg-gray-700 text-white rounded"
>
    Return to Dashboard
</button>
</div>
</div>
);
}
