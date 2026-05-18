import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RecruiterJobList() {
const recruiterId = localStorage.getItem("user_id");

const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// pagination
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 4; // jobs per page

// edit state
const [editingId, setEditingId] = useState(null);
const [editForm, setEditForm] = useState({
title: "",
category: "",
subject: "",
experience_required: "",
location: "",
salary: "",
description: "",
});

// delete modal
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [jobToDelete, setJobToDelete] = useState(null);

// toast
const [toast, setToast] = useState(null);
const showToast = (msg, type = "success") => {
setToast({ msg, type });
setTimeout(() => setToast(null), 2500);
};

// -------------------------
// Fetch jobs for this recruiter
// -------------------------
const fetchJobs = async () => {
if (!recruiterId) {
setError("Recruiter not found. Please log in again.");
setLoading(false);
return;
}

setLoading(true);
setError("");

try {
const res = await axios.get(
`http://localhost:5000/api/jobs/employer/${recruiterId}`
);
const data = res.data || [];

// sort newest first
data.sort(
(a, b) =>
new Date(b.created_at || 0).getTime() -
new Date(a.created_at || 0).getTime()
);

setJobs(data);
setCurrentPage(1); // reset to first page when reloading
} catch (err) {
console.error(err);
setError("Could not load jobs. Please try again.");
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchJobs();
}, [recruiterId]);

// -------------------------
// Edit handlers
// -------------------------
const startEdit = (job) => {
setEditingId(job._id);
setEditForm({
institution: job.institution || "",
title: job.title || "",
category: job.category || "",
subject: job.subject || "",
experience_required: job.experience_required || "",
location: job.location || "",
salary: job.salary || "",
description: job.description || "",
});
};

const cancelEdit = () => {
setEditingId(null);
setEditForm({
institution: "",
title: "",
category: "",
subject: "",
experience_required: "",
location: "",
salary: "",
description: "",
});
};

const handleEditChange = (e) => {
setEditForm({ ...editForm, [e.target.name]: e.target.value });
};

const saveEdit = async (jobId) => {
try {
await axios.put(
`http://localhost:5000/api/recruiter/jobs/update/${jobId}`,
editForm
);

setJobs((prev) =>
prev.map((job) =>
job._id === jobId ? { ...job, ...editForm } : job
)
);

showToast("Job updated successfully!");
cancelEdit();
} catch (err) {
console.error(err);
showToast("Failed to update job.", "error");
}
};

// -------------------------
// Delete handlers
// -------------------------
const openDeleteModal = (jobId) => {
setJobToDelete(jobId);
setShowDeleteModal(true);
};

const confirmDelete = async () => {
if (!jobToDelete) return;

try {
await axios.delete(
`http://localhost:5000/api/recruiter/jobs/delete/${jobToDelete}`
);

setJobs((prev) => prev.filter((j) => j._id !== jobToDelete));
showToast("Job deleted successfully.");

setShowDeleteModal(false);
setJobToDelete(null);

// fix edge case: if last item on last page removed, go back one page
setCurrentPage((prevPage) => {
const totalPages = Math.max(
1,
Math.ceil((jobs.length - 1) / pageSize)
);
return Math.min(prevPage, totalPages);
});
} catch (err) {
console.error(err);
showToast("Failed to delete job.", "error");
}
};

// -------------------------
// Pagination helpers
// -------------------------
const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
const startIndex = (currentPage - 1) * pageSize;
const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

const goToPage = (page) => {
if (page < 1 || page > totalPages) return;
setCurrentPage(page);
};

// -------------------------
// JSX
// -------------------------
return (
<div className="p-6">
{/* Toast */}
{toast && (
<div
className={`fixed top-5 right-5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
transition-all transform 
${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}
>
{toast.msg}
</div>
)}

<h2 className="text-2xl font-bold mb-4 text-gray-800">My Job Posts</h2>

{error && (
<div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm">
{error}
</div>
)}

{loading ? (
<p className="text-gray-600">Loading jobs...</p>
) : jobs.length === 0 ? (
<p className="text-gray-600">You haven&apos;t posted any jobs yet.</p>
) : (
<>
{/* JOB CARDS */}
<div className="grid md:grid-cols-2 gap-4">
{paginatedJobs.map((job) => {
const isEditing = editingId === job._id;

return (
<div
    key={job._id}
    className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col justify-between hover:shadow-lg transition"
>
    {/* Top: title + category */}
    <div>
    {isEditing ? (
        <>
        <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            className="w-full border rounded-lg px-2 py-1 mb-2 text-lg font-semibold"
        />
        <input
            type="text"
            name="category"
            value={editForm.category}
            onChange={handleEditChange}
            className="w-full border rounded-lg px-2 py-1 mb-2 text-sm text-gray-700"
            placeholder="Category"
        />
        </>
    ) : (
        <>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
        </h3>
        <p className="text-xs inline-block px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 mb-2">
            {job.category}
        </p>
        </>
    )}

    {/* Meta info */}
    <div className="text-sm text-gray-700 space-y-1 mb-2">
        <p>
<span className="font-semibold">Institution:</span>{" "}
{isEditing ? (
<input
    type="text"
    name="institution"
    value={editForm.institution}
    onChange={handleEditChange}
    className="border rounded px-2 py-1 w-full"
/>
) : (
job.institution || "—"
)}
</p>

        <p>
        <span className="font-semibold">Subject:</span>{" "}
        {isEditing ? (
            <input
            type="text"
            name="subject"
            value={editForm.subject}
            onChange={handleEditChange}
            className="border rounded px-2 py-1 w-full"
            />
        ) : (
            job.subject || "—"
        )}
        </p>

        <p>
        <span className="font-semibold">Experience:</span>{" "}
        {isEditing ? (
            <input
            type="number"
            name="experience_required"
            value={editForm.experience_required}
            onChange={handleEditChange}
            className="border rounded px-2 py-1 w-20"
            />
        ) : (
            `${job.experience_required} yrs`
        )}
        </p>

        <p>
        <span className="font-semibold">Location:</span>{" "}
        {isEditing ? (
            <input
            type="text"
            name="location"
            value={editForm.location}
            onChange={handleEditChange}
            className="border rounded px-2 py-1 w-full"
            />
        ) : (
            job.location
        )}
        </p>

        <p>
        <span className="font-semibold">Salary:</span>{" "}
        {isEditing ? (
            <input
            type="text"
            name="salary"
            value={editForm.salary}
            onChange={handleEditChange}
            className="border rounded px-2 py-1 w-full"
            />
        ) : (
            (job.salary && `₹${job.salary}`) || "Not specified"
        )}
        </p>
    </div>

    {/* Description */}
    <div className="text-sm text-gray-700">
        <p className="font-semibold mb-1">Description:</p>
        {isEditing ? (
        <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            className="w-full border rounded-lg px-2 py-1 h-20"
        />
        ) : (
        <p className="line-clamp-3">{job.description}</p>
        )}
    </div>
    </div>

    {/* Buttons */}
    <div className="mt-4 flex justify-between items-center">
    <p className="text-xs text-gray-500">
        Posted on{" "}
        {job.created_at
        ? new Date(job.created_at).toLocaleString()
        : "—"}
    </p>

    <div className="flex gap-2">
        {isEditing ? (
        <>
            <button
            type="button"
            onClick={() => saveEdit(job._id)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700"
            >
            Save
            </button>
            <button
            type="button"
            onClick={cancelEdit}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
            Cancel
            </button>
        </>
        ) : (
        <button
            type="button"
            onClick={() => startEdit(job)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
        >
            Edit
        </button>
        )}

        <button
        type="button"
        onClick={() => openDeleteModal(job._id)}
        className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
        >
        Delete
        </button>
    </div>
    </div>
</div>
);
})}
</div>

{/* PAGINATION CONTROLS */}
{totalPages > 1 && (
<div className="flex items-center justify-center gap-2 mt-6">
<button
onClick={() => goToPage(currentPage - 1)}
disabled={currentPage === 1}
className={`px-3 py-1 text-sm rounded-lg border ${
    currentPage === 1
    ? "text-gray-400 border-gray-200 cursor-not-allowed"
    : "text-gray-700 border-gray-300 hover:bg-gray-100"
}`}
>
Prev
</button>

{Array.from({ length: totalPages }).map((_, idx) => {
const page = idx + 1;
return (
    <button
    key={page}
    onClick={() => goToPage(page)}
    className={`px-3 py-1 text-sm rounded-lg border ${
        currentPage === page
        ? "bg-blue-600 text-white border-blue-600"
        : "border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
    >
    {page}
    </button>
);
})}

<button
onClick={() => goToPage(currentPage + 1)}
disabled={currentPage === totalPages}
className={`px-3 py-1 text-sm rounded-lg border ${
    currentPage === totalPages
    ? "text-gray-400 border-gray-200 cursor-not-allowed"
    : "text-gray-700 border-gray-300 hover:bg-gray-100"
}`}
>
Next
</button>
</div>
)}
</>
)}

{/* DELETE MODAL */}
{showDeleteModal && (
<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
<div className="bg-white rounded-xl shadow-xl p-6 w-[350px] animate-fadeIn">
<h3 className="text-lg font-semibold text-gray-800 mb-3">
Delete Job?
</h3>
<p className="text-gray-600 mb-6 text-sm">
Are you sure you want to delete this job post? This action cannot
be undone.
</p>
<div className="flex justify-end gap-3">
<button
className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
onClick={() => {
    setShowDeleteModal(false);
    setJobToDelete(null);
}}
>
Cancel
</button>
<button
className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
onClick={confirmDelete}
>
Delete
</button>
</div>
</div>
</div>
)}
</div>
);
}