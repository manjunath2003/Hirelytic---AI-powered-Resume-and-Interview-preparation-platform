import { useState } from "react";
import axios from "axios";

export default function ScheduleInterviewModal({
application,
onClose,
onSuccess,
}) {
const [form, setForm] = useState({
date: "",
time: "",
mode: "online",
contact_email: "",
contact_phone: "",
});

const [loading, setLoading] = useState(false);

// ✅ NEW: success message state
const [successMessage, setSuccessMessage] = useState("");

// ----------------------------------
// 📤 SUBMIT SCHEDULE
// ----------------------------------
const submit = async () => {
if (!form.date || !form.time) {
alert("Please select date and time");
return;
}

setLoading(true);

try {
await axios.post(
"http://127.0.0.1:5000/api/interview-schedule/schedule",
{
application_id: application._id,
teacher_id: application.user_id,
interview: {
date: form.date,
time: form.time,
mode: form.mode,
contact_email: form.contact_email,
contact_phone: form.contact_phone,
},
},
{
withCredentials: false, // ✅ ADD THIS
}
);

// ✅ NEW: show success message
setSuccessMessage("Interview scheduled successfully ✅");

onSuccess();

// ✅ NEW: delay close so user can see success
setTimeout(() => {
onClose();
}, 1200);

} catch (err) {
console.error("Schedule interview failed", err.response?.data || err);
alert("Failed to schedule interview");
} finally {
setLoading(false);
}
};

// ----------------------------------
// 🎨 UI
// ----------------------------------
return (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white p-6 rounded-xl w-[420px] shadow-lg">
<h2 className="text-xl font-bold mb-4">Schedule Interview</h2>

{/* ✅ NEW: success message UI */}
{successMessage && (
<div className="mb-4 p-2 text-green-700 bg-green-100 border border-green-300 rounded text-sm">
{successMessage}
</div>
)}

<input
type="date"
className="w-full border p-2 mb-3 rounded"
value={form.date}
onChange={(e) =>
setForm({ ...form, date: e.target.value })
}
/>

<input
type="time"
className="w-full border p-2 mb-3 rounded"
value={form.time}
onChange={(e) =>
setForm({ ...form, time: e.target.value })
}
/>

<select
className="w-full border p-2 mb-3 rounded"
value={form.mode}
onChange={(e) =>
setForm({ ...form, mode: e.target.value })
}
>
<option value="online">Online</option>
<option value="offline">Offline</option>
</select>

<input
type="email"
placeholder="Contact Email"
className="w-full border p-2 mb-3 rounded"
value={form.contact_email}
onChange={(e) =>
setForm({ ...form, contact_email: e.target.value })
}
/>

<input
type="text"
placeholder="Contact Phone"
className="w-full border p-2 mb-4 rounded"
value={form.contact_phone}
onChange={(e) =>
setForm({ ...form, contact_phone: e.target.value })
}
/>

<div className="flex justify-end gap-3">
<button
onClick={onClose}
className="px-4 py-2 border rounded"
>
Cancel
</button>

<button
onClick={submit}
disabled={loading}
className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
>
{loading ? "Scheduling..." : "Schedule Interview"}
</button>
</div>
</div>
</div>
);
}
