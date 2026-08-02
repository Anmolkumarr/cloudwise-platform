import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";

const SERVICE_COLORS = { EC2: "#7c5cfc", S3: "#3b82f6", RDS: "#f97316", IAM: "#22c55e", Others: "#94a3b8" };
const VIEWS = ["daily", "monthly"];

const CostAnalysis = () => {
  const [data, setData] = useState(null);
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/cost-analysis")
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

  const chartData = view === "daily" ? data.daily : data.monthly.map((m) => ({ date: m.month, amount: m.amount }));

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Cost Analysis</h1>
          <p className="text-sm text-gray-500">Total spend: <span className="text-white font-semibold">${data.total}</span></p>
        </div>
        <div className="flex bg-white/5 rounded-xl p-1 border border-border">
          {VIEWS.map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${view === v ? "bg-primary text-white" : "text-gray-400"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SectionCard title={`${view === "daily" ? "Daily" : "Monthly"} Cost Trend`} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Line type="monotone" dataKey="amount" stroke="#9d85ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Cost by Service">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.byService} dataKey="amount" nameKey="service" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.byService.map((s) => <Cell key={s.service} fill={SERVICE_COLORS[s.service]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Service Breakdown">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.byService}>
            <CartesianGrid stroke="#1c2137" vertical={false} />
            <XAxis dataKey="service" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.byService.map((s) => <Cell key={s.service} fill={SERVICE_COLORS[s.service]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>
    </DashboardLayout>
  );
};

export default CostAnalysis;