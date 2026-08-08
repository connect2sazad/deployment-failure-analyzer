import { useState, useEffect } from "react";
import "./App.css";

function getCategoryClass(category) {

  switch (category) {

    case "SSH":
      return "text-bg-danger";

    case "Terraform":
      return "text-bg-primary";

    case "Docker":
      return "text-bg-info";

    case "Ansible":
      return "text-bg-warning";

    case "Dependency":
      return "text-bg-secondary";

    case "Networking":
      return "text-bg-dark";

    case "Permissions":
      return "text-bg-danger";

    default:
      return "text-bg-secondary";
  }
}

function formatDate(dateString) {

  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  return date.toLocaleString();
}

function App() {
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyses"
      );

      if (!response.ok) {
        throw new Error("Could not load history.");
      }

      const data = await response.json();

      setHistory(data);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const analyzeFailure = async () => {
    if (!log.trim()) {
      setError("Please paste a deployment log first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            log: log,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Analysis failed.");
      }

      const data = await response.json();

      setResult(data);

      loadHistory();
    } catch (err) {
      setError(
        "Could not connect to the analyzer backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const viewAnalysis = (analysis) => {
    setLog(analysis.log);

    setResult({
      id: analysis.id,
      category: analysis.category,
      confidence: analysis.confidence,
      cause: analysis.cause,
      fix: analysis.fix,
      matched_patterns: []
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const clearAnalyzer = () => {
    setLog("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}

      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand fw-semibold">
            <i className="bi bi-terminal-fill me-2"></i>
            Deployment Failure Analyzer
          </span>

          <span className="badge text-bg-success">
            <i className="bi bi-circle-fill me-1 small"></i>
            Analyzer
          </span>
        </div>
      </nav>

      <main className="container py-5">
        {/* Header */}

        <div className="mb-4">
          <h1 className="display-6 fw-bold mb-2">
            Analyze deployment failures
          </h1>

          <p className="text-secondary mb-0">
            Paste a failed CI/CD job log and identify the likely
            failure category, root cause and remediation.
          </p>
        </div>

        <div className="row g-4">
          {/* LEFT SIDE */}

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-file-earmark-code me-2"></i>
                      Pipeline Log
                    </h5>
                  </div>

                  <span className="badge text-bg-light border">
                    Raw log
                  </span>
                </div>
              </div>

              <div className="card-body">
                <textarea
                  className="form-control log-input"
                  value={log}
                  onChange={(e) => setLog(e.target.value)}
                  placeholder={`Paste your failed pipeline log here...

Example:

Running deployment...
ssh ubuntu@10.0.1.25
Permission denied (publickey)
ERROR: Job failed: exit code 255`}
                />

                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-dark px-4"
                    onClick={analyzeFailure}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Analyze Failure
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={clearAnalyzer}
                    disabled={loading}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Clear
                  </button>
                </div>

                {error && (
                  <div
                    className="alert alert-danger mt-3 mb-0"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="col-lg-5">
            {!result && (
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center empty-result">
                  <div className="empty-icon mb-3">
                    <i className="bi bi-activity"></i>
                  </div>

                  <h5>No analysis yet</h5>

                  <p className="text-secondary small mb-0">
                    Paste a failed deployment log and run the
                    analyzer to see the diagnosis.
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Analysis Result
                  </h5>
                </div>

                <div className="card-body">
                  {/* Category */}

                  <div className="mb-4">
                    <small className="text-uppercase text-secondary fw-semibold">
                      Failure Category
                    </small>

                    <div className="mt-2">
                      <span className="badge text-bg-danger category-badge">
                        {result.category}
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}

                  <div className="mb-4">
                    <div className="d-flex justify-content-between">
                      <small className="text-uppercase text-secondary fw-semibold">
                        Evidence Confidence
                      </small>

                      <strong>
                        {result.confidence}%
                      </strong>
                    </div>

                    <div
                      className="progress mt-2"
                      style={{ height: "8px" }}
                    >
                      <div
                        className="progress-bar bg-dark"
                        style={{
                          width: `${result.confidence}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Cause */}

                  <div className="analysis-section">
                    <h6>
                      <i className="bi bi-exclamation-circle me-2"></i>
                      Likely Cause
                    </h6>

                    <p className="mb-0 text-secondary">
                      {result.cause}
                    </p>
                  </div>

                  {/* Fix */}

                  <div className="analysis-section">
                    <h6>
                      <i className="bi bi-tools me-2"></i>
                      Suggested Fix
                    </h6>

                    <p className="mb-0 text-secondary">
                      {result.fix}
                    </p>
                  </div>

                  {/* Evidence */}

                  {result.matched_patterns?.length > 0 && (
                    <div className="analysis-section">
                      <h6>
                        <i className="bi bi-fingerprint me-2"></i>
                        Evidence
                      </h6>

                      {result.matched_patterns.map(
                        (pattern, index) => (
                          <div
                            className="evidence-item"
                            key={index}
                          >
                            <div className="d-flex justify-content-between gap-3">
                              <strong className="small">
                                {pattern.description}
                              </strong>

                              <span className="badge text-bg-light border">
                                +{pattern.weight}
                              </span>
                            </div>

                            <code>
                              {pattern.matched_text}
                            </code>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis History */}

<div className="card border-0 shadow-sm mt-4">

  <div className="card-header bg-white py-3">

    <div className="d-flex justify-content-between align-items-center">

      <h5 className="mb-0">
        <i className="bi bi-clock-history me-2"></i>
        Recent Failures
      </h5>

      <span className="badge text-bg-light border">
        {history.length} records
      </span>

    </div>

  </div>


  <div className="card-body p-0">

    {history.length === 0 ? (

      <div className="text-center py-5 text-secondary">

        <i className="bi bi-inbox fs-2 d-block mb-2"></i>

        No analysis history yet.

      </div>

    ) : (

      <div className="table-responsive">

        <table className="table table-hover align-middle mb-0">

          <thead className="table-light">

            <tr>

              <th className="ps-4">
                ID
              </th>

              <th>
                Category
              </th>

              <th>
                Evidence
              </th>

              <th>
                Analyzed
              </th>

              <th className="text-end pe-4">
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {history.map((analysis) => (

              <tr key={analysis.id}>

                <td className="ps-4 text-secondary">
                  #{analysis.id}
                </td>


                <td>

                  <span
                    className={`badge ${getCategoryClass(
                      analysis.category
                    )}`}
                  >
                    {analysis.category}
                  </span>

                </td>


                <td>

                  <div
                    className="progress history-progress"
                  >

                    <div
                      className="progress-bar bg-dark"
                      style={{
                        width: `${analysis.confidence}%`
                      }}
                    >
                    </div>

                  </div>

                  <small className="text-secondary">
                    {analysis.confidence}%
                  </small>

                </td>


                <td className="text-secondary">

                  {formatDate(
                    analysis.created_at
                  )}

                </td>


                <td className="text-end pe-4">

                  <button
                    className="btn btn-sm btn-outline-dark"
                    onClick={() =>
                      viewAnalysis(analysis)
                    }
                  >

                    <i className="bi bi-eye me-1"></i>

                    View

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    )}

  </div>

</div>
      </main>
    </div>
  );
}

export default App;