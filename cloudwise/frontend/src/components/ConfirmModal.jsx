import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4" onClick={onCancel}>
    <div className="glass-card w-full max-w-sm p-6 fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${danger ? "bg-accent-red/15 text-accent-red" : "bg-primary/15 text-primary-light"}`}>
          <AlertTriangle size={20} />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-400 mb-6">{message}</p>
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="flex-1 bg-white/5 hover:bg-white/10 border border-border text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-colors">
          {cancelLabel}
        </button>
        <button onClick={onConfirm} className={`flex-1 text-white text-sm font-medium py-2.5 rounded-xl transition-colors ${danger ? "bg-accent-red hover:bg-accent-red/80" : "bg-primary hover:bg-primary-dark"}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;