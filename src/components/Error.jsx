import { useState } from "react";
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

  const retrywhole = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/job/retry/${state.job_id}/3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const data = await res.json();
    navigate("/result", { state: state });
  }

  return (
    <main>
      <div className="error-container">
        <div className="row">
          <div className="col-md-6 align-self-center">
            <h1>{statusCode}</h1>
            <h2>{title}</h2>
            <p style={{ textAlign: "center" }}>{desc}</p>

            <button className="error-btn green" onClick={retrywhole}>
              {btn}
            </button>
          </div>

          <div className="col-md-6 align-self-center">
          </div>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
