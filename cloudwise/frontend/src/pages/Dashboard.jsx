import React, { useEffect, useState } from "react";
import {
  DollarSign, Server, Package, Database, Users, AlertTriangle, Info,
  CheckCircle2, Rocket, HardDrive, Layers, ArrowDownRight, TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import QuickActionModal from "../components/QuickActionModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { getCurrencySymbol } from "../utils/currency.js";
const SERVICE_COLORS = { EC2: "#7c5cfc", S3: "#3b82f6", RDS: "#f97316", IAM: "#22c55e", Others: "#94a3b8" };
const CATEGORY_ROUTES = { EC2: "/ec2", S3: "/s3", RDS: "/rds", IAM: "/iam" };
const STATUS_COLORS = { running: "#22c55e", stopped: "#ef4444", warning: "#94a3b8" };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null); // "ec2" | "s3" | "rds" | "iam" | null

  const fetchDashboard = () => {
    setLoading(true);
    setError("");
    api
      .get("/dashboard")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard data. Please check your connection."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000); // silent auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={fetchDashboard} /></DashboardLayout>;
  if (!data) return null;

  const { cards, costOverview, costByService, resourceStatus, resourceDistribution, alerts, recommendations, activities, costForecast, budget, currency } = data;
  const symbol = getCurrencySymbol(currency);

  const distributionData = [
    { name: "EC2", value: resourceDistribution.ec2 },
    { name: "S3", value: resourceDistribution.s3 },
    { name: "RDS", value: resourceDistribution.rds },
    { name: "IAM", value: resourceDistribution.iam },
  ];

  const statusData = [
    { name: "Running", value: resourceStatus.running, color: STATUS_COLORS.running },
    { name: "Stopped", value: resourceStatus.stopped, color: STATUS_COLORS.stopped },
    { name: "Warning", value: resourceStatus.warning, color: STATUS_COLORS.warning },
  ];

  const severityIcon = { critical: AlertTriangle, warning: AlertTriangle, info: Info };
  const severityColor = { critical: "text-accent-red bg-accent-red/15", warning: "text-accent-orange bg-accent-orange/15", info: "text-accent-blue bg-accent-blue/15" };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your cloud infrastructure today.</p>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Total Cost" value={`${symbol}${cards.totalCost}`} sub="↓ 12.4% from last month" trend="down" color="primary" to="/cost-analysis" />
        <StatCard icon={Server} label="EC2 Instances" value={cards.ec2Count} sub={`● ${cards.ec2Running} Running`} color="blue" to="/ec2" />
        <StatCard icon={Package} label="S3 Buckets" value={cards.s3Count} sub="Active buckets" color="green" to="/s3" />
        <StatCard icon={Database} label="RDS Databases" value={cards.rdsCount} sub={`Available: ${cards.rdsAvailable}`} color="orange" to="/rds" />
        <StatCard icon={Users} label="IAM Users" value={cards.iamCount} sub="Active Users" color="primary" to="/iam" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SectionCard title="Cost Overview" className="lg:col-span-1">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-white">{symbol}{cards.totalCost}</span>
            <span className="text-xs text-accent-green flex items-center gap-0.5"><ArrowDownRight size={12}/> 12.4%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={costOverview}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Area type="monotone" dataKey="amount" stroke="#9d85ff" strokeWidth={2} fill="url(#costGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Cost by Service">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={costByService} dataKey="amount" nameKey="service" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {costByService.map((entry) => (
                    <Cell key={entry.service} fill={SERVICE_COLORS[entry.service]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {costByService.map((s) => (
                <div key={s.service} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="h-2 w-2 rounded-full" style={{ background: SERVICE_COLORS[s.service] }} />
                    {s.service}
                  </span>
                  <span className="text-gray-300 font-medium">{symbol}{s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Resource Status">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              <p className="text-2xl font-bold text-white">{resourceStatus.total}</p>
              <p className="text-xs text-gray-500 -mt-1 mb-2">Total</p>
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="text-gray-300 font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Resource distribution bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <SectionCard title="Resource Distribution">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distributionData}>
              <CartesianGrid stroke="#1c2137" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#7c5cfc" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Recent Alerts" action={<a href="/alerts" className="text-xs text-primary-light">View all</a>}>
          <div className="space-y-3">
            {alerts.filter((a) => !a.resolved).slice(0, 3).map((a) => {
              const Icon = severityIcon[a.severity] || Info;
              return (
                <div key={a._id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${severityColor[a.severity]}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{a.type}</p>
                    <p className="text-xs text-gray-500 truncate">{a.message}</p>
                  </div>
                </div>
              );
            })}
           {alerts.filter((a) => !a.resolved).length === 0 && <p className="text-sm text-gray-500">No active alerts 🎉</p>}
          </div>
        </SectionCard>

        <SectionCard title="Top Optimization Recommendations" action={<a href="/optimization" className="text-xs text-primary-light">View all</a>}>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((r) => (
              <div key={r._id} className="flex items-center justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-accent-green/15 text-accent-green flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 font-medium truncate">{r.action}</p>
                    <p className="text-xs text-gray-500">Save up to {symbol}{r.saving.toFixed(2)}/month</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(CATEGORY_ROUTES[r.category] || "/optimization")}
                  className="text-xs border border-primary/40 text-primary-light rounded-lg px-2.5 py-1 shrink-0 hover:bg-primary/10 transition-colors"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <SectionCard title="Quick Actions" className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 flex-wrap h-full py-3">
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { icon: Rocket, label: "Launch EC2", action: "ec2", color: "text-accent-orange", bg: "bg-accent-orange/10" },
                { icon: HardDrive, label: "Create Bucket", action: "s3", color: "text-accent-green", bg: "bg-accent-green/10" },
                { icon: Database, label: "Create RDS", action: "rds", color: "text-accent-blue", bg: "bg-accent-blue/10" },
                { icon: Users, label: "Add IAM User", action: "iam", color: "text-accent-red", bg: "bg-accent-red/10" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setActiveModal(a.action)}
                  className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-200 text-xs font-medium transition-colors"
                >
                  <span className={`h-12 w-12 rounded-2xl flex items-center justify-center ${a.bg}`}>
                    <a.icon size={26} className={a.color} />
                  </span>
                  {a.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/monitoring")}
              className="text-xs border border-border text-gray-400 hover:text-white hover:border-primary/40 rounded-lg px-3 py-1.5 shrink-0 transition-colors"
            >
              View All
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Cost Forecast">
          <p className="text-2xl font-bold text-white">{symbol}{costForecast}</p>
          <p className="text-xs text-gray-500 mb-3">Predicted for next period</p>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={costOverview}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#forecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Budget Status">
          {(() => {
            const pct = (budget.used / budget.total) * 100;
            const isExceeded = pct > 100;
            const isWarning = pct >= 80 && pct <= 100;
            const barColor = isExceeded ? "bg-accent-red" : isWarning ? "bg-accent-orange" : "bg-gradient-to-r from-primary to-accent-green";
            const textColor = isExceeded ? "text-accent-red" : isWarning ? "text-accent-orange" : "text-gray-500";

            return (
              <>
                <p className="text-2xl font-bold text-white">{symbol}{budget.used} <span className="text-sm text-gray-500 font-normal">/ {symbol}{budget.total}</span></p>
                <p className={`text-xs mb-3 font-medium ${textColor}`}>
                  {isExceeded ? `⚠️ Budget Exceeded by ${symbol}${(budget.used - budget.total).toFixed(2)}` : `${pct.toFixed(1)}% Used`}
                </p>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </>
            );
          })()}
        </SectionCard>

        <SectionCard title="System Health">
          <div className="flex items-center gap-2 text-accent-green mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold">All Systems Operational</span>
          </div>
          <p className="text-xs text-gray-500">Live Activity</p>
          <div className="mt-2 space-y-2 max-h-24 overflow-y-auto">
            {activities.slice(0, 3).map((act) => (
              <div key={act._id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">{act.action}</span>
                <span className="text-gray-600 shrink-0 ml-2">{new Date(act.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {activeModal && (
        <QuickActionModal
          action={activeModal}
          onClose={() => setActiveModal(null)}
          onSuccess={fetchDashboard}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;