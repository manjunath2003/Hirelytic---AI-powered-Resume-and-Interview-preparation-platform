import { useEffect, useState } from "react";
import axios from "axios";
import AnimatedPage from "../components/AnimatedPage";

export default function RecruiterProfile() {
const userId = localStorage.getItem("user_id");

const [profile, setProfile] = useState(null);
const [form, setForm] = useState({
name: "",
email: "",
phone: "",
institution: "",
role: "",
location: "",
});

const [editing, setEditing] = useState(false);
const [loading, setLoading] = useState(true);
const [toast, setToast] = useState(null);

// -----------------------------
// TOAST HANDLER
// -----------------------------
const showToast = (message, type = "success") => {
setToast({ message, type });
setTimeout(() => setToast(null), 2500);
};

// -----------------------------
// LOAD PROFILE (VIEW MODE)
// -----------------------------
useEffect(() => {
axios
.get(`http://127.0.0.1:5000/api/recruiter-profile/${userId}`)
.then((res) => {
setProfile(res.data || {});
setForm(res.data || {});
})
.catch((err) => {
console.error("Recruiter profile fetch error:", err);
})
.finally(() => setLoading(false));
}, [userId]);

// -----------------------------
// SAVE PROFILE
// -----------------------------
const saveProfile = async () => {
try {
await axios.post(
"http://127.0.0.1:5000/api/recruiter-profile/update",
{ user_id: userId, ...form }
);

setProfile(form);
setEditing(false);
showToast("Profile updated successfully");
} catch (err) {
showToast("Failed to save profile", "error");
}
};

if (loading) {
return (
<div className="bg-white p-8 rounded-xl shadow text-center">
Loading profile…
</div>
);
}

// -----------------------------
// UI
// -----------------------------
return (
<AnimatedPage>
<div className="min-h-screen bg-gray-100 pt-28 px-4">
<div className="bg-white p-8 rounded-2xl shadow max-w-3xl mx-auto relative">

{/* TOAST */}
{toast && (
<div className="fixed top-6 right-6 z-50">
<div
className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white ${
toast.type === "error" ? "bg-red-600" : "bg-green-600"
}`}
>
<span>{toast.type === "error" ? "❌" : "✅"}</span>
<span className="font-medium">{toast.message}</span>
</div>
</div>
)}

{/* HEADER */}
<div className="flex items-center justify-between mb-8">
<h2 className="text-2xl font-bold">Recruiter Profile</h2>

{!editing && (
<button
onClick={() => setEditing(true)}
className="px-5 py-2 bg-purple-600 text-white rounded-lg"
>
Edit Profile
</button>
)}
</div>

{/* DETAILS */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
<Field
label="Name"
value={form.name}
editing={editing}
onChange={(v) => setForm({ ...form, name: v })}
/>

<Field
label="Email"
value={form.email}
editing={editing}
onChange={(v) => setForm({ ...form, email: v })}
/>

<Field
label="Phone"
value={form.phone}
editing={editing}
onChange={(v) => setForm({ ...form, phone: v })}
/>

<Field
label="Institution"
value={form.institution}
editing={editing}
onChange={(v) =>
setForm({ ...form, institution: v })
}
/>

<Field
label="Role"
value={form.role}
editing={editing}
onChange={(v) => setForm({ ...form, role: v })}
/>

<Field
label="Location"
value={form.location}
editing={editing}
onChange={(v) =>
setForm({ ...form, location: v })
}
/>
</div>

{/* SAVE BUTTON */}
{editing && (
<div className="flex justify-end mt-8">
<button
onClick={saveProfile}
className="px-6 py-2 bg-green-600 text-white rounded-lg"
>
Save Changes
</button>
</div>
)}
</div>
</div>
</AnimatedPage>
);
}

// -----------------------------
// FIELD COMPONENT
// -----------------------------
function Field({ label, value, editing, onChange }) {
return (
<div>
<p className="text-sm text-gray-500 mb-1">{label}</p>
{editing ? (
<input
value={value || ""}
onChange={(e) => onChange(e.target.value)}
className="w-full border rounded-lg p-2"
/>
) : (
<p className="text-lg font-medium text-gray-800">
{value || "-"}
</p>
)}
</div>
);
}
