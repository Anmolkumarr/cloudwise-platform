import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";
import { Play, Square, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";

const statusBadge = { running: "bg-accent-green/15 text-accent-green", stopped: "bg-accent-red/15 text-accent-red", warning: "bg-accent-orange/15 text-accent-orange" };

const RDS = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/rds")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load data. Please check your connection."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = async (id) => {
    setActingId(id);
    try {
      await api.put(`/rds/${id}/toggle`);
      await load();
    } finally {
      setActingId(null);
    }
  };

  const deleteDatabase = async (id, name) => {
    if (!window.confirm(`Delete database "${name}"? This cannot be undone.`)) return;
    setActingId(id);
    try {
      await api.delete(`/rds/${id}`);
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!data) return null;

  const perfData = data.resources.map((r) => ({ name: r.name, score: r.performanceScore }));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white mb-1">RDS Databases</h1>
      <p className="text-sm text-gray-500 mb-6">Monitor performance and cost of your managed databases.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SectionCard title="Performance Score">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfData}>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Cost Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.costs}>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Databases">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="pb-3 font-medium">DB Name</th>
                <th className="pb-3 font-medium">Engine</th>
                <th className="pb-3 font-medium">Region</th>
                <th className="pb-3 font-medium">Performance</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Cost/day</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.resources.map((r) => (
                <tr key={r._id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="py-3 text-gray-200 font-medium">{r.name}</td>
                  <td className="py-3 text-gray-400">{r.engine}</td>
                  <td className="py-3 text-gray-400">{r.region}</td>
                  <td className="py-3 text-gray-400">{r.performanceScore}/100</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${statusBadge[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-3 text-right text-gray-200">${r.cost.toFixed(2)}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(r._id)}
                        disabled={actingId === r._id}
                        title={r.status === "stopped" ? "Start" : "Stop"}
                        className="p-1.5 rounded-lg border border-border text-gray-400 hover:text-white hover:border-primary/50 disabled:opacity-50"
                      >
                        {r.status === "stopped" ? <Play size={14} /> : <Square size={14} />}
                      </button>
                      <button
                        onClick={() => deleteDatabase(r._id, r.name)}
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

export default RDS;
