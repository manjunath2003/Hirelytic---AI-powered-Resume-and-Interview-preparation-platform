import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TeacherJobs() {
const categories = [
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
"Higher Secondary / PUC (PCMCs)",
"Higher Secondary / PUC (Commerce)"
];

const [jobs, setJobs] = useState([]);
const [search, setSearch] = useState("");
const [subject, setSubject] = useState("");
const [location, setLocation] = useState("");
const [category, setCategory] = useState("");

const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const limit = 10;

const userId = localStorage.getItem("user_id");
const [appliedJobs, setAppliedJobs] = useState([]);

// ---------------------------------------------------
// FETCH APPLIED JOBS
// ---------------------------------------------------
// ---------------------------------------------------
// FETCH APPLIED JOBS  ✅ FIXED
// ---------------------------------------------------
const fetchAppliedJobs = async () => {
if (!userId) return;

try {
const res = await axios.get(
    `http://localhost:5000/api/applications/list/${userId}`
);

const appliedIds = res.data.map((item) => item.job_id);
setAppliedJobs(appliedIds);

} catch (err) {
console.log("Applied jobs fetch error:", err);
}
};



// ---------------------------------------------------
// FETCH JOBS WITH FILTERS + PAGINATION
// ---------------------------------------------------
const fetchWithFilters = () => {
axios
.get("http://localhost:5000/api/jobs/search", {
params: {
q: search,
subject,
location,
category,
page,
limit,
},
})
.then((res) => {
setJobs(res.data.jobs);
setTotal(res.data.total);
})
.catch((err) => console.log(err));
};

// Load when page changes
useEffect(() => {
fetchWithFilters();
fetchAppliedJobs();
}, [page]);

useEffect(() => {
console.log("APPLIED JOBS FROM API →", appliedJobs);
}, [appliedJobs]);

// Reset to page 1 when filter changes
useEffect(() => {
setPage(1);
}, [search, subject, location, category]);

return (
<div className="p-6">
<h1 className="text-xl font-bold mb-4">Find Jobs</h1>

{/* Filters */}
<div className="p-4 border rounded mb-5 bg-gray-50">
<input
type="text"
placeholder="Search (title, subject...)"
className="border p-2 mr-2 rounded w-1/3"
value={search}
onChange={(e) => setSearch(e.target.value)}
/>

<input
type="text"
placeholder="Subject"
className="border p-2 mr-2 rounded w-1/4"
value={subject}
onChange={(e) => setSubject(e.target.value)}
/>

<input
type="text"
placeholder="Location"
className="border p-2 mr-2 rounded w-1/4"
value={location}
onChange={(e) => setLocation(e.target.value)}
/>

<select
className="border p-2 rounded mr-2"
onChange={(e) => setCategory(e.target.value)}
>
<option value="">All Categories</option>
{categories.map((cat) => (
<option key={cat} value={cat}>
{cat}
</option>
))}
</select>

<button
onClick={() => setPage(1)}
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Search
</button>

<button
onClick={() => {
setSearch("");
setSubject("");
setLocation("");
setCategory("");
setPage(1);
}}
className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
>
Clear
</button>
</div>

{/* Job Cards */}
<div className="space-y-4">
{jobs.map((job) => {
const isApplied = appliedJobs.includes(job._id);

return (
<div
key={job._id}
className="p-4 border rounded shadow-sm bg-white hover:shadow-md transition"
>
<h2 className="text-lg font-semibold">{job.title}</h2>

<p>
<b>Institution:</b> {job.institution || "Not provided"}
</p>
<p>
<b>Category:</b> {job.category}
</p>
<p>
<b>Subject:</b> {job.subject}
</p>
<p>
<b>Location:</b> {job.location}
</p>

{/* Button + Applied Badge Row */}
<div className="flex items-center gap-3 mt-3">

{/* VIEW DETAILS BUTTON */}
<button
className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
onClick={() => (window.location.href = `/job/${job._id}`)}
>
View Details
</button>

{/* ⭐ APPLIED badge beside button */}
{isApplied && (
<span className="px-3 py-1 text-xs bg-green-600 text-white font-semibold rounded-lg shadow">
✔ Applied
</span>
)}
</div>
</div>
);
})}
</div>

{/* Pagination */}
<div className="flex gap-3 mt-6">
<button
disabled={page === 1}
onClick={() => setPage(page - 1)}
className={`px-3 py-1 rounded ${
page === 1 ? "bg-gray-300" : "bg-blue-600 text-white"
}`}
>
Previous
</button>

<span className="px-3 py-1">Page {page}</span>

<button
disabled={page * limit >= total}
onClick={() => setPage(page + 1)}
className={`px-3 py-1 rounded ${
page * limit >= total ? "bg-gray-300" : "bg-blue-600 text-white"
}`}
>
Next
</button>
</div>
</div>
);
}
