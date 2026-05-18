// src/pages/AppliedJobs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AppliedJobs() {
const userId = localStorage.getItem("user_id");

const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const fetchAppliedJobs = async () => {
if (!userId) {
setError("User not logged in.");
setLoading(false);
return;
}

setLoading(true);
setError("");

try {
const res = await axios.get(`http://localhost:5000/api/applications/list/${userId}`);
setApplications(res.data || []);
} catch (err) {
console.error("Error fetching applied jobs:", err);
setError("Could not fetch applied jobs.");
} finally {
setLoading(false);
}
};

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
fetchAppliedJobs();
}, []);

const formatDateTime = (dt) => {
if (!dt) return "-";
try {
const d = new Date(dt);
return d.toLocaleString();
} catch {
return dt;
}
};

const handleViewResume = (resumeMeta) => {
if (!resumeMeta || !resumeMeta.file_name) {
alert("Generated resume filename missing.");
return;
}

// Uploaded resume (if you ever use it)
if (resumeMeta.type === "uploaded") {
// this endpoint tries to serve bytes if present; otherwise returns message
window.open(`http://localhost:5000/api/resume_files/get/${resumeMeta.resume_id}`, "_blank");
return;
}

// Generated resume preview: use resume_id (MongoDB _id) with the correct route
if (resumeMeta.type === "generated") {
const resumeId = resumeMeta.resume_id;
if (!resumeId) {
    alert("Generated resume ID missing.");
    return;
}
window.open(`http://localhost:5000/api/resume_builder/preview/${resumeId}/pdf`, "_blank");
return;
}

alert("Resume preview unavailable.");
};


if (loading) return <div className="p-6">Loading applied jobs...</div>;
if (error) return (
<div className="p-6">
<h1 className="text-xl font-bold mb-3">Applied Jobs</h1>
<div className="mb-4 text-red-600">{error}</div>
<button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={fetchAppliedJobs}>Retry</button>
</div>
);
if (!applications.length) return (
<div className="p-6">
<h1 className="text-xl font-bold mb-3">Applied Jobs</h1>
<p className="text-gray-600">You haven't applied to any jobs yet.</p>
</div>
);

return (
<div className="p-6">
<div className="flex items-center justify-between mb-4">
<div>
<h1 className="text-2xl font-bold">Applied Jobs</h1>
<p className="text-gray-600">You've applied to {applications.length} job{applications.length !== 1 ? "s" : ""}.</p>
</div>

<button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={fetchAppliedJobs}>Refresh</button>
</div>

<div className="space-y-5">
{applications.map((app) => (
<div key={app.job_id} className="p-5 border rounded-lg shadow bg-white hover:shadow-lg transition">
<h2 className="text-xl font-semibold mb-1">{app.title}</h2>

<p className="text-gray-700"><b>Institution:</b> {app.institution || "Not provided"}</p>
<p className="text-gray-700"><b>Category:</b> {app.category || "-"}</p>
<p className="text-gray-700"><b>Subject:</b> {app.subject || "-"}</p>
<p className="text-gray-700"><b>Location:</b> {app.location || "-"}</p>

{app.salary && <p className="text-gray-700"><b>Salary:</b> ₹{app.salary}</p>}

<p className="text-gray-600 mt-2"><b>Applied On:</b> {formatDateTime(app.applied_at)}</p>

{app.resume_meta ? (
<p className="mt-1 text-sm">
<b>Attached Resume: </b>
<button onClick={() => handleViewResume(app.resume_meta)} className="text-blue-600 underline hover:text-blue-800">View Resume</button>
</p>
) : (
<p className="mt-1 text-sm"><b>Attached Resume: </b><span className="italic">Not available</span></p>
)}

<button className="mt-4 px-3 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200" onClick={() => (window.location.href = `/job/${app.job_id}`)}>View Job</button>
</div>
))}
</div>
</div>
);
}
