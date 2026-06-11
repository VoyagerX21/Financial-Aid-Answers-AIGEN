import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FinanceAid() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [jobId, setJobId] = useState(state.job_id)
  const [showButtons, setShowButtons] = useState({
    1: false,
    2: false
  });
  const [loading, setLoading] = useState(false);
  const loadingMessages = [
    "Almost there...",
    "Hang on tight...",
    "Thinking hard...",
    "Warming up the AI...",
    "Polishing your result...",
    "A few more seconds...",
    "Finalizing the answer...",
    "Just a moment longer...",
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [responses, setResponses] = useState({
    1: "",
    2: "",
  });

  const typingIntervals = useRef({});

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  const getresponse = async () => {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/job/${jobId}`);
    const data = await res.json();
    return data;
  }

  useEffect(() => {
    let intervalId;
    const fetchResponse = async () => {
      try {
        const data = await getresponse();
        if (data.status === "failed") {
          clearInterval(intervalId);
          navigate("/error", { state: data });
          return;
        }
        if (data.status === "running") {
          return;
        }
        clearInterval(intervalId);
        setResponses({
          1: data.firstRes,
          2: data.secondRes,
        });
        setLoading(false);
        setTimeout(() => typeWriter(1, "result-response1", data.firstRes), 200);
        setTimeout(() => typeWriter(2, "result-response2", data.secondRes), 300);
      } catch (err) {
        clearInterval(intervalId);
        navigate("/error", { state: err });
      }
    };
    fetchResponse();
    intervalId = setInterval(fetchResponse, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  });

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return undefined;
    }

    const intervalId = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => clearInterval(intervalId);
  }, [loading]);

  const handleOutside = (e) => {
    const menuBtn = document.querySelector(".icon-menu");
    const menu = document.getElementById("result-dropdownMenu");

    if (menuBtn && menu && !menuBtn.contains(e.target) && !menu.contains(e.target)) {
      closeDropdown();
    }
  };

  const typeWriter = (box, id, text, speed = 50) => {
    setShowButtons(prev => ({ ...prev, [box]: false }));
    const element = document.getElementById(id);
    element.innerHTML = `<span class="result-typing-cursor"></span>`;

    const words = text.split(" ");
    let index = 0;

    if (typingIntervals.current[id]) {
      clearInterval(typingIntervals.current[id]);
    }

    typingIntervals.current[id] = setInterval(() => {
      if (index < words.length) {
        const newText = (
          element.textContent.trim() +
          " " +
          words[index]
        ).trim();
        element.innerHTML =
          newText + `<span class="result-typing-cursor"></span>`;
        index++;
      } else {
        clearInterval(typingIntervals.current[id]);
        setTimeout(() => {
          element.innerHTML = text;
        }, 1000);
      }
    }, speed);
    setShowButtons(prev => ({ ...prev, [box]: true }));
  };

  const copyResponse = (boxNumber) => {
    const text = document
      .getElementById(`result-response${boxNumber}`)
      .textContent.trim();
    navigator.clipboard.writeText(text);
    alert("Content Copied!");
  };

  const generateResponse = async (boxNumber, buttonElement) => {
    const button = buttonElement;
    const responseElement = document.getElementById(
      `result-response${boxNumber}`
    );

    button.disabled = true;
    button.classList.add("result-loading");
    button.textContent = "";

    responseElement.innerHTML = `<span class="result-typing-cursor"></span>`;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/job/${jobId}/retry/${Number(boxNumber)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload, boxNumber }),
      });
      const data = await res.json();

      setResponses((prev) => ({ ...prev, [boxNumber]: data.response }));

      button.disabled = false;
      button.classList.remove("result-loading");
      button.textContent = "Regenerate";

      typeWriter(boxNumber, `result-response${boxNumber}`, data.response, 80);
    } catch (error) {
      console.log(error);
      button.disabled = false;
      button.classList.remove("result-loading");
      button.textContent = "Regenerate";
      responseElement.innerHTML = "Error generating response.";
    }
  };

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-circle"></div>
          <p style={{ color: "white", fontWeight: "bold" }}>
            {loadingMessages[loadingMessageIndex]}
          </p>
          <p style={{ color: "white", fontSize: "14px" }}>
            The AI is taking its time to give you a better answer.
          </p>
        </div>
      )}
      <div className="result-main-content">
        <div className="header">
          <div
            className="home-btn"
            onClick={() => (window.location.href = "/")}
          >
            Home
          </div>

          <div className="header-right">
            <button
              className="icon-btn icon-menu"
              onClick={toggleDropdown}
            ></button>

            {dropdownOpen && (
              <div className={`dropdown-menu ${dropdownOpen ? "active" : ""}`} id="result-dropdownMenu">
                <a
                  href="https://github.com/VoyagerX21/Get-AidEasy"
                  target="_blank"
                >
                  Source Code
                </a>
                <a
                  href="https://www.instagram.com/_gaurav.khakse_/"
                  target="_blank"
                >
                  Stalk my insta?
                </a>
                <a style={{ cursor: "pointer" }} href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
                  Buy me a coffee ☕️
                </a>
              </div>
            )}
          </div>
        </div>

        <h1 className="result-main-title">AI Financial Aid Responses</h1>

        <div className="result-chat-container">
          <div className="result-container">
            <ResponseBox
              title="Why Are You Applying For Financial Aid?"
              boxNumber={1}
              text={responses[1]}
              onCopy={copyResponse}
              onRegenerate={generateResponse}
              showButtons={showButtons[1]}
            />

            <ResponseBox
              title="How Will Your Selected Course Help With Your Goals?"
              boxNumber={2}
              text={responses[2]}
              onCopy={copyResponse}
              onRegenerate={generateResponse}
              showButtons={showButtons[2]}
            />
          </div>
        </div>

        {modalOpen && <CoffeeModal onClose={() => setModalOpen(false)} />}
      </div>
    </>
  );
}

function ResponseBox({ title, boxNumber, text, onCopy, onRegenerate, showButtons }) {
  return (
    <div className="result-response-box">
      <h2>{title}</h2>

      <div className="result-content-area">
        <div className="result-ai-response" id={`result-response${boxNumber}`}>
          <span className="result-typing-cursor"></span>
        </div>
      </div>

      <div className="result-button-group">
        <p className="result-warning">
          ⚠️ "AI answers may have flaws, so double-check before you trust!"
        </p>

        {showButtons ? <div className="result-buttons-only">
          <button className="result-copy-btn" onClick={() => onCopy(boxNumber)}>
            Copy
          </button>

          <button
            className="result-regenerate-btn"
            onClick={(e) => onRegenerate(boxNumber, e.target)}
          >
            Regenerate
          </button>
        </div> : null}
      </div>
    </div>
  );
}

function CoffeeModal({ onClose }) {
  const copyUPI = () => {
    navigator.clipboard.writeText("khakse2gaurav2003@okaxis");
    alert("Copied UPI ID!");
  };

  return (
    <div className="overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>Buy me a coffee!</h2>

        <div className="modal-content">
          <div className="modal-message">
            <strong>Hey there! 👋</strong>
            <br />
            <br />
            If my work helped you in any way, consider buying me a coffee!
          </div>

          <div className="upi-section">
            <div className="upi-label">📱 UPI ID</div>

            <div className="upi-id" onClick={copyUPI}>
              khakse2gaurav2003@okaxis
            </div>
            <div className="copy-hint">👆 Click to copy UPI ID</div>
          </div>

          <div className="thank-you">
            Thank you so much! 🙏
            <br />- Gaurav
          </div>
        </div>
      </div>
    </div>
  );
}
