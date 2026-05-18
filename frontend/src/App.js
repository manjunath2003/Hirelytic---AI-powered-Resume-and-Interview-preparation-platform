import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WelcomePage from "./pages/WelcomePage";

import TeacherProfile from "./pages/TeacherProfile";
import RecruiterProfile from "./pages/RecruiterProfile";

import RecruiterDashboard from "./pages/RecruiterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SkillTest from "./pages/skills/SkillTest";
import SkillTestResult from "./pages/skills/SkillTestResult";
import TeacherDashboard from "./pages/TeacherDashboard";
import JobDetails from "./pages/JobDetails";
import SelectResume from "./pages/SelectResume";
import InterviewPrep from "./pages/InterviewPreparation";
import Notifications from "./pages/Notifications";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider, useUser } from "./context/UserContext";


// ---------------- LAYOUT ----------------
function Layout({ children }) {
const location = useLocation();
const hideNavbarRoutes = ["/", "/login", "/register", "/welcome"];
const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

return (
<>
{!shouldHideNavbar && <Navbar />}
{children}
</>
);
}

/* ✅ Wrapper kept (unchanged logic) */
function TeacherDashboardWrapper() {
const { user } = useUser();
return <TeacherDashboard userId={user?._id} />;
}


// ---------------- ROUTES ----------------
function AnimatedRoutes() {
const location = useLocation();

return (
<AnimatePresence mode="wait">
<Routes location={location} key={location.pathname}>

{/* Public Pages */}
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/welcome" element={<WelcomePage />} />

{/* 🔒 Teacher Profile */}
<Route
  path="/teacher/profile"
  element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherProfile />
    </ProtectedRoute>
  }
/>

{/* 🔒 Recruiter Profile (NEW – REQUIRED) */}
<Route
  path="/employer/profile"
  element={
    <ProtectedRoute allowedRole="employer">
      <RecruiterProfile />
    </ProtectedRoute>
  }
/>

<Route path="/skill-test" element={<SkillTest />} />
<Route path="/skill-test/result" element={<SkillTestResult />} />
<Route path="/job/:jobId" element={<JobDetails />} />
<Route path="/select-resume/:jobId" element={<SelectResume />} />
<Route path="/Interview-Preparation" element={<InterviewPrep />} />

{/* 🔔 Teacher Notifications */}
<Route
  path="/teacher/notifications"
  element={
    <ProtectedRoute allowedRole="teacher">
      <Notifications />
    </ProtectedRoute>
  }
/>

{/* ⭐ Teacher Dashboard */}
<Route
  path="/teacher/dashboard"
  element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherDashboard />
    </ProtectedRoute>
  }
/>

{/* 🛡️ Admin Dashboard */}
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

{/* 🧑‍💼 Employer Dashboard */}
<Route
  path="/employer/dashboard"
  element={
    <ProtectedRoute allowedRole="employer">
      <RecruiterDashboard />
    </ProtectedRoute>
  }
/>

</Routes>
</AnimatePresence>
);
}


// ---------------- APP ROOT ----------------
function App() {
return (
<UserProvider>
<Router>
<Layout>
  <AnimatedRoutes />
</Layout>
</Router>
</UserProvider>
);
}

export default App;
