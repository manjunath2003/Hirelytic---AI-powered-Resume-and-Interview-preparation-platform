import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedPage from "../components/AnimatedPage";
import GlobalLoader from "../components/GlobalLoader";
import ExampleChart from "../components/ExampleChart";
import BuildResume from "../pages/BuildResume";
import CreateResume from "../pages/CreateResume.jsx";
import GeneratedResumesPage from "../pages/GeneratedResumePage";
import TeacherJobs from "../pages/TeacherJobs";
import AppliedJobs from "../pages/AppliedJobs";
import InterviewPrep from "../pages/InterviewPreparation";
import { useLocation } from "react-router-dom";
import Notifications from "../pages/Notifications";

// FIX: Imported the missing FeedbackTab component
import FeedbackTab from "../components/FeedbackTab"; 

import TeacherAnalytics from "../components/TeacherAnalytics"; // 🆕 Import the new file

export default function TeacherDashboard() {
// -----------------------------------
// BASIC SESSION VALUES
// -----------------------------------
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const teacherName = localStorage.getItem("name") || "Teacher";
const location = useLocation();

useEffect(() => {
if (!token || !userId) {
localStorage.clear();
window.location.href = "/login";
}
}, [token, userId]); // FIX: Added dependencies to avoid ESLint warning

// -----------------------------------
// STATE
// -----------------------------------
const [sidebarOpen, setSidebarOpen] = useState(true);
const [activeTab, setActiveTab] = useState(location.state?.openTab || "dashboard");
const [loading, setLoading] = useState(true);

const [profile, setProfile] = useState({});
// Note: resumePreview and uploading were removed here because they were unused
const [recommendedJobs, setRecommendedJobs] = useState([]);
const [latestSkill, setLatestSkill] = useState(null);
const [unreadNotifications, setUnreadNotifications] = useState(0);

// Real profile strength & missing fields
const [strength, setStrength] = useState(0);
const [missingFields, setMissingFields] = useState([]);

// Resume & combined strength
const [resumeStrength, setResumeStrength] = useState(0);
const [combinedStrength, setCombinedStrength] = useState(0);

// Session validity (for redirect)
const [sessionValid, setSessionValid] = useState(!!userId);

// Redirect to login if no user session
useEffect(() => {
if (!userId) {
setSessionValid(false);
window.location.href = "/login";
} else {
setSessionValid(true);
}
}, [userId]);

// Loader delay
useEffect(() => {
const t = setTimeout(() => setLoading(false), 600);
return () => clearTimeout(t);
}, []);

// Fetch profile
useEffect(() => {
if (!userId) return;
fetch(`http://127.0.0.1:5000/api/profile/get/${userId}`)
.then((res) => res.json())
.then((data) => setProfile(data.profile || data || {}))
.catch(() => {});
}, [userId]);

// Fetch skill assessment report
useEffect(() => {
if (!userId) return;
fetch(`http://127.0.0.1:5000/api/skills/report/${userId}`)
.then((res) => res.json())
.then((data) => {
if (data && data.final_score !== undefined) {
setLatestSkill(data);
}
})
.catch(() => {});
}, [userId]);

// Fetch recommended jobs
useEffect(() => {
if (!userId) return;
fetch(`http://127.0.0.1:5000/api/jobs/recommend/${userId}`)
.then((res) => res.json())
.then((data) => setRecommendedJobs(data || []))
.catch(() => {});
}, [userId]);

// Fetch profile strength
const fetchStrength = async () => {
if (!userId) return;
try {
const res = await fetch(
`http://127.0.0.1:5000/api/profile/strength/${userId}`
);
const data = await res.json();
setStrength(data.strength || 0);
setMissingFields(data.missing || []);
} catch {
setStrength(0);
setMissingFields([]);
}
};

// Fetch latest generated resume strength
const fetchResumeStrength = async () => {
if (!userId) return;
try {
const res = await fetch(
`http://127.0.0.1:5000/api/resume_ai/list/${userId}`
);

const data = await res.json();
if (Array.isArray(data) && data.length > 0) {
const latest = data[0];
setResumeStrength(Number(latest.strength) || 0);
} else {
setResumeStrength(0);
}
} catch {
setResumeStrength(0);
}
};

useEffect(() => {
if (!userId) return;

fetch(`http://127.0.0.1:5000/api/notifications/unread-count/${userId}`)
.then((res) => res.json())
.then((data) => {
setUnreadNotifications(data.count || 0);
})
.catch(() => {});
}, [userId]);

// Fetch strengths when profile/user changes
useEffect(() => {
fetchStrength();
fetchResumeStrength();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId, profile]);

// Compute combined strength
useEffect(() => {
const combined = Math.round(strength * 0.6 + resumeStrength * 0.4);
setCombinedStrength(Number.isFinite(combined) ? combined : 0);
}, [strength, resumeStrength]);

// Listen for global "resumeUpdated" event
useEffect(() => {
const handleResumeUpdated = () => {
fetchResumeStrength();
if (window.updateGeneratedResumes) {
window.updateGeneratedResumes();
}
};

window.addEventListener("resumeUpdated", handleResumeUpdated);
return () =>
window.removeEventListener("resumeUpdated", handleResumeUpdated);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Expose fetchResumeStrength globally (if needed by other pages)
useEffect(() => {
window.updateGeneratedResumes = fetchResumeStrength;
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// -----------------------------------
// ACTION HANDLERS
// -----------------------------------

// Save profile
const saveProfile = async () => {
const body = { ...profile };
delete body._id;

const res = await fetch(
`http://127.0.0.1:5000/api/profile/update/${userId}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
}
);

const data = await res.json();

const toast = document.createElement("div");
toast.innerText = data.message || "Profile updated!";
toast.style.position = "fixed";
toast.style.top = "20px";
toast.style.right = "20px";
toast.style.padding = "12px 18px";
toast.style.background = "#16a34a";
toast.style.color = "white";
toast.style.borderRadius = "8px";
toast.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
toast.style.zIndex = "9999";
toast.style.fontSize = "14px";
toast.style.fontWeight = "600";
document.body.appendChild(toast);

setTimeout(() => toast.remove(), 1100);

fetchStrength();
fetchResumeStrength();
setActiveTab("dashboard");
};

// Photo upload
const handlePhotoUpload = async (e) => {
const file = e.target.files?.[0];
if (!file) return;

const fd = new FormData();
fd.append("photo", file);

const res = await fetch(
`http://127.0.0.1:5000/api/profile/uploadPhoto/${userId}`,
{
method: "POST",
body: fd,
}
);

const data = await res.json();

if (data.profilePhoto) {
setProfile((prev) => ({ ...prev, profilePhoto: data.profilePhoto }));
}

fetchStrength();
};

// -----------------------------------
// RENDER GUARDS
// -----------------------------------

if (!sessionValid) {
return (
<div className="h-screen flex items-center justify-center text-red-600 text-xl">
Invalid session. Redirecting to login...
</div>
);
}

if (loading) return <GlobalLoader />;

const barColor =
combinedStrength < 40
? "bg-red-500"
: combinedStrength < 75
? "bg-yellow-500"
: "bg-green-600";

// -----------------------------------
// MAIN UI
// -----------------------------------

return (
<AnimatedPage>
<div className="flex h-screen bg-gray-100 overflow-hidden">
{/* SIDEBAR */}
<motion.aside
initial={{ x: -120, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ duration: 0.3 }}
className={`bg-green-700 text-white w-64 flex flex-col fixed h-full z-30 transition-all ${
sidebarOpen ? "translate-x-0" : "-translate-x-72"
}`}
>
<div className="p-5">
<h1 className="text-2xl font-bold">Teacher Panel</h1>
</div>

{/* 🛠️ FIX: Added overflow-y-auto so sidebar scrolls if content is too tall */}
<nav className="flex-1 overflow-y-auto px-5 pb-5 space-y-7">
{[
{ label: "Dashboard", key: "dashboard" },
{ label: "Resume Analysis", key: "resume" },
{ label: "Create Resume", key: "create" },
{ label: "Resume Library", key: "generated" },
{ label: "Jobs", key: "jobs" },
{ label: "Applied Jobs", key: "applied" },
{ label: "Interview Preparation", key: "interview" },
{ label: "Skill Test", key: "skill" },
{ label: "Notifications", key: "notifications" },
{ label: "Feedback", key: "feedback" },
].map((item) => (
<button
key={item.key}
onClick={() => {
if (item.key === "skill") {
window.location.href = "/skill-test";
} else {
setActiveTab(item.key);
}
}}
className={`block w-full text-left p-2 rounded-lg transition ${
activeTab === item.key
? "bg-green-900 font-semibold"
: "hover:bg-green-600"
}`}
>
<span className="flex items-center justify-between">
<span>{item.label}</span>

{item.key === "notifications" && unreadNotifications > 0 && (
<span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
    {unreadNotifications}
</span>
)}
</span>
</button>
))}
</nav>
</motion.aside>

{/* MAIN CONTENT */}
<div className={`flex-1 flex flex-col h-screen transition-all ${sidebarOpen ? "md:ml-64" : "ml-0"}`}>
{/* TOP NAV */}
<header className="bg-white shadow p-4 px-6 flex justify-between items-center fixed top-0 right-0 left-0 z-20 transition-all" style={{ left: sidebarOpen ? '16rem' : '0' }}>
<button
className="md:hidden"
onClick={() => setSidebarOpen(!sidebarOpen)}
>
{sidebarOpen ? <X size={26} /> : <Menu size={26} />}
</button>

<div className="flex items-center gap-4 ml-auto">
<span className="font-semibold text-gray-700">{teacherName}</span>

<div className="relative group cursor-pointer">
{profile.profilePhoto ? (
<img
src={`http://127.0.0.1:5000/${profile.profilePhoto}`}
alt="Profile"
className="w-10 h-10 rounded-full object-cover border-2 border-green-700"
/>
) : (
<div className="bg-green-700 text-white w-10 h-10 rounded-full flex items-center justify-center">
{teacherName.charAt(0).toUpperCase()}
</div>
)}
</div>
</div>
</header>

{/* MAIN CONTENT AREA */}
{/* 🛠️ FIX: Increased pt-24 to pt-32 to prevent content hiding behind navbar */}
<main className="flex-1 overflow-y-auto pt-32 px-6 pb-10 bg-gray-50/50">
<div className="max-w-5xl mx-auto">

{/* 🛠️ FIX: Removed the duplicate static dashboard block here. 
Now ONLY TeacherAnalytics is rendered for the dashboard tab. */}
{activeTab === "dashboard" && (
<TeacherAnalytics /> 
)}

{/* RESUME ANALYSIS TAB */}
{activeTab === "resume" && (
<div className="mb-6">
<BuildResume />
</div>
)}

{/* CREATE RESUME TAB */}
{activeTab === "create" && (
<div className="mb-6">
<CreateResume />
</div>
)}

{/* JOBS TAB */}
{activeTab === "jobs" && (
<div className="mb-6">
<TeacherJobs />
</div>
)}

{/* PROFILE TAB */}
{activeTab === "profile" && (
<div className="bg-white p-6 rounded-xl shadow">
<h3 className="text-xl font-semibold mb-4">Update Profile</h3>

{/* Photo */}
<div className="flex items-center gap-4 mb-6">
<img
    src={
    profile.profilePhoto
        ? `http://127.0.0.1:5000/${profile.profilePhoto}`
        : "/default-avatar.png"
    }
    className="h-20 w-20 rounded-full object-cover border"
    alt="profile"
/>
<input
    type="file"
    accept="image/*"
    onChange={handlePhotoUpload}
/>
</div>

{/* Form */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<input
    value={profile.name || ""}
    onChange={(e) =>
    setProfile({ ...profile, name: e.target.value })
    }
    className="border p-2 rounded"
    placeholder="Full Name"
/>

<input
    value={profile.email || ""}
    onChange={(e) =>
    setProfile({ ...profile, email: e.target.value })
    }
    className="border p-2 rounded"
    placeholder="Email"
/>

<input
    value={profile.age || ""}
    onChange={(e) => {
    const v = e.target.value;
    if (/^\d{0,2}$/.test(v)) {
        setProfile({ ...profile, age: v });
    }
    }}
    className="border p-2 rounded"
    placeholder="Age"
/>

<div>
    <label className="block mb-1 font-medium text-gray-700">
    Gender
    </label>
    <div className="flex gap-2">
    {["Male", "Female", "Other"].map((g) => (
        <button
        key={g}
        type="button"
        onClick={() => setProfile({ ...profile, gender: g })}
        className={`px-4 py-2 rounded-lg border ${
            profile.gender === g
            ? "bg-green-600 text-white"
            : "bg-white text-gray-700"
        }`}
        >
        {g}
        </button>
    ))}
    </div>
</div>

<input
    value={profile.phone || ""}
    onChange={(e) => {
    const v = e.target.value;
    if (/^\d{0,10}$/.test(v)) {
        setProfile({ ...profile, phone: v });
    }
    }}
    className="border p-2 rounded"
    placeholder="Phone Number"
/>

<select
    value={profile.qualification || ""}
    onChange={(e) =>
    setProfile({
        ...profile,
        qualification: e.target.value,
    })
    }
    className="border p-2 rounded"
>
    <option value="">Select Qualification</option>
    <option value="B.Ed">B.Ed</option>
    <option value="M.Ed">M.Ed</option>
    <option value="D.El.Ed">D.El.Ed</option>
    <option value="PhD">PhD</option>
    <option value="Other">Other</option>
</select>

<input
    value={profile.experience || ""}
    onChange={(e) => {
    const v = e.target.value;
    if (/^\d{0,2}$/.test(v)) {
        setProfile({ ...profile, experience: v });
    }
    }}
    className="border p-2 rounded"
    placeholder="Experience (Years)"
/>

<input
    value={profile.skills || ""}
    onChange={(e) =>
    setProfile({ ...profile, skills: e.target.value })
    }
    className="border p-2 rounded"
    placeholder="Skills"
/>

<input
    value={profile.preferred_subject || ""}
    onChange={(e) =>
    setProfile({
        ...profile,
        preferred_subject: e.target.value,
    })
    }
    className="border p-2 rounded"
    placeholder="Preferred Subject"
/>

<input
    value={profile.preferred_location || ""}
    onChange={(e) =>
    setProfile({
        ...profile,
        preferred_location: e.target.value,
    })
    }
    className="border p-2 rounded"
    placeholder="Preferred Location"
/>

<select
    value={profile.job_type || ""}
    onChange={(e) =>
    setProfile({
        ...profile,
        job_type: e.target.value,
    })
    }
    className="border p-2 rounded"
>
    <option value="">Select Job Type</option>
    <option value="Full-Time">Full-Time</option>
    <option value="Part-Time">Part-Time</option>
</select>
</div>

{/* About */}
<div className="mt-6">
<label className="font-medium text-gray-700">About</label>
<textarea
    value={profile.about || ""}
    onChange={(e) =>
    setProfile({ ...profile, about: e.target.value })
    }
    className="w-full border p-3 rounded mt-1"
    rows="4"
    placeholder="Write something..."
></textarea>
</div>

<button
onClick={saveProfile}
className="mt-6 bg-green-700 text-white px-6 py-2 rounded-lg"
>
Save Changes
</button>
</div>
)}

{/* GENERATED RESUMES TAB */}
{activeTab === "generated" && (
<div className="mb-6">
<GeneratedResumesPage />
</div>
)}

{/* APPLIED JOBS TAB */}
{activeTab === "applied" && (
<div className="mb-6">
<AppliedJobs />
</div>
)}

{/* INTERVIEW PREPARATION TAB */}
{activeTab === "interview" && (
<div className="mb-6">
<InterviewPrep />
</div>
)}

{activeTab === "notifications" && (
<div className="mb-6">
<Notifications />
</div>
)}

{/* FEEDBACK TAB */}
{activeTab === "feedback" && (
<FeedbackTab
userRole="TEACHER"
onReturn={() => setActiveTab("dashboard")}
/>
)}
</div>
</main>
</div>
</div>
</AnimatedPage>
);
}
