import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/detailform.css";  // your existing CSS

export default function Personalization() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const obj = state?.obj || {};
  const courselist = state?.courselist || [];
  const specializationUrl = state?.url || null;

  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState("student");
  const [loading, setLoading] = useState(false);

  // Form fields    
  const [name, setName] = useState("");
  const [institute, setInstitute] = useState("");
  const [organization, setOrganization] = useState("");
  const [year, setYear] = useState("");
  const [position, setPosition] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Handle specialization checkbox toggle
  const toggleCourse = (value) => {
    setSelectedCourses((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // Modal
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // Dropdown menu
  const toggleMenu = () => setShowMenu((p) => !p);

  // Copy UPI
  const copyUPI = () => {
    navigator.clipboard.writeText("khakse2gaurav2003@okaxis");
  };

  // Status toggle
  const setStudent = () => setStatus("student");
  const setWorking = () => setStatus("working");

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      courseType: obj.title,
      specialization: specializationUrl,
      courses: selectedCourses,
      name,
      status,
      institute,
      organization,
      year,
      position,
    };

    try {
      const res = await fetch("https://get-easyaid-server.onrender.com/GetPrompt",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success){
        navigate("/result", { state: data });
      }
      else{
        navigate("/error", { state: data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loader Overlay */}
      {loading && (
        <div id="loaderOverlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            zIndex: "9999",
            color: "white",
            fontSize: "18px",
          }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "15px",
          }}></div>
          <span>Generating... please wait</span>
          <span>Model is under load :(</span>
        </div>
      )}

      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div
            onClick={() => navigate("/")}
            style={{
              cursor: "pointer",
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: "10px",
              padding: "10px",
              color: "black",
            }}
          >
            Home
          </div>

          <div className="header-right">
            <button className="icon-btn icon-menu" onClick={toggleMenu}></button>

            <div className={`dropdown-menu ${showMenu ? "active" : ""}`}>
              <a href="https://github.com/VoyagerX21/Get-AidEasy" target="_blank">
                Source Code
              </a>
              <a href="https://www.instagram.com/_gaurav.khakse_/" target="_blank">
                Stalk my insta?
              </a>
              <a onClick={openModal}>Buy me a coffee ☕️</a>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="chat-container">
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {/* Selected Course */}
              <div className="form-group">
                <label>Selected Course</label>
                <input type="text" disabled value={obj.title || ""} />
              </div>

              {/* Specialization */}
              {specializationUrl && (
                <>
                  <p className="IndicatorOfSpec">
                    This course is under a{" "}
                    <a href={specializationUrl} style={{ color: "black" }} target="_blank">
                      specialization
                    </a>
                  </p>

                  <div className="specialization-section">
                    <div className="specialization-title">
                      ✓ Check other completed courses below
                    </div>
                    <div className="courses-grid">
                      {courselist.map(([idx, val]) => (
                        <label key={idx} className="checkbox-wrapper-19">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(val)}
                            onChange={() => toggleCourse(val)}
                          />
                          <span className="check-box"></span>
                          <span className="course-label">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Name */}
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Status Toggle */}
              <div className="form-group">
                <label>Status:</label>
                <div className="toggle-container">
                  <span
                    className={`toggle-label ${status === "student" ? "active" : ""}`}
                    onClick={setStudent}
                  >
                    Student
                  </span>

                  <div
                    className={`toggle-switch ${status === "working" ? "active" : ""}`}
                    onClick={() => setStatus(status === "student" ? "working" : "student")}
                  >
                    <div className="toggle-slider"></div>
                  </div>

                  <span
                    className={`toggle-label ${status === "working" ? "active" : ""}`}
                    onClick={setWorking}
                  >
                    Working
                  </span>
                </div>
              </div>

              {/* Student Fields */}
              {status === "student" && (
                <>
                  <div className="form-group">
                    <label>Institute/School:</label>
                    <input type="text" value={institute} onChange={(e) => setInstitute(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Year of Study:</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g., 2"
                    />
                  </div>
                </>
              )}

              {/* Working Fields */}
              {status === "working" && (
                <>
                  <div className="form-group">
                    <label>Organization:</label>
                    <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Position:</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>
                </>
              )}

              <button type="submit" className="submit-btn">
                Get Result
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`overlay ${showModal ? "active" : ""}`} onClick={closeModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={closeModal}>×</button>

          <h2>Buy me a coffee!</h2>

          <div className="message">
            <strong>Hey there! 👋</strong><br /><br />
            If my work helped you in any way or brought a smile to your face,
            consider buying me a coffee! ☕<br /><br />
            Every small contribution fuels my passion for coding and keeps me
            motivated to create more awesome stuff! <span className="heart">❤️</span>
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
            Your support means the world to me and helps me keep creating!<br />
            <em>- Gaurav</em>
          </div>
        </div>
      </div>
    </>
  );
}
