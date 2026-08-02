import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Package,
  Database,
  Users,
  LineChart,
  Activity,
  Bell,
  Wrench,
  FileText,
  Settings,
  Cloud,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ec2", label: "EC2 Instances", icon: Server },
  { to: "/s3", label: "S3 Buckets", icon: Package },
  { to: "/rds", label: "RDS Databases", icon: Database },
  { to: "/iam", label: "IAM Users", icon: Users },
  { to: "/cost-analysis", label: "Cost Analysis", icon: LineChart },
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: Bell, badgeKey: "alerts" },
  { to: "/optimization", label: "Optimization", icon: Wrench },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ open, onClose, alertCount = 0, user }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 glass border-r border-border z-40 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Cloud size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">CloudWise</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Manage · Monitor · Optimize</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, badgeKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary-light border border-primary/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </span>
              {badgeKey === "alerts" && alertCount > 0 && (
                <span className="bg-accent-red text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {alertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-3 border-t border-border">
          <div className="glass-card p-3 rounded-xl">
            <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">AWS Account</p>
            <p className="text-sm text-white font-medium">{user?.awsAccountName || "—"}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">ID: {user?.awsAccountId || "—"}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
