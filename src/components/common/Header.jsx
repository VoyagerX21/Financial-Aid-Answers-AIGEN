import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Github, Coffee, Menu, X, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import CoffeeModal from "./CoffeeModal";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBrandClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-brand" onClick={handleBrandClick} role="button" tabIndex={0}>
            <div className="brand-icon-wrapper">
              <Sparkles size={18} className="brand-sparkle-icon" />
            </div>
            <span className="brand-name">Get-AidEasy</span>
            <span className="brand-badge">SaaS</span>
          </div>

          <nav className="header-nav-desktop">
            <a
              href="https://github.com/VoyagerX21/Financial-Aid-Answers-AIGEN"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <Github size={16} />
              <span>Source</span>
            </a>

            <a
              href="https://www.instagram.com/_gaurav.khakse_/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <span>Connect</span>
            </a>

            <button
              type="button"
              className="btn-coffee-nav"
              onClick={() => setModalOpen(true)}
            >
              <Coffee size={16} />
              <span>Buy Coffee</span>
            </button>

            <div className="nav-divider" />

            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </nav>

          <div className="header-nav-mobile-toggle">
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu-dropdown">
            <a
              href="https://github.com/VoyagerX21/Get-AidEasy"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Github size={18} />
              <span>Source Code</span>
            </a>

            <a
              href="https://www.instagram.com/_gaurav.khakse_/"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Connect on Instagram</span>
            </a>

            <button
              type="button"
              className="mobile-nav-link mobile-nav-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setModalOpen(true);
              }}
            >
              <Coffee size={18} />
              <span>Buy me a coffee ☕️</span>
            </button>
          </div>
        )}
      </header>

      <CoffeeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
