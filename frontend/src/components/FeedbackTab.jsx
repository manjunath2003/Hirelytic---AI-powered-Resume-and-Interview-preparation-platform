import React, { useState } from "react";
import { Star, CheckCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios"; // 🆕 Import axios for database communication

export default function FeedbackForm({ role, onReturn }) {
const [rating, setRating] = useState(0);
const [hover, setHover] = useState(0);
const [feedback, setFeedback] = useState("");
const [submitted, setSubmitted] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false); // 🆕 Track loading state

// Unified theme handling based on role
const isTeacher = role === "TEACHER";
const accentColor = isTeacher ? "bg-green-700 hover:bg-green-800" : "bg-purple-700 hover:bg-purple-800";
const starActiveColor = "#facc15"; 
const ringColor = isTeacher ? "focus:ring-green-500" : "focus:ring-purple-500";

const handleSubmit = async (e) => {
e.preventDefault();
if (rating === 0) {
alert("Please select a star rating.");
return;
}

setIsSubmitting(true);
try {
// 🆕 REAL INTEGRATION: Sending data to the admin feedback submit endpoint
await axios.post("http://127.0.0.1:5000/admin/feedbacks/submit", {
role: role,
email: localStorage.getItem("email") || "User", // Ensure email is in localStorage
rating: rating,
feedback: feedback,
created_at: new Date().toISOString() // Required for backend sorting
});

setSubmitted(true);

// Return to dashboard after 3 seconds
setTimeout(() => {
onReturn();
}, 3000);
} catch (err) {
console.error("Feedback submission error:", err);
alert("Failed to save feedback. Please check if the backend server is running.");
} finally {
setIsSubmitting(false);
}
};

if (submitted) {
return (
<motion.div 
initial={{ opacity: 0, scale: 0.9 }} 
animate={{ opacity: 1, scale: 1 }}
className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl text-center border border-gray-100"
>
<div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isTeacher ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"}`}>
<CheckCircle size={48} />
</div>
<h2 className="text-2xl font-bold text-gray-800">Thanks for your valuable feedback!</h2>
<p className="text-gray-500 mt-2 font-medium">Your response has been stored successfully.</p>
<p className="text-sm text-gray-400 mt-4 italic">Returning you to the dashboard...</p>
</motion.div>
);
}

return (
<motion.div 
initial={{ opacity: 0, y: 20 }} 
animate={{ opacity: 1, y: 0 }}
className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100"
>
<div className="mb-8">
<h2 className="text-3xl font-black text-gray-900">Rate Your Experience</h2>
<p className="text-gray-600 font-medium mt-1 text-sm uppercase tracking-wide">Help us improve Hirelytic</p>
</div>

<form onSubmit={handleSubmit} className="space-y-8">
{/* STAR RATING */}
<div className="flex flex-col items-center gap-4">
<div className="flex items-center gap-2">
{[1, 2, 3, 4, 5].map((star) => (
<button
key={star}
type="button"
className="transition-transform hover:scale-125 active:scale-95 focus:outline-none"
onClick={() => setRating(star)}
onMouseEnter={() => setHover(star)}
onMouseLeave={() => setHover(0)}
>
<Star
    size={48}
    fill={(hover || rating) >= star ? starActiveColor : "none"}
    color={(hover || rating) >= star ? starActiveColor : "#d1d5db"}
    strokeWidth={2.5}
/>
</button>
))}
</div>
<span className="text-sm font-black text-gray-400 uppercase tracking-widest">
{rating > 0 ? `Rating: ${rating} / 5` : "Select a rating"}
</span>
</div>

{/* FEEDBACK TEXT */}
<div>
<label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">
Write your feedback
</label>
<textarea
required
className={`w-full border-2 border-gray-100 rounded-2xl p-5 outline-none transition-all resize-none font-medium bg-gray-50/50 focus:bg-white focus:border-transparent focus:ring-4 ${ringColor}`}
rows="5"
placeholder="Tell us what you liked or what we can improve..."
value={feedback}
onChange={(e) => setFeedback(e.target.value)}
/>
</div>

<div className="flex gap-4">
<button
type="button"
onClick={onReturn}
className="flex-1 py-4 rounded-2xl font-bold text-gray-500 border-2 border-gray-100 hover:bg-gray-50 transition-all"
>
Cancel
</button>
<button
type="submit"
disabled={isSubmitting}
className={`flex-[2] py-4 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 ${accentColor} ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
>
{isSubmitting ? "Sending..." : <><Send size={18} /> Submit Feedback</>}
</button>
</div>
</form>
</motion.div>
);
}
