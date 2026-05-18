import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Welcome() {
  const [progress, setProgress] = useState(0);

  const name = localStorage.getItem("name") || "User";
  const role = localStorage.getItem("tempRole") || "user";

  // Auto Progress Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Auto redirect after 2 seconds
  useEffect(() => {
    setTimeout(() => {
      if (role === "admin") window.location.href = "/admin/dashboard";
      else if (role === "teacher") window.location.href = "/teacher/dashboard";
      else if (role === "employer") window.location.href = "/employer/dashboard";
      else window.location.href = "/login";
    }, 2000);
  }, [role]);

  const roleGreeting = {
    admin: "Welcome Admin 👑",
    teacher: "Welcome Teacher 👩‍🏫",
    employer: "Welcome Recruiter 🧑‍💼",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600">

      {/* ✨ Floating Neon Particles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white bg-opacity-30 blur-xl rounded-full"
          style={{
            width: Math.random() * 100 + 40,
            height: Math.random() * 100 + 40,
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* ✨ 3D Animated Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white bg-opacity-20 backdrop-blur-3xl shadow-2xl rounded-3xl px-14 py-12 text-center border border-white/30 max-w-xl w-full z-10"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent blur-3xl"></div>

        <motion.h1
          className="text-4xl font-extrabold text-white drop-shadow-lg mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {roleGreeting[role] || "Welcome 🎉"}
        </motion.h1>

        <motion.p
          className="text-lg text-white/90 font-medium"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          Hello{" "}
          <span className="text-white font-bold drop-shadow-md">{name}</span>,
          your dashboard is preparing…
        </motion.p>

        {/* Circular Progress Ring */}
        <motion.div
          className="relative flex justify-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg className="w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="#ffffff44"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="56"
              cy="56"
              r="45"
              stroke="#ffffff"
              strokeWidth="8"
              fill="none"
              strokeDasharray="280"
              strokeDashoffset={280 - (280 * progress) / 100}
              strokeLinecap="round"
              animate={{ strokeDashoffset: 280 - (280 * progress) / 100 }}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <span className="absolute text-2xl font-bold text-white drop-shadow-lg">
            {progress}%
          </span>
        </motion.div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-white/30 rounded-full h-3 mt-5 backdrop-blur-xl">
          <motion.div
            className="bg-white h-3 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>

        <p className="text-sm text-white/90 mt-2">
          Redirecting in a moment…
        </p>
      </motion.div>
    </div>
  );
}
