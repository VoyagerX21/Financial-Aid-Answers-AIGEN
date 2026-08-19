import React, { useState, useEffect } from "react";
import { X, Check, Copy, Coffee, Heart } from "lucide-react";
import { useToast } from "./Toast";

export default function CoffeeModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const upiId = "khakse2gaurav2003@okaxis";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      addToast("UPI ID copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast("Failed to copy UPI ID", "error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-badge-icon">
            <Coffee size={24} className="icon-coffee" />
          </div>
          <h2 className="modal-title">Support Get-AidEasy</h2>
          <p className="modal-subtitle">
            If this tool helped you secure financial aid, consider supporting further development.
          </p>
        </div>

        <div className="modal-body">
          <div className="upi-container">
            <div className="upi-header">
              <span className="upi-title">UPI Payment ID</span>
              <span className="upi-tag">Instant Transfer</span>
            </div>

            <div className="upi-box" onClick={handleCopy} role="button" tabIndex={0}>
              <code className="upi-address">{upiId}</code>
              <button
                type="button"
                className={`upi-copy-btn ${copied ? "copied" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                aria-label="Copy UPI ID"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="upi-hint">Supports Google Pay, PhonePe, Paytm, and all UPI apps.</p>
          </div>

          <div className="modal-footer-message">
            <Heart size={16} className="icon-heart" />
            <span>Built with care by Gaurav • 100% Free & Open Source</span>
          </div>
        </div>
      </div>
    </div>
  );
}
