import { useEffect } from "react";
import AnimatedPage from "../components/AnimatedPage";

export default function WelcomePage() {
  useEffect(() => {
    const role = localStorage.getItem("role");

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      if (role === "admin") window.location.href = "/admin/dashboard";
      else if (role === "teacher") window.location.href = "/teacher/dashboard";
      else if (role === "employer") window.location.href = "/employer/dashboard";
      else window.location.href = "/login"; // fallback safety
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6">
        <h1 className="text-5xl font-extrabold drop-shadow mb-4 animate-pulse">
          Welcome to Hirelytic
        </h1>
        <p className="text-lg opacity-90">Loading your dashboard...</p>

        {/* Loader */}
        <div className="mt-8 animate-spin border-4 border-white border-t-transparent rounded-full w-12 h-12"></div>
      </div>
    </AnimatedPage>
  );
}
