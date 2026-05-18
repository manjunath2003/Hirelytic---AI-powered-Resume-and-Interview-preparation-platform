import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function GeneratedResumesPage() {
const userId = localStorage.getItem("user_id");
const { jobId } = useParams();
const navigate = useNavigate();

const [resumes, setResumes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [resumeToDelete, setResumeToDelete] = useState(null);
const [toastMsg, setToastMsg] = useState("");
const [openDropdown, setOpenDropdown] = useState(null);

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const sanitizeFilename = (name) =>
name.replace(/[^a-zA-Z0-9 _.-]/g, "");

const checkDuplicateName = (currentId, newName) => {
return resumes.some((r) => {
if (r._id === currentId) return false;
const existing = (r.pdf_filename || r.docx_filename || "")
.replace(/\.(pdf|docx)$/i, "")
.toLowerCase();
return existing === newName.toLowerCase();
});
};

// ------------------------------------------------------------
// FETCH RESUMES
// ------------------------------------------------------------
const fetchResumes = useCallback(async () => {
if (!userId) {
setError("User not found.");
setLoading(false);
return;
}

try {
const res = await fetch(
`http://127.0.0.1:5000/api/resume_ai/list/${userId}`
);
const data = await res.json();

const withState = (data || [])
.map((r) => ({
...r,
isEditing: false,
editName: (r.pdf_filename || r.docx_filename || "").replace(
/\.pdf$|\.docx$/i,
""
),
nameError: "",
animateStar: false,
}))
.sort(
(a, b) =>
new Date(b.created_at || 0) -
new Date(a.created_at || 0)
);

setResumes(withState);
} catch {
setError("Failed to load resumes.");
} finally {
setLoading(false);
}
}, [userId]);

useEffect(() => {
fetchResumes();
}, [fetchResumes]);

// ------------------------------------------------------------
// STAR
// ------------------------------------------------------------
const handleToggleStar = async (resumeId, currentStarred) => {
await fetch(
`http://127.0.0.1:5000/api/resume_ai/toggle_star/${resumeId}`,
{ method: "POST" }
);

setResumes((prev) =>
prev.map((r) =>
r._id === resumeId
? { ...r, starred: !currentStarred, animateStar: true }
: r
)
);

setTimeout(() => {
setResumes((prev) =>
prev.map((r) =>
r._id === resumeId ? { ...r, animateStar: false } : r
)
);
}, 300);
};

// ------------------------------------------------------------
// DOWNLOAD
// ------------------------------------------------------------
const downloadFile = async (url, filename) => {
const res = await fetch(url);
const blob = await res.blob();
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = filename;
a.click();
URL.revokeObjectURL(a.href);
};

// ------------------------------------------------------------
// DELETE
// ------------------------------------------------------------
const openDeleteModal = (id) => {
setResumeToDelete(id);
setShowDeleteModal(true);
};

const confirmDelete = async () => {
await fetch(
`http://127.0.0.1:5000/api/resume_ai/delete/${resumeToDelete}`,
{ method: "DELETE" }
);

setResumes((p) => p.filter((r) => r._id !== resumeToDelete));
setShowDeleteModal(false);
setResumeToDelete(null);
setToastMsg("Resume deleted");
setTimeout(() => setToastMsg(""), 2000);
};

// ------------------------------------------------------------
// APPLY
// ------------------------------------------------------------
const applyWithResume = async (resumeId) => {
await fetch("http://127.0.0.1:5000/api/applications/apply", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
user_id: userId,
job_id: jobId,
resume_id: resumeId,
}),
});
navigate(`/job/${jobId}`);
};

// ------------------------------------------------------------
// RENAME
// ------------------------------------------------------------
const startEditing = (id) => {
setResumes((p) =>
p.map((r) => (r._id === id ? { ...r, isEditing: true } : r))
);
};

const cancelEditing = (id) => {
setResumes((p) =>
p.map((r) =>
r._id === id
? {
...r,
isEditing: false,
nameError: "",
editName: (r.pdf_filename || r.docx_filename || "").replace(
/\.pdf$|\.docx$/i,
""
),
}
: r
)
);
};

const handleEditChange = (id, value) => {
const clean = sanitizeFilename(value);
const duplicate = checkDuplicateName(id, clean);

setResumes((p) =>
p.map((r) =>
r._id === id
? {
...r,
editName: clean,
nameError: duplicate ? "Name already exists" : "",
}
: r
)
);
};

const handleRename = async (resume) => {
if (resume.nameError || !resume.editName.trim()) return;

try {
const res = await fetch(
`http://127.0.0.1:5000/api/resume_builder/rename/${resume._id}`,
{
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ new_name: resume.editName }),
}
);

if (!res.ok) {
console.error("Rename failed with status:", res.status);
return;
}

if (res.status === 409) {
setResumes((p) =>
p.map((r) =>
r._id === resume._id
? { ...r, nameError: "Name already exists" }
: r
)
);
return;
}

const data = await res.json();

setResumes((p) =>
p.map((r) =>
r._id === resume._id
? {
...r,
pdf_filename: data.pdf_filename,
docx_filename: data.docx_filename,
isEditing: false,
nameError: "",
}
: r
)
);
} catch (err) {
console.error("❌ RENAME FETCH ERROR:", err);
}
};


// ------------------------------------------------------------
// RENDER
// ------------------------------------------------------------
return (
<div className="p-6">
<h2 className="text-xl font-bold mb-4">Generated Resumes</h2>

{toastMsg && (
<div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
{toastMsg}
</div>
)}

{loading && <p>Loading...</p>}
{error && <p className="text-red-600">{error}</p>}

{!loading &&
resumes.map((r) => (
<div key={r._id} className="bg-white p-4 mb-4 rounded shadow">
{/* Header */}
<div className="flex justify-between items-center">
{!r.isEditing ? (
<div className="flex items-center gap-2">
<p className="font-semibold">{r.pdf_filename}</p>
<button onClick={() => startEditing(r._id)}>✏️</button>
</div>
) : (
<div>
<div className="flex items-center gap-2">
<input
className="border px-2 py-1 rounded"
value={r.editName}
onChange={(e) =>
handleEditChange(r._id, e.target.value)
}
/>
<button onClick={() => handleRename(r)}>✔</button>
<button onClick={() => cancelEditing(r._id)}>✖</button>
</div>

{r.nameError && (
<p className="text-sm text-red-600 mt-1">
{r.nameError}
</p>
)}
</div>
)}

<button
className={`text-yellow-400 text-xl ${
r.animateStar ? "scale-125" : ""
}`}
onClick={() => handleToggleStar(r._id, !!r.starred)}
>
{r.starred ? "★" : "☆"}
</button>
</div>

<p className="text-sm text-gray-600">
Created: {new Date(r.created_at).toLocaleString()}
</p>

{/* ACTION BUTTONS */}
<div className="flex gap-3 mt-3 flex-wrap">
<button
className="bg-blue-600 text-white px-3 py-1 rounded"
onClick={() =>
window.open(
`http://127.0.0.1:5000/api/resume_builder/preview/${r._id}/pdf`,
"_blank"
)
}
>
Preview
</button>

<div className="relative">
<button
className="bg-green-700 text-white px-3 py-1 rounded"
onClick={() =>
setOpenDropdown(openDropdown === r._id ? null : r._id)
}
>
Download ▼
</button>

{openDropdown === r._id && (
<div className="absolute mt-2 w-28 bg-white border rounded shadow z-50">
<button
className="block w-full text-left px-3 py-2 hover:bg-gray-100"
onClick={() => {
downloadFile(
`http://localhost:5000/api/resume_builder/download/${r._id}/pdf`,
r.pdf_filename
);
setOpenDropdown(null);
}}
>
PDF
</button>

{r.docx_filename && (
<button
className="block w-full text-left px-3 py-2 hover:bg-gray-100"
onClick={() => {
downloadFile(
`http://localhost:5000/api/resume_builder/download/${r._id}/docx`,
r.docx_filename
);
setOpenDropdown(null);
}}
>
DOCX
</button>
)}
</div>
)}
</div>

<button
className="bg-red-600 text-white px-3 py-1 rounded"
onClick={() => openDeleteModal(r._id)}
>
Delete
</button>

{jobId && (
<button
className="bg-purple-600 text-white px-3 py-1 rounded"
onClick={() => applyWithResume(r._id)}
>
Select
</button>
)}
</div>
</div>
))}

{showDeleteModal && (
<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
<div className="bg-white p-6 rounded">
<p>Delete this resume?</p>
<div className="flex gap-3 mt-4">
<button
className="bg-red-600 text-white px-3 py-1"
onClick={confirmDelete}
>
Delete
</button>
<button
className="bg-gray-300 px-3 py-1"
onClick={() => setShowDeleteModal(false)}
>
Cancel
</button>
</div>
</div>
</div>
)}
</div>
);
}
