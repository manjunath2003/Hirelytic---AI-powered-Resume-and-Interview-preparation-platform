import { useState, useEffect } from "react";

export default function ProfilePage() {
  const userId = localStorage.getItem("user_id");
  const [profile, setProfile] = useState({});
  const [photoPreview, setPhotoPreview] = useState("/default-avatar.png");

  useEffect(() => {
    if (!userId) return;

    fetch(`http://127.0.0.1:5000/api/profile/get/${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        const p = data.profile || {};

        const photo = p.profilePhoto
          ? p.profilePhoto.startsWith("http")
            ? p.profilePhoto
            : `http://127.0.0.1:5000/${p.profilePhoto}`
          : "/default-avatar.png";

        setProfile(p);
        setPhotoPreview(photo);
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, [userId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    await fetch(`http://127.0.0.1:5000/api/profile/update/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    alert("Profile Updated Successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

      {/* Profile Photo */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={photoPreview}
          alt="Profile"
          className="h-20 w-20 rounded-full object-cover border"
        />
      </div>

      {/* FORM FIELDS (with labels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input label="Full Name" name="name" value={profile.name} handler={handleChange} />
        <Input label="Email" name="email" value={profile.email} handler={handleChange} />
        <Input label="Phone" name="phone" value={profile.phone} handler={handleChange} />
        <Input label="Age" name="age" value={profile.age} handler={handleChange} />
        <Input label="Gender" name="gender" value={profile.gender} handler={handleChange} />
        <Input label="Qualification" name="qualification" value={profile.qualification} handler={handleChange} />
        <Input label="Experience (Years)" name="experience" value={profile.experience} handler={handleChange} />
        <Input label="Skills" name="skills" value={profile.skills} handler={handleChange} />
        <Input label="Preferred Subject" name="preferred_subject" value={profile.preferred_subject} handler={handleChange} />
        <Input label="Preferred Location" name="preferred_location" value={profile.preferred_location} handler={handleChange} />
        <Input label="Job Type" name="job_type" value={profile.job_type} handler={handleChange} />

        <div className="md:col-span-2">
          <label className="font-semibold">About</label>
          <textarea
            className="border p-2 rounded mt-1 w-full"
            name="about"
            value={profile.about || ""}
            onChange={handleChange}
          />
        </div>

      </div>

      <button
        onClick={saveProfile}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Save Profile
      </button>
    </div>
  );
}

function Input({ label, name, value, handler }) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <input
        className="border p-2 rounded mt-1 w-full"
        name={name}
        value={value || ""}
        onChange={handler}
      />
    </div>
  );
}
