import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, Check, RefreshCw, AlertTriangle, Clock, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Header from "./common/Header";
import Loader from "./common/Loader";
import { useToast } from "./common/Toast";

const LOADING_MESSAGES = [
  "Analyzing your background and course curriculum...",
  "Drafting persuasive, authentic financial aid essays...",
  "Validating word count and requirements...",
  "Polishing essay tone and formatting...",
  "Finalizing your application answers...",
];

export default function FinanceAid() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const jobId = state?.job_id || state?.jobId || null;
  const completionTimeRef = useRef(null);
  const [showButtons, setShowButtons] = useState({
    1: false,
    2: false,
  });
  const [copiedBox, setCopiedBox] = useState({
    1: false,
    2: false,
    all: false,
  });
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState({
    1: false,
    2: false,
  });

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [responses, setResponses] = useState({
    1: "",
    2: "",
  });

  const typingIntervals = useRef({});
  const pollingRef = useRef(null);

  const formatCompletionTime = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (!/^\d+(\.\d+)?$/.test(trimmedValue)) {
        return trimmedValue;
      }
      value = Number(trimmedValue);
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return String(value);
    }

    const totalSeconds = numericValue * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];

    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    const formattedSeconds = Number.isInteger(seconds)
      ? `${seconds}s`
      : `${seconds.toFixed(1).replace(/\.0$/, "")}s`;

    if (seconds > 0.01 || parts.length === 0) {
      parts.push(formattedSeconds);
    }

    return parts.join(" ");
  };

  const countWords = (text) => {
    if (!text || typeof text !== "string") return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const typeWriter = useCallback((box, elementId, text, speed = 35) => {
    setShowButtons((prev) => ({ ...prev, [box]: false }));
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `<span class="typing-cursor"></span>`;

    const words = text.split(" ");
    let index = 0;

    if (typingIntervals.current[elementId]) {
      clearInterval(typingIntervals.current[elementId]);
    }

    typingIntervals.current[elementId] = setInterval(() => {
      if (index < words.length) {
        const currentText = element.textContent.replace("|", "").trim();
        const newText = `${currentText} ${words[index]}`.trim();
        element.innerHTML = `${newText}<span class="typing-cursor"></span>`;
        index++;
      } else {
        clearInterval(typingIntervals.current[elementId]);
        delete typingIntervals.current[elementId];

        setTimeout(() => {
          element.innerHTML = text;
          setShowButtons((prev) => ({ ...prev, [box]: true }));
        }, 200);
      }
    }, speed);
  }, []);

  const getresponse = useCallback(async () => {
    setLoading(true);
    const apiUrl = window.__ENV__?.VITE_API_URL || "";
    const res = await fetch(`${apiUrl}/job/${jobId}`);
    const data = await res.json();
    return data;
  }, [jobId]);

  const configResponse = useCallback((val) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    const fetchResponse = async () => {
      try {
        const data = await getresponse();

        if (data.status === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          navigate("/error", { state: { ...data, job_id: jobId } });
          return;
        }

        if (data.status === "running") return;

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        if (completionTimeRef.current === null && data.time !== undefined && data.time !== null) {
          completionTimeRef.current = formatCompletionTime(data.time);
        }

        setResponses({
          1: data.firstRes || "",
          2: data.secondRes || "",
        });

        setLoading(false);

        if (val === 1 || val === 3) {
          setTimeout(() => typeWriter(1, "result-response-1", data.firstRes || ""), 150);
        }

        if (val === 2 || val === 3) {
          setTimeout(() => typeWriter(2, "result-response-2", data.secondRes || ""), 250);
        }
      } catch (err) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        navigate("/error", { state: { ...err, job_id: jobId } });
      }
    };

    fetchResponse();
    pollingRef.current = setInterval(fetchResponse, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [getresponse, jobId, navigate, typeWriter]);

  useEffect(() => {
    if (!jobId) {
      navigate("/");
      return;
    }
    const cleanup = configResponse(3);
    return cleanup;
  }, [jobId, navigate, configResponse]);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);

    return () => clearInterval(intervalId);
  }, [loading]);

  const copyResponse = (boxNumber) => {
    const text = document.getElementById(`result-response-${boxNumber}`)?.textContent?.trim() || responses[boxNumber];
    if (!text) return;

    navigator.clipboard.writeText(text);
    setCopiedBox((prev) => ({ ...prev, [boxNumber]: true }));
    addToast(`Question ${boxNumber} answer copied to clipboard!`, "success");
    setTimeout(() => {
      setCopiedBox((prev) => ({ ...prev, [boxNumber]: false }));
    }, 2000);
  };

  const copyAllResponses = () => {
    const text1 = document.getElementById("result-response-1")?.textContent?.trim() || responses[1];
    const text2 = document.getElementById("result-response-2")?.textContent?.trim() || responses[2];

    const fullText = `--- Coursera Financial Aid Application ---\n\nQ1: Why are you applying for financial aid?\n\n${text1}\n\n=========================================\n\nQ2: How will your selected course help with your goals?\n\n${text2}`;

    navigator.clipboard.writeText(fullText);
    setCopiedBox((prev) => ({ ...prev, all: true }));
    addToast("All application answers copied to clipboard!", "success");
    setTimeout(() => {
      setCopiedBox((prev) => ({ ...prev, all: false }));
    }, 2500);
  };

  const generateResponse = async (boxNumber) => {
    const responseElement = document.getElementById(`result-response-${boxNumber}`);
    setRegenerating((prev) => ({ ...prev, [boxNumber]: true }));
    setShowButtons((prev) => ({ ...prev, [boxNumber]: false }));

    if (responseElement) {
      responseElement.innerHTML = `<span class="typing-cursor"></span>`;
    }

    try {
      const apiUrl = window.__ENV__?.VITE_API_URL || "";
      await fetch(`${apiUrl}/job/retry/${jobId}/${Number(boxNumber)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      configResponse(Number(boxNumber));
    } catch (error) {
      console.error(error);
      if (responseElement) {
        responseElement.innerHTML = "Error generating response. Please try again.";
      }
      addToast("Failed to regenerate response", "error");
    } finally {
      setRegenerating((prev) => ({ ...prev, [boxNumber]: false }));
    }
  };

  const wordCount1 = countWords(responses[1]);
  const wordCount2 = countWords(responses[2]);

  return (
    <div className="app-layout">
      <Header />

      {loading && (
        <Loader
          message={LOADING_MESSAGES[loadingMessageIndex]}
          submessage="Polling server for completion..."
        />
      )}

      <main className="page-wrapper page-wrapper-wide">
        <div className="result-header-bar">
          <div className="result-title-section">
            <h1 className="result-main-title">Financial Aid Application Answers</h1>
            <div className="result-meta-badges">
              {completionTimeRef.current && (
                <span className="badge badge-success">
                  <Clock size={13} />
                  <span>Generated in {completionTimeRef.current}</span>
                </span>
              )}
              <span className="badge badge-primary">
                <Sparkles size={13} />
                <span>AI Tailored</span>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/details", { state })}
            >
              <ArrowLeft size={14} />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={copyAllResponses}
            >
              {copiedBox.all ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedBox.all ? "Copied All!" : "Copy Both Answers"}</span>
            </button>
          </div>
        </div>

        <div className="disclaimer-alert">
          <AlertTriangle size={18} className="disclaimer-icon" />
          <div>
            <strong>Review before submitting:</strong> Coursera applications are reviewed for authenticity. Make sure all personal details, goals, and university/company names accurately represent your situation.
          </div>
        </div>

        <div className="result-grid">
          {/* Question 1 Box */}
          <div className="response-card">
            <div className="response-card-header">
              <h2 className="response-card-question-title">
                1. Why are you applying for financial aid?
              </h2>
            </div>

            <div className="response-text-area" id="result-response-1">
              <span className="typing-cursor"></span>
            </div>

            <div className="response-card-footer">
              <div className={`word-count-indicator ${wordCount1 >= 150 ? "valid" : ""}`}>
                {wordCount1 >= 150 && <CheckCircle2 size={15} />}
                <span>
                  {wordCount1} words {wordCount1 >= 150 ? "(Meets 150-word requirement)" : ""}
                </span>
              </div>

              {showButtons[1] && (
                <div className="response-action-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={regenerating[1]}
                    onClick={() => generateResponse(1)}
                  >
                    <RefreshCw size={14} className={regenerating[1] ? "saas-loader-spinner" : ""} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${copiedBox[1] ? "btn-success" : "btn-primary"} btn-sm`}
                    onClick={() => copyResponse(1)}
                  >
                    {copiedBox[1] ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedBox[1] ? "Copied!" : "Copy Answer"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Question 2 Box */}
          <div className="response-card">
            <div className="response-card-header">
              <h2 className="response-card-question-title">
                2. How will this course help with your goals?
              </h2>
            </div>

            <div className="response-text-area" id="result-response-2">
              <span className="typing-cursor"></span>
            </div>

            <div className="response-card-footer">
              <div className={`word-count-indicator ${wordCount2 >= 150 ? "valid" : ""}`}>
                {wordCount2 >= 150 && <CheckCircle2 size={15} />}
                <span>
                  {wordCount2} words {wordCount2 >= 150 ? "(Meets 150-word requirement)" : ""}
                </span>
              </div>

              {showButtons[2] && (
                <div className="response-action-buttons">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={regenerating[2]}
                    onClick={() => generateResponse(2)}
                  >
                    <RefreshCw size={14} className={regenerating[2] ? "saas-loader-spinner" : ""} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    className={`btn ${copiedBox[2] ? "btn-success" : "btn-primary"} btn-sm`}
                    onClick={() => copyResponse(2)}
                  >
                    {copiedBox[2] ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedBox[2] ? "Copied!" : "Copy Answer"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="result-bottom-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            <span>Search Another Course</span>
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <a
              href="https://github.com/VoyagerX21/Get-AidEasy"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <span>Star on GitHub ⭐</span>
            </a>
            <button
              type="button"
              className="btn btn-primary"
              onClick={copyAllResponses}
            >
              <Copy size={16} />
              <span>Copy All Answers</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
