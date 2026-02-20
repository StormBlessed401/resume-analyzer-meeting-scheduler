"use client";

import { useState } from "react";

export default function Home() {

  const [atsScore, setAtsScore] = useState<number>(0);
  const [atsBreakdown, setAtsBreakdown] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchPercentage, setMatchPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!resumeFile || !jd.trim()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("jd", jd);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analyze-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      setAtsScore(data.ats_score || 0);
      setAtsBreakdown(data.ats_breakdown || null);
      setMatchedSkills(data.matched_skills || []);
      setMissingSkills(data.missing_skills || []);
      setMatchPercentage(data.match_percentage || 0);
      setCandidateEmail(data.candidate_email || null);
      setAnalyzed(true);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") setResumeFile(file);
  };

  const handleScheduleInterview = () => {
    if (!candidateEmail) return;

    const subject = encodeURIComponent("Interview Invitation");

    const body = encodeURIComponent(
    "Hi,\n\n" +
    "Thank you for your interest in the position and for taking the time to share your profile with us. " +
    "We were impressed by your background and would like to move forward by scheduling an interview to discuss your experience in more detail.\n\n" +
    "During this conversation, we'll talk about your skills, previous projects, and how your expertise aligns with the role and our team's goals.\n\n" +
    "Please confirm your availability for the proposed time, or feel free to suggest an alternative slot that works better for you.\n\n" +
    "We look forward to speaking with you.\n\n" +
    "Best regards,\n" +
    "Hiring Team"
  );
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    window.open(
      `https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&to=${candidateEmail}&startdt=${formatDate(
        start
      )}&enddt=${formatDate(end)}&online=1`,
      "_blank"
    );
  };


  const scoreColor =
    matchPercentage >= 70
      ? "#22c55e"
      : matchPercentage >= 40
      ? "#f59e0b"
      : "#ef4444";

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

  // ATS ring — amber/gold, out of 100
  const atsCircumference = 2 * Math.PI * 54;
  const atsStrokeDashoffset = atsCircumference - (atsScore / 100) * atsCircumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          color: #e8e6f0;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          background: #0a0a0f;
          background-image:
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(99, 60, 180, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(30, 80, 160, 0.1) 0%, transparent 60%);
          padding: 48px 24px 80px;
        }

        .container {
          max-width: 860px;
          margin: 0 auto;
        }

        /* HEADER */
        .header {
          margin-bottom: 52px;
        }
        .header-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8b7cf8;
          margin-bottom: 16px;
        }
        .header-eyebrow span {
          display: inline-block;
          width: 20px;
          height: 1px;
          background: #8b7cf8;
        }
        .header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 400;
          line-height: 1.05;
          color: #f0eeff;
          letter-spacing: -0.02em;
        }
        .header h1 em {
          font-style: italic;
          color: #b8a8ff;
        }
        .header-sub {
          margin-top: 14px;
          color: #6b6480;
          font-size: 15px;
          font-weight: 300;
          max-width: 480px;
          line-height: 1.6;
        }

        /* INPUTS GRID */
        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 640px) {
          .inputs-grid { grid-template-columns: 1fr; }
        }

        .input-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 24px;
          transition: border-color 0.2s;
        }
        .input-card:hover {
          border-color: rgba(139, 124, 248, 0.3);
        }
        .input-card.drag-active {
          border-color: #8b7cf8;
          background: rgba(139, 124, 248, 0.06);
        }

        .input-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5c5475;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8b7cf8;
        }

        /* FILE UPLOAD */
        .file-drop {
          border: 1.5px dashed rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          min-height: 160px;
          text-align: center;
        }
        .file-drop:hover {
          border-color: rgba(139, 124, 248, 0.5);
          background: rgba(139, 124, 248, 0.04);
        }
        .file-drop input[type="file"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }
        .file-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(139, 124, 248, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .file-icon svg { color: #8b7cf8; }
        .file-drop-text {
          font-size: 13px;
          color: #4a4260;
          line-height: 1.5;
        }
        .file-drop-text strong {
          display: block;
          color: #9d8fff;
          font-weight: 500;
          font-size: 13px;
          margin-bottom: 2px;
        }
        .file-name {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: #86efac;
          font-weight: 500;
          width: 100%;
        }

        /* TEXTAREA */
        .jd-textarea {
          width: 100%;
          min-height: 220px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          color: #d4cfed;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 300;
          line-height: 1.7;
          resize: vertical;
          transition: border-color 0.2s;
          outline: none;
        }
        .jd-textarea::placeholder { color: #3a3354; }
        .jd-textarea:focus {
          border-color: rgba(139, 124, 248, 0.5);
          background: rgba(139, 124, 248, 0.03);
        }

        /* ANALYZE BUTTON */
        .analyze-btn {
          width: 100%;
          padding: 18px 32px;
          background: linear-gradient(135deg, #7c5cfc 0%, #5b8af7 100%);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .analyze-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #9478ff 0%, #7aaaf9 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .analyze-btn:hover:not(:disabled)::before { opacity: 1; }
        .analyze-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .analyze-btn span { position: relative; z-index: 1; }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          position: relative;
          z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESULTS */
        .results {
          margin-top: 40px;
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .results-header {
          display: flex;
          align-items: center;
          gap: 28px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }

        .score-ring {
          flex-shrink: 0;
          position: relative;
          width: 128px;
          height: 128px;
        }
        .score-ring svg {
          transform: rotate(-90deg);
          width: 128px;
          height: 128px;
        }
        .score-ring-track {
          fill: none;
          stroke: rgba(255,255,255,0.06);
          stroke-width: 8;
        }
        .score-ring-fill {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .score-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .score-number {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          line-height: 1;
          color: #f0eeff;
        }
        .score-pct {
          font-size: 11px;
          color: #5c5475;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .score-meta h2 {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          font-weight: 400;
          color: #f0eeff;
          margin-bottom: 8px;
        }
        .score-meta p {
          font-size: 13.5px;
          color: #5c5475;
          font-weight: 300;
          line-height: 1.6;
          max-width: 360px;
        }
        .score-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .score-badge.good { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
        .score-badge.mid { background: rgba(245,158,11,0.12); color: #fcd34d; border: 1px solid rgba(245,158,11,0.2); }
        .score-badge.low { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }

        /* SKILLS GRID */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .skills-grid { grid-template-columns: 1fr; }
          .results-header { flex-direction: column; text-align: center; }
        }

        .skills-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }
        .skills-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .skills-card-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .skills-card-title.matched { color: #86efac; }
        .skills-card-title.missing { color: #fca5a5; }
        .skills-count {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #f0eeff;
        }

        .skill-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .skill-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 400;
          color: #c4bfe0;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          transition: all 0.15s;
        }
        .skill-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }
        .skill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .skill-dot.matched { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .skill-dot.missing { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,0.5); }

        /* ── ATS CARD — amber/gold theme ── */
        .ats-card {
          background: rgba(251, 191, 36, 0.03);
          border: 1px solid rgba(251, 191, 36, 0.15);
          border-radius: 16px;
          padding: 24px;
          margin-top: 20px;
        }
        .ats-card-header {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 20px;
        }
        .ats-ring {
          flex-shrink: 0;
          position: relative;
          width: 88px;
          height: 88px;
        }
        .ats-ring svg {
          transform: rotate(-90deg);
          width: 88px;
          height: 88px;
        }
        .ats-ring-track {
          fill: none;
          stroke: rgba(251, 191, 36, 0.1);
          stroke-width: 7;
        }
        .ats-ring-fill {
          fill: none;
          stroke: #f59e0b;
          stroke-width: 7;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5));
        }
        .ats-ring-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
        }
        .ats-ring-number {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          line-height: 1;
          color: #fcd34d;
        }
        .ats-ring-label-text {
          font-size: 9px;
          color: #92692a;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ats-meta {
          flex: 1;
        }
        .ats-card-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #d97706;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .ats-card-title-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
        }
        .ats-card-desc {
          font-size: 12px;
          color: #78643a;
          font-weight: 300;
          line-height: 1.5;
        }
        .ats-breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        @media (max-width: 640px) {
          .ats-breakdown-grid { grid-template-columns: 1fr; }
        }
        .ats-breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(251, 191, 36, 0.04);
          border: 1px solid rgba(251, 191, 36, 0.1);
          transition: all 0.15s;
        }
        .ats-breakdown-item:hover {
          background: rgba(251, 191, 36, 0.07);
          border-color: rgba(251, 191, 36, 0.2);
        }
        .ats-breakdown-label {
          font-size: 12.5px;
          color: #a07c3a;
          font-weight: 400;
        }
        .ats-breakdown-value {
          font-family: 'DM Serif Display', serif;
          font-size: 15px;
          color: #fcd34d;
        }
        .ats-breakdown-max {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #6b5020;
          font-weight: 400;
        }

        /* SCHEDULE INTERVIEW BUTTON */
        .interview-section {
          margin-top: 24px;
        }
        .interview-btn {
          width: 100%;
          padding: 18px 32px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(99, 153, 255, 0.3);
          border-radius: 14px;
          color: #a8c4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        .interview-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99, 153, 255, 0.1) 0%, rgba(99, 100, 255, 0.08) 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .interview-btn:hover::before { opacity: 1; }
        .interview-btn:hover {
          border-color: rgba(99, 153, 255, 0.6);
          color: #c5d9ff;
        }
        .interview-btn svg { flex-shrink: 0; position: relative; z-index: 1; }
        .interview-btn span { position: relative; z-index: 1; }
        .interview-email-hint {
          margin-top: 10px;
          text-align: center;
          font-size: 12px;
          color: #3d3660;
          font-weight: 400;
        }
        .interview-email-hint strong {
          color: #5a508a;
          font-weight: 500;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 40px 0;
        }
      `}</style>

      <div className="page">
        <div className="container">
          {/* HEADER */}
          <header className="header">
            <div className="header-eyebrow">
              <span /> NLP Powered Analysis
            </div>
            <h1>
              Resume <em>Gap</em> Analyzer
            </h1>
            <p className="header-sub">
              Upload your resume and paste a job description and/or key skills to discover how
              well you matchand and what skills you're missing.
            </p>
          </header>

          {/* INPUTS */}
          <div className="inputs-grid">
            {/* Resume Upload */}
            <div className="input-card">
              <div className="input-label">
                <div className="input-label-dot" />
                Resume
              </div>
              <div
                className={`file-drop${dragOver ? " drag-active" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    e.target.files && setResumeFile(e.target.files[0])
                  }
                />
                <div className="file-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="file-drop-text">
                  <strong>Drop your PDF here</strong>
                  or click to browse
                </div>
              </div>
              {resumeFile && (
                <div className="file-name">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {resumeFile.name}
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="input-card">
              <div className="input-label">
                <div className="input-label-dot" />
                Job Description/Key Skills
              </div>
              <textarea
                className="jd-textarea"
                placeholder="Paste the full job description here…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
          </div>

          {/* ANALYZE BUTTON */}
          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !resumeFile || !jd.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Analyzing your resume…</span>
              </>
            ) : (
              <>
                <span>Analyze Match</span>
                <svg
                  style={{ position: "relative", zIndex: 1 }}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* RESULTS */}
          {analyzed && (
            <div className="results">
              <div className="divider" />

              {/* Score header */}
              <div className="results-header">
                <div className="score-ring">
                  <svg viewBox="0 0 128 128">
                    <circle
                      className="score-ring-track"
                      cx="64"
                      cy="64"
                      r="54"
                    />
                    <circle
                      className="score-ring-fill"
                      cx="64"
                      cy="64"
                      r="54"
                      stroke={scoreColor}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="score-label">
                    <span className="score-number">{matchPercentage}</span>
                    <span className="score-pct">Match</span>
                  </div>
                </div>
                <div className="score-meta">
                  <h2>Overall Match Score</h2>
                  <p>
                    {matchPercentage >= 70
                      ? "Strong alignment with this role. You meet most of the key requirements."
                      : matchPercentage >= 40
                      ? "Moderate fit. A few targeted improvements could make a strong difference."
                      : "Significant gaps identified. Focus on the missing skills below to improve your chances."}
                  </p>
                  <div
                    className={`score-badge ${
                      matchPercentage >= 70
                        ? "good"
                        : matchPercentage >= 40
                        ? "mid"
                        : "low"
                    }`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="12" />
                    </svg>
                    {matchPercentage >= 70
                      ? "Strong Match"
                      : matchPercentage >= 40
                      ? "Partial Match"
                      : "Needs Work"}
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="skills-grid">
                <div className="skills-card">
                  <div className="skills-card-header">
                    <div className="skills-card-title matched">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Matched Skills
                    </div>
                    <span className="skills-count">{matchedSkills.length}</span>
                  </div>
                  <ul className="skill-list">
                    {matchedSkills.map((skill, i) => (
                      <li key={i} className="skill-item">
                        <div className="skill-dot matched" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="skills-card">
                  <div className="skills-card-header">
                    <div className="skills-card-title missing">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Missing Skills
                    </div>
                    <span className="skills-count">{missingSkills.length}</span>
                  </div>
                  <ul className="skill-list">
                    {missingSkills.map((skill, i) => (
                      <li key={i} className="skill-item">
                        <div className="skill-dot missing" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ATS Score Section — amber/gold theme */}
              <div className="ats-card">
                <div className="ats-card-header">
                  {/* Mini ring for ATS */}
                  <div className="ats-ring">
                    <svg viewBox="0 0 88 88">
                      <circle className="ats-ring-track" cx="44" cy="44" r="37" />
                      <circle
                        className="ats-ring-fill"
                        cx="44"
                        cy="44"
                        r="37"
                        strokeDasharray={2 * Math.PI * 37}
                        strokeDashoffset={2 * Math.PI * 37 - (atsScore / 100) * 2 * Math.PI * 37}
                      />
                    </svg>
                    <div className="ats-ring-label">
                      <span className="ats-ring-number">{atsScore}</span>
                      <span className="ats-ring-label-text">/ 100</span>
                    </div>
                  </div>
                  <div className="ats-meta">
                    <div className="ats-card-title">
                      <div className="ats-card-title-dot" />
                      ATS Compatibility Score
                    </div>
                    <p className="ats-card-desc">
                      How well your resume is optimized for applicant tracking systems — based on keywords, structure, formatting, and readability.
                    </p>
                  </div>
                </div>

                {atsBreakdown && (
                  <div className="ats-breakdown-grid">
                    <div className="ats-breakdown-item">
                      <span className="ats-breakdown-label">Keywords</span>
                      <span className="ats-breakdown-value">
                        {atsBreakdown.keywords} <span className="ats-breakdown-max">/ 30</span>
                      </span>
                    </div>
                    <div className="ats-breakdown-item">
                      <span className="ats-breakdown-label">Structure</span>
                      <span className="ats-breakdown-value">
                        {atsBreakdown.structure} <span className="ats-breakdown-max">/ 20</span>
                      </span>
                    </div>
                    <div className="ats-breakdown-item">
                      <span className="ats-breakdown-label">Achievements</span>
                      <span className="ats-breakdown-value">
                        {atsBreakdown.measurable} <span className="ats-breakdown-max">/ 20</span>
                      </span>
                    </div>
                    <div className="ats-breakdown-item">
                      <span className="ats-breakdown-label">Formatting</span>
                      <span className="ats-breakdown-value">
                        {atsBreakdown.formatting} <span className="ats-breakdown-max">/ 15</span>
                      </span>
                    </div>
                    <div className="ats-breakdown-item">
                      <span className="ats-breakdown-label">Readability</span>
                      <span className="ats-breakdown-value">
                        {atsBreakdown.readability} <span className="ats-breakdown-max">/ 15</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Schedule Interview Button */}
              <div className="interview-section">
                <button
                  className="interview-btn"
                  onClick={handleScheduleInterview}
                  disabled={!candidateEmail}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Create Interview Event on Outlook</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
                <p className="interview-email-hint">
                  {candidateEmail
                    ? <><span>Creates Outlook calendar invite for </span><strong>{candidateEmail}</strong></>
                    : "No email found in resume"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
