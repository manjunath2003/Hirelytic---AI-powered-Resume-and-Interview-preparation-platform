import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import AnimatedPage from "../components/AnimatedPage";

export default function TeacherProfile() {
const { user, updateUser } = useUser();
const userId = localStorage.getItem("user_id");
const token = localStorage.getItem("token");

const [profile, setProfile] = useState(null);
const [formData, setFormData] = useState({});
const [photoURL, setPhotoURL] = useState("/default-avatar.png");
const [isEditing, setIsEditing] = useState(false);
const [saving, setSaving] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState(null);

// ------------------ FETCH PROFILE ------------------
useEffect(() => {
if (!userId) return;

fetch(`http://127.0.0.1:5000/api/profile/get/${userId}`, {
headers: { Authorization: `Bearer ${token}` },
})
.then((res) => res.json())
.then((data) => {
const p = data.profile;
setProfile(p);
setFormData(p);

if (p?.profilePhoto) {
  setPhotoURL(
    p.profilePhoto.startsWith("http")
      ? p.profilePhoto
      : `http://127.0.0.1:5000/${p.profilePhoto}`
  );
}
})
.catch((err) => console.error("Profile fetch error:", err));
}, [userId, token]);

// ------------------ PHOTO HANDLING ------------------
const handlePhotoSelect = (e) => {
const file = e.target.files[0];
if (!file) return;

setSelectedPhoto(file);
setPhotoURL(URL.createObjectURL(file));
};

const uploadPhoto = async () => {
const fd = new FormData();
fd.append("photo", selectedPhoto);

const res = await fetch(
`http://127.0.0.1:5000/api/profile/uploadPhoto/${userId}`,
{ method: "POST" }
);

const data = await res.json();
return data.profilePhoto;
};

// ------------------ SAVE PROFILE ------------------
const handleSave = async () => {
setSaving(true);

let profilePhoto = profile.profilePhoto;

if (selectedPhoto) {
profilePhoto = await uploadPhoto();
}

const payload = {
...formData,
profilePhoto,
};

await fetch(
`http://127.0.0.1:5000/api/profile/update/${userId}`,
{
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
}
);

setProfile(payload);
updateUser({
name: payload.name,
email: payload.email,
profilePhoto: payload.profilePhoto,
});

setIsEditing(false);
setSaving(false);
};

if (!profile)
return <div className="p-10 text-center text-xl">Loading...</div>;

// ------------------ UI ------------------
return (
<AnimatedPage>
<div className="min-h-screen flex justify-center pt-28 px-4 bg-gray-100">
<div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">

  {/* PROFILE HEADER */}
  <div className="flex flex-col items-center mb-8">
    <img
      src={photoURL}
      alt="Profile"
      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
    />

    {isEditing && (
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="mt-4"
      />
    )}

    {isEditing ? (
      <input
        value={formData.name || ""}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        className="mt-4 text-2xl font-bold border p-2 rounded text-center"
      />
    ) : (
      <h1 className="text-3xl font-bold mt-4">
        {profile.name || user?.name || "Unnamed User"}
      </h1>
    )}

    {!isEditing && (
      <button
        onClick={() => setIsEditing(true)}
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Edit Profile
      </button>
    )}
  </div>

  {/* PROFILE DETAILS */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
    <EditableField label="Email" name="email" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Phone" name="phone" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Age" name="age" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Gender" name="gender" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Qualification" name="qualification" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Experience (Years)" name="experience" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Skills" name="skills" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Preferred Subject" name="preferred_subject" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Preferred Location" name="preferred_location" {...{ isEditing, formData, setFormData }} />
    <EditableField label="Job Type" name="job_type" {...{ isEditing, formData, setFormData }} />
  </div>

  {/* ABOUT */}
  <div className="mt-10">
    <h2 className="text-xl font-semibold mb-2">About</h2>
    {isEditing ? (
      <textarea
        value={formData.about || ""}
        onChange={(e) =>
          setFormData({ ...formData, about: e.target.value })
        }
        className="w-full border p-3 rounded"
        rows="4"
      />
    ) : (
      <p className="text-gray-700 bg-gray-100 p-4 rounded-lg shadow">
        {profile.about || "Not Provided"}
      </p>
    )}
  </div>

  {/* SAVE BUTTON */}
  {isEditing && (
    <button
      onClick={handleSave}
      disabled={saving}
      className="mt-8 bg-green-600 text-white px-6 py-2 rounded-lg"
    >
      {saving ? "Saving..." : "Save Changes"}
    </button>
  )}
</div>
</div>
</AnimatedPage>
);
}

// ------------------ FIELD COMPONENT ------------------
function EditableField({ label, name, isEditing, formData, setFormData }) {
return (
<div>
<p className="text-gray-500 font-medium">{label}</p>
{isEditing ? (
<input
  value={formData[name] || ""}
  onChange={(e) =>
    setFormData({ ...formData, [name]: e.target.value })
  }
  className="border p-2 rounded w-full"
/>
) : (
<p className="text-gray-900 font-semibold">
  {formData[name] || "Not Provided"}
</p>
)}
</div>
);
}
