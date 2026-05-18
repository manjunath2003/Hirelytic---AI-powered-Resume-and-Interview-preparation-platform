import React, { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function FeedbackForm({ role, onReturn }) {
const [rating, setRating] = useState(0);
const [hover, setHover] = useState(0);
const [feedback, setFeedback] = useState("");
const [submitted, setSubmitted] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

// Theme based on user role
const isTeacher = role === "TEACHER";
const accentColor = isTeacher ? "bg-green-700 hover:bg-green-800" : "bg-purple-700 hover:bg-purple-800";
const starColor = isTeacher ? "#15803d" : "#7e22ce";
const ringColor = isTeacher ? "focus:ring-green-500" : "focus:ring-purple-500";

const handleSubmit = async (e) => {
e.preventDefault();
if (rating === 0) {
alert("Please select a star rating before submitting.");
return;
}

setIsSubmitting(true);
try {
// 🆕 CAPTURING FULL USER IDENTITY 
// Ensuring name, email, and role are sent to the backend
await axios.post("http://127.0.0.1:5000/admin/feedbacks/submit", {
role: role,
name: localStorage.getItem("name") || "Anonymous User", // 🆕 Pulls name from storage
email: localStorage.getItem("email") || "Anonymous Email", // 🆕 Pulls email from storage
rating: rating,
feedback: feedback,
created_at: new Date().toISOString() // Required for backend sorting
});

setSubmitted(true);
// Automatically return to dashboard after success message
setTimeout(() => onReturn(), 3000);
} catch (err) {
console.error("Feedback submission error:", err);
alert("Failed to save feedback. Please check if your backend is running.");
} finally {
setIsSubmitting(false);
}
};

if (submitted) {
return (
<motion.div 
initial={{ opacity: 0, scale: 0.9 }} 
animate={{ opacity: 1, scale: 1 }}
className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] shadow-xl text-center border border-gray-100"
>
<div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isTeacher ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"}`}>
<CheckCircle size={48} />
</div>
<h2 className="text-3xl font-black text-gray-900 mb-2">Thank You!</h2>
<p className="text-gray-500 font-medium">Your feedback has been stored successfully.</p>
<p className="text-sm text-gray-400 mt-4 italic">Redirecting you back to dashboard...</p>
</motion.div>
);
}

return (
<motion.div 
initial={{ opacity: 0, y: 20 }} 
animate={{ opacity: 1, y: 0 }}
className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-2xl mx-auto border border-gray-100"
>
<div className="mb-8">
<h2 className="text-3xl font-black text-gray-900">Share Your Experience</h2>
<p className="text-gray-500 font-medium mt-1">Help us improve the Hirelytic platform for everyone.</p>
</div>

<form onSubmit={handleSubmit} className="space-y-8">
{/* STAR RATING */}
<div>
<label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Your Rating</label>
<div className="flex justify-center gap-3">
{[1, 2, 3, 4, 5].map((star) => (
<button
key={star}
type="button"
className="transform transition-transform active:scale-90"
onClick={() => setRating(star)}
onMouseEnter={() => setHover(star)}
onMouseLeave={() => setHover(0)}
>
<Star 
    size={42} 
    className="transition-all duration-200"
    fill={(hover || rating) >= star ? starColor : "none"} 
    stroke={(hover || rating) >= star ? starColor : "#d1d5db"} 
    strokeWidth={2.5}
/>
</button>
))}
</div>
</div>

{/* FEEDBACK TEXT */}
<div>
<label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Detailed Comments</label>
<textarea
required
className={`w-full border-2 border-gray-100 p-5 rounded-[1.5rem] outline-none transition-all resize-none font-medium bg-gray-50/50 ${ringColor} focus:ring-2 focus:bg-white`}
rows="5"
value={feedback}
onChange={(e) => setFeedback(e.target.value)}
placeholder="What did you like or what can we improve?"
/>
</div>

{/* SUBMIT BUTTON */}
<div className="flex gap-4">
<button 
type="button" 
onClick={onReturn}
className="flex-1 py-4 text-gray-500 font-bold rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all"
>
Cancel
</button>
<button 
type="submit" 
disabled={isSubmitting}
className={`flex-[2] py-4 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${accentColor} ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
>
{isSubmitting ? "Submitting..." : <><Send size={18} /> Submit Feedback</>}
</button>
</div>
</form>
</motion.div>
);
}
