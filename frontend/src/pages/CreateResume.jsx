import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateResume() {
const userId = localStorage.getItem("user_id");
const navigate = useNavigate();

const [loading, setLoading] = useState(false);
const [toast, setToast] = useState(null);
const showToast = (msg, type = "success") => {
setToast({ msg, type });
setTimeout(() => setToast(null), 2500);
};

const [step, setStep] = useState(1); // 1 = Form, 2 = Template Selection
const [generatedPdf, setGeneratedPdf] = useState(null);
const [generatedDocx, setGeneratedDocx] = useState(null);
const [resumeData, setResumeData] = useState(null);
const [resumeId, setResumeId] = useState(null);

// ---------------- TEMPLATE STATE ----------------
const [selectedTemplate, setSelectedTemplate] = useState("teacher_classic");
const [previewTemplate, setPreviewTemplate] = useState(null);

const templates = [
{
id: "teacher_classic",
name: "Classic",
description: "Formal, traditional layout – best for schools",
image: "/templates/classic.png",
},
{
id: "teacher_modern",
name: "Modern",
description: "Clean, modern design – best for private institutions",
image: "/templates/modern.png",
},
{
id: "teacher_minimal",
name: "Minimal",
description: "Simple, ATS-friendly, good design, content-focused",
image: "/templates/minimal.png",
},
];

// ---------------- FORM STATE ----------------
const [form, setForm] = useState({
personal: {
fullName: "",
email: "",
phone: "",
location: "",
linkedin: "",
},
summary: "",
skills: "",
experience: [
{ role: "", institution: "", duration: "", responsibilities: "" },
],
education: [{ degree: "", institution: "", year: "" }],
projects: [{ title: "", description: "" }],
certifications: "",
strengths: "",
});

const [errors, setErrors] = useState({});

// ---------------- VALIDATION ----------------
const validateForm = () => {
const newErrors = {};

// 🔹 PERSONAL INFO
if (!form.personal.fullName.trim()) newErrors.fullName = "Name is required";

if (!form.personal.email.match(/^\S+@\S+\.\S+$/))
newErrors.email = "Valid email is required";

if (!form.personal.phone || form.personal.phone.length < 10)
newErrors.phone = "Valid phone number is required";

if (!form.personal.location.trim()) newErrors.location = "Location is required";

if (!form.personal.linkedin.trim()) newErrors.linkedin = "LinkedIn is required";

// 🔹 SUMMARY
if (!form.summary.trim()) newErrors.summary = "Summary is required";

// 🔹 SKILLS
if (!form.skills.trim()) newErrors.skills = "Skills are required";

// 🔹 EXPERIENCE
form.experience.forEach((exp, i) => {
if (!exp.role.trim()) newErrors[`exp_role_${i}`] = "Role required";
if (!exp.institution.trim()) newErrors[`exp_inst_${i}`] = "Institution required";
if (!exp.duration.trim()) newErrors[`exp_dur_${i}`] = "Duration required";
if (!exp.responsibilities.trim())
newErrors[`exp_resp_${i}`] = "Responsibilities required";
});

// 🔹 EDUCATION
form.education.forEach((edu, i) => {
if (!edu.degree.trim()) newErrors[`edu_deg_${i}`] = "Degree required";
if (!edu.institution.trim()) newErrors[`edu_inst_${i}`] = "Institution required";
if (!edu.year.trim()) newErrors[`edu_year_${i}`] = "Year required";
});

// 🔹 PROJECTS
form.projects.forEach((proj, i) => {
if (!proj.title.trim()) newErrors[`proj_title_${i}`] = "Title required";
if (!proj.description.trim()) newErrors[`proj_desc_${i}`] = "Description required";
});

// 🔹 CERTIFICATIONS
if (!form.certifications.trim()) newErrors.certifications = "Certifications required";

// 🔹 STRENGTHS
if (!form.strengths.trim()) newErrors.strengths = "Strengths required";

setErrors(newErrors);

return Object.keys(newErrors).length === 0;
};

if (!userId) {
return <div className="p-6 text-red-600">User not logged in.</div>;
}

// ---------------- HELPERS ----------------
const updatePersonal = (key, value) => {
setForm((p) => ({
...p,
personal: { ...p.personal, [key]: value },
}));
if (errors[key]) setErrors({ ...errors, [key]: null });
};

const updateExperience = (i, key, value) => {
const exp = [...form.experience];
exp[i][key] = value;
setForm({ ...form, experience: exp });
};

const updateEducation = (i, key, value) => {
const edu = [...form.education];
edu[i][key] = value;
setForm({ ...form, education: edu });
};

const updateProject = (i, key, value) => {
const proj = [...form.projects];
proj[i][key] = value;
setForm({ ...form, projects: proj });
};

// ---------------- ADD / REMOVE HANDLERS ----------------
const addExperience = () => {
if (form.experience.length >= 5) {
showToast("Maximum 5 teaching experiences allowed", "error");
return;
}
setForm({
...form,
experience: [
...form.experience,
{ role: "", institution: "", duration: "", responsibilities: "" },
],
});
};

const removeExperience = (index) => {
if (form.experience.length === 1) return;
setForm({
...form,
experience: form.experience.filter((_, i) => i !== index),
});
};

const addEducation = () => {
if (form.education.length >= 5) {
showToast("Maximum 5 education entries allowed", "error");
return;
}
setForm({
...form,
education: [...form.education, { degree: "", institution: "", year: "" }],
});
};

const removeEducation = (index) => {
if (form.education.length === 1) return;
setForm({
...form,
education: form.education.filter((_, i) => i !== index),
});
};

const addProject = () => {
if (form.projects.length >= 5) {
showToast("Maximum 5 projects allowed", "error");
return;
}
setForm({
...form,
projects: [...form.projects, { title: "", description: "" }],
});
};

const removeProject = (index) => {
if (form.projects.length === 1) return;
setForm({
...form,
projects: form.projects.filter((_, i) => i !== index),
});
};

// ---------------- GENERATE RESUME ----------------
const generateResume = async () => {
setLoading(true);
showToast("Generating teacher resume...");

try {
const payload = {
    template: selectedTemplate,
    personal: form.personal,
    summary: form.summary,
    skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    experience: form.experience,
    education: form.education,
    projects: form.projects, // Backend expects list of {title, description}
    strengths: form.strengths.split(",").map((s) => s.trim()).filter(Boolean),
    certifications: form.certifications
        .split("\n")
        .map((c) => ({ title: c.trim() })) // Changed to match backend expectation
        .filter(c => c.title),
};

const res = await axios.post(
`http://localhost:5000/api/resume_builder/create/${userId}`,
payload
);

if (res.data?.content) {
    setResumeData(res.data.content);
    setGeneratedPdf(res.data.pdf_filename);
    setGeneratedDocx(res.data.docx_filename);
    setResumeId(res.data.resume_id);   // ✅ ADD THIS
    showToast("Resume created successfully!");
}
} catch (err) {
console.error(err);
showToast(err.response?.data?.error || "Resume creation failed", "error");
} finally {
setLoading(false);
}
};

const handleShowTemplates = () => {
if (validateForm()) {
setStep(2); // Toggle to Template Selection View
window.scrollTo({ top: 0, behavior: "smooth" });
} else {
showToast("Please fill all required fields", "error");
}
};

return (
<>
{toast && (
<div
className={`fixed top-5 right-5 px-4 py-2 text-white rounded shadow-lg z-[100] ${
toast.type === "error" ? "bg-red-600" : "bg-green-600"
}`}
>
{toast.msg}
</div>
)}

<div className="bg-white p-6 rounded-xl shadow-md min-h-screen">


{/* --- STEP 1: FORM INPUTS --- */}
{step === 1 && (
<>
<h2 className="text-2xl font-bold mb-4">Create Teacher Resume</h2>

<h3 className="font-semibold mb-2">Personal Information</h3>
<div className="space-y-2 mb-4">
<input
className={`border p-2 w-full ${errors.fullName ? "border-red-500" : ""}`}
placeholder="Full Name"
value={form.personal.fullName}
onChange={(e) => updatePersonal("fullName", e.target.value)}
/>
{errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}

<input
className={`border p-2 w-full ${errors.email ? "border-red-500" : ""}`}
placeholder="Email Address"
value={form.personal.email}
onChange={(e) => updatePersonal("email", e.target.value)}
/>
{errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

<input
className={`border p-2 w-full ${errors.phone ? "border-red-500" : ""}`}
placeholder="Phone Number"
value={form.personal.phone}
onChange={(e) => updatePersonal("phone", e.target.value)}
/>
{errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

<input
className={`border p-2 w-full ${errors.location ? "border-red-500" : ""}`}
placeholder="Location (e.g. Bangalore, Karnataka)"
value={form.personal.location}
onChange={(e) => updatePersonal("location", e.target.value)}
/>
{errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}

<input
className={`border p-2 w-full ${errors.linkedin ? "border-red-500" : ""}`}
placeholder="LinkedIn or Portfolio Link"
value={form.personal.linkedin}
onChange={(e) => updatePersonal("linkedin", e.target.value)}
/>
{errors.linkedin && <p className="text-red-500 text-xs">{errors.linkedin}</p>}
</div>

<h3 className="font-semibold mb-2">Professional Summary (Teaching Philosophy)</h3>
<textarea
className={`border p-2 w-full mb-4 ${errors.summary ? "border-red-500" : ""}`}
rows={4}
placeholder="E.g. Dedicated Primary Teacher with 5 years of experience in creating inclusive classroom environments..."
value={form.summary}
onChange={(e) => setForm({ ...form, summary: e.target.value })}
/>
{errors.summary && <p className="text-red-500 text-xs">{errors.summary}</p>}

<h3 className="font-semibold mb-2">Teaching Skills (comma separated)</h3>
<input
className={`border p-2 w-full mb-4 ${errors.skills ? "border-red-500" : ""}`}
placeholder="Classroom Management, Lesson Planning, Curriculum Development, Student Evaluation..."
value={form.skills}
onChange={(e) => setForm({ ...form, skills: e.target.value })}
/>
{errors.skills && <p className="text-red-500 text-xs">{errors.skills}</p>}

<h3 className="font-semibold mb-2">Teaching Experience</h3>
{form.experience.map((exp, i) => (
<div key={i} className="border p-3 mb-3 rounded relative bg-gray-50">

{form.experience.length > 1 && (
<button
  onClick={() => removeExperience(i)}
  className="absolute top-2 right-2 text-red-500 font-bold"
>
  Remove
</button>
)}

<input
  className="border p-2 w-full mb-2"
  placeholder="Position (e.g. Senior Mathematics Teacher)"
  value={exp.role}
  onChange={(e) => updateExperience(i, "role", e.target.value)}
/>

<input
  className="border p-2 w-full mb-2"
  placeholder="School / Institution Name"
  value={exp.institution}
  onChange={(e) => updateExperience(i, "institution", e.target.value)}
/>

<input
  className="border p-2 w-full mb-2"
  placeholder="Duration (e.g. June 2020 - Present)"
  value={exp.duration}
  onChange={(e) => updateExperience(i, "duration", e.target.value)}
/>

<textarea
  className="border p-2 w-full"
  rows={3}
  placeholder="Key Responsibilities & Achievements"
  value={exp.responsibilities}
  onChange={(e) => updateExperience(i, "responsibilities", e.target.value)}
/>

</div>
))}

<button
type="button"
onClick={addExperience}
className="text-green-700 font-semibold text-sm mb-6"
>
+ Add Teaching Experience
</button>


<h3 className="font-semibold mb-2">Academic Qualifications</h3>
{form.education.map((edu, i) => (
<div key={i} className="border p-3 mb-3 rounded relative bg-gray-50">

{form.education.length > 1 && (
<button
  onClick={() => removeEducation(i)}
  className="absolute top-2 right-2 text-red-500 font-bold"
>
  Remove
</button>
)}

<input
  className="border p-2 w-full mb-2"
  placeholder="Degree"
  value={edu.degree}
  onChange={(e) => updateEducation(i, "degree", e.target.value)}
/>

<input
  className="border p-2 w-full mb-2"
  placeholder="Institution"
  value={edu.institution}
  onChange={(e) => updateEducation(i, "institution", e.target.value)}
/>

<input
  className="border p-2 w-full"
  placeholder="Year"
  value={edu.year}
  onChange={(e) => updateEducation(i, "year", e.target.value)}
/>

</div>
))}

<button
type="button"
onClick={addEducation}
className="text-green-700 font-semibold text-sm mb-6"
>
+ Add Education Entry
</button>


{/* 🔥 PROJECTS SECTION */}
<h3 className="font-semibold mb-2">Projects</h3>

{form.projects.map((proj, i) => (
<div key={i} className="border p-3 mb-3 rounded bg-gray-50">

<input
className="border p-2 w-full mb-2"
placeholder="Project Title"
value={proj.title}
onChange={(e) => updateProject(i, "title", e.target.value)}
/>

<textarea
className="border p-2 w-full mb-2"
rows={2}
placeholder="Project Description"
value={proj.description}
onChange={(e) => updateProject(i, "description", e.target.value)}
/>

{form.projects.length > 1 && (
<button
type="button"
onClick={() => removeProject(i)}
className="text-red-600 text-sm"
>
Remove
</button>
)}

</div>
))}

<button
type="button"
onClick={addProject}
className="text-green-700 font-semibold text-sm mb-6"
>
+ Add Project
</button>


<h3 className="font-semibold mb-2">Certifications</h3>
<textarea
className={`border p-2 w-full mb-4 ${errors.certifications ? "border-red-500" : ""}`}
rows={3}
value={form.certifications}
onChange={(e) => setForm({ ...form, certifications: e.target.value })}
/>
{errors.certifications && <p className="text-red-500 text-xs">{errors.certifications}</p>}

<h3 className="font-semibold mb-2">Core Strengths</h3>
<input
className={`border p-2 w-full mb-6 ${errors.strengths ? "border-red-500" : ""}`}
value={form.strengths}
onChange={(e) => setForm({ ...form, strengths: e.target.value })}
/>
{errors.strengths && <p className="text-red-500 text-xs">{errors.strengths}</p>}

<button
onClick={handleShowTemplates}
className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
>
Select Templates for Resume Creation
</button>
</>
)}

{/* --- STEP 2: TEMPLATE SELECTION AND RESULTS --- */}
{step === 2 && (
<div className="animate-in fade-in slide-in-from-right-10 duration-500">
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold">Select Template to Create Resume</h2>

<button
onClick={() => {
  setStep(1);
  setResumeData(null);
}}
className="text-blue-600 font-semibold hover:underline"
>
← Back to Edit Details
</button>
</div>

{/* 🔥 HIDE TEMPLATE CARDS AFTER RESUME GENERATED */}
{!resumeData && (
<>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {templates.map((t) => (
    <div
      key={t.id}
      className={`border-2 rounded-xl p-4 transition-all shadow-sm ${
        selectedTemplate === t.id
          ? "border-green-600 bg-green-50 ring-2 ring-green-500"
          : "bg-white hover:border-gray-300"
      }`}
    >
      <h4 className="font-bold text-xl">{t.name}</h4>
      <p className="text-gray-600 mt-2 text-sm">{t.description}</p>

      <button
        type="button"
        onClick={() => setPreviewTemplate(t)}
        className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
      >
        Preview Template
      </button>

      <button
        type="button"
        onClick={() => setSelectedTemplate(t.id)}
        className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Select Template
      </button>

      {selectedTemplate === t.id && (
        <p className="text-green-600 font-bold mt-2 text-center">✓ Selected</p>
      )}
    </div>
  ))}
</div>

<button
  onClick={generateResume}
  disabled={loading}
  className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all shadow-md ${
    loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"
  }`}
>
  {loading ? "Generating Resume..." : "Finalize & Generate Resume"}
</button>
</>
)}

{/* 🔥 TEMPLATE PREVIEW MODAL */}
{previewTemplate && (
<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-4 max-w-3xl w-full relative">
  <button
    onClick={() => setPreviewTemplate(null)}
    className="absolute top-2 right-3 text-2xl font-bold text-gray-600 hover:text-black"
  >
    ×
  </button>

  <h3 className="text-xl font-semibold mb-3 text-center">
    {previewTemplate.name} Template Preview
  </h3>

  <img
    src={previewTemplate.image}
    alt={previewTemplate.name}
    className="w-full max-h-[80vh] object-contain rounded-lg border"
  />
</div>
</div>
)}

{resumeData && (
<div className="mt-8 p-10 border-2 border-dashed border-green-300 rounded-2xl bg-green-50 text-center">

<h3 className="text-3xl font-bold mb-6 text-green-800">
✨ Your Resume is Ready!
</h3>

<div className="flex flex-wrap justify-center gap-6 mb-10">

<button
className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold"
onClick={() =>
window.open(
`http://localhost:5000/api/resume_builder/preview/${resumeId}/pdf`
)
}
>
Preview PDF
</button>

<button
className="px-8 py-3 bg-green-700 text-white rounded-lg font-bold"
onClick={() =>
window.open(
`http://localhost:5000/api/resume_builder/download/${resumeId}/pdf`
)
}
>
Download PDF
</button>

{generatedDocx && (
<button
className="px-8 py-3 bg-gray-700 text-white rounded-lg font-bold"
onClick={() =>
window.open(
`http://localhost:5000/api/resume_builder/download/${resumeId}/docx`
)
}
>
Download DOCX
</button>
)}

</div>


</div>
)}

{/* 🔥 DASHBOARD BUTTON */}
<div className="border-t border-green-200 pt-8 mt-10 flex justify-center">
<button
onClick={() => navigate("/dashboard")}
className="px-12 py-4 bg-black text-white rounded-xl font-bold text-xl hover:bg-gray-900 transition-all shadow-xl"
>
Return to Dashboard
</button>
</div>
</div>
)}
</div>
</>
);
}
