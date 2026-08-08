import { useEffect, useState } from "react";
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

    case "Configuration":
      return "text-bg-warning";

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

  const [githubRuns, setGithubRuns] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);

  const [analyzingRun, setAnalyzingRun] = useState(null);

  // Multiple failed jobs belonging to one GitHub workflow
  const [githubResults, setGithubResults] = useState([]);


  // -------------------------------------------------------
  // Analysis History
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // GitHub Workflow Runs
  // -------------------------------------------------------

  const loadGithubRuns = async () => {
    setGithubLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/github/runs"
      );

      if (!response.ok) {
        throw new Error("GitHub request failed.");
      }

      const data = await response.json();

      setGithubRuns(data);

    } catch (err) {
      console.error("GitHub runs error:", err);

    } finally {
      setGithubLoading(false);
    }
  };


  // -------------------------------------------------------
  // Analyze GitHub Workflow
  // -------------------------------------------------------

  const analyzeGithubRun = async (run) => {
    setAnalyzingRun(run.id);

    setError("");
    setGithubResults([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/github/runs/${run.id}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "GitHub analysis request failed."
        );
      }

      const data = await response.json();

      if (
        !data.analyses ||
        data.analyses.length === 0
      ) {
        setError(
          "No failed jobs were found in this workflow."
        );

        return;
      }

      setGithubResults(data.analyses);

      // Display first failed job automatically
      const firstResult = data.analyses[0];

      setResult(firstResult);

      setLog(firstResult.log || "");

      await loadHistory();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {
      console.error(err);

      setError(
        "Could not analyze this GitHub workflow."
      );

    } finally {
      setAnalyzingRun(null);
    }
  };


  // -------------------------------------------------------
  // Initial Page Load
  // -------------------------------------------------------

  useEffect(() => {
    loadHistory();
    loadGithubRuns();
  }, []);


  // -------------------------------------------------------
  // Manual Analysis
  // -------------------------------------------------------

  const analyzeFailure = async () => {
    if (!log.trim()) {
      setError(
        "Please paste a deployment log first."
      );

      return;
    }

    setLoading(true);
    setError("");

    setResult(null);
    setGithubResults([]);

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

      await loadHistory();

    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the analyzer backend. Make sure FastAPI is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // -------------------------------------------------------
  // View Historical Analysis
  // -------------------------------------------------------

  const viewAnalysis = (analysis) => {
    setLog(
      analysis.log || ""
    );

    setGithubResults([]);

    setResult({
      ...analysis,
      matched_patterns: [],
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // -------------------------------------------------------
  // Select Failed GitHub Job
  // -------------------------------------------------------

  const selectGithubJob = (job) => {
    setResult(job);

    setLog(
      job.log || ""
    );
  };


  // -------------------------------------------------------
  // Clear
  // -------------------------------------------------------

  const clearAnalyzer = () => {
    setLog("");
    setResult(null);
    setGithubResults([]);
    setError("");
  };


  return (
    <div className="min-vh-100 bg-light">

      {/* NAVBAR */}

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

        {/* HEADER */}

        <div className="mb-4">

          <h1 className="display-6 fw-bold mb-2">
            Analyze deployment failures
          </h1>

          <p className="text-secondary mb-0">
            Analyze CI/CD failures from pasted logs or
            directly from GitHub Actions.
          </p>

        </div>


        {/* ANALYZER */}

        <div className="row g-4">

          {/* LOG */}

          <div className="col-lg-7">

            <div className="card border-0 shadow-sm">

              <div className="card-header bg-white py-3">

                <div className="d-flex justify-content-between align-items-center">

                  <h5 className="mb-0">
                    <i className="bi bi-file-earmark-code me-2"></i>

                    Pipeline Log
                  </h5>

                  <span className="badge text-bg-light border">
                    Raw log
                  </span>

                </div>

              </div>


              <div className="card-body">

                <textarea
                  className="form-control log-input"
                  value={log}
                  onChange={(e) =>
                    setLog(e.target.value)
                  }
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

                  <div className="alert alert-danger mt-3 mb-0">

                    <i className="bi bi-exclamation-triangle-fill me-2"></i>

                    {error}

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* RESULT */}

          <div className="col-lg-5">

            {!result && (

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center empty-result">

                  <div className="empty-icon mb-3">
                    <i className="bi bi-activity"></i>
                  </div>

                  <h5>
                    No analysis yet
                  </h5>

                  <p className="text-secondary small mb-0">
                    Paste a failed deployment log or analyze
                    a failed GitHub Actions workflow.
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

                  {/* FAILED JOB SELECTOR */}

                  {githubResults.length > 1 && (

                    <div className="mb-4">

                      <small className="text-uppercase text-secondary fw-semibold">
                        Failed Jobs
                      </small>

                      <div className="d-flex flex-wrap gap-2 mt-2">

                        {githubResults.map((job) => (

                          <button
                            key={job.job_id}
                            className={
                              result?.job_id === job.job_id
                                ? "btn btn-sm btn-dark"
                                : "btn btn-sm btn-outline-dark"
                            }
                            onClick={() =>
                              selectGithubJob(job)
                            }
                          >

                            <i className="bi bi-x-circle me-1"></i>

                            {job.job_name}

                          </button>

                        ))}

                      </div>

                    </div>

                  )}


                  {/* GITHUB METADATA */}

                  {result?.source === "github" && (

                    <div className="alert alert-light border mb-4">

                      <div className="d-flex">

                        <i className="bi bi-github fs-4 me-3 mt-1"></i>

                        <div className="flex-grow-1">

                          <strong>
                            GitHub Actions
                          </strong>

                          <div className="small text-secondary mt-1">
                            {result.repository}
                          </div>

                          <div className="small mt-2">

                            <strong>
                              Workflow:
                            </strong>{" "}

                            {result.workflow_name}

                          </div>

                          <div className="small mt-1">

                            <strong>
                              Job:
                            </strong>{" "}

                            {result.job_name}

                          </div>

                          <div className="small mt-1">

                            <strong>
                              Branch:
                            </strong>{" "}

                            {result.branch}

                          </div>

                          <div className="small mt-1">

                            <strong>
                              Commit:
                            </strong>{" "}

                            <code>
                              {result.commit_sha?.substring(
                                0,
                                7
                              )}
                            </code>

                          </div>

                          <div className="small mt-1">

                            <strong>
                              Run:
                            </strong>{" "}

                            #{result.run_id}

                          </div>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* CATEGORY */}

                  <div className="mb-4">

                    <small className="text-uppercase text-secondary fw-semibold">
                      Failure Category
                    </small>

                    <div className="mt-2">

                      <span
                        className={`badge ${getCategoryClass(
                          result.category
                        )} category-badge`}
                      >

                        {result.category}

                      </span>

                    </div>

                  </div>


                  {/* CONFIDENCE */}

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


                  {/* CAUSE */}

                  <div className="analysis-section">

                    <h6>
                      <i className="bi bi-exclamation-circle me-2"></i>

                      Likely Cause
                    </h6>

                    <p className="mb-0 text-secondary">
                      {result.cause}
                    </p>

                  </div>


                  {/* FIX */}

                  <div className="analysis-section">

                    <h6>
                      <i className="bi bi-tools me-2"></i>

                      Suggested Fix
                    </h6>

                    <p className="mb-0 text-secondary">
                      {result.fix}
                    </p>

                  </div>


                  {/* EVIDENCE */}

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


        {/* ==================================================
            GITHUB ACTIONS
        ================================================== */}

        <div className="card border-0 shadow-sm mt-4">

          <div className="card-header bg-white py-3">

            <div className="d-flex justify-content-between align-items-center">

              <h5 className="mb-0">

                <i className="bi bi-github me-2"></i>

                GitHub Actions

              </h5>


              <button
                className="btn btn-sm btn-outline-dark"
                onClick={loadGithubRuns}
                disabled={githubLoading}
              >

                <i className="bi bi-arrow-clockwise me-1"></i>

                Refresh

              </button>

            </div>

          </div>


          <div className="card-body p-0">

            {githubLoading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border"
                  role="status"
                />

                <p className="text-secondary mt-2 mb-0">
                  Loading workflow runs...
                </p>

              </div>

            ) : githubRuns.length === 0 ? (

              <div className="text-center py-5 text-secondary">

                <i className="bi bi-github fs-2 d-block mb-2"></i>

                No workflow runs found.

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                  <thead className="table-light">

                    <tr>

                      <th className="ps-4">
                        Workflow
                      </th>

                      <th>
                        Branch
                      </th>

                      <th>
                        Commit
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Result
                      </th>

                      <th>
                        Date
                      </th>

                      <th className="text-end pe-4">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {githubRuns.map((run) => (

                      <tr
                        key={run.id}
                        className={
                          run.conclusion === "failure"
                            ? "failed-run"
                            : ""
                        }
                      >

                        <td className="ps-4">

                          <a
                            href={run.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-decoration-none fw-semibold text-dark"
                          >

                            <i className="bi bi-github me-2"></i>

                            {run.name}

                          </a>

                        </td>


                        <td>

                          <span className="badge text-bg-light border">

                            <i className="bi bi-git me-1"></i>

                            {run.branch}

                          </span>

                        </td>


                        <td>

                          <code>
                            {run.commit}
                          </code>

                        </td>


                        <td>

                          {run.status === "completed" ? (

                            <span className="badge text-bg-secondary">
                              Completed
                            </span>

                          ) : (

                            <span className="badge text-bg-primary">
                              {run.status}
                            </span>

                          )}

                        </td>


                        <td>

                          {run.conclusion === "success" && (

                            <span className="badge text-bg-success">

                              <i className="bi bi-check-circle me-1"></i>

                              Success

                            </span>

                          )}


                          {run.conclusion === "failure" && (

                            <span className="badge text-bg-danger">

                              <i className="bi bi-x-circle me-1"></i>

                              Failed

                            </span>

                          )}


                          {!run.conclusion && (

                            <span className="badge text-bg-primary">
                              Running
                            </span>

                          )}


                          {run.conclusion &&
                            ![
                              "success",
                              "failure",
                            ].includes(
                              run.conclusion
                            ) && (

                              <span className="badge text-bg-warning">

                                {run.conclusion}

                              </span>

                            )}

                        </td>


                        <td className="text-secondary">

                          {formatDate(
                            run.created_at
                          )}

                        </td>


                        <td className="text-end pe-4">

                          {run.conclusion === "failure" ? (

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                analyzeGithubRun(run)
                              }
                              disabled={
                                analyzingRun === run.id
                              }
                            >

                              {analyzingRun === run.id ? (

                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>

                                  Analyzing
                                </>

                              ) : (

                                <>
                                  <i className="bi bi-search me-1"></i>

                                  Analyze
                                </>

                              )}

                            </button>

                          ) : (

                            <span className="text-secondary">
                              —
                            </span>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            RECENT FAILURES
        ================================================== */}

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
                        Source
                      </th>

                      <th>
                        Repository
                      </th>

                      <th>
                        Job
                      </th>

                      <th>
                        Branch
                      </th>

                      <th>
                        Commit
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Confidence
                      </th>

                      <th>
                        Time
                      </th>

                      <th className="text-end pe-4">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {history.map((analysis) => (

                      <tr key={analysis.id}>

                        <td className="ps-4">

                          {analysis.source === "github" ? (

                            <span className="badge text-bg-dark">

                              <i className="bi bi-github me-1"></i>

                              GitHub

                            </span>

                          ) : (

                            <span className="badge text-bg-secondary">

                              <i className="bi bi-pencil me-1"></i>

                              Manual

                            </span>

                          )}

                        </td>


                        <td>

                          {analysis.repository ? (

                            <span className="fw-semibold">
                              {analysis.repository}
                            </span>

                          ) : (
                            "—"
                          )}

                        </td>


                        <td>

                          {analysis.job_name ||
                            "Manual Analysis"}

                        </td>


                        <td>

                          {analysis.branch ? (

                            <span className="badge text-bg-light border">

                              <i className="bi bi-git me-1"></i>

                              {analysis.branch}

                            </span>

                          ) : (
                            "—"
                          )}

                        </td>


                        <td>

                          {analysis.commit_sha ? (

                            <code>
                              {analysis.commit_sha.substring(
                                0,
                                7
                              )}
                            </code>

                          ) : (
                            "—"
                          )}

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

                          <strong>
                            {analysis.confidence}%
                          </strong>

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