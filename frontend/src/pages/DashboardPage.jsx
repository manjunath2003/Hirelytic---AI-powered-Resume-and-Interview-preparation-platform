import React from "react";
import TeacherDashboard from "../components/TeacherDashboard";
import { useUser } from "../context/UserContext";   // ✅ import hook correctly

export default function DashboardPage() {
  const { user } = useUser();   // ✅ now "user" is defined

  if (!user?._id) {
    return (
      <div className="p-10 text-center text-gray-500 text-xl">
        Loading user...
      </div>
    );
  }

  return <TeacherDashboard userId={user._id} />;
}

