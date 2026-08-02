import React from "react";

const SectionCard = ({ title, action, children, className = "" }) => (
  <div className={`glass-card p-5 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export default SectionCard;
