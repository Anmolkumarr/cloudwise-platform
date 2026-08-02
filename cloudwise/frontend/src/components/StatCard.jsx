import React from "react";
import { useNavigate } from "react-router-dom";

const colorMap = {
  primary: "bg-primary/20 text-primary-light",
  blue: "bg-accent-blue/20 text-accent-blue",
  green: "bg-accent-green/20 text-accent-green",
  orange: "bg-accent-orange/20 text-accent-orange",
  red: "bg-accent-red/20 text-accent-red",
};

const StatCard = ({ icon: Icon, label, value, sub, trend, color = "primary", to }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={to ? () => navigate(to) : undefined}
      className={`glass-card p-5 ${to ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${trend === "down" ? "text-accent-green" : trend === "up" ? "text-accent-red" : "text-gray-500"}`}>
          {sub}
        </p>
      )}
    </div>
  );
};

export default StatCard;