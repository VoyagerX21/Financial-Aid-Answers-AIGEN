import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Briefcase, ExternalLink, Sparkles, CheckSquare, Square } from "lucide-react";
import Header from "./common/Header";
import Loader from "./common/Loader";
import { useToast } from "./common/Toast";

export default function Personalization() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const obj = state?.obj || {};
  const courselist = state?.courselist || [];
  const specializationUrl = state?.url || null;

  const [status, setStatus] = useState("student");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [institute, setInstitute] = useState("");
  const [organization, setOrganization] = useState("");
  const [year, setYear] = useState("");
  const [position, setPosition] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Checkbox toggle
  const toggleCourse = (value) => {
    setSelectedCourses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const selectAllCourses = () => {
    setSelectedCourses(courselist.map(([, val]) => val));
  };

  const clearAllCourses = () => {
    setSelectedCourses([]);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Please enter your full name", "error");
      return;
    }

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
      const apiUrl = window.__ENV__?.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/GetPrompt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/result", { state: data });
      } else {
        navigate("/error", { state: data });
      }
    } catch (err) {
      console.error(err);
      addToast("Network error submitting application details", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Header />

      {loading && (
        <Loader
          message="Synthesizing Personalized Financial Aid Essays..."
          submessage="Applying prompt engineering to align with Coursera's acceptance criteria"
        />
      )}

      <main className="page-wrapper page-wrapper-narrow">
        <div className="detail-page-header">
          <div className="back-btn-link" onClick={() => navigate("/")} role="button" tabIndex={0}>
            <ArrowLeft size={16} />
            <span>Back to course search</span>
          </div>

          <h1 className="detail-page-title">Personalize Your Application</h1>
          <p className="detail-page-subtitle">
            Provide a few details so the AI can craft authentic, persuasive responses tailored to your profile.
          </p>
        </div>

        {/* Selected Course Banner */}
        <div className="selected-course-banner">
          <div className="selected-course-info">
            <span className="selected-course-tag">Selected Course</span>
            <span className="selected-course-name">{obj.title || "No course selected"}</span>
          </div>
          {obj.Organization && (
            <span className="badge badge-muted">{obj.Organization}</span>
          )}
        </div>

        {/* Specialization notice & completed courses */}
        {(specializationUrl || courselist.length > 0) && (
          <>
            {specializationUrl && (
              <div className="spec-notice-banner">
                <Sparkles size={18} />
                <span>
                  This course is part of a specialization.{" "}
                  <a href={specializationUrl} target="_blank" rel="noopener noreferrer">
                    View on Coursera <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                  </a>
                </span>
              </div>
            )}

            {courselist.length > 0 && (
              <div className="course-checklist-section">
                <div className="course-checklist-header">
                  <span className="course-checklist-title">
                    Optional: Select courses in this series you have already completed
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={selectAllCourses}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={clearAllCourses}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="course-checklist-grid">
                  {courselist.map(([idx, val]) => {
                    const isChecked = selectedCourses.includes(val);
                    return (
                      <label key={idx} className="course-checkbox-card">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCourse(val)}
                        />
                        <span className="course-checkbox-label">{val}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Main Personalization Form */}
        <div className="saas-card">
          <div className="saas-card-header">
            <div>
              <h2 className="saas-card-title">Applicant Profile</h2>
              <p className="saas-card-description">This information will be woven naturally into your essays.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="saas-card-body">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gaurav Khakse"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Academic / Professional Status</label>
                <div className="segmented-control">
                  <button
                    type="button"
                    className={`segmented-btn ${status === "student" ? "active" : ""}`}
                    onClick={() => setStatus("student")}
                  >
                    <GraduationCap size={16} />
                    <span>Student / Academic</span>
                  </button>

                  <button
                    type="button"
                    className={`segmented-btn ${status === "working" ? "active" : ""}`}
                    onClick={() => setStatus("working")}
                  >
                    <Briefcase size={16} />
                    <span>Working Professional</span>
                  </button>
                </div>
              </div>

              {status === "student" && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="institute">
                      University / College / School Name
                    </label>
                    <input
                      id="institute"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Delhi University, Stanford University"
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="yearOfStudy">
                      Year of Study
                      <span className="form-label-optional">Optional</span>
                    </label>
                    <input
                      id="yearOfStudy"
                      type="text"
                      className="form-input"
                      placeholder="e.g., 2nd Year, Final Year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                </>
              )}

              {status === "working" && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="organization">
                      Company / Organization Name
                    </label>
                    <input
                      id="organization"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Acme Tech, Freelance"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="position">
                      Current Role / Title
                      <span className="form-label-optional">Optional</span>
                    </label>
                    <input
                      id="position"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Junior Developer, Intern, Data Analyst"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="saas-card-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Sparkles size={16} />
                <span>Generate Application Answers</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
