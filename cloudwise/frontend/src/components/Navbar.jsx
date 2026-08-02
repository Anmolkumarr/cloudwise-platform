import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Settings, Menu, LogOut, ChevronDown, Server, AlertTriangle, Wrench, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import api from "../api/axios.js";
import ConfirmModal from "./ConfirmModal.jsx";

const RESOURCE_ROUTES = { EC2: "/ec2", S3: "/s3", RDS: "/rds", IAM: "/iam" };

const Navbar = ({ onMenuClick, alertCount = 0 }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const confirmLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      api
        .get(`/search?q=${encodeURIComponent(query.trim())}`)
        .then(({ data }) => {
          setResults(data);
          setShowDropdown(true);
        })
        .catch(() => setResults(null))
        .finally(() => setSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goTo = (path) => {
    navigate(path);
    setShowDropdown(false);
    setQuery("");
  };

  const hasResults =
    results &&
    (results.resources?.length || results.alerts?.length || results.recommendations?.length || results.reports?.length);

  return (
    <>
      <header className="sticky top-0 z-20 glass border-b border-border">
        <div className="flex items-center justify-between gap-4 px-4 lg:px-8 py-3.5">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="lg:hidden text-gray-400 hover:text-white focus-ring rounded"
              onClick={onMenuClick}
            >
              <Menu size={22} />
            </button>

            <div ref={searchRef} className="relative hidden md:block w-full max-w-sm">
              <div className="flex items-center gap-2 bg-white/5 border border-border rounded-xl px-3 py-2">
                {searching ? (
                  <Loader2 size={16} className="text-gray-500 animate-spin" />
                ) : (
                  <Search size={16} className="text-gray-500" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results && setShowDropdown(true)}
                  placeholder="Search resources, services..."
                  className="bg-transparent outline-none text-sm text-gray-300 placeholder-gray-500 w-full"
                />
              </div>

              {showDropdown && (
                <div className="absolute left-0 right-0 mt-2 bg-[#0d1122] border border-border rounded-xl max-h-96 overflow-y-auto py-2 shadow-2xl z-50">
                  {!hasResults && !searching && (
                    <p className="text-xs text-gray-500 px-4 py-3">No results for "{query}"</p>
                  )}

                  {results?.resources?.length > 0 && (
                    <div className="mb-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide px-4 py-1">Resources</p>
                      {results.resources.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => goTo(RESOURCE_ROUTES[r.type] || "/dashboard")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          <Server size={14} className="text-primary-light shrink-0" />
                          <span className="truncate">{r.name}</span>
                          <span className="text-[10px] text-gray-500 ml-auto shrink-0">{r.type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results?.alerts?.length > 0 && (
                    <div className="mb-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide px-4 py-1">Alerts</p>
                      {results.alerts.map((a) => (
                        <button
                          key={a._id}
                          onClick={() => goTo("/alerts")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          <AlertTriangle size={14} className="text-accent-orange shrink-0" />
                          <span className="truncate">{a.type}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results?.recommendations?.length > 0 && (
                    <div className="mb-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide px-4 py-1">Recommendations</p>
                      {results.recommendations.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => goTo("/optimization")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          <Wrench size={14} className="text-accent-green shrink-0" />
                          <span className="truncate">{r.action}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results?.reports?.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide px-4 py-1">Reports</p>
                      {results.reports.map((rep) => (
                        <button
                          key={rep.service}
                          onClick={() => goTo("/reports")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                        >
                          <FileText size={14} className="text-accent-blue shrink-0" />
                          <span className="truncate">{rep.service} Cost Report</span>
                          {rep.total != null && <span className="text-[10px] text-gray-500 ml-auto shrink-0">${rep.total}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/alerts")}
              className="relative p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white focus-ring"
            >
              <Bell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white focus-ring"
            >
              <Settings size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white/5 focus-ring"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-sm font-bold text-white overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white leading-none">{user?.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 capitalize">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 glass-card rounded-xl overflow-hidden py-1 shadow-glow">
                  <button
                    onClick={() => { setMenuOpen(false); setShowLogoutConfirm(true); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log out?"
          message="You'll need to log in again to access your dashboard."
          confirmLabel="Log Out"
          cancelLabel="Cancel"
          danger
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default Navbar;