import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
Zap,
FileText,
Download,
Target,
Calendar,
TrendingUp,
BarChart3,
Search
} from "lucide-react";
import axios from "axios";
import {
AreaChart,
Area,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts";

export default function TeacherAnalytics() {
const [data, setData] = useState({
resumeScore: 0,
resumesGenerated: 0,
resumesDownloaded: 0,
jobsAvailable: 0,
jobsApplied: 0,
jobsShortlisted: 0,
interviewsAttended: 0,
interviewPrep: 0,
skillScore: 0,
activityData: []
});

const [loading, setLoading] = useState(true);

// 🛡️ TOKEN FETCH + CLEANUP (NO LOGIC CHANGE)
let token = localStorage.getItem("token");
if (token && token.startsWith('"') && token.endsWith('"')) {
token = token.slice(1, -1);
}

console.log("ANALYTICS TOKEN:", token);

const fetchAnalytics = async () => {
try {
if (!token) {
console.error("No token found, analytics skipped");
setLoading(false);
return;
}

const res = await axios.get(
"http://127.0.0.1:5000/api/teacher/analytics-summary",
{
headers: {
Authorization: `Bearer ${token}`
}
}
);

if (res.data) {
setData(res.data);
}
} catch (err) {
console.error("Analytics fetch error:", err);
} finally {
setLoading(false);
}
};

useEffect(() => {
fetchAnalytics();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

if (loading)
return (
<div className="flex flex-col items-center justify-center h-64 space-y-4">
<div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
<p className="font-bold text-gray-400 text-xs uppercase tracking-widest">
Loading Analytics...
</p>
</div>
);

return (
<div className="space-y-8 pb-10 animate-in fade-in duration-700">
{/* SECTOR 1 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<MetricCard
label="AI Resume Score"
val={`${data.resumeScore}%`}
icon={<Zap size={20} />}
color="bg-yellow-500"
/>
<MetricCard
label="Resumes Created"
val={data.resumesGenerated}
icon={<FileText size={20} />}
color="bg-blue-600"
/>
<MetricCard
label="Resumes Saved"
val={data.resumesDownloaded}
icon={<Download size={20} />}
color="bg-indigo-600"
/>
<MetricCard
label="Available Jobs"
val={data.jobsAvailable}
icon={<Search size={20} />}
color="bg-green-600"
/>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/* SECTOR 2 */}
<div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
<div className="flex justify-between items-center mb-8">
<h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
<TrendingUp size={16} /> Activity Growth
</h3>
<span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">
Real-time
</span>
</div>

<div className="h-[320px]">
<ResponsiveContainer width="100%" height="100%">
<AreaChart data={data.activityData}>
<defs>
    <linearGradient
    id="growthGradient"
    x1="0"
    y1="0"
    x2="0"
    y2="1"
    >
    <stop
        offset="5%"
        stopColor="#16a34a"
        stopOpacity={0.15}
    />
    <stop
        offset="95%"
        stopColor="#16a34a"
        stopOpacity={0}
    />
    </linearGradient>
</defs>
<CartesianGrid
    strokeDasharray="3 3"
    vertical={false}
    stroke="#f1f5f9"
/>
<XAxis
    dataKey="name"
    axisLine={false}
    tickLine={false}
    tick={{
    fill: "#94a3b8",
    fontSize: 12,
    fontWeight: 800
    }}
/>
<YAxis hide />
<Tooltip />
<Area
    type="monotone"
    dataKey="value"
    stroke="#16a34a"
    strokeWidth={4}
    fill="url(#growthGradient)"
/>
</AreaChart>
</ResponsiveContainer>
</div>
</div>

{/* SECTOR 3 */}
<div className="space-y-6">
<div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">
Job Funnel
</h3>
<div className="space-y-5">
<FunnelRow
label="Jobs Applied"
val={data.jobsApplied}
icon={<BarChart3 size={14} />}
/>
<FunnelRow
label="Shortlisted"
val={data.jobsShortlisted}
icon={<Target size={14} />}
color="text-green-400"
/>
<FunnelRow
label="Interviews"
val={data.interviewsAttended}
icon={<Calendar size={14} />}
/>
</div>
</div>

<div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
Readiness
</h3>
<div className="space-y-8">
<SkillItem
label="Interview Prep"
percent={data.interviewPrep}
color="bg-green-600"
/>
<SkillItem
label="Skill Score"
percent={data.skillScore}
color="bg-blue-600"
/>
</div>
</div>
</div>
</div>
</div>
);
}

/* ---------------- SUB COMPONENTS ---------------- */

function MetricCard({ label, val, icon, color }) {
return (
<motion.div
whileHover={{ y: -5 }}
className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5"
>
<div
className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white`}
>
{icon}
</div>
<div>
<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
{label}
</p>
<p className="text-2xl font-black text-slate-900 tracking-tight">
{val}
</p>
</div>
</motion.div>
);
}

function FunnelRow({ label, val, icon, color = "text-white" }) {
return (
<div className="flex justify-between items-center border-b border-slate-800 pb-3 last:border-0">
<div className="flex items-center gap-3">
<span className="text-slate-500">{icon}</span>
<span className="text-sm font-bold text-slate-300">{label}</span>
</div>
<span className={`text-lg font-black ${color}`}>{val}</span>
</div>
);
}

function SkillItem({ label, percent, color }) {
return (
<div>
<div className="flex justify-between text-[10px] font-black mb-3 uppercase text-slate-500 italic">
<span>{label}</span>
<span>{percent}%</span>
</div>
<div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
<motion.div
initial={{ width: 0 }}
animate={{ width: `${percent}%` }}
className={`h-full ${color}`}
/>
</div>
</div>
);
}
