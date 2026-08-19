import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ message = "Processing your request...", submessage = "This usually takes 5-15 seconds" }) {
  return (
    <div className="saas-loader-overlay" role="status" aria-live="polite">
      <div className="saas-loader-card">
        <div className="saas-loader-spinner-wrapper">
          <Loader2 size={36} className="saas-loader-spinner" />
        </div>
        <div className="saas-loader-content">
          <h3 className="saas-loader-title">{message}</h3>
          {submessage && <p className="saas-loader-subtitle">{submessage}</p>}
        </div>
        <div className="saas-loader-progress-bar">
          <div className="saas-loader-progress-inner" />
        </div>
      </div>
    </div>
  );
}
