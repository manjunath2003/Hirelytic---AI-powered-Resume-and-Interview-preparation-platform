import React, { useState } from "react";
import axios from "axios";

export default function BuildResume() {
const userId = localStorage.getItem("user_id");

const [selectedCategory, setSelectedCategory] = useState("");
const [file, setFile] = useState(null);

const [uploading, setUploading] = useState(false);
const [checking, setChecking] = useState(false);

const [strength, setStrength] = useState(0);
const [missing, setMissing] = useState([]);
const [missingConcepts, setMissingConcepts] = useState([]);
const [recommendations, setRecommendations] = useState([]);
const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("");

const [showResult, setShowResult] = useState(false);
const [toast, setToast] = useState(null);

const showToast = (msg, type = "success") => {
setToast({ msg, type });
setTimeout(() => setToast(null), 2500);
};

if (!userId) {
return (
<div className="p-6 text-red-600">
User not logged in. Please log in again.
</div>
);
}

const handleFileChange = (e) => {
const f = e.target.files?.[0];
if (!f) return;
setFile(f);
};

const handleCategoryChange = (e) => {
const value = e.target.value;
setSelectedCategory(value);
setSelectedCategoryLabel(value || "");
};

// ------------------------------
// Upload Resume + Trigger Analysis
// ------------------------------
const handleUploadAndAnalyze = async () => {
if (!selectedCategory) {
showToast("Please select a teaching category first.", "error");
return;
}
if (!file) {
showToast("Please choose a resume file to upload.", "error");
return;
}

try {
setUploading(true);

const formData = new FormData();
formData.append("file", file);
formData.append("user_id", userId);
formData.append("selected_category", selectedCategory);

await axios.post(
"http://127.0.0.1:5000/api/resume/upload",
formData,
{ headers: { "Content-Type": "multipart/form-data" } }
);

showToast("Resume uploaded. Checking strength & gaps...");
await fetchStrengthAndGaps();

} catch (err) {
console.error(err);
showToast("Upload failed. Please try again.", "error");
} finally {
setUploading(false);
}
};

// ------------------------------
// Fetch Resume Strength + Gaps
// ------------------------------
const fetchStrengthAndGaps = async () => {
try {
setChecking(true);

const res = await axios.get(
`http://127.0.0.1:5000/api/resume/strength/${userId}`
);

const data = res.data || {};

setStrength(data.strength || 0);
setMissing(data.missing || []);
setMissingConcepts(data.missing_concepts || []);
setRecommendations(data.recommendations || []);

setShowResult(true);

} catch (err) {
console.error(err);
showToast("Could not calculate resume strength.", "error");
} finally {
setChecking(false);
}
};

return (
<div className="p-6">

{/* Toast */}
{toast && (
<div
className={`fixed top-5 right-5 px-4 py-3 text-white rounded-lg shadow-lg transition-all ${
toast.type === "error" ? "bg-red-600" : "bg-green-600"
}`}
>
{toast.msg}
</div>
)}

{/* Title */}
<h2 className="text-2xl font-bold mb-4 text-gray-800">
Resume Analysis
</h2>

{/* Category + File */}
<div className="bg-white rounded-2xl shadow p-6">
<label className="block text-sm font-semibold text-gray-700 mb-2">
Select Teaching Category
</label>

<select
value={selectedCategory}
onChange={handleCategoryChange}
className="w-full border rounded-lg px-3 py-2 mb-4"
>
<option value="">-- Select Category --</option>

{/* Pre-Primary */}
<option value="Pre-Primary (Nursery-KG)">Pre-Primary (Nursery–KG)</option>

{/* Primary */}
<option value="Primary (Grades 1-5)">Primary (Grades 1–5)</option>

{/* Middle School */}
<option value="Middle School (Grades 6-8)">Middle School (Grades 6–8)</option>

{/* High School 9–10 */}
<option value="High School (Grades 9-10) – State Board">
High School Teacher (9–10) – State Board
</option>
<option value="High School (Grades 9-10) – CBSE Board">
High School Teacher (9–10) – CBSE Board
</option>
<option value="High School (Grades 9-10) – ICSE Board">
High School Teacher (9–10) – ICSE Board
</option>

{/* High School 9–12 */}
<option value="High School (Grades 9-12) – State Board">
High School Teacher (9–12) – State Board
</option>
<option value="High School (Grades 9-12) – CBSE Board">
High School Teacher (9–12) – CBSE Board
</option>
<option value="High School (Grades 9-12) – ICSE Board">
High School Teacher (9–12) – ICSE Board
</option>

{/* PUC */}
<option value="PUC – PCMB">Higher Secondary / PUC (PCMB)</option>
<option value="PUC – PCMCs">Higher Secondary / PUC (PCMCs)</option>
<option value="PUC – Commerce">Higher Secondary / PUC (Commerce)</option>
</select>

<input
type="file"
accept=".pdf,.doc,.docx"
onChange={handleFileChange}
className="block mb-4"
/>

<button
onClick={handleUploadAndAnalyze}
disabled={uploading || checking}
className={`px-5 py-2 rounded-lg text-white font-semibold ${
uploading || checking
  ? "bg-gray-500 cursor-not-allowed"
  : "bg-blue-700 hover:bg-blue-800"
}`}
>
{uploading || checking ? "Analyzing..." : "Upload & Analyze Resume"}
</button>
</div>

{/* RESULTS */}
{showResult && (
<div className="bg-white rounded-2xl shadow p-6 mt-6">

<h3 className="text-xl font-semibold mb-2">Resume Strength Overview</h3>

<p className="mb-4">
<span className="font-bold text-green-600">{strength}%</span>{" "}
Overall Strength
</p>

{selectedCategoryLabel && (
<p className="text-sm text-gray-600 mb-4">
  Evaluated for:{" "}
  <span className="font-medium">{selectedCategoryLabel}</span>
</p>
)}

{/* Missing Fields */}
<div className="mb-4">
<h4 className="font-semibold mb-1">Missing Fields</h4>
{missing.length > 0 ? (
  <ul className="list-disc list-inside text-red-600">
    {missing.map((item, idx) => (
      <li key={idx}>{item}</li>
    ))}
  </ul>
) : (
  <p className="text-gray-600 text-sm">No missing fields detected.</p>
)}
</div>

{/* Missing Semantic Concepts */}
<div className="mb-4">
<h4 className="font-semibold mb-1">Missing Semantic Concepts</h4>
{missingConcepts.length > 0 ? (
  <ul className="list-disc list-inside text-red-600">
    {missingConcepts.map((item, idx) => (
      <li key={idx}>{item}</li>
    ))}
  </ul>
) : (
  <p className="text-gray-600 text-sm">
    No missing semantic gaps — excellent content alignment!
  </p>
)}
</div>

{/* Recommendations */}
<div>
<h4 className="font-semibold mb-1">Recommendations</h4>
{recommendations.length > 0 ? (
  <ul className="list-disc list-inside text-gray-800">
    {recommendations.map((rec, idx) => (
      <li key={idx}>{rec}</li>
    ))}
  </ul>
) : (
  <p className="text-gray-600 text-sm">No recommendations.</p>
)}
</div>

</div>
)}
</div>
);
}
