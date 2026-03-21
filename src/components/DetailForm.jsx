import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
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
    localStorage.setItem("userDetailsPayload", payload);
    try {
      const res = await fetch(
        "https://geteasyserver.khakse.dev/GetPrompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.success) {
        navigate("/result", { state: data });
      } else {
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
      {loading && (
        <div className="loader-overlay">
          <div className="loader-circle"></div>
          <p style={{color: "white", fontWeight: "bold"}}>Generating... please wait</p>
          <p style={{color: "white", fontSize: "14px"}}>Model is under load :(</p>
        </div>
      )}

      <div className="detailform-main-content">
        <div className="header">
          <div onClick={() => navigate("/")} className="home-btn">
            Home
          </div>

          <div className="header-right">
            <button
              className="icon-btn icon-menu"
              onClick={toggleMenu}
            ></button>

            {showMenu && (
              <div className={`dropdown-menu ${showMenu ? "active" : ""}`}>
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
                <a style={{cursor: "pointer"}}onClick={openModal}>Buy me a coffee ☕️</a>
              </div>
            )}
          </div>
        </div>

        <div className="detailform-chat-container">
          <div className="detailform-form-container">
            <form onSubmit={handleSubmit}>
              <div className="detailform-form-group">
                <label>Selected Course</label>
                <input type="text" disabled value={obj.title || ""} />
              </div>

              {(specializationUrl || courselist.length > 0) && (
                <>
                  <p className="detailform-indicatorOfSpec">
                    This course is under a{" "}
                    <a
                      href={specializationUrl}
                      style={{ color: "black" }}
                      target="_blank"
                    >
                      specialization
                    </a>
                  </p>

                  <div className="detailform-specialization-section">
                    <div className="detailform-specialization-title">
                      ✓ Check other completed courses below
                    </div>

                    <div className="detailform-courses-grid">
                      {courselist.map(([idx, val]) => (
                        <label
                          key={idx}
                          className="detailform-checkbox-wrapper"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(val)}
                            onChange={() => toggleCourse(val)}
                          />
                          <span className="detailform-check-box"></span>
                          <span className="detailform-course-label">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="detailform-form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="detailform-form-group">
                <label>Status:</label>
                <div className="detailform-toggle-container">
                  <span
                    className={`detailform-toggle-label ${
                      status === "student" ? "active" : ""
                    }`}
                    onClick={setStudent}
                  >
                    Student
                  </span>

                  <div
                    className={`detailform-toggle-switch ${
                      status === "working" ? "active" : ""
                    }`}
                    onClick={() =>
                      setStatus(status === "student" ? "working" : "student")
                    }
                  >
                    <div className="detailform-toggle-slider"></div>
                  </div>

                  <span
                    className={`detailform-toggle-label ${
                      status === "working" ? "active" : ""
                    }`}
                    onClick={setWorking}
                  >
                    Working
                  </span>
                </div>
              </div>

              {status === "student" && (
                <>
                  <div className="detailform-form-group">
                    <label>Institute/School:</label>
                    <input
                      type="text"
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                    />
                  </div>

                  <div className="detailform-form-group">
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

              {status === "working" && (
                <>
                  <div className="detailform-form-group">
                    <label>Organization:</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>

                  <div className="detailform-form-group">
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

              <button type="submit" className="detailform-submit-btn">
                Get Result
              </button>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={`overlay ${showModal ? "active" : ""}`} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              ×
            </button>

            <h2>Buy me a coffee!</h2>

            <div className="modal-content">
              <div className="modal-message">
                <strong>Hey there! 👋</strong>
                <br />
                <br />
                If my work helped you in any way or brought a smile to your face,
                consider buying me a coffee! ☕<br />
              </div>

              <div className="upi-section">
                <div className="upi-label">📱 UPI ID</div>

                <div className="upi-id" onClick={copyUPI}>
                  khakse2gaurav2003@okaxis
                </div>

                <div className="copy-hint">👆 Click to copy UPI ID</div>
              </div>

              <div className="thank-you">
                <strong>Thank you so much! 🙏</strong>
                <br />
                Your support means the world to me and helps me keep creating!
                <br />
                <em>- Gaurav</em>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
