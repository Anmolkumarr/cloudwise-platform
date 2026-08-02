import React, { useEffect, useState } from "react";
import { User, Shield, Bell, Cloud, Globe, Clock, DollarSign, Wallet, Check, Camera, Lock, Building2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Singapore",
  "Australia/Sydney",
];

const CURRENCIES = ["USD", "INR", "EUR", "GBP"];
const ROLES = ["admin", "user"];

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { applyTheme } = useTheme();
  const { showToast } = useToast();


  // ---------- App settings (theme/notifications/regional/billing) ----------
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // ---------- Profile form ----------
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    company: user?.company || "",
    avatar: user?.avatar || "",
    role: user?.role || "admin",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  // ---------- Password form ----------
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => setSettings(data))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setSettings((s) => ({ ...s, [field]: value }));
    setSaved(false);
  };

  const handleNotificationChange = (field, value) => {
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [field]: value } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError("");
    if (settings.budgetLimit === "" || isNaN(Number(settings.budgetLimit)) || Number(settings.budgetLimit) < 0) {
      setError("Budget limit must be a positive number");
      showToast("Budget limit must be a positive number", "error");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put("/settings", {
        theme: settings.theme,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
        currency: settings.currency,
        budgetLimit: Number(settings.budgetLimit),
      });
      setSettings(data);
      setSaved(true);
      showToast("Preferences saved", "success");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save settings";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image must be smaller than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((f) => ({ ...f, avatar: reader.result }));
      setProfileSaved(false);
      setProfileError("");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }
    setProfileSaving(true);
    setProfileError("");
    try {
      const { data } = await api.put("/auth/me", profileForm);
      updateUser(data);
      setProfileSaved(true);
      showToast("Profile updated successfully", "success");
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      setProfileError(msg);
      showToast(msg, "error");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSaved(true);
      showToast("Password updated successfully", "success");
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setPasswordError(msg);
      showToast(msg, "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  if (!settings) {
    return (
      <DashboardLayout>
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-3">
          {error || "Failed to load settings. Please check your connection and try again."}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          {saved ? <Check size={16} /> : null}
          {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
        </button>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ---------- Editable Profile ---------- */}
        <SectionCard title="Profile" className="lg:col-span-2">
          <form onSubmit={handleProfileSave} className="space-y-4">
            {profileError && (
              <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5">
                {profileError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    profileForm.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center cursor-pointer border-2 border-bg-card">
                  <Camera size={12} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p className="text-gray-300 font-medium">{user?.email}</p>
                <p className="text-xs mt-0.5">Click the camera icon to change your photo (max 2MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-medium">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => { setProfileForm((f) => ({ ...f, name: e.target.value })); setProfileSaved(false); }}
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Building2 size={12}/> Company</label>
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) => { setProfileForm((f) => ({ ...f, company: e.target.value })); setProfileSaved(false); }}
                  placeholder="e.g. Acme Inc."
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Role</label>
                <select
                  value={profileForm.role}
                  onChange={(e) => { setProfileForm((f) => ({ ...f, role: e.target.value })); setProfileSaved(false); }}
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50 capitalize"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-bg capitalize">{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Cloud size={12}/> AWS Account</label>
                <input
                  type="text"
                  value={user?.awsAccountName || ""}
                  disabled
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              {profileSaved ? <Check size={16} /> : null}
              {profileSaving ? "Saving..." : profileSaved ? "Saved" : "Save Profile"}
            </button>
          </form>
        </SectionCard>

        {/* ---------- Change Password ---------- */}
        <SectionCard title="Change Password">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {passwordError && (
              <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5">
                {passwordError}
              </div>
            )}
            {passwordSaved && (
              <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm rounded-xl px-4 py-2.5">
                Password updated successfully
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Lock size={12}/> Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Security">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-gray-500 flex items-center gap-2"><Shield size={14}/> Two-Factor Auth</span>
              <span className="text-accent-orange text-xs bg-accent-orange/15 px-2 py-1 rounded-lg">Not Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-gray-500 flex items-center gap-2"><Bell size={14}/> Alert Notifications</span>
              <span className={`text-xs px-2 py-1 rounded-lg ${settings.notifications.alerts ? "text-accent-green bg-accent-green/15" : "text-gray-500 bg-white/5"}`}>
                {settings.notifications.alerts ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Appearance">
          <label className="text-xs text-gray-400 font-medium">Theme</label>
          <div className="flex gap-3 mt-2">
            {["dark", "light"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  handleChange("theme", t);
                  applyTheme(t);
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border transition-colors ${
                  settings.theme === t
                    ? "bg-primary/15 border-primary/40 text-primary-light"
                    : "bg-white/5 border-border text-gray-400 hover:text-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-600 mt-2">Applies instantly across the app and is saved when you click Save Preferences.</p>
        </SectionCard>

        <SectionCard title="Notifications">
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
              <span>Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleNotificationChange("email", e.target.checked)}
                className="accent-primary h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-300 cursor-pointer">
              <span>Alert Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.alerts}
                onChange={(e) => handleNotificationChange("alerts", e.target.checked)}
                className="accent-primary h-4 w-4"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Regional">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Globe size={12}/> Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} className="bg-bg">{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Clock size={12}/> Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} className="bg-bg">{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Billing">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><DollarSign size={12}/> Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-bg">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5"><Wallet size={12}/> Monthly Budget Limit</label>
              <input
                type="number"
                min="0"
                value={settings.budgetLimit}
                onChange={(e) => handleChange("budgetLimit", e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
              />
              <p className="text-[11px] text-gray-600 mt-1.5">Used to calculate your Budget Status on the dashboard.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
};

export default Settings;