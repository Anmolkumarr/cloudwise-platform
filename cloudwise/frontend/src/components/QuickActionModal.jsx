import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";

const CONFIG = {
  ec2: {
    title: "Launch EC2 Instance",
    endpoint: "/ec2",
    fields: [
      { name: "name", label: "Instance Name", type: "text", placeholder: "e.g. web-server-03" },
      {
        name: "instanceType",
        label: "Instance Type",
        type: "select",
        options: ["t2.nano", "t2.micro", "t2.small", "t3.small", "t3.medium"],
      },
      { name: "region", label: "Region", type: "text", placeholder: "ap-south-1", default: "ap-south-1" },
    ],
  },
  s3: {
    title: "Create S3 Bucket",
    endpoint: "/s3",
    fields: [
      { name: "name", label: "Bucket Name", type: "text", placeholder: "e.g. my-new-bucket" },
      {
        name: "storageClass",
        label: "Storage Class",
        type: "select",
        options: ["Standard", "Standard-IA", "Glacier"],
      },
      { name: "region", label: "Region", type: "text", placeholder: "ap-south-1", default: "ap-south-1" },
    ],
  },
  rds: {
    title: "Create RDS Database",
    endpoint: "/rds",
    fields: [
      { name: "name", label: "Database Name", type: "text", placeholder: "e.g. orders-db" },
      { name: "engine", label: "Engine", type: "select", options: ["PostgreSQL", "MySQL"] },
      { name: "region", label: "Region", type: "text", placeholder: "ap-south-1", default: "ap-south-1" },
    ],
  },
  iam: {
    title: "Add IAM User",
    endpoint: "/iam",
    fields: [
      { name: "name", label: "User Name", type: "text", placeholder: "e.g. new-dev-user" },
      { name: "roles", label: "Roles (comma separated)", type: "text", placeholder: "e.g. ReadOnlyAccess, S3FullAccess" },
      { name: "mfaEnabled", label: "MFA Enabled", type: "checkbox" },
    ],
  },
};

const QuickActionModal = ({ action, onClose, onSuccess }) => {
  const cfg = CONFIG[action];
  const initial = {};
  cfg.fields.forEach((f) => {
    initial[f.name] = f.type === "checkbox" ? false : f.default || (f.type === "select" ? f.options[0] : "");
  });

  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post(cfg.endpoint, form);
      onSuccess();
      onClose();
      showToast(`${cfg.title} successful`, "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="glass-card w-full max-w-md p-6 fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{cfg.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {cfg.fields.map((f) => (
            <div key={f.name}>
              {f.type === "checkbox" ? (
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form[f.name]}
                    onChange={(e) => handleChange(f.name, e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                  {f.label}
                </label>
              ) : (
                <>
                  <label className="text-xs text-gray-400 font-medium">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      value={form[f.name]}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
                    >
                      {f.options.map((opt) => (
                        <option key={opt} value={opt} className="bg-bg">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form[f.name]}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-white/5 border border-border rounded-xl px-3 py-2.5 mt-1 text-sm text-gray-200 outline-none focus:border-primary/50"
                    />
                  )}
                </>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-medium py-2.5 rounded-xl disabled:opacity-60 mt-2"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickActionModal;