import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from 'lucide-react';

export default function Main() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const loadingMessages = [
    "Fetching course details...",
    "Crunching your selection...",
    "Preparing your next step...",
    "Almost there...",
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const searchCourses = async (searchText) => {
    if (!searchText.trim()) {
      setResults([]);
      setHasSearched(false);
      setShowDropdown(false);
      return;
    }

    try {

      const res = await fetch(
        `https://geteasyserver.khakse.dev/search?query=${encodeURIComponent(
          searchText
        )}`
      );

      const data = await res.json();
      // console.log(data);
      if (data.success) {
        setResults(data.results || []);
        setHasSearched(true);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchCourses(query);
    }, 400); // debounce delay

    return () => clearTimeout(debounceRef.current);
  }, [query]);

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

  useEffect(() => {
    const handleKeys = (e) => {
      if (!showDropdown) return;

      if (e.key === "Escape") {
        setShowDropdown(false);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }

      if (e.key === "Enter" && highlight >= 0) {
        select(results[highlight]);
      }
    };

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [results, highlight, showDropdown]);

  useEffect(() => {
    const clickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("click", clickOutside);
    return () => document.removeEventListener("click", clickOutside);
  }, []);

  const select = async (item) => {
    setQuery(item.title);
    setShowDropdown(false);

    try {
      setLoadingMessageIndex(Math.floor(Math.random() * loadingMessages.length));
      setLoading(true);

      const res = await fetch(
        "https://geteasyserver.khakse.dev/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ obj: item }),
        }
      );

      const data = await res.json();
      if (data.success) {
        navigate("/details", { state: data });
      } else {
        alert("Something went wrong!");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    clearTimeout(debounceRef.current);
    searchCourses(query);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText("khakse2gaurav2003@okaxis");
    alert("UPI copied!");
  };

  return (
    <>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-circle"></div>
          <p style={{ color: "white", fontWeight: "bold" }}>
            {loadingMessages[loadingMessageIndex]}
          </p>
        </div>
      )}

      <div className="main-content">
        <div className="header">
          <div onClick={() => window.location.reload()} className="home-btn">
            Get-EasyAid
          </div>

          <div className="header-right">
            <button
              className="icon-btn icon-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="dropdown-menu active">
                <a href="https://github.com/VoyagerX21/Get-AidEasy" target="_blank">
                  Source Code
                </a>
                <a
                  href="https://www.instagram.com/_gaurav.khakse_/"
                  target="_blank"
                >
                  Stalk my insta?
                </a>
                <a onClick={() => setModalOpen(true)}>Buy me a coffee ☕️</a>
              </div>
            )}
          </div>
        </div>

        <div className="chat-container">
          <h1 className="welcome-message">
            100% Legit Coursera Financial Aid Answers
          </h1>
          <h1 className="welcome-message">
            <i>Learn smart. Apply smarter</i>
          </h1>

          <div className="input-container">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                className="main-input"
                placeholder="Type course name or university to search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setShowDropdown(true)}
              />

              <button style={{ background: "black", borderRadius: "50%", border: "none", cursor: "pointer" }} onClick={handleSearchClick}>
                <Search size={22} color="white"/>
              </button>
            </div>

            {showDropdown && results.length > 0 && (
              <div className="dropdown show" ref={dropdownRef}>
                {results.map((item, i) => (
                  <div
                    key={item.FIELD1 || i}
                    className={`dropdown-item ${
                      highlight === i ? "highlighted" : ""
                    }`}
                    onClick={() => select(item)}
                  >
                    <div className="item-text">{item.title}</div>
                    <div className="item-category">
                      {item.Organization}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showDropdown && hasSearched && results.length === 0 && (
              <div className="dropdown show" ref={dropdownRef}>
                <div className="dropdown-item dropdown-item-empty" aria-disabled="true">
                  No results found
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="overlay active" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2>Buy me a coffee!</h2>

            <div className="modal-content">
              <div className="upi-section">
                <div className="upi-id" onClick={copyUPI}>
                  khakse2gaurav2003@okaxis
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}