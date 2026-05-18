import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import { useUser } from "../context/UserContext";

export default function Login() {
const { setFullUser } = useUser();

const [selectedRole, setSelectedRole] = useState("");

const [formData, setFormData] = useState({
email: "",
password: "",
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
setError("");
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError("");

try {
localStorage.clear();

const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(formData),
});

const data = await response.json();
console.log("Login Response:", data);

if (!response.ok || data.error) {
setError("Invalid Email or Password");
setLoading(false);
return;
}

// ✅ Allow admin from any selected role
if (
selectedRole &&
data.role !== selectedRole &&
data.role !== "admin"
) {
setError("Selected role does not match your account");
setLoading(false);
return;
}

localStorage.setItem("token", data.token);
localStorage.setItem("user_id", data.user_id);
localStorage.setItem("role", data.role);

setFullUser({
user_id: data.user_id,
role: data.role,
});

setTimeout(() => {
if (data.role === "teacher") {
window.location.href = "/teacher/dashboard";
} else if (data.role === "employer") {
window.location.href = "/employer/dashboard";
} else if (data.role === "admin") {
window.location.href = "/admin/dashboard";
} else {
window.location.href = "/welcome";
}
}, 200);

} catch (err) {
console.error("Login error:", err);
setError("Server error. Please try again.");
setLoading(false);
}
};

return (
<AnimatedPage>
<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
<div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
<h2 className="text-3xl font-bold text-center mb-4 text-blue-600">
Hirelytic Login
</h2>

{/* 🔥 ROLE SELECTION */}
{!selectedRole && (
<div className="space-y-4">
<p className="text-center text-gray-600 font-semibold">
Select your role
</p>

<button
onClick={() => setSelectedRole("teacher")}
className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
Teacher / Job Seeker
</button>

<button
onClick={() => setSelectedRole("employer")}
className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
>
Recruiter
</button>
</div>
)}

{/* 🔥 LOGIN FORM */}
{selectedRole && (
<>
<p className="text-center text-sm text-gray-500 mb-3">
Selected Role:{" "}
<span className="font-semibold text-blue-600">
{selectedRole}
</span>
</p>

{error && (
<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
{error}
</div>
)}

<form onSubmit={handleSubmit} className="space-y-5">
<div>
<label className="block text-gray-600 font-semibold mb-1">
Email
</label>
<input
type="email"
name="email"
value={formData.email}
onChange={handleChange}
required
className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
/>
</div>

<div>
<label className="block text-gray-600 font-semibold mb-1">
Password
</label>
<div className="relative">
<input
type={showPassword ? "text" : "password"}
name="password"
value={formData.password}
onChange={handleChange}
required
className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-12"
/>
<span
className="absolute right-4 top-3 cursor-pointer text-gray-500"
onClick={() => setShowPassword(!showPassword)}
>
{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
</span>
</div>
</div>

<button
type="submit"
disabled={loading}
className={`w-full py-3 rounded-lg font-semibold transition ${
loading
? "bg-blue-400 cursor-not-allowed"
: "bg-blue-600 hover:bg-blue-700 text-white"
}`}
>
{loading ? "Logging in..." : "Login"}
</button>

<button
type="button"
onClick={() => setSelectedRole("")}
className="w-full text-sm text-gray-500 hover:underline"
>
← Change Role
</button>

<p className="text-center text-gray-600 mt-3">
Don't have an account?{" "}
<a href="/register" className="text-blue-600 hover:underline">
Signup
</a>
</p>
</form>
</>
)}
</div>
</div>
</AnimatedPage>
);
}
