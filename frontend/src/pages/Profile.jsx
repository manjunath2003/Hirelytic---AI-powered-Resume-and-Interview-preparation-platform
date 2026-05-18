import { useState, useEffect } from "react";
import AnimatedPage from "../components/AnimatedPage";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // LOAD INITIAL DATA FROM LOCALSTORAGE
    setFormData({
      name: localStorage.getItem("name") || "",
      email: localStorage.getItem("email") || "",
      role: localStorage.getItem("role") || "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/auth/update_profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setSuccessMsg("Profile updated successfully!");

        localStorage.setItem("name", formData.name);
        localStorage.setItem("email", formData.email);
      }
    } catch (error) {
      setErrorMsg("Server error! Try again.");
    }

    setLoading(false);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:5000/auth/change_password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();

      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setSuccessMsg("Password updated successfully!");
        setPasswords({ oldPassword: "", newPassword: "" });
      }
    } catch (error) {
      setErrorMsg("Server error! Try again.");
    }

    setLoading(false);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-100 flex justify-center pt-28 pb-10 px-4">
        <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">

          <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
            Profile Settings
          </h1>

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {successMsg}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {errorMsg && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {errorMsg}
            </div>
          )}

          {/* UPDATE PROFILE */}
          <form onSubmit={updateProfile} className="space-y-5">

            <h2 className="text-xl font-semibold text-gray-700 mb-2">Basic Details</h2>

            <div>
              <label className="font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="font-medium">Role (Read Only)</label>
              <input
                value={formData.role}
                readOnly
                className="w-full mt-1 p-3 border rounded-lg bg-gray-200 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* PASSWORD CHANGE */}
          <hr className="my-8" />

          <form onSubmit={updatePassword} className="space-y-5">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Change Password
            </h2>

            <div>
              <label className="font-medium">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div>
              <label className="font-medium">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

        </div>
      </div>
    </AnimatedPage>
  );
}
