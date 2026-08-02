import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/alerts")
      .then(({ data }) => setAlertCount(data.filter((a) => !a.resolved).length))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} alertCount={alertCount} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} alertCount={alertCount} />
        <main className="flex-1 p-4 lg:p-8 fade-in">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
