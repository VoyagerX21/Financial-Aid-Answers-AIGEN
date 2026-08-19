import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, BookOpen, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import Header from "./common/Header";
import Loader from "./common/Loader";
import { useToast } from "./common/Toast";

const LOADING_MESSAGES = [
  "Fetching course details...",
  "Analyzing syllabus and curriculum...",
  "Preparing your personalization form...",
  "Almost ready...",
];

export default function Main() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const searchCourses = useCallback(async (searchText) => {
    if (!searchText.trim()) {
      setResults([]);
      setHasSearched(false);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const apiUrl = window.__ENV__?.VITE_API_URL || "";
      const res = await fetch(
        `${apiUrl}/search?query=${encodeURIComponent(searchText)}`
      );

      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setHasSearched(true);
        setShowDropdown(true);
        setHighlight(-1);
      }
    } catch (err) {
      console.error("Search error:", err);
      addToast("Failed to search courses. Please check connection.", "error");
    } finally {
      setIsSearching(false);
    }
  }, [addToast]);

  const select = useCallback(async (item) => {
    setQuery(item.title);
    setShowDropdown(false);

    try {
      setLoadingMessageIndex(0);
      setLoading(true);

      const apiUrl = window.__ENV__?.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obj: item }),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/details", { state: data });
      } else {
        addToast(data.message || "Failed to load course details", "error");
      }
    } catch {
      addToast("Network error communicating with server", "error");
    } finally {
      setLoading(false);
    }
  }, [navigate, addToast]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchCourses(query);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, searchCourses]);

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

  // Keyboard navigation & global shortcuts (/ or Cmd+K)
  useEffect(() => {
    const handleKeys = (e) => {
      // Focus search input on '/' or 'Cmd+K' / 'Ctrl+K' when not in input
      if ((e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (!showDropdown) return;

      if (e.key === "Escape") {
        setShowDropdown(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter" && highlight >= 0 && results[highlight]) {
        e.preventDefault();
        select(results[highlight]);
      }
    };

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [results, highlight, showDropdown, select]);

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", clickOutside);
    return () => document.removeEventListener("click", clickOutside);
  }, []);

  return (
    <div className="app-layout">
      <Header />

      {loading && (
        <Loader
          message={LOADING_MESSAGES[loadingMessageIndex]}
          submessage="Configuring specialization syllabus and background prompts"
        />
      )}

      <main className="page-wrapper">
        <section className="search-hero">
          <div className="search-pill-badge">
            <Sparkles size={14} />
            <span>AI-Powered Application Assistant</span>
          </div>

          <h1 className="search-hero-title">
            Generate Coursera Financial Aid Answers
          </h1>

          <p className="search-hero-subtitle">
            Get 100% compliant, customized 150+ word financial aid application essays tailored to your background in seconds.
          </p>

          <div className="search-command-container">
            <div className="search-command-bar">
              {isSearching ? (
                <Loader2 size={20} className="search-bar-icon saas-loader-spinner" />
              ) : (
                <Search size={20} className="search-bar-icon" />
              )}

              <input
                ref={inputRef}
                className="search-bar-input"
                placeholder="Search course title (e.g., Python for Everybody, Machine Learning)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
                aria-label="Course search input"
              />

              <div className="search-shortcut-badge">Press / to focus</div>
            </div>

            {showDropdown && results.length > 0 && (
              <div className="search-results-dropdown" ref={dropdownRef}>
                {results.map((item, i) => (
                  <div
                    key={item.FIELD1 || i}
                    className={`search-result-item ${
                      highlight === i ? "highlighted" : ""
                    }`}
                    onClick={() => select(item)}
                    role="option"
                    aria-selected={highlight === i}
                  >
                    <div className="search-result-title">{item.title}</div>
                    {item.Organization && (
                      <span className="search-result-org">{item.Organization}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showDropdown && hasSearched && results.length === 0 && !isSearching && (
              <div className="search-results-dropdown" ref={dropdownRef}>
                <div className="search-empty-state">
                  No matching courses found. Try searching with a general keyword.
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <BookOpen size={20} />
            </div>
            <h3 className="feature-title">Course-Specific Context</h3>
            <p className="feature-desc">
              Extracts the exact curriculum and syllabus to craft genuine, relevant learning motivations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="feature-title">Meets 150+ Word Requirement</h3>
            <p className="feature-desc">
              Formatted to fulfill Coursera's strict minimum word count criteria for both prompt questions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={20} />
            </div>
            <h3 className="feature-title">100% Free & Open Source</h3>
            <p className="feature-desc">
              Built for students and self-learners worldwide. Fully transparent and privacy-friendly.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}