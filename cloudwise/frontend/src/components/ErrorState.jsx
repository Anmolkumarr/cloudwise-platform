import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="h-12 w-12 rounded-full bg-accent-red/15 text-accent-red flex items-center justify-center mb-4">
      <AlertTriangle size={22} />
    </div>
    <p className="text-gray-300 font-medium mb-1">Couldn't load this page</p>
    <p className="text-sm text-gray-500 mb-5 max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <RefreshCw size={14} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;