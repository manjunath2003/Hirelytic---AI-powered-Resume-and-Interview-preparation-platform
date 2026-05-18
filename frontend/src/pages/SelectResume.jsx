// src/pages/SelectResume.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function SelectResume() {
const { jobId } = useParams();
const navigate = useNavigate();
const userId = localStorage.getItem("user_id");

const [generatedResumes, setGeneratedResumes] = useState([]);
const [selected, setSelected] = useState(null);
const [loading, setLoading] = useState(true);

const [toastMsg, setToastMsg] = useState("");
const [toastType, setToastType] = useState("success");

// ---------------------------------------------------
// Toast Function
// ---------------------------------------------------
const showToast = (msg, type = "success") => {
setToastMsg(msg);
setToastType(type);
setTimeout(() => setToastMsg(""), 2000);
};

// ---------------------------------------------------
// Load resumes
// ---------------------------------------------------
useEffect(() => {
const load = async () => {
try {
const res = await fetch(
    `http://127.0.0.1:5000/api/resume_ai/list/${userId}`
);
const data = await res.json();
setGeneratedResumes(data || []);
} catch (err) {
console.error("Failed to load generated resumes", err);
} finally {
setLoading(false);
}
};
load();
}, [userId]);

// ---------------------------------------------------
// Submit Application
// ---------------------------------------------------
const submitApplication = async () => {
if (!selected) return alert("Please select a resume before applying.");

const payload = {
user_id: userId,
job_id: jobId,
resume_id: selected,
resume_type: "generated",
};

const res = await fetch("http://127.0.0.1:5000/api/applications/apply", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});

const text = await res.text();
let data = {};

try {
data = JSON.parse(text);
} catch {}

if (res.status === 201) {
showToast("Application submitted successfully!", "success");
setTimeout(() => {
navigate("/teacher/dashboard", { state: { openTab: "jobs" } });
}, 1000);
return;
}

if (res.status === 409) {
showToast("Application updated!", "success");
setTimeout(() => {
navigate("/teacher/dashboard", { state: { openTab: "jobs" } });
}, 1000);
return;
}

showToast(data.error || "Failed to apply", "error");
};

// ---------------------------------------------------
// UI RENDER
// ---------------------------------------------------
if (loading) return <div className="p-6 text-lg">Loading resumes...</div>;

return (
<div className="p-6 max-w-3xl mx-auto">

{/* Toast Popup */}
{toastMsg && (
<div
    className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 transition-all duration-300
    ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}
>
    {toastMsg}
</div>
)}

<h1 className="text-2xl font-bold mb-4">Select Resume to Apply</h1>

{generatedResumes.length === 0 ? (
<p className="text-gray-600">No generated resumes found. Create one first.</p>
) : (
generatedResumes.map((r) => (
    <div
        key={r._id}
        className="p-4 border rounded-lg mb-3 flex justify-between items-center bg-white shadow-sm"
    >
        <div>
            <p className="font-semibold">
                {r.pdf_filename || r.docx_filename || "Generated Resume"}
            </p>
            <p className="text-sm text-gray-500">
                Created: {new Date(r.created_at).toLocaleString()}
            </p>
        </div>

        <input
            type="radio"
            name="resume"
            checked={selected === r._id}
            onChange={() => setSelected(r._id)}
        />
    </div>
))
)}

<button
className={`mt-4 px-6 py-3 rounded text-white ${
    selected
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-gray-400 cursor-not-allowed"
}`}
disabled={!selected}
onClick={submitApplication}
>
Submit Application
</button>
</div>
);
}
