import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import Header from "./common/Header";
import Loader from "./common/Loader";
import { useToast } from "./common/Toast";

const ErrorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    statusCode = 500,
    title = "Generation Error",
    desc = "We encountered an issue processing your financial aid prompt. Please try again or start over.",
    btn = "Try Again",
  } = state || {};

  const jobId = state?.job_id ?? state?.jobId ?? null;

  const retrywhole = async () => {
    if (!jobId) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = window.__ENV__?.VITE_API_URL || "";
      await fetch(`${apiUrl}/job/retry/${jobId}/3`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      navigate("/result", { state: { ...state, job_id: jobId } });
    } catch (err) {
      console.error(err);
      addToast("Failed to retry request. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Header />

      {loading && (
        <Loader
          message="Retrying financial aid essay generation..."
          submessage="Re-establishing connection with AI backend"
        />
      )}

      <main className="error-page-container">
        <div className="error-card-wrapper" role="alertdialog" aria-modal="true" aria-labelledby="error-title">
          <span className="error-status-badge">
            <AlertCircle size={14} />
            <span>Error Encountered</span>
          </span>

          <div className="error-code">{statusCode}</div>
          <h1 className="error-title" id="error-title">{title}</h1>
          <p className="error-description">{desc}</p>

          <div className="error-actions-group">
            {jobId && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={retrywhole}
              >
                <RefreshCw size={16} />
                <span>{btn}</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ErrorPage;
