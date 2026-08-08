import { useState } from "react";
import "./App.css";


function App() {

  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            log: log
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to analyze the log.");
      }


      const data = await response.json();

      setResult(data);

    } catch (err) {

      setError(
        "Could not connect to the analyzer backend."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="container">

      <h1>Deployment Failure Analyzer</h1>

      <p className="subtitle">
        Paste a failed CI/CD deployment log to identify
        the likely root cause.
      </p>


      <textarea
        value={log}
        onChange={(e) => setLog(e.target.value)}
        placeholder="Paste deployment log here..."
      />


      <button
        onClick={analyzeFailure}
        disabled={loading}
      >

        {loading ? "Analyzing..." : "Analyze Failure"}

      </button>


      {error && (
        <div className="error">
          {error}
        </div>
      )}


      {result && (

        <div className="result">

          <h2>Analysis Result</h2>


          <div className="field">

            <span>Category</span>

            <strong>
              {result.category}
            </strong>

          </div>


          <div className="field">

            <span>Confidence</span>

            <strong>
              {result.confidence}%
            </strong>

          </div>


          <div className="section">

            <h3>Likely Cause</h3>

            <p>
              {result.cause}
            </p>

          </div>


          <div className="section">

            <h3>Suggested Fix</h3>

            <p>
              {result.fix}
            </p>

          </div>


          {result.matched_patterns?.length > 0 && (

            <div className="section">

              <h3>Evidence</h3>

              <ul>

                {result.matched_patterns.map(
                  (pattern, index) => (

                    <li key={index}>
                      <strong>{pattern.description}</strong>
                      {" - "}
                      {pattern.matched_text}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

        </div>

      )}

    </div>
  );
}


export default App;