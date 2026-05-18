import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, MapPin, School, IndianRupee, Clock } from "lucide-react";

export default function JobDetails() {
const { jobId } = useParams();
const navigate = useNavigate();

const userId = localStorage.getItem("user_id");

const [job, setJob] = useState(null);
const [applied, setApplied] = useState(false);
const [loading, setLoading] = useState(true);

const [successMsg, setSuccessMsg] = useState(""); // popup alert

// -------------------------------
// FETCH JOB DETAILS
// -------------------------------
const fetchJobDetails = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/jobs/job/${jobId}`
);
setJob(res.data);
} catch (err) {
console.log(err);
}
};

// -------------------------------
// CHECK IF USER ALREADY APPLIED
// -------------------------------
const checkIfApplied = async () => {
try {
const res = await axios.get(
`http://localhost:5000/api/applications/check/${userId}/${jobId}`
);
setApplied(res.data.applied);
} catch (err) {
console.log("Check failed");
}
};

useEffect(() => {
const load = async () => {
await fetchJobDetails();
await checkIfApplied();
setLoading(false);
};
load();
}, []);

// -------------------------------
// SUCCESS MSG POPUP HANDLER
// -------------------------------
const showPopup = (msg) => {
setSuccessMsg(msg);
setTimeout(() => setSuccessMsg(""), 3000);
};

if (loading || !job) {
return (
<div className="p-10 text-center text-gray-500 text-xl">
Loading job details...
</div>
);
}

return (
<div className="p-6 max-w-4xl mx-auto">

{/* ⭐ Success / Error Alert Message */}
{successMsg && (
<div
className="
fixed 
top-10 
left-1/2 
transform -translate-x-1/2 
bg-green-700 
text-white 
font-bold 
text-lg 
px-6 
py-3 
rounded-xl 
shadow-2xl 
z-50 
animate-fade-in
"
>
{successMsg}
</div>
)}

{/* Back Button */}
<button
className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-black"
onClick={() => navigate("/dashboard", { state: { openTab: "jobs" } })}
>
← Back to Jobs
</button>

<div className="bg-white rounded-xl shadow-lg p-8">

{/* Title */}
<h1 className="text-3xl font-bold mb-2 text-gray-900">
{job.title}
</h1>

{/* Institution */}
<p className="text-lg text-gray-700 flex items-center gap-2 mb-6">
<School className="w-5 h-5 text-blue-600" />
<span className="font-semibold">Institution:</span> {job.institution}
</p>

{/* Info Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

<div className="p-5 bg-gray-50 rounded-lg border flex items-start gap-4">
<Briefcase className="w-6 h-6 text-blue-600 mt-1" />
<div>
    <p className="text-gray-500 text-sm">Category</p>
    <p className="font-semibold text-gray-800">{job.category}</p>
</div>
</div>

<div className="p-5 bg-gray-50 rounded-lg border flex items-start gap-4">
<School className="w-6 h-6 text-blue-600 mt-1" />
<div>
    <p className="text-gray-500 text-sm">Subject</p>
    <p className="font-semibold text-gray-800">{job.subject}</p>
</div>
</div>

<div className="p-5 bg-gray-50 rounded-lg border flex items-start gap-4">
<MapPin className="w-6 h-6 text-blue-600 mt-1" />
<div>
    <p className="text-gray-500 text-sm">Location</p>
    <p className="font-semibold text-gray-800">{job.location}</p>
</div>
</div>

<div className="p-5 bg-gray-50 rounded-lg border flex items-start gap-4">
<IndianRupee className="w-6 h-6 text-blue-600 mt-1" />
<div>
    <p className="text-gray-500 text-sm">Salary</p>
    <p className="font-semibold text-gray-800">₹{job.salary}</p>
</div>
</div>

<div className="p-5 bg-gray-50 rounded-lg border flex items-start gap-4">
<Clock className="w-6 h-6 text-blue-600 mt-1" />
<div>
    <p className="text-gray-500 text-sm">Experience Required</p>
    <p className="font-semibold text-gray-800">
    {job.experience_required} years
    </p>
</div>
</div>

</div>

{/* Description */}
<h2 className="text-xl font-bold mb-3">Job Description</h2>
<div className="p-4 bg-gray-50 border rounded-lg text-gray-700 leading-relaxed">
{job.description}
</div>

{/* Apply Button */}
<div className="mt-8">
{!applied ? (
<button
    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded font-bold text-lg hover:bg-blue-700"
    onClick={() => navigate(`/select-resume/${jobId}`)} // ⭐ Redirect to Resume Selection Page
>
    Apply with Generated Resume
</button>
) : (
<button
    disabled
    className="w-full md:w-auto bg-gray-400 text-white px-6 py-3 rounded-lg text-lg cursor-not-allowed"
>
    Already Applied
</button>
)}
</div>

</div>
</div>
);
}
