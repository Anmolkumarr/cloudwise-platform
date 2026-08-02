import React, { useEffect, useState } from "react";
import { Wrench, PiggyBank } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import SectionCard from "../components/SectionCard.jsx";
import Loader from "../components/Loader.jsx";
import ErrorState from "../components/ErrorState.jsx";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const CATEGORY_ROUTES = { EC2: "/ec2", S3: "/s3", RDS: "/rds", IAM: "/iam" };

const categoryColor = { EC2: "bg-primary/15 text-primary-light", S3: "bg-accent-blue/15 text-accent-blue", RDS: "bg-accent-orange/15 text-accent-orange", IAM: "bg-accent-green/15 text-accent-green" };

const Optimization = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/recommendations")
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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-white mb-1">Optimization Center</h1>
      <p className="text-sm text-gray-500 mb-6">Recommendations to cut costs and improve efficiency.</p>

      <div className="glass-card p-5 mb-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center">
          <PiggyBank size={24} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total potential savings</p>
          <p className="text-2xl font-bold text-white">${data.totalSavings}/month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {data.recommendations.map((r) => (
          <div
            key={r._id}
            onClick={() => navigate(CATEGORY_ROUTES[r.category] || "/dashboard")}
            className="glass-card p-5 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${categoryColor[r.category]}`}>
                <Wrench size={16} />
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">{r.category}</span>
            </div>
            <h3 className="text-white font-semibold mb-1">{r.action}</h3>
            <p className="text-sm text-gray-500 mb-3">{r.issue}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Resource: <span className="text-gray-300">{r.resource}</span></span>
              {r.saving > 0 && <span className="text-sm font-semibold text-accent-green">Save ${r.saving.toFixed(2)}/mo</span>}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Optimization;