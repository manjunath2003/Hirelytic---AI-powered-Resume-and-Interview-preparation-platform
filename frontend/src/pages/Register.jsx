import { useState } from "react";
import axios from "axios";

export default function Register() {
const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
});

const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://127.0.0.1:5000/api/auth/register", form);
    alert("Registered Successfully!");
};

return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg bg-white">
    <h2 className="text-2xl font-bold mb-4">Register</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
        <input
        className="w-full p-2 border"
        placeholder="Full Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
        className="w-full p-2 border"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
        className="w-full p-2 border"
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
        className="w-full p-2 border"
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
        <option value="teacher">Teacher</option>
        <option value="employer">Employer</option>
        </select>

        <button className="bg-blue-600 text-white w-full p-2">Register</button>
    </form>
    </div>
);
}
