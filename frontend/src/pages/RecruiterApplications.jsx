import React, { useEffect, useState } from "react";
import axios from "axios";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";

export default function RecruiterApplications({ filter = "applied" }) {
const recruiterId = localStorage.getItem("user_id");

const [apps, setApps] = useState([]);
const [loading, setLoading] = useState(true);

// ✅ already present (kept)
const [showModal, setShowModal] = useState(false);
const [selectedApp, setSelectedApp] = useState(null);

const fetchApps = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/jobs/recruiter/applications/${recruiterId}`
);
setApps(res.data);
} catch (err) {
console.error("Error fetching applications:", err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchApps();
}, []);

// ✅ reject handler (FIXED, logic intact)
const rejectApplication = async (applicationId, teacherId) => {
try {
await axios.post(
"http://localhost:5000/api/interview-schedule/reject",
{
application_id: applicationId,
teacher_id: teacherId,
message: "Your application has been rejected."
}
);
fetchApps();
} catch (err) {
console.error("Error rejecting application:", err);
alert("Failed to reject application");
}
};

if (loading) return <p>Loading applications...</p>;

// ✅ FILTER BY STATUS (ADDED)
const filteredApps = apps.filter((app) => {
if (filter === "applied") {
return app.status !== "shortlisted" && app.status !== "rejected";
}
if (filter === "shortlisted") {
return app.status === "shortlisted";
}
if (filter === "rejected") {
return app.status === "rejected";
}
return true;
});

if (filteredApps.length === 0)
return <p>No applications found.</p>;

return (
<div className="space-y-4">
{filteredApps.map((app) => {
const meta = app.resume_meta || {};

const pdfUrl = meta.resume_id
? `http://localhost:5000/api/resume_builder/preview/${meta.resume_id}/pdf`
: null;

return (
<div
key={app._id}
className="bg-white shadow p-4 rounded-xl border"
>
<h3 className="text-lg font-semibold">
{app.job_title || "Untitled Job"}
</h3>

<p className="text-sm text-gray-600">
<strong>Institution:</strong>{" "}
{app.institution || "N/A"}
</p>

<div className="mt-4 flex items-start space-x-4">
{app.applicant_photo ? (
<img
    src={app.applicant_photo}
    alt="Profile"
    className="w-14 h-14 rounded-full object-cover border"
/>
) : (
<div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white">
    ?
</div>
)}

<div className="space-y-1">
<p><strong>Name:</strong> {app.applicant_name}</p>
<p><strong>Email:</strong> {app.applicant_email}</p>
<p><strong>Phone:</strong> {app.applicant_phone}</p>
<p><strong>Experience:</strong> {app.applicant_experience}</p>
<p><strong>Qualification:</strong> {app.applicant_qualification}</p>
<p><strong>Skills:</strong> {app.applicant_skills}</p>
<p><strong>Age:</strong> {app.applicant_age}</p>

{app.applicant_about && (
    <div className="mt-2">
    <strong>About:</strong>
    <p>{app.applicant_about}</p>
    </div>
)}
</div>
</div>

<p className="mt-4">
<strong>Applied on:</strong>{" "}
{new Date(app.applied_at).toLocaleString()}
</p>

<p className="mt-2">
<strong>Resume:</strong>{" "}
{meta.file_name || "N/A"}
</p>

{pdfUrl ? (
<a
href={pdfUrl}
target="_blank"
rel="noopener noreferrer"
className="text-blue-600 underline text-sm"
>
View PDF
</a>
) : (
<p className="text-gray-500 text-sm">
PDF not available
</p>
)}

{/* ✅ STATUS LABELS */}
{app.status === "shortlisted" && (
<p className="mt-3 text-green-600 font-semibold">
Interview Scheduled
</p>
)}

{app.status === "rejected" && (
<p className="mt-3 text-red-600 font-semibold">
Rejected
</p>
)}

{/* ✅ ACTION BUTTONS (ONLY FOR APPLIED) */}
{app.status !== "shortlisted" && app.status !== "rejected" && (
<div className="flex gap-3 mt-3">
<button
    disabled={showModal}
    onClick={() => {
    setSelectedApp(app);
    setShowModal(true);
    }}
    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
>
    Shortlist & Schedule Interview
</button>

<button
    disabled={showModal}
    onClick={() => rejectApplication(app._id, app.user_id)}
    className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
>
    Reject
</button>
</div>
)}
</div>
);
})}

{/* ✅ MODAL (SAFE GUARD) */}
{showModal && selectedApp && (
<ScheduleInterviewModal
application={selectedApp}
onClose={() => {
setShowModal(false);
setSelectedApp(null);
}}
onSuccess={() => {
setShowModal(false);
setSelectedApp(null);
fetchApps();
}}
/>
)}
</div>
);
}
