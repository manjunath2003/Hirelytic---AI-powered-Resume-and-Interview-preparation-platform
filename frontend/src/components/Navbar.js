import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useUser } from "../context/UserContext";

export default function Navbar() {
const navigate = useNavigate();
const { user, clearUser, updateUser } = useUser();

const [open, setOpen] = useState(false);
const dropdownRef = useRef(null);

const role = user?.role || localStorage.getItem("role");
const userId = user?.user_id || localStorage.getItem("user_id");
const token = localStorage.getItem("token");

// ✅ Fetch USER details (NOT teacher profile)
useEffect(() => {
if (!userId) return;

async function fetchUser() {
try {
const res = await fetch(
`http://127.0.0.1:5000/api/profile/user/${userId}`
);
const data = await res.json();

if (data.profile) {
updateUser({
name: data.profile.name,
email: data.profile.email,
profilePhoto: data.profile.profilePhoto || "",
});
}
} catch (err) {
console.error("NAVBAR USER FETCH ERROR:", err);
}
}

fetchUser();
}, [userId]);

// Close dropdown on outside click
useEffect(() => {
const handleClick = (e) => {
if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
setOpen(false);
}
};
document.addEventListener("mousedown", handleClick);
return () => document.removeEventListener("mousedown", handleClick);
}, []);

const handleLogout = () => {
clearUser();
navigate("/login");
};

const displayRole = role ? role.toUpperCase() : "";

return (
<nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow fixed top-0 left-0 w-full z-50">

{/* LOGO */}
<h1
className="text-xl font-bold cursor-pointer"
onClick={() => navigate("/")}
>
Hirelytic
</h1>

{/* RIGHT SIDE */}
{!token ? (
<div className="space-x-4 text-white font-medium">
<Link to="/login" className="hover:underline">Login</Link>
<Link to="/register" className="hover:underline">Register</Link>
</div>
) : (
<div className="flex items-center gap-4">

{/* ROLE */}
<span className="text-lg font-semibold uppercase tracking-wide">
{displayRole}
</span>

{/* PROFILE ICON */}
<div className="relative" ref={dropdownRef}>
<button
type="button"
onClick={() => setOpen(!open)}
className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow overflow-hidden"
>
{user?.profilePhoto ? (
<img
src={`http://127.0.0.1:5000/${user.profilePhoto}`}
alt="User"
className="w-full h-full object-cover"
/>
) : (
<span className="text-blue-600 font-bold text-lg">
{user?.name ? user.name.charAt(0).toUpperCase() : "?"}
</span>
)}
</button>

{/* DROPDOWN */}
{open && (
<div className="absolute right-0 mt-2 bg-white text-black rounded-md shadow-lg w-36 py-2 z-50">

<button
type="button"
onClick={() => {
if (role === "teacher") {
navigate("/teacher/profile");
} else if (role === "employer") {
navigate("/employer/profile");
} else if (role === "admin") {
navigate("/admin/dashboard");
}
setOpen(false);
}}
className="block w-full text-left px-4 py-2 hover:bg-gray-100"
>
Profile
</button>

<button
type="button"
onClick={handleLogout}
className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
>
Logout
</button>

</div>
)}
</div>

</div>
)}
</nav>
);
}
