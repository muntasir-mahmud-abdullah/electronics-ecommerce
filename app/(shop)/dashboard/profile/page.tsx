"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.user) {
        setProfileData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/user/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Failed to update password", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[#8892A4]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-black text-white tracking-tight mb-2">
          Profile Settings
        </h1>
        <p className="text-[#8892A4] text-sm">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#00D4E8]" />
          Profile Information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-[#111320] border border-[#1E2235] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#00D4E8]" />
          Change Password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-[#8892A4] text-xs uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full bg-[#0A0C14] border border-[#1E2235] rounded-lg px-4 py-3 text-white placeholder-[#8892A4] focus:border-[#00D4E8] focus:outline-none"
                required
                minLength={8}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00D4E8] hover:bg-[#00BDD0] text-[#0A0C14] font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
