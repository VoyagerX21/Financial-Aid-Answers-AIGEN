import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    statusCode = 500,
    title = "Internal Server Error",
    desc = "Something went wrong. Please try again later.",
    btn = "Try Again",
  } = state || {};
  const jobId = state?.job_id ?? state?.jobId ?? null;

  useEffect(() => {
    document.body.classList.add("error-route-active");

    return () => {
      document.body.classList.remove("error-route-active");
    };
  }, []);

  const retrywhole = async () => {
    if (!jobId) {
      navigate("/result", { state });
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/job/retry/${jobId}/3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const data = await res.json();
    navigate("/result", { state: { ...state, job_id: jobId } });
  }

  return (
    <main className="error-overlay-shell" aria-live="polite">
      <div className="error-card" role="alertdialog" aria-modal="true" aria-labelledby="error-title">
        <span className="error-badge">Error</span>
        <h1>{statusCode}</h1>
        <h2 id="error-title">{title}</h2>
        <p>{desc}</p>

        <div className="error-actions">
          <button className="error-btn green" onClick={retrywhole}>
            {btn}
          </button>
          <button className="error-btn green" onClick={() => navigate("/") }>
            Start Over
          </button>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
