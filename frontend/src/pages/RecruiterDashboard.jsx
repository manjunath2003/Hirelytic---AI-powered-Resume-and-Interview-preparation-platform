import { useState, useEffect, useMemo, useCallback } from "react";
import { Menu, X, Briefcase, Users, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
} from "recharts";
import { useNavigate, useLocation } from "react-router-dom";

import AnimatedPage from "../components/AnimatedPage";
import GlobalLoader from "../components/GlobalLoader";

import RecruiterPostJob from "./RecruiterPostJob";
import RecruiterJobList from "./RecruiterJobList";
import RecruiterApplications from "./RecruiterApplications";
import RecruiterInterviews from "./RecruiterInterviews";

import FeedbackTab from "../components/FeedbackTab";

export default function RecruiterDashboard() {
const recruiterId = localStorage.getItem("user_id");
const recruiterName = localStorage.getItem("name") || "Recruiter";
const navigate = useNavigate();

const [sidebarOpen, setSidebarOpen] = useState(true);
const location = useLocation();

const [activeTab, setActiveTab] = useState(
location.state?.openTab || "dashboard"
);
const [loading, setLoading] = useState(true);

const [applications, setApplications] = useState([]);
const [jobCount, setJobCount] = useState(0);

// -----------------------------
// FETCH DASHBOARD DATA
// -----------------------------
const fetchStats = useCallback(async () => {
try {
const [appsRes, jobsRes] = await Promise.all([
axios.get(
`http://localhost:5000/api/jobs/recruiter/applications/${recruiterId}`
),
axios.get(`http://localhost:5000/api/jobs/employer/${recruiterId}`),
]);

setApplications(appsRes.data || []);
setJobCount(jobsRes.data?.length || 0);
} catch (err) {
console.error("Dashboard stats error:", err);
}
}, [recruiterId]);

useEffect(() => {
fetchStats();
const t = setTimeout(() => setLoading(false), 600);
return () => clearTimeout(t);
}, [fetchStats]);

useEffect(() => {
if (location.state?.openTab) {
setActiveTab(location.state.openTab);
}
}, [location.state]);

// -----------------------------
// DERIVED STATS
// -----------------------------
const stats = useMemo(() => {
return {
jobs: jobCount,
applicants: applications.length,
shortlisted: applications.filter((a) => a.status === "shortlisted").length,
rejected: applications.filter((a) => a.status === "rejected").length,
};
}, [applications, jobCount]);

// -----------------------------
// GRAPH DATA
// -----------------------------
const graphData = useMemo(() => {
const map = {};
applications.forEach((app) => {
const date = new Date(app.applied_at).toLocaleDateString();
map[date] = (map[date] || 0) + 1;
});

return Object.keys(map).map((date) => ({
date,
applications: map[date],
}));
}, [applications]);

const menuItems = [
{ label: "Dashboard", key: "dashboard" },
{ label: "Post a Job", key: "post" },
{ label: "My Job Posts", key: "myjobs" },
{ label: "View Applications", key: "applicants" },
{ label: "Shortlisted", key: "shortlisted" },
{ label: "Rejected", key: "rejected" },
{ label: "Interviews", key: "interviews" },
{ label: "Feedback", key: "feedback" },
];

if (loading) return <GlobalLoader />;

return (
<AnimatedPage>
<div className="flex h-screen bg-gray-100">
{/* SIDEBAR */}
<aside
className={`bg-purple-700 text-white w-64 p-5 space-y-6 fixed h-full z-20 transition-all duration-300 ${
sidebarOpen ? "translate-x-0" : "-translate-x-72"
}`}
>
<h1 className="text-2xl font-bold">Recruiter Panel</h1>

<nav className="space-y-2 mt-4">
{menuItems.map((item) => (
<button
key={item.key}
onClick={() => setActiveTab(item.key)}
className={`block w-full text-left p-2 rounded-lg transition ${
activeTab === item.key
? "bg-purple-900 font-semibold"
: "hover:bg-purple-600"
}`}
>
{item.label}
</button>
))}
</nav>
</aside>

{/* MAIN */}
<div className="flex-1 flex flex-col md:ml-64">
{/* NAVBAR */}
<header className="bg-white shadow p-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 md:left-64 z-10">
<button
className="md:hidden text-purple-700"
onClick={() => setSidebarOpen(!sidebarOpen)}
>
{sidebarOpen ? <X size={26} /> : <Menu size={26} />}
</button>

<div className="relative group flex items-center gap-4 cursor-pointer ml-auto">
<span className="font-semibold text-gray-700 hidden sm:block">
{recruiterName}
</span>

<div className="bg-purple-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
{recruiterName.charAt(0).toUpperCase()}
</div>

{/* DROPDOWN */}
<div className="absolute right-0 top-12 w-40 bg-white shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100">
<button
type="button"
className="block w-full text-left px-4 py-2 hover:bg-gray-100"
onClick={(e) => {
e.stopPropagation();
navigate("/employer/profile");
}}
>
Profile
</button>

<button
type="button"
className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
onClick={(e) => {
e.stopPropagation();
localStorage.clear();
navigate("/login");
}}
>
Logout
</button>
</div>
</div>
</header>

{/* CONTENT */}
<main className="pt-24 px-6 pb-10 overflow-auto">
<div className="max-w-6xl mx-auto">
{activeTab === "dashboard" && (
<div className="space-y-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
<StatCard title="Total Job Posts" value={stats.jobs} icon={<Briefcase />} />
<StatCard title="Total Applicants" value={stats.applicants} icon={<Users />} />
<StatCard title="Shortlisted" value={stats.shortlisted} icon={<CheckCircle />} />
<StatCard title="Rejected" value={stats.rejected} icon={<XCircle />} />
</div>

<div className="bg-white p-6 rounded-2xl shadow">
<h3 className="text-lg font-semibold mb-4">
Applications Over Time
</h3>

{graphData.length === 0 ? (
<p className="text-gray-500">No application data yet</p>
) : (
<ResponsiveContainer width="100%" height={280}>
<LineChart data={graphData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis allowDecimals={false} />
  <Tooltip />
  <Line
    type="monotone"
    dataKey="applications"
    stroke="#7c3aed"
    strokeWidth={3}
  />
</LineChart>
</ResponsiveContainer>
)}
</div>
</div>
)}

{activeTab === "post" && <RecruiterPostJob />}
{activeTab === "myjobs" && <RecruiterJobList />}
{activeTab === "applicants" && <RecruiterApplications filter="applied" />}
{activeTab === "shortlisted" && <RecruiterApplications filter="shortlisted" />}
{activeTab === "rejected" && <RecruiterApplications filter="rejected" />}
{activeTab === "interviews" && <RecruiterInterviews />}
{activeTab === "feedback" && (
<FeedbackTab userRole="RECRUITER" onReturn={() => setActiveTab("dashboard")} />
)}
</div>
</main>
</div>
</div>
</AnimatedPage>
);
}

function StatCard({ title, value, icon }) {
return (
<motion.div
whileHover={{ scale: 1.02 }}
className="bg-white p-6 rounded-2xl shadow flex items-center justify-between"
>
<div>
<p className="text-gray-500 text-sm">{title}</p>
<p className="text-3xl font-bold">{value}</p>
</div>
<div className="p-4 rounded-full bg-purple-100 text-purple-700">
{icon}
</div>
</motion.div>
);
}
