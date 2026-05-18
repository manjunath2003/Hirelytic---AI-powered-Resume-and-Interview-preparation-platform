import { Link } from "react-router-dom";
import AnimatedPage from "../components/AnimatedPage";

export default function Home() {
  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-between px-10 md:px-20 lg:px-32 bg-gradient-to-b from-white to-gray-100">

        {/* LEFT SECTION */}
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Welcome to <span className="text-yellow-500">Hirelytic</span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
            The <span className="font-semibold text-yellow-600">AI-powered platform</span> built for 
            <span className="font-semibold text-yellow-600"> Teachers & Employers</span>.  
            Create job-winning resumes, prepare confidently for interviews,  
            and find your perfect career match — all in one place.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="px-10 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl shadow-lg hover:bg-yellow-300 transition-all duration-300"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-10 py-3 bg-transparent border-2 border-gray-700 text-gray-700 font-semibold rounded-xl hover:bg-white hover:text-blue-700 transition-all duration-300"
            >
              Signup
            </Link>
          </div>
        </div>

        {/* RIGHT SECTION — IMAGE */}
        <div className="md:w-1/2 flex justify-center relative">
          <img
            src="/home-bg.jpg"
            alt="Teachers"
            className="w-full max-w-xl rounded-3xl shadow-xl object-cover"
          />
        </div>

      </div>
    </AnimatedPage>
  );
}
