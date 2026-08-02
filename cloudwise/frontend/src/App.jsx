import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EC2 from "./pages/EC2.jsx";
import S3 from "./pages/S3.jsx";
import RDS from "./pages/RDS.jsx";
import IAM from "./pages/IAM.jsx";
import CostAnalysis from "./pages/CostAnalysis.jsx";
import Optimization from "./pages/Optimization.jsx";
import Monitoring from "./pages/Monitoring.jsx";
import Alerts from "./pages/Alerts.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ec2" element={<ProtectedRoute><EC2 /></ProtectedRoute>} />
      <Route path="/s3" element={<ProtectedRoute><S3 /></ProtectedRoute>} />
      <Route path="/rds" element={<ProtectedRoute><RDS /></ProtectedRoute>} />
      <Route path="/iam" element={<ProtectedRoute><IAM /></ProtectedRoute>} />
      <Route path="/cost-analysis" element={<ProtectedRoute><CostAnalysis /></ProtectedRoute>} />
      <Route path="/optimization" element={<ProtectedRoute><Optimization /></ProtectedRoute>} />
      <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
