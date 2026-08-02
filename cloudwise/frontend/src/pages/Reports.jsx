import React, { useEffect, useState } from "react";
import { FileText, FileDown, FileSpreadsheet } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";
import { useToast } from "../context/ToastContext.jsx";
const SERVICE_COLORS = { EC2: "#7c5cfc", S3: "#3b82f6", RDS: "#f97316", IAM: "#22c55e", Others: "#94a3b8" };

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(null); // "csv" | "pdf" | null
  const { showToast } = useToast();
  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/reports")
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load report data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const response = await api.get(`/reports/${type}`, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cloudwise-report-${Date.now()}.${type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`${type.toUpperCase()} report downloaded`, "success");
    } catch (err) {
      const msg = `Failed to download ${type.toUpperCase()} report.`;
      setError(msg);
      showToast(msg, "error");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (error && !data) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reports</h1>
          <p className="text-sm text-gray-500">Generated on {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload("csv")}
            disabled={downloading !== null}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-border text-gray-200 text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-60 transition-colors"
          >
            <FileSpreadsheet size={16} /> {downloading === "csv" ? "Downloading..." : "Download CSV"}
          </button>
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading !== null}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-60 transition-colors"
          >
            <FileDown size={16} /> {downloading === "pdf" ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm rounded-xl px-4 py-2.5 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary-light flex items-center justify-center"><FileText size={20}/></div>
            <div>
              <p className="text-xs text-gray-500">Total Cost (period)</p>
              <p className="text-2xl font-bold text-white">${data.summary.totalCost}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center"><FileText size={20}/></div>
            <div>
              <p className="text-xs text-gray-500">Total Resources</p>
              <p className="text-2xl font-bold text-white">{data.summary.totalResources}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Cost Share by Service">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.serviceBreakdown} dataKey="amount" nameKey="service" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.serviceBreakdown.map((s) => <Cell key={s.service} fill={SERVICE_COLORS[s.service]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#131829", border: "1px solid #232842", borderRadius: 10, fontSize: 12, color: "#e5e7eb" }} itemStyle={{ color: "#e5e7eb" }} labelStyle={{ color: "#9ca3af" }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Service Breakdown">
          <div className="space-y-3">
            {data.serviceBreakdown.map((s) => (
              <div key={s.service} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: SERVICE_COLORS[s.service] }} />
                  {s.service}
                </span>
                <span className="text-gray-500">{s.count} resources</span>
                <span className="text-white font-medium">${s.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
};

export default Reports;