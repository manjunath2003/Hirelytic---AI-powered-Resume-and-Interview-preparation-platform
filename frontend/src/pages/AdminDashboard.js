import { useState, useEffect } from "react";
import { Menu, X, Star, Users, Briefcase, Trash2, PieChart, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import AnimatedPage from "../components/AnimatedPage";
import GlobalLoader from "../components/GlobalLoader";
import ExampleChart from "../components/ExampleChart";
import FeedbackForm from "../components/FeedbackForm";

export default function AdminDashboard() {
const [sidebarOpen, setSidebarOpen] = useState(true);
const [activeTab, setActiveTab] = useState("dashboard");
const [loading, setLoading] = useState(true);

// LIVE DATA STATE
const [users, setUsers] = useState([]);
const [jobs, setJobs] = useState([]);
const [applications, setApplications] = useState([]);
const [feedbacks, setFeedbacks] = useState([]);

// 🆕 NEW UI STATES (MODAL & TOAST)
const [confirmModal, setConfirmModal] = useState({ show: false, type: "", id: "" });
const [toast, setToast] = useState({ show: false, message: "" });

const showToast = (msg) => {
setToast({ show: true, message: msg });
setTimeout(() => setToast({ show: false, message: "" }), 3000);
};

// --------------------------------------------------
// 🔹 FETCH ALL LIVE DATA
// --------------------------------------------------
const fetchData = async () => {
try {
const [userRes, jobRes, appRes, feedbackRes] = await Promise.all([
axios.get("http://127.0.0.1:5000/admin/users"),
axios.get("http://127.0.0.1:5000/admin/jobs"),
axios.get("http://127.0.0.1:5000/admin/applications"),
axios.get("http://127.0.0.1:5000/admin/feedbacks") 
]);

setUsers(userRes.data || []);
setJobs(jobRes.data || []);
setApplications(appRes.data || []);
setFeedbacks(feedbackRes.data || []);
} catch (err) {
console.error("Error fetching admin data:", err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchData();
}, []);

// --------------------------------------------------
// 🤖 OPERATIONS: UPDATED DELETE HANDLERS
// --------------------------------------------------
const deleteUser = async (id) => {
try {
await axios.delete(`http://127.0.0.1:5000/admin/users/delete/${id}`);
setConfirmModal({ show: false, type: "", id: "" });
showToast("User deleted successfully!");
fetchData();
setActiveTab("users"); 
} catch (err) {
console.error(err);
}
};

const deleteJob = async (id) => {
try {
await axios.delete(`http://127.0.0.1:5000/admin/jobs/delete/${id}`);
setConfirmModal({ show: false, type: "", id: "" });
showToast("Job deleted successfully!");
fetchData();
setActiveTab("jobs");
} catch (err) {
console.error(err);
}
};

if (loading) return <GlobalLoader />;

return (
<AnimatedPage>
<div className="flex h-screen bg-gray-50 text-gray-800 relative">

{/* 🆕 CUSTOM TOAST NOTIFICATION */}
{toast.show && (
<motion.div 
initial={{ opacity: 0, y: -20 }} 
animate={{ opacity: 1, y: 20 }} 
className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[110] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
>
<CheckCircle size={20} /> {toast.message}
</motion.div>
)}

{/* 🆕 CUSTOM CONFIRMATION MODAL */}
{confirmModal.show && (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
<motion.div 
initial={{ scale: 0.9, opacity: 0 }} 
animate={{ scale: 1, opacity: 1 }}
className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
>
<div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
<AlertCircle size={40} />
</div>
<h3 className="text-2xl font-black text-gray-900 mb-2">Are you sure?</h3>
<p className="text-gray-500 mb-8 font-medium text-sm">
Do you really want to remove this {confirmModal.type}? This action cannot be undone and will be permanent.
</p>
<div className="flex gap-4">
<button 
onClick={() => setConfirmModal({ show: false, type: "", id: "" })}
className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
>
Cancel
</button>
<button 
onClick={() => confirmModal.type === "user" ? deleteUser(confirmModal.id) : deleteJob(confirmModal.id)}
className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
>
Yes, Delete
</button>
</div>
</motion.div>
</div>
)}

{/* SIDEBAR */}
<aside className={`bg-blue-800 text-white w-64 p-6 fixed h-full z-20 transition-all ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
<h1 className="text-2xl font-black mb-10 tracking-tight text-center">Hirelytic <span className="text-blue-400 font-medium text-lg block">Admin Portal</span></h1>
<nav className="space-y-2">
{[
{ label: "Overview", key: "dashboard", icon: <PieChart size={18}/> },
{ label: "Manage Users", key: "users", icon: <Users size={18}/> },
{ label: "Manage Jobs", key: "jobs", icon: <Briefcase size={18}/> },
{ label: "Applications", key: "applications", icon: <FileText size={18}/> },
{ label: "Feedbacks", key: "feedbacks", icon: <Star size={18}/> },
].map(item => (
<button 
key={item.key} 
onClick={() => setActiveTab(item.key)} 
className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeTab === item.key ? "bg-blue-600 shadow-lg font-bold" : "hover:bg-blue-700 text-blue-100"}`}
>
{item.icon} {item.label}
</button>
))}
</nav>
</aside>

<div className={`flex-1 flex flex-col transition-all ${sidebarOpen ? "md:ml-64" : "ml-0"}`}>
{/* NAVBAR */}
<header className="bg-white border-b p-4 px-8 flex justify-between items-center sticky top-0 z-10">
<button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
{sidebarOpen ? <X size={24}/> : <Menu size={24}/>}
</button>

<div className="flex items-center gap-4">
<span className="font-bold text-sm text-gray-700 uppercase tracking-wider">Admin Control</span>
<div className="relative group cursor-pointer">
<div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-md">A</div>
<div className="absolute right-0 mt-2 w-36 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
<button
className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-semibold"
onClick={() => {
localStorage.clear();
window.location.href = "/login";
}}
>
Logout
</button>
</div>
</div>
</div>
</header>

<main className="p-8 overflow-auto">
<div className="max-w-6xl mx-auto">

{/* 📊 TAB: OVERVIEW */}
{activeTab === "dashboard" && (
<div className="space-y-8">
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<StatCard label="Live Users" val={users.length} color="text-green-600" />
<StatCard label="Active Jobs" val={jobs.length} color="text-purple-600" />
<StatCard label="Total Apps" val={applications.length} color="text-blue-600" />
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
<h3 className="font-bold mb-6">Platform Performance</h3>
<ExampleChart />
</div>
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
<h3 className="font-bold mb-6 text-gray-400 text-sm uppercase">Recent Registrations</h3>
<div className="space-y-4">
{users.slice(0, 5).map(u => (
<div key={u._id} className="flex justify-between items-center border-b border-gray-50 pb-2">
<div>
    <p className="font-bold text-sm">{u.email}</p>
    <p className="text-[10px] text-gray-400 uppercase font-black">{u.role}</p>
</div>
<Trash2 size={14} onClick={() => setConfirmModal({ show: true, type: "user", id: u._id })} className="text-red-300 cursor-pointer hover:text-red-600 transition-colors" />
</div>
))}
</div>
</div>
</div>
</div>
)}

{/* 👥 TAB: MANAGE USERS */}
{activeTab === "users" && (
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
<h2 className="text-xl font-bold mb-6">User Management Directory</h2>
<table className="w-full text-left">
<thead>
<tr className="text-gray-400 border-b text-xs uppercase font-black tracking-widest">
<th className="pb-4">Email Account</th>
<th className="pb-4">Access Level</th>
<th className="pb-4 text-right">Administrative Action</th>
</tr>
</thead>
<tbody>
{users.map(u => (
<tr key={u._id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
<td className="py-4 font-medium text-sm">{u.email}</td>
<td><span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${u.role === 'TEACHER' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{u.role}</span></td>
<td className="text-right">
<button onClick={() => setConfirmModal({ show: true, type: "user", id: u._id })} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}

{/* 💼 TAB: MANAGE JOBS */}
{activeTab === "jobs" && (
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
<h2 className="text-xl font-bold mb-6">Live Job Listings</h2>
<div className="grid grid-cols-1 gap-4">
{jobs.length === 0 ? <p className="text-center text-gray-400 py-10">No jobs posted yet.</p> : 
jobs.map(j => (
<div key={j._id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all">
<div>
<p className="font-bold text-blue-900">{j.title}</p>
<p className="text-xs text-gray-500">Recruiter ID: <span className="font-mono text-blue-600">{j.posted_by || j.employer_id}</span></p>
</div>
<button onClick={() => setConfirmModal({ show: true, type: "job", id: j._id })} className="bg-white text-red-500 shadow-sm border p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
</div>
))
}
</div>
</div>
)}

{/* 📝 TAB: APPLICATIONS */}
{activeTab === "applications" && (
<div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
<h2 className="text-xl font-bold mb-6">Global Application Logs</h2>
<div className="space-y-3">
{applications.length === 0 ? <p className="text-gray-400 italic">No applications recorded in the system.</p> : 
applications.map(app => (
<div key={app._id} className="p-4 border-b last:border-0 flex justify-between items-center">
<p className="text-sm font-medium"><span className="text-blue-600 font-bold">{app.teacher_email}</span> applied for <span className="italic">Job ID: {app.job_id}</span></p>
<span className="text-[10px] text-gray-400 font-mono">{app.applied_at || 'Recently'}</span>
</div>
))
}
</div>
</div>
)}

{/* ⭐ TAB: FEEDBACKS */}
{activeTab === "feedbacks" && (
<div className="space-y-6">
<h2 className="text-xl font-bold">User Experience Review Board</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{feedbacks.length === 0 ? (
<div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400 italic">
No feedback reports have been submitted by users yet.
</div>
) : (
feedbacks.map((f) => (
<motion.div 
initial={{ opacity: 0, scale: 0.95 }} 
animate={{ opacity: 1, scale: 1 }} 
key={f._id} 
className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
>
<div className="flex justify-between items-start mb-4">
    <div className="flex gap-1 text-yellow-400">
    {[...Array(5)].map((_, i) => (
        <Star 
        key={i} 
        size={16} 
        fill={i < f.rating ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth={3}
        />
    ))}
    </div>
    {/* Role Badge */}
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${f.role === 'TEACHER' ? 'text-green-500 border-green-100' : 'text-purple-500 border-purple-100'}`}>
    {f.role}
    </span>
</div>

<p className="text-gray-700 font-medium mb-4 italic leading-relaxed">
    "{f.feedback}"
</p>

{/* 🆕 UPDATED USER INFO SECTION */}
<div className="pt-4 border-t border-gray-100 flex flex-col gap-1">
    <p className="text-sm font-black text-blue-900">
    {f.name || "Anonymous"} 
    </p>
    <p className="text-xs text-gray-500 font-medium truncate">
    {f.email}
    </p>
    <p className="text-[10px] text-gray-400 font-bold mt-1">
    {f.created_at ? new Date(f.created_at).toLocaleString() : "Date not available"}
    </p>
</div>
</motion.div>
))
)}
</div>
</div>
)}

</div>
</main>
</div>
</div>
</AnimatedPage>
);
}

function StatCard({ label, val, color }) {
return (
<motion.div whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 transition-all">
<p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
<p className={`text-5xl font-black tracking-tighter ${color}`}>{val}</p>
</motion.div>
);
}
