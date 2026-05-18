import { useEffect, useState } from "react";
import axios from "axios";
import { Video, Calendar, Clock } from "lucide-react";

export default function RecruiterInterviews() {
const recruiterId = localStorage.getItem("user_id");
const [apps, setApps] = useState([]);
const [loading, setLoading] = useState(true);

const fetchInterviews = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/jobs/recruiter/applications/${recruiterId}`
);

const shortlisted = (res.data || []).filter(
(a) => a.status === "shortlisted" && a.interview
);

setApps(shortlisted);
} catch (err) {
console.error("Interview fetch error", err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchInterviews();
}, []);

if (loading) return <p>Loading interviews...</p>;

if (apps.length === 0) {
return (
<div className="bg-white p-6 rounded-xl shadow">
<p className="text-gray-500">No interviews scheduled yet.</p>
</div>
);
}

return (
<div className="space-y-5">
{apps.map((app) => {
const interview = app.interview;

return (
<div
key={app._id}
className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500"
>
{/* JOB */}
<h3 className="text-lg font-semibold">
{app.job_title}
</h3>
<p className="text-sm text-gray-600 mb-4">
{app.institution}
</p>

{/* CANDIDATE */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
<p><strong>Name:</strong> {app.applicant_name}</p>
<p><strong>Email:</strong> {app.applicant_email}</p>
<p><strong>Phone:</strong> {app.applicant_phone}</p>
<p><strong>Experience:</strong> {app.applicant_experience}</p>
</div>

{/* INTERVIEW DETAILS */}
<div className="flex flex-wrap gap-4 text-sm mb-4">
<span className="flex items-center gap-1">
<Calendar size={16} /> {interview.date}
</span>
<span className="flex items-center gap-1">
<Clock size={16} /> {interview.time}
</span>
<span>
<strong>Mode:</strong> {interview.mode}
</span>
</div>

{/* JOIN LINK */}
{interview.meeting_link && (
<a
href={interview.meeting_link}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
>
<Video size={18} />
Join Interview
</a>
)}
</div>
);
})}
</div>
);
}
