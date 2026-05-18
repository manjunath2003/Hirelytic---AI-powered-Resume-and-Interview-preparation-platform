import React, { useState } from "react";
import axios from "axios";

export default function RecruiterPostJob() {
const recruiterId = localStorage.getItem("user_id");

const categories = [
"-- Select Category --",
"Pre-Primary (Nursery–KG)",
"Primary (Grades 1–5)",
"Middle School (Grades 6–8)",
"High School Teacher (9–10) – State Board",
"High School Teacher (9–10) – CBSE Board",
"High School Teacher (9–10) – ICSE Board",
"High School Teacher (9–12) – State Board",
"High School Teacher (9–12) – CBSE Board",
"High School Teacher (9–12) – ICSE Board",
"Higher Secondary / PUC (PCMB)",
"Higher Secondary / PUC (PCMCs)",
"Higher Secondary / PUC (Commerce)"
];

const [form, setForm] = useState({
institution:"",
title: "",
category: "",
subject: "",
experience_required: "",
location: "",
salary: "",
description: ""
});

const [toast, setToast] = useState(null);

const showToast = (msg, type = "success") => {
setToast({ msg, type });
setTimeout(() => setToast(null), 2500);
};

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
e.preventDefault();

try {
await axios.post("http://localhost:5000/api/recruiter/jobs/create", {
...form,
posted_by: recruiterId,
institution: form.institution
});

// 1️⃣ Show toast immediately
setToast({
msg: "✅ Job Posted Successfully!",
type: "success",
});

// 2️⃣ Force re-render before redirect
await new Promise((resolve) => setTimeout(resolve, 50));

// 3️⃣ Reset form
setForm({
institution: "",
title: "",
category: "",
subject: "",
experience_required: "",
location: "",
salary: "",
description: "",
});

// 4️⃣ Redirect after 2.5 seconds
setTimeout(() => {
window.location.href = "/employer/dashboard";
}, 2500);

} catch (err) {
console.error(err);
showToast("❌ Job posting failed!", "error");
}
};

return (
<div className="p-6 max-w-xl mx-auto relative">

{/* Toast Notification */}
{toast && (
<div
className={`
fixed top-6 right-6 z-50
px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold
transition-all transform
animate-slide-in
${toast.type === "error" ? "bg-red-600" : "bg-green-600"}
`}
>
{toast.msg}
</div>
)}

<h2 className="text-xl font-bold mb-4">Post a New Job</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<div>
  <label className="block mb-1 font-semibold">Institution Name</label>
  <input
    type="text"
    name="institution"
    value={form.institution}
    onChange={handleChange}
    className="w-full border p-2 rounded"
    required
  />
</div>

<div>
<label className="block mb-1 font-semibold">Job Title</label>
<input
type="text"
name="title"
value={form.title}
onChange={handleChange}
className="w-full border p-2 rounded"
required
/>
</div>

<div>
<label className="block mb-1 font-semibold">Category</label>
<select
name="category"
value={form.category}
onChange={handleChange}
className="w-full border p-2 rounded"
required
>
{categories.map((cat, index) => (
    <option key={index} value={cat}>{cat}</option>
))}
</select>
</div>

<div>
<label className="block mb-1 font-semibold">Subject</label>
<input
type="text"
name="subject"
value={form.subject}
onChange={handleChange}
className="w-full border p-2 rounded"
/>
</div>

<div>
<label className="block mb-1 font-semibold">Experience Required (Years)</label>
<input
type="number"
name="experience_required"
value={form.experience_required}
onChange={handleChange}
className="w-full border p-2 rounded"
required
/>
</div>

<div>
<label className="block mb-1 font-semibold">Location</label>
<input
type="text"
name="location"
value={form.location}
onChange={handleChange}
className="w-full border p-2 rounded"
required
/>
</div>

<div>
<label className="block mb-1 font-semibold">Salary</label>
<input
type="text"
name="salary"
value={form.salary}
onChange={handleChange}
className="w-full border p-2 rounded"
/>
</div>

<div>
<label className="block mb-1 font-semibold">Job Description</label>
<textarea
name="description"
value={form.description}
onChange={handleChange}
className="w-full border p-2 rounded h-28"
required
></textarea>
</div>

<button
type="submit"
className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 transition"
>
Post Job
</button>
</form>
</div>
);
}
