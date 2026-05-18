import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";

export default function Register() {
const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
role: "teacher",
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [success, setSuccess] = useState("");

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
setError("");
setSuccess("");
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError("");
setSuccess("");

try {
// 🔥 CLEAR ANY OLD SESSION FIRST
localStorage.clear();

const response = await fetch(
"http://127.0.0.1:5000/api/auth/register",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(formData),
}
);

const data = await response.json();
console.log("Signup Response:", data);

if (!response.ok) {
setError(data.error || "Registration failed");
setLoading(false);
return;
}

// ✅ SUCCESS
setSuccess("Account created successfully! Redirecting...");
setLoading(false);

// Store ONLY temp role (NO user_id / token)
localStorage.setItem("tempRole", formData.role);

setTimeout(() => {
window.location.href = "/welcome";
}, 1200);

} catch (err) {
console.error("REGISTER ERROR:", err);
setError("Server error. Try again later.");
setLoading(false);
}
};

return (
<AnimatedPage>
<div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
<div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
<h2 className="text-3xl font-bold text-center mb-4 text-blue-600">
Create Account
</h2>

{/* ERROR MESSAGE */}
{error && (
<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
{error}
</div>
)}

{/* SUCCESS MESSAGE */}
{success && (
<div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded">
{success}
</div>
)}

<form onSubmit={handleSubmit} className="space-y-5">
{/* NAME */}
<div>
<label className="block text-gray-600 font-semibold mb-1">
  Full Name
</label>
<input
  type="text"
  name="name"
  onChange={handleChange}
  required
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
  placeholder="Enter your full name"
/>
</div>

{/* EMAIL */}
<div>
<label className="block text-gray-600 font-semibold mb-1">
  Email
</label>
<input
  type="email"
  name="email"
  onChange={handleChange}
  required
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
  placeholder="Enter your email"
/>
</div>

{/* PASSWORD */}
<div>
<label className="block text-gray-600 font-semibold mb-1">
  Password
</label>
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    onChange={handleChange}
    required
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-12"
    placeholder="Enter your password"
  />
  <span
    className="absolute right-4 top-3 cursor-pointer text-gray-500"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
  </span>
</div>
</div>

{/* ROLE */}
<div>
<label className="block text-gray-600 font-semibold mb-1">
  Select Role
</label>
<select
  name="role"
  onChange={handleChange}
  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
>
  <option value="teacher">Teacher</option>
  <option value="employer">Employer</option>
</select>
</div>

{/* BUTTON */}
<button
type="submit"
disabled={loading}
className={`w-full py-3 rounded-lg font-semibold transition 
  ${
    loading
      ? "bg-blue-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`}
>
{loading ? "Creating..." : "Register"}
</button>

<p className="text-center text-gray-600 mt-3">
Already have an account?{" "}
<a href="/login" className="text-blue-600 hover:underline">
  Login
</a>
</p>
</form>
</div>
</div>
</AnimatedPage>
);
}
