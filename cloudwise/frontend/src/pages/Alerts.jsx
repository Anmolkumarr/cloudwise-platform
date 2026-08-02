import React, { useEffect, useState } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";

const severityIcon = { critical: AlertTriangle, warning: AlertTriangle, info: Info };
const severityColor = { critical: "text-accent-red bg-accent-red/15", warning: "text-accent-orange bg-accent-orange/15", info: "text-accent-blue bg-accent-blue/15" };

const Alerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(null);
  const [tab, setTab] = useState("active"); // "active" | "resolved"

  const load = () => {
    setLoading(true);
    setError("");
    return api
      .get("/alerts")
      .then(({ data }) => setAlerts(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load alerts. Please check your connection."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const resolve = async (id) => {
    setResolving(id);
    try {
      await api.put(`/alerts/${id}/resolve`);
      await load();
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!alerts) return null;

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);
  const shown = tab === "active" ? activeAlerts : resolvedAlerts;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white mb-1">Alerts</h1>
      <p className="text-sm text-gray-500 mb-6">{activeAlerts.length} unresolved alerts</p>

      <div className="flex bg-white/5 rounded-xl p-1 border border-border w-fit mb-4">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg ${tab === "active" ? "bg-primary text-white" : "text-gray-400"}`}
        >
          Active ({activeAlerts.length})
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg ${tab === "resolved" ? "bg-primary text-white" : "text-gray-400"}`}
        >
          Resolved ({resolvedAlerts.length})
        </button>
      </div>

      <SectionCard title={tab === "active" ? "Active Alerts" : "Resolved Alerts"}>
        <div className="space-y-3">
          {shown.length === 0 && (
            <p className="text-sm text-gray-500 py-6 text-center">
              {tab === "active" ? "No active alerts 🎉" : "Nothing resolved yet"}
            </p>
          )}
          {shown.map((a) => {
            const Icon = severityIcon[a.severity] || Info;
            return (
              <div key={a._id} className={`flex items-center justify-between gap-3 p-3 rounded-xl ${a.resolved ? "opacity-50" : ""} bg-white/5`}>
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${severityColor[a.severity]}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium">{a.type}</p>
                    <p className="text-xs text-gray-500">{a.message}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!a.resolved ? (
                  <button
                    onClick={() => resolve(a._id)}
                    disabled={resolving === a._id}
                    className="text-xs border border-primary/40 text-primary-light rounded-lg px-3 py-1.5 shrink-0 disabled:opacity-50"
                  >
                    {resolving === a._id ? "Resolving..." : "Resolve"}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-accent-green shrink-0"><CheckCircle2 size={14}/> Resolved</span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default Alerts;