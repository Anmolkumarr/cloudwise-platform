import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";

const IAM = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/iam")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load data. Please check your connection."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActingId(id);
    try {
      await api.delete(`/iam/${id}`);
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!data) return null;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white mb-1">IAM Users</h1>
      <p className="text-sm text-gray-500 mb-6">Manage user access, roles, and MFA status.</p>

      <SectionCard title="Users">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Roles</th>
                <th className="pb-3 font-medium">MFA</th>
                <th className="pb-3 font-medium">Last Active</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.resources.map((r) => (
                <tr key={r._id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="py-3 text-gray-200 font-medium">{r.name}</td>
                  <td className="py-3 text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {r.roles?.map((role) => (
                        <span key={role} className="bg-white/5 border border-border px-2 py-0.5 rounded-lg text-xs">{role}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    {r.mfaEnabled ? (
                      <span className="flex items-center gap-1.5 text-accent-green text-xs font-medium"><ShieldCheck size={14}/> Enabled</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-accent-red text-xs font-medium"><ShieldAlert size={14}/> Disabled</span>
                    )}
                  </td>
                  <td className="py-3 text-gray-500 text-xs">{new Date(r.lastActive).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => deleteUser(r._id, r.name)}
                        disabled={actingId === r._id}
                        title="Delete"
                        className="p-1.5 rounded-lg border border-border text-gray-400 hover:text-accent-red hover:border-accent-red/50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default IAM;
