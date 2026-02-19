"use client";

import { useState } from "react";

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchPercentage, setMatchPercentage] = useState<number>(0);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [atsBreakdown, setAtsBreakdown] = useState<{
    keywords: number;
    structure: number;
    measurable: number;
    formatting: number;
    readability: number;
  } | null>(null);
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

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();

      setMatchedSkills(data.matched_skills || []);
      setMissingSkills(data.missing_skills || []);
      setMatchPercentage(data.match_percentage || 0);
      setCandidateEmail(data.candidate_email || null);
      setAtsScore(data.ats_score || 0);
      setAtsBreakdown(data.ats_breakdown || null);

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
        "Thank you for your interest in the position. " +
        "We would like to schedule an interview to discuss your experience.\n\n" +
        "Please confirm your availability.\n\n" +
        "Best regards,\nHiring Team"
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
  const strokeDashoffset =
    circumference - (matchPercentage / 100) * circumference;

  return (
    <>
      <style>{`
        body {
          background: #0a0a0f;
          color: #e8e6f0;
          font-family: sans-serif;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .input-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .analyze-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #7c5cfc 0%, #5b8af7 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          margin-bottom: 30px;
        }

        .results-header {
          display: flex;
          gap: 30px;
          align-items: center;
          margin-bottom: 20px;
        }

        .skills-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .skills-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .skill-list {
          list-style: none;
          padding: 0;
        }

        .skill-item {
          padding: 6px 0;
        }
      `}</style>

      <div className="container">
        <h1>Resume Gap Analyzer</h1>

        <div className="input-card">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) =>
              e.target.files && setResumeFile(e.target.files[0])
            }
          />
        </div>

        <div className="input-card">
          <textarea
            placeholder="Paste Job Description"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            style={{ width: "100%", minHeight: "150px" }}
          />
        </div>

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Match"}
        </button>

        {analyzed && (
          <>
            <div className="results-header">
              <div>
                <h2>Match Score: {matchPercentage}%</h2>
              </div>
              <div>
                <h2>ATS Score: {atsScore}/100</h2>
              </div>
            </div>

            {/* ATS Breakdown */}
            {atsBreakdown && (
              <div className="skills-card">
                <div className="skills-card-header">
                  <strong>ATS Breakdown</strong>
                </div>
                <ul className="skill-list">
                  <li className="skill-item">
                    Keywords: {atsBreakdown.keywords} / 30
                  </li>
                  <li className="skill-item">
                    Structure: {atsBreakdown.structure} / 20
                  </li>
                  <li className="skill-item">
                    Measurable: {atsBreakdown.measurable} / 20
                  </li>
                  <li className="skill-item">
                    Formatting: {atsBreakdown.formatting} / 15
                  </li>
                  <li className="skill-item">
                    Readability: {atsBreakdown.readability} / 15
                  </li>
                </ul>
              </div>
            )}

            <div className="skills-card">
              <strong>Matched Skills</strong>
              <ul className="skill-list">
                {matchedSkills.map((skill, i) => (
                  <li key={i} className="skill-item">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="skills-card">
              <strong>Missing Skills</strong>
              <ul className="skill-list">
                {missingSkills.map((skill, i) => (
                  <li key={i} className="skill-item">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="analyze-btn"
              onClick={handleScheduleInterview}
              disabled={!candidateEmail}
            >
              Create Interview Event on Outlook
            </button>
          </>
        )}
      </div>
    </>
  );
}
