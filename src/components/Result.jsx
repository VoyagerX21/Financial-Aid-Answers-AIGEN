import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function FinanceAid() {
  const { state } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [responses, setResponses] = useState({
    1: state.firstRes,
    2: state.secondRes,
  });

  const typingIntervals = useRef({});

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  useEffect(() => {
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  });

  const handleOutside = (e) => {
    const menuBtn = document.querySelector(".icon-menu");
    const menu = document.getElementById("result-dropdownMenu");

    if (menuBtn && menu && !menuBtn.contains(e.target) && !menu.contains(e.target)) {
      closeDropdown();
    }
  };

  const typeWriter = (id, text, speed = 50) => {
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
      const res = await fetch("/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxNumber }),
      });
      const data = await res.json();

      setResponses((prev) => ({ ...prev, [boxNumber]: data.response }));

      button.disabled = false;
      button.classList.remove("result-loading");
      button.textContent = "Regenerate";

      typeWriter(`result-response${boxNumber}`, data.response, 80);
    } catch (error) {
      button.disabled = false;
      button.classList.remove("result-loading");
      button.textContent = "Regenerate";
      responseElement.innerHTML = "Error generating response.";
    }
  };

  useEffect(() => {
    setTimeout(() => typeWriter("result-response1", responses[1]), 200);
    setTimeout(() => typeWriter("result-response2", responses[2]), 300);
  }, []);

  return (
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
              <a style={{cursor: "pointer"}} href="#" onClick={(e) => { e.preventDefault(); setModalOpen(true); }}>
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
          />

          <ResponseBox
            title="How Will Your Selected Course Help With Your Goals?"
            boxNumber={2}
            text={responses[2]}
            onCopy={copyResponse}
            onRegenerate={generateResponse}
          />
        </div>
      </div>

      {modalOpen && <CoffeeModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function ResponseBox({ title, boxNumber, text, onCopy, onRegenerate }) {
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

        <div className="result-buttons-only">
          <button className="result-copy-btn" onClick={() => onCopy(boxNumber)}>
            Copy
          </button>

          <button
            className="result-regenerate-btn"
            onClick={(e) => onRegenerate(boxNumber, e.target)}
          >
            Regenerate
          </button>
        </div>
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
