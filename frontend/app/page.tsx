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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analyze-pdf`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Backend error");
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
    const body = encodeURIComponent("Hi,\n\nThank you for your interest in the position and for taking the time to share your profile with us. We were impressed by your background and would like to move forward by scheduling an interview to discuss your experience in more detail.\n\nDuring this conversation, we'll talk about your skills, previous projects, and how your expertise aligns with the role and our team's goals.\n\nPlease confirm your availability for the proposed time, or feel free to suggest an alternative slot that works better for you.\n\nWe look forward to speaking with you.\n\nBest regards,\nHiring Team");
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    window.open(`https://outlook.office.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&to=${candidateEmail}&startdt=${formatDate(start)}&enddt=${formatDate(end)}&online=1`, "_blank");
  };

  const scoreColor = matchPercentage >= 70 ? "#059669" : matchPercentage >= 40 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;
  const atsCircumference = 2 * Math.PI * 37;
  const atsStrokeDashoffset = atsCircumference - (atsScore / 100) * atsCircumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f1f5f9;
          --surface: #ffffff;
          --border: #e2e8f0;
          --border-strong: #cbd5e1;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --brand: #2563eb;
          --brand-light: #eff6ff;
          --brand-border: #bfdbfe;
          --success: #059669;
          --success-light: #ecfdf5;
          --success-border: #a7f3d0;
          --warning: #d97706;
          --warning-light: #fffbeb;
          --warning-border: #fde68a;
          --danger: #dc2626;
          --danger-light: #fef2f2;
          --danger-border: #fecaca;
        }

        body {
          background: var(--bg);
          color: var(--text-primary);
          font-family: 'Sora', sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          background: var(--bg);
          padding: 0 0 80px;
        }

        /* NAVBAR */
        .navbar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          gap: 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo {
          width: 30px; height: 30px;
          background: var(--brand);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo svg { color: white; }
        .nav-brand-text {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .nav-brand-text span {
          color: var(--brand);
        }
        .nav-sep { width: 1px; height: 20px; background: var(--border); margin: 0 20px; }
        .nav-label {
          font-size: 13px;
          font-weight: 400;
          color: var(--text-muted);
        }
        .nav-badge {
          margin-left: auto;
          display: flex; align-items: center; gap: 6px;
          padding: 4px 12px;
          background: var(--brand-light);
          border: 1px solid var(--brand-border);
          border-radius: 100px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--brand);
        }
        .nav-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--brand);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* MAIN CONTENT */
        .main { max-width: 900px; margin: 0 auto; padding: 40px 24px 0; }

        /* PAGE HEADER */
        .page-header {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 36px 40px;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }
        .page-header-icon {
          width: 52px; height: 52px;
          background: var(--brand-light);
          border: 1px solid var(--brand-border);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .page-header-icon svg { color: var(--brand); }
        .page-header-text h1 {
          font-size: clamp(20px, 3vw, 26px);
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .page-header-text h1 span { color: var(--brand); }
        .page-header-text p {
          font-size: 13.5px;
          color: var(--text-secondary);
          font-weight: 300;
          line-height: 1.65;
          max-width: 560px;
        }

        /* STEP LABELS */
        .step-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }
        .step-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
        }
        .step-num {
          width: 22px; height: 22px;
          background: var(--brand);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700;
          color: white; flex-shrink: 0;
        }

        /* INPUTS */
        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 12px;
        }
        @media (max-width: 640px) { .inputs-grid { grid-template-columns: 1fr; } .step-row { grid-template-columns: 1fr; } }

        .input-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 20px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input-card:hover {
          border-color: var(--border-strong);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .input-card.drag-active { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

        .input-label {
          font-size: 12px; font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }

        .file-drop {
          border: 1.5px dashed var(--border-strong);
          border-radius: 8px;
          padding: 32px 20px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; cursor: pointer;
          transition: all 0.15s;
          position: relative;
          min-height: 160px;
          text-align: center;
          background: var(--bg);
        }
        .file-drop:hover {
          border-color: var(--brand);
          background: var(--brand-light);
        }
        .file-drop input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .file-icon {
          width: 42px; height: 42px;
          background: var(--brand-light);
          border: 1px solid var(--brand-border);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .file-icon svg { color: var(--brand); }
        .file-drop-text { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
        .file-drop-text strong { display: block; color: var(--text-primary); font-weight: 600; font-size: 13px; margin-bottom: 2px; }
        .file-name {
          margin-top: 10px;
          display: flex; align-items: center; gap: 8px;
          background: var(--success-light);
          border: 1px solid var(--success-border);
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px; color: var(--success); font-weight: 500;
          width: 100%;
        }

        .jd-textarea {
          width: 100%; min-height: 220px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          color: var(--text-primary);
          font-family: 'Sora', sans-serif;
          font-size: 13px; font-weight: 300; line-height: 1.7;
          resize: vertical; outline: none; transition: border-color 0.15s;
        }
        .jd-textarea::placeholder { color: var(--text-muted); }
        .jd-textarea:focus { border-color: var(--brand); background: var(--surface); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }

        .analyze-btn {
          width: 100%; padding: 16px 32px;
          background: var(--brand);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 1px 3px rgba(37,99,235,0.3), 0 4px 12px rgba(37,99,235,0.15);
        }
        .analyze-btn:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 2px 6px rgba(37,99,235,0.4), 0 8px 20px rgba(37,99,235,0.2);
          transform: translateY(-1px);
        }
        .analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESULTS */
        .results { margin-top: 32px; animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        .section-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px; margin-top: 24px;
        }
        .section-title {
          font-size: 13px; font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
        }
        .section-line { flex: 1; height: 1px; background: var(--border); }

        .results-header {
          display: flex; align-items: center; gap: 32px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px 32px;
          margin-bottom: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .score-ring { flex-shrink: 0; position: relative; width: 128px; height: 128px; }
        .score-ring svg { transform: rotate(-90deg); width: 128px; height: 128px; }
        .score-ring-track { fill: none; stroke: var(--border); stroke-width: 8; }
        .score-ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1); }
        .score-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
        .score-number { font-size: 36px; font-weight: 700; line-height: 1; color: var(--text-primary); letter-spacing: -0.04em; }
        .score-pct { font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

        .score-meta h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; letter-spacing: -0.02em; }
        .score-meta p { font-size: 13.5px; color: var(--text-secondary); font-weight: 300; line-height: 1.65; max-width: 340px; }
        .score-badge {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 12px; padding: 4px 12px;
          border-radius: 100px; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.02em;
        }
        .score-badge.good { background: var(--success-light); color: var(--success); border: 1px solid var(--success-border); }
        .score-badge.mid { background: var(--warning-light); color: var(--warning); border: 1px solid var(--warning-border); }
        .score-badge.low { background: var(--danger-light); color: var(--danger); border: 1px solid var(--danger-border); }

        .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .skills-grid { grid-template-columns: 1fr; } .results-header { flex-direction: column; } }

        .skills-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 22px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .skills-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .skills-card-title { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; display: flex; align-items: center; gap: 7px; }
        .skills-card-title.matched { color: var(--success); }
        .skills-card-title.missing { color: var(--danger); }
        .skills-count { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.04em; }

        .skill-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
        .skill-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--text-secondary);
          padding: 8px 10px;
          border-radius: 7px;
          transition: all 0.12s;
        }
        .skill-item:hover { background: var(--bg); color: var(--text-primary); }
        .skill-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .skill-dot.matched { background: var(--success); }
        .skill-dot.missing { background: var(--danger); }

        .ats-card {
          background: var(--warning-light);
          border: 1px solid var(--warning-border);
          border-radius: 12px; padding: 24px; margin-top: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ats-card-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .ats-ring { flex-shrink: 0; position: relative; width: 88px; height: 88px; }
        .ats-ring svg { transform: rotate(-90deg); width: 88px; height: 88px; }
        .ats-ring-track { fill: none; stroke: rgba(217,119,6,0.12); stroke-width: 7; }
        .ats-ring-fill { fill: none; stroke: var(--warning); stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1); }
        .ats-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
        .ats-ring-number { font-size: 22px; font-weight: 700; line-height: 1; color: var(--warning); letter-spacing: -0.04em; }
        .ats-ring-label-text { font-size: 9px; color: rgba(217,119,6,0.5); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
        .ats-meta { flex: 1; }
        .ats-card-title { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--warning); display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
        .ats-card-title-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--warning); }
        .ats-card-desc { font-size: 13px; color: rgba(120,80,0,0.7); font-weight: 300; line-height: 1.6; }

        .ats-breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (max-width: 640px) { .ats-breakdown-grid { grid-template-columns: 1fr; } }
        .ats-breakdown-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(217,119,6,0.1);
          transition: all 0.12s;
        }
        .ats-breakdown-item:hover { background: rgba(255,255,255,0.95); }
        .ats-breakdown-label { font-size: 13px; color: rgba(120,80,0,0.8); font-weight: 400; }
        .ats-breakdown-value { font-size: 16px; font-weight: 700; color: var(--warning); letter-spacing: -0.03em; }
        .ats-breakdown-max { font-size: 11px; color: rgba(217,119,6,0.4); font-weight: 400; }

        .interview-section { margin-top: 16px; }
        .interview-btn {
          width: 100%; padding: 16px 32px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: 10px;
          color: var(--text-secondary);
          font-family: 'Sora', sans-serif;
          font-size: 14px; font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .interview-btn:hover {
          background: var(--brand-light);
          border-color: var(--brand);
          color: var(--brand);
          box-shadow: 0 2px 8px rgba(37,99,235,0.12);
        }
        .interview-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .interview-email-hint { margin-top: 8px; text-align: center; font-size: 12px; color: var(--text-muted); }
        .interview-email-hint strong { color: var(--text-secondary); font-weight: 500; }
      `}</style>

      <div className="page">
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="nav-brand-text">Resume<span>IQ</span></span>
          </div>
          <div className="nav-sep" />
          <span className="nav-label">Resume Intelligence Suite</span>
          <div className="nav-badge">
            <div className="nav-badge-dot" />
            NLP Powered
          </div>
        </nav>

        <div className="main">
          <div className="page-header">
            <div className="page-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="page-header-text">
              <h1>Resume <span>Gap</span> Analyzer, <span>ATS</span> Checker & Interview Scheduler</h1>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                <div style={{
                  flex: '1', minWidth: '200px',
                  background: 'var(--brand-light)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  display: 'flex', gap: '10px', alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: 'var(--brand)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '3px' }}>For Applicants</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '300', lineHeight: '1.6' }}>Upload your resume and a job description and/or the Key Skills to evaluate your match score, identify missing skills, and assess your ATS compatibility.</div>
                  </div>
                </div>
                <div style={{
                  flex: '1', minWidth: '200px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '11px 14px',
                  display: 'flex', gap: '10px', alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: 'var(--success)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '3px' }}>For HR Teams</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '300', lineHeight: '1.6' }}>Analyze candidate resumes against role requirements, review ATS readiness, and seamlessly schedule interviews.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="step-row">
            <div className="step-label"><div className="step-num">1</div>Upload your resume (PDF)</div>
            <div className="step-label"><div className="step-num">2</div>Paste the job description</div>
          </div>

          <div className="inputs-grid">
            <div className="input-card">
              <div className="input-label">Resume Document</div>
              <div className={`file-drop${dragOver ? " drag-active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}>
                <input type="file" accept="application/pdf" onChange={(e) => e.target.files && setResumeFile(e.target.files[0])} />
                <div className="file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {resumeFile.name}
                </div>
              )}
            </div>

            <div className="input-card">
              <div className="input-label">Job Description / Key Skills</div>
              <textarea className="jd-textarea" placeholder="Paste the full job description here…" value={jd} onChange={(e) => setJd(e.target.value)} />
            </div>
          </div>

          <button className="analyze-btn" onClick={handleAnalyze} disabled={loading || !resumeFile || !jd.trim()}>
            {loading ? (<><div className="spinner" /><span>Analyzing your resume…</span></>) : (<><span>Analyze Match</span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>)}
          </button>

          {analyzed && (
            <div className="results">
              <div className="section-header">
                <div className="section-title">Match Results</div>
                <div className="section-line" />
              </div>

              <div className="results-header">
                <div className="score-ring">
                  <svg viewBox="0 0 128 128">
                    <circle className="score-ring-track" cx="64" cy="64" r="54" />
                    <circle className="score-ring-fill" cx="64" cy="64" r="54" stroke={scoreColor} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                  </svg>
                  <div className="score-label">
                    <span className="score-number">{matchPercentage}</span>
                    <span className="score-pct">Match</span>
                  </div>
                </div>
                <div className="score-meta">
                  <h2>Overall Match Score</h2>
                  <p>{matchPercentage >= 70 ? "Strong alignment with this role. You meet most of the key requirements." : matchPercentage >= 40 ? "Moderate fit. A few targeted improvements could make a strong difference." : "Significant gaps identified. Focus on the missing skills below to improve your chances."}</p>
                  <div className={`score-badge ${matchPercentage >= 70 ? "good" : matchPercentage >= 40 ? "mid" : "low"}`}>
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="12" /></svg>
                    {matchPercentage >= 70 ? "Strong Match" : matchPercentage >= 40 ? "Partial Match" : "Needs Work"}
                  </div>
                </div>
              </div>

              <div className="section-header">
                <div className="section-title">Skills Breakdown</div>
                <div className="section-line" />
              </div>

              <div className="skills-grid">
                <div className="skills-card">
                  <div className="skills-card-header">
                    <div className="skills-card-title matched">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Matched Skills
                    </div>
                    <span className="skills-count">{matchedSkills.length}</span>
                  </div>
                  <ul className="skill-list">
                    {matchedSkills.map((skill, i) => (<li key={i} className="skill-item"><div className="skill-dot matched" />{skill}</li>))}
                  </ul>
                </div>
                <div className="skills-card">
                  <div className="skills-card-header">
                    <div className="skills-card-title missing">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Missing Skills
                    </div>
                    <span className="skills-count">{missingSkills.length}</span>
                  </div>
                  <ul className="skill-list">
                    {missingSkills.map((skill, i) => (<li key={i} className="skill-item"><div className="skill-dot missing" />{skill}</li>))}
                  </ul>
                </div>
              </div>

              <div className="section-header">
                <div className="section-title">ATS Compatibility</div>
                <div className="section-line" />
              </div>

              <div className="ats-card">
                <div className="ats-card-header">
                  <div className="ats-ring">
                    <svg viewBox="0 0 88 88">
                      <circle className="ats-ring-track" cx="44" cy="44" r="37" />
                      <circle className="ats-ring-fill" cx="44" cy="44" r="37" strokeDasharray={atsCircumference} strokeDashoffset={atsStrokeDashoffset} />
                    </svg>
                    <div className="ats-ring-label">
                      <span className="ats-ring-number">{atsScore}</span>
                      <span className="ats-ring-label-text">/ 100</span>
                    </div>
                  </div>
                  <div className="ats-meta">
                    <div className="ats-card-title"><div className="ats-card-title-dot" />ATS Compatibility Score</div>
                    <p className="ats-card-desc">How well your resume is optimized for applicant tracking systems — based on keywords, structure, formatting, and readability.</p>
                  </div>
                </div>
                {atsBreakdown && (
                  <div className="ats-breakdown-grid">
                    <div className="ats-breakdown-item"><span className="ats-breakdown-label">Keywords</span><span className="ats-breakdown-value">{atsBreakdown.keywords} <span className="ats-breakdown-max">/ 30</span></span></div>
                    <div className="ats-breakdown-item"><span className="ats-breakdown-label">Structure</span><span className="ats-breakdown-value">{atsBreakdown.structure} <span className="ats-breakdown-max">/ 20</span></span></div>
                    <div className="ats-breakdown-item"><span className="ats-breakdown-label">Achievements</span><span className="ats-breakdown-value">{atsBreakdown.measurable} <span className="ats-breakdown-max">/ 20</span></span></div>
                    <div className="ats-breakdown-item"><span className="ats-breakdown-label">Formatting</span><span className="ats-breakdown-value">{atsBreakdown.formatting} <span className="ats-breakdown-max">/ 15</span></span></div>
                    <div className="ats-breakdown-item"><span className="ats-breakdown-label">Readability</span><span className="ats-breakdown-value">{atsBreakdown.readability} <span className="ats-breakdown-max">/ 15</span></span></div>
                  </div>
                )}
              </div>

              <div className="interview-section">
                <button className="interview-btn" onClick={handleScheduleInterview} disabled={!candidateEmail}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  <span>Create Interview Event on Outlook</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </button>
                <p className="interview-email-hint">
                  {candidateEmail ? <><span>Creates Outlook calendar invite for </span><strong>{candidateEmail}</strong></> : "No email found in resume"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
