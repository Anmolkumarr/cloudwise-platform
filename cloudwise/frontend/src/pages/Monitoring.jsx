import React, { useEffect, useState } from "react";
import { Activity as ActivityIcon, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";

const statusBadge = { running: "bg-accent-green/15 text-accent-green", active: "bg-accent-green/15 text-accent-green", stopped: "bg-accent-red/15 text-accent-red", warning: "bg-accent-orange/15 text-accent-orange" };

const Monitoring = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/system-health")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load data. Please check your connection."))
      .finally(() => setLoading(false));
  };

   useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);
  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!data) return null;

  const cpuResources = data.resources.filter((r) => r.type === "EC2");

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white mb-1">Monitoring</h1>
      <p className="text-sm text-gray-500 mb-6">Real-time health and performance of your infrastructure.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SectionCard title="System Health Score">
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "health", value: data.healthScore, fill: data.healthScore > 80 ? "#22c55e" : "#f97316" }]} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#1c2137" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-28 mb-16">
            <p className="text-3xl font-bold text-white">{data.healthScore}%</p>
          </div>
          <div className="flex items-center gap-2 justify-center text-accent-green">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">{data.status}</span>
          </div>
        </SectionCard>

        <SectionCard title="Average CPU Utilization" className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <ActivityIcon size={22} className="text-primary-light" />
            <span className="text-3xl font-bold text-white">{data.avgCpu}%</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={cpuResources.map((r) => ({ name: r.name, cpu: r.cpuUsage || 0 }))}>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="cpu" radius={[6, 6, 0, 0]} fill="#7c5cfc" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Resource Health">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="pb-3 font-medium">Resource</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">CPU</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.resources.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/5">
                  <td className="py-3 text-gray-200 font-medium">{r.name}</td>
                  <td className="py-3 text-gray-400">{r.type}</td>
                  <td className="py-3 text-gray-400">{r.cpuUsage != null ? `${r.cpuUsage}%` : "—"}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${statusBadge[r.status]}`}>{r.status}</span>
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

export default Monitoring;