import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import "../styles/main.css";

export default function Main() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingmsg, setLoadingmsg] = useState("");

  const [courses, setCourses] = useState([]);       // 🌟 always array
  const [filtered, setFiltered] = useState([]);     // 🌟 always array

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const loadedRef = useRef(false); // StrictMode protection

  // ============================
  // FETCH COURSES ONCE
  // ============================
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setLoadingmsg("Fetching course records...");

      const res = await fetch("https://get-easyaid-server.onrender.com/getAllCourses");
      const data = await res.json();

      // CASCADE safety check
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
        await localforage.setItem("courses", data);
      }
    } catch (e) {
      console.error("ERROR FETCHING COURSES:", e);
    } finally {
      setLoading(false);
      setLoadingmsg("");
    }
  };

  const cacheLoad = async () => {
    const cached = await localforage.getItem("courses");

    if (Array.isArray(cached) && cached.length > 0) {
      setCourses(cached);
    } else {
      await fetchCourses();
    }
  };

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    cacheLoad();
  }, []);

  // ============================
  // FILTERING LOGIC
  // ============================
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(courses);
      return;
    }

    const q = query.toLowerCase();
    const f = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.Organization.toLowerCase().includes(q)
    );
    setFiltered(f);
  }, [query, courses]);

  useEffect(() => {
    setHighlight(-1); // reset highlight whenever results change
  }, [filtered]);

  // ============================
  // KEYBOARD NAVIGATION
  // ============================
  useEffect(() => {
    const handleKeys = (e) => {
      if (!showDropdown) return;

      if (e.key === "Escape") {
        setShowDropdown(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (highlight >= 0 && filtered[highlight]) {
          select(filtered[highlight]);
        }
      }
    };

    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [filtered, highlight, showDropdown]);

  // ============================
  // OUTSIDE CLICK CLOSE
  // ============================
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

  // ============================
  // SELECT COURSE
  // ============================ 
  const select = async (item) => {
    setQuery(item.title);
    setShowDropdown(false);
    setLoading(true);
    setLoadingmsg("Fetching course details...");

    try {
      const res = await fetch("https://get-easyaid-server.onrender.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ obj: item }),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/details", { state: data });
      } else {
        alert("Internal server error, try again later!");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setLoading(false);
      setLoadingmsg("");
    }
  };

  // ============================
  // COPY UPI
  // ============================
  const copyUPI = () => {
    navigator.clipboard.writeText("khakse2gaurav2003@okaxis");
    alert("UPI copied!");
  };

  // ============================
  // UI
  // ============================
  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div className="loader-overlay">
          <div className="loader-circle"></div>
          <p style={{color: "white", fontWeight: "bold"}}>{loadingmsg}</p>
        </div>
      )}

      {/* MAIN */}
      <div className="main-content">
        <div className="header">
          <div
            onClick={() => window.location.reload()}
            className="logo"
          >
            Get-EasyAid
          </div>

          <div className="header-right">
            <button
              className="icon-btn icon-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            ></button>

            {menuOpen && (
              <div className={`dropdown-menu ${menuOpen ? "active" : ""}`}>
                <a href="https://github.com/VoyagerX21/Get-AidEasy" target="_blank">
                  Source Code
                </a>
                <a href="https://www.instagram.com/_gaurav.khakse_/" target="_blank">
                  Stalk my insta?
                </a>
                <a onClick={() => setModalOpen(true)}>Buy me a coffee ☕️</a>
              </div>
            )}
          </div>
        </div>

        <div className="chat-container">
          <h1 className="welcome-message">100% Legit Coursera Financial Aid Answers</h1>
          <h1 className="welcome-message"><i>Learn smart. Apply smarter</i></h1>

          <div className="input-container">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                className="main-input"
                // type="text"
                placeholder="Search for Courses by Name"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <div className="search-btn icon-search"></div>
            </div>

            {showDropdown && filtered.length > 0 && (
              <div className="dropdown show" ref={dropdownRef}>
                {filtered.map((item, i) => (
                  <div
                    key={item.FIELD1}
                    className={`dropdown-item ${highlight === i ? "highlighted" : ""}`}
                    onClick={() => select(item)}
                  >
                    <div className="item-text">{item.title}</div>
                    <div className="item-category">{item.Organization}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="overlay active" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            <h2>Buy me a coffee!</h2>

            <div className="message">
              <strong>Hey there! 👋</strong><br /><br />
              If my work helped you in any way or brought a smile to your face,
              consider buying me a coffee ☕
            </div>

            <div className="upi-section">
              <div className="upi-label">📱 UPI ID</div>
              <div className="upi-id" onClick={copyUPI}>
                khakse2gaurav2003@okaxis
              </div>
              <div className="copy-hint">👆 Click to copy UPI ID</div>
            </div>

            <div className="thank-you">
              <strong>Thank you so much! 🙏</strong><br />
              <em>- Gaurav</em>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
