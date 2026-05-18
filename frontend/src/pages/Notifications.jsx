import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Video } from "lucide-react";

export default function Notifications({ onClearBadge }) {
const userId = localStorage.getItem("user_id");
const [notifications, setNotifications] = useState([]);
const [loading, setLoading] = useState(true);

const fetchNotifications = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/notifications/${userId}`
);
setNotifications(res.data || []);
} catch (err) {
console.error("Notification fetch error", err);
} finally {
setLoading(false);
}
};

// 🔔 MARK AS READ WHEN OPENED
const markAsRead = async () => {
try {
await axios.post(
`http://localhost:5000/api/notifications/mark-read/${userId}`
);
if (onClearBadge) onClearBadge(); // clear sidebar badge
} catch (err) {
console.error("Mark read error", err);
}
};

useEffect(() => {
fetchNotifications();
markAsRead();
}, []);

if (loading) return <p>Loading notifications...</p>;

if (notifications.length === 0) {
return (
<div className="bg-white p-6 rounded-xl shadow">
<p className="text-gray-500">No notifications yet.</p>
</div>
);
}

return (
<div className="space-y-4">
<h2 className="text-2xl font-bold mb-4">Notifications</h2>

{notifications.map((n) => {
const meta = n.meta || {};

/* ================= INTERVIEW ================= */
if (n.type === "interview") {
return (
<div
key={n._id}
className="bg-white p-5 rounded-xl shadow border-l-4 border-green-500"
>
<div className="flex items-center gap-2 mb-3">
<CheckCircle className="text-green-600" />
<span className="font-semibold text-green-700">
Interview Scheduled
</span>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
<p><strong>Date:</strong> {meta.date}</p>
<p><strong>Time:</strong> {meta.time}</p>
<p><strong>Mode:</strong> {meta.mode}</p>
<p><strong>Email:</strong> {meta.contact_email}</p>
<p><strong>Phone:</strong> {meta.contact_phone}</p>
</div>

{meta.meeting_link && (
<a
href={meta.meeting_link}
target="_blank"
rel="noopener noreferrer"
className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
>
<Video size={18} />
Join Interview
</a>
)}
</div>
);
}

/* ================= REJECTION ================= */
if (n.type === "rejection") {
return (
<div
key={n._id}
className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500"
>
<div className="flex items-center gap-2 mb-2">
<XCircle className="text-red-600" />
<span className="font-semibold text-red-700">
Application Rejected
</span>
</div>

{/* JOB DETAILS */}
{meta.job_title && (
<p className="text-sm">
<strong>Job:</strong> {meta.job_title}
</p>
)}

{meta.institution && (
<p className="text-sm">
<strong>Institution:</strong> {meta.institution}
</p>
)}

<p className="text-gray-700 text-sm mt-2">
{n.message || "Your application was not selected for this role."}
</p>
</div>
);
}

return null;
})}
</div>
);
}
