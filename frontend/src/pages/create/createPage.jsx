/*
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// If you implemented useAuth in App.jsx as shown previously:
//import { useAuth } from "../../App";

const LANGUAGES = [
  { value: "cpp", label: "C++ 11" },
  { value: "cpp17", label: "C++ 17" },
  { value: "python", label: "Python 3" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript (Node)" },
];

export default function CreatePage({auth}) {
  const navigate = useNavigate();
  //const { auth, loading: authLoading } = useAuth(); // ensure App.jsx exported useAuth
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [constraints, setConstraints] = useState("");
  const [hint, setHint] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { code, explanation, language, timestamp }
  const [error, setError] = useState(null);


  async function handleGenerate(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic validation
    if (!problem.trim()) {
      setError("Please provide a problem description.");
      return;
    }

    // Compose the payload - backend expects { problem, constraints, hint, language }
    // We'll include title in the problem body if provided so the model sees it.
    const composedProblem = title ? `${title}\n\n${problem}` : problem;

    const payload = {
      problem: composedProblem,
      constraints: constraints || "",
      hint: hint || "",
      language,
    };

    setLoading(true);

    try {
      const res = await fetch("http://16.171.23.225:4000/v1/problem/create", {
        method: "POST",
        credentials: "include", // important so the HttpOnly JWT cookie is sent
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      console.log("res : ",res);
      const text = await res.text();
      console.log("text : ", text);
       
      // Try to parse JSON. The backend should return a JSON object with fields like:
      // { language, explanation, code, ... }
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        // If parsing fails, attempt to extract JSON-ish substring (in case OpenAI returned raw text)
        const jsonMatch = text && text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (innerErr) {
            // ignore - will fall back to raw text
            data = null;
          }
        }
      }

      if (!res.ok) {
        // If server returned non-2xx, show helpful error content if available
        const serverMessage = (data && (data.message || data.error)) || text || `Server returned ${res.status}`;
        throw new Error(serverMessage);
      }
      console.log("data : ",data);
      if (!data) {
        // If we couldn't parse JSON, use the raw text as explanation or code fallback
        setResult({
          language,
          code: text || "",
          explanation: "Response could not be parsed as JSON; raw response shown below.",
          timestamp: new Date().toISOString(),
        });
      } else {
        // Normalize fields - backend uses `code` for the generated program and `explanation`
        const code = data.code ?? data.completeCode ?? data.solution ?? data.complete_code ?? "";
        const explanation = data.explanation ?? data.explain ?? data.details ?? "";
        setResult({
          language: data.language ?? language,
          code,
          explanation,
          timestamp: data.timestamp ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Generate failed:", err);
      setError(err.message || "Failed to generate solution");
    } finally {
      setLoading(false);
    }
  }

  function copyCodeToClipboard() {
    if (!result?.code) return;
    navigator.clipboard
      .writeText(result.code)
      .then(() => {
        // small non-blocking UX feedback
        // You can replace this alert with a toast later
        alert("Code copied to clipboard");
      })
      .catch(() => {
        alert("Unable to copy");
      });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#0b0b0b] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-pink-400 mb-2">Welcome</h1>
        <h2 className="text-2xl text-gray-200 mb-6">Craft Your Own Problem</h2>
        <p className="text-gray-400 mb-8">
          A good problem description covers Problem Statement, input and output, constraints and hints.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4 text-left">
          <label className="block text-sm text-gray-300 mb-2">Select Programming Language:</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loading}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Problem Title (optional)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loading}
          />

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Enter your problem..."
            rows={6}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loading}
            required
          />

          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Providing constraints would be useful to generate optimal code..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loading}
          />

          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Providing hints would be useful to generate optimal code..."
            rows={2}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loading}
          />

          <div className="text-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-pink-500 to-violet-500 shadow-lg disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Solution"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 bg-[#0b0b0c] border border-gray-800 rounded-lg p-4 text-left">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Generated Solution ({result.language})</div>
                <div className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyCodeToClipboard}
                  className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            <pre
              className="whitespace-pre-wrap font-mono text-sm text-gray-200 bg-[#070708] rounded p-4 border border-gray-900 overflow-auto"
              style={{ maxHeight: "50vh" }}
            >
              {result.code || "// No code returned from server"}
            </pre>

            {result.explanation && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Explanation</div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{result.explanation}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
*/
// pages/CreatePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//import { useAuth } from "../App"; // expects App.jsx to export/useAuth as earlier

const LANGUAGES = [
  { value: "C++", label: "C++ 11" },
  { value: "Python", label: "Python 3" },
];

export default function CreatePage() {
  const navigate = useNavigate();
 // const { auth, loading: authLoading } = useAuth();

  // form fields
  const [language, setLanguage] = useState(LANGUAGES[0].value);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [constraints, setConstraints] = useState("");
  const [hint, setHint] = useState("");

  // generate code state
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [result, setResult] = useState(null); // { language, code, explanation, timestamp }
  const [generateError, setGenerateError] = useState(null);

  // edit mode for generated code
  const [editMode, setEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState("");

  // testcases generation state
  const [loadingTests, setLoadingTests] = useState(false);
  const [testsError, setTestsError] = useState(null);
  const [testsResult, setTestsResult] = useState(null); // { status, url, testCaseCount, message }

 


  /* ---------- generate code (calls your existing /api/generate-solution) ---------- */
  async function handleGenerateCode(e) {
    e.preventDefault();
    setGenerateError(null);
    setResult(null);
    setTestsResult(null);
    setTestsError(null);

    if (!problem.trim()) {
      setGenerateError("Please provide a problem description.");
      return;
    }

    const composedProblem = title ? `${title}\n\n${problem}` : problem;

    const payload = {
      problem: composedProblem,
      constraints: constraints || "",
      hint: hint || "",
      language,
    };

    setLoadingGenerate(true);

    try {
      const res = await fetch("http://16.171.23.225:4000/v1/problem/create", {
        method: "POST",
        credentials: "include", // important for HttpOnly JWT cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        const jsonMatch = text && text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (innerErr) {
            data = null;
          }
        }
      }

      if (!res.ok) {
        const serverMsg = (data && (data.message || data.error)) || text || `Server returned ${res.status}`;
        throw new Error(serverMsg);
      }

      if (!data) {
        // fallback if server returned raw text
        setResult({
          language,
          code: text || "",
          explanation: "Response could not be parsed as JSON; raw response shown below.",
          timestamp: new Date().toISOString(),
        });
      } else {
        const code = data.code ?? data.completeCode ?? data.solution ?? "";
        const explanation = data.explanation ?? data.explain ?? "";
        setResult({
          language: data.language ?? language,
          code,
          explanation,
          timestamp: data.timestamp ?? new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Generate code failed:", err);
      setGenerateError(err.message || "Failed to generate code.");
    } finally {
      setLoadingGenerate(false);
    }
  }

  /* ---------- auto-generate testcases (calls your /api/generate-tests controller) ---------- */
  async function handleGenerateTests() {
    setTestsError(null);
    setTestsResult(null);

    // require code from previous step
    if (!result?.code) {
      setTestsError("No generated code found. Generate code first.");
      return;
    }

    // // optional: ensure still authenticated before making request
    // if (!auth.loggedIn) {
    //   navigate("/login", { state: { from: { pathname: "/create" } } });
    //   return;
    // }

    // payload expected by your controller
    const testsPayload = {
      problem: problem || title || "Generated problem",
      constraint: constraints || "",
      code: result.code,
      recruiterQuestion: false, // toggle as needed in UI later
      mainFunction: "", // fill if you have specialized template code
      language: result.language || language,
      pythonMainFunction: "", // fill if needed
      title: title || "Generated Problem",
    };

    setLoadingTests(true);

    try {
      const res = await fetch("http://16.171.23.225:4000/v1/problem/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testsPayload),
      });

      const text = await res.text();

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        // try extract JSON inside response
        const jsonMatch = text && text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (innerErr) {
            data = null;
          }
        }
      }

      if (!res.ok) {
        const serverMsg = (data && (data.message || data.error)) || text || `Server returned ${res.status}`;
        throw new Error(serverMsg);
      }

      // normalize expected response shape from your controller:
      // res: { status, message, url, testCaseCount } OR { error/message on failure }
      const status = data?.status ?? (res.ok ? "success" : "error");
      const url = data?.url ?? data?.data?.url ?? null;
      const testCaseCount = data?.testCaseCount ?? data?.testCaseCount ?? null;
      const message = data?.message ?? data?.msg ?? "";

      setTestsResult({
        status,
        url,
        testCaseCount,
        message,
      });
    } catch (err) {
      console.error("Generate tests failed:", err);
      setTestsError(err.message || "Failed to generate test cases.");
    } finally {
      setLoadingTests(false);
    }
  }

  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => {
        // small visual feedback - replace with toast if you have one
        alert("Link copied to clipboard");
      },
      () => {
        alert("Unable to copy link");
      }
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#0b0b0b] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-pink-400 mb-2">Welcome</h1>
        <h2 className="text-2xl text-gray-200 mb-6">Craft Your Own Problem</h2>
        <p className="text-gray-400 mb-8">
          A good problem description covers Problem Statement, input and output, constraints and hints.
        </p>

        <form onSubmit={handleGenerateCode} className="space-y-4 text-left">
          <label className="block text-sm text-gray-300 mb-2">Select Programming Language:</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loadingGenerate || loadingTests}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Problem Title (optional)"
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loadingGenerate || loadingTests}
          />

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Enter your problem..."
            rows={6}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loadingGenerate || loadingTests}
            required
          />

          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Providing constraints would be useful to generate optimal code..."
            rows={3}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loadingGenerate || loadingTests}
          />

          <textarea
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Providing hints would be useful to generate optimal code..."
            rows={2}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-gray-200"
            disabled={loadingGenerate || loadingTests}
          />

          <div className="text-center mt-6 space-y-3">
            <button
              type="submit"
              disabled={loadingGenerate || loadingTests}
              className="px-8 py-3 rounded-full font-medium bg-gradient-to-r from-pink-500 to-violet-500 shadow-lg disabled:opacity-60"
            >
              {loadingGenerate ? "Generating..." : "Generate Solution"}
            </button>
          </div>
        </form>

        {/* generate-code error */}
        {generateError && (
          <div className="mt-6 bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded">
            {generateError}
          </div>
        )}

        {/* result */}
        {result && (
          <div className="mt-8 bg-[#0b0b0c] border border-gray-800 rounded-lg p-4 text-left">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Generated Solution ({result.language})</div>
                <div className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-3">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => {
                        setEditedCode(result.code || "");
                        setEditMode(true);
                      }}
                      className="text-xs px-3 py-1 rounded bg-blue-800 border border-blue-700 hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.code || "");
                        alert("Code copied to clipboard");
                      }}
                      className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700"
                    >
                      Copy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setResult({ ...result, code: editedCode });
                        setEditMode(false);
                      }}
                      className="text-xs px-3 py-1 rounded bg-green-800 border border-green-700 hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedCode("");
                      }}
                      className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setResult(null);
                    setGenerateError(null);
                    setTestsResult(null);
                    setTestsError(null);
                    setEditMode(false);
                    setEditedCode("");
                  }}
                  className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            {!editMode ? (
              <pre
                className="whitespace-pre-wrap font-mono text-sm text-gray-200 bg-[#070708] rounded p-4 border border-gray-900 overflow-auto"
                style={{ maxHeight: "50vh" }}
              >
                {result.code || "// No code returned from server"}
              </pre>
            ) : (
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full font-mono text-sm text-gray-200 bg-[#070708] rounded p-4 border border-gray-700 overflow-auto"
                style={{ maxHeight: "50vh", minHeight: "30vh" }}
                placeholder="Edit your code here..."
              />
            )}

            {result.explanation && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Explanation</div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{result.explanation}</div>
              </div>
            )}

            {/* --------- Auto-generate testcases button (shown only when code exists) --------- */}
            <div className="mt-6 text-center">
              <button
                onClick={handleGenerateTests}
                disabled={loadingTests}
                className="px-6 py-2 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg disabled:opacity-60"
              >
                {loadingTests ? "Generating testcases..." : "Auto-generate testcases"}
              </button>
            </div>

            {/* tests error */}
            {testsError && (
              <div className="mt-4 bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded">
                {testsError}
              </div>
            )}

            {/* show generated link / result */}
            {testsResult && (
              <div className="mt-4 bg-green-900/10 border border-green-800 text-green-200 px-4 py-3 rounded">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm">
                    {testsResult.status === "success" ? (
                      <div>
                        <div className="font-medium text-gray-200">Testcases generated successfully</div>
                        {testsResult.testCaseCount != null && (
                          <div className="text-xs text-gray-400">Testcases: {testsResult.testCaseCount}</div>
                        )}
                      </div>
                    ) : (
                      <div className="font-medium text-yellow-200">Result: {testsResult.message || testsResult.status}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {testsResult.url ? (
                      <>
                        <a
                          href={testsResult.url.replace(/^local:host:/, "http://")}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs underline"
                        >
                          Open Problem
                        </a>
                        <button
                          onClick={() => copyToClipboard(testsResult.url)}
                          className="text-xs px-3 py-1 rounded bg-gray-800 border border-gray-700"
                        >
                          Copy Link
                        </button>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400">No link returned by server</div>
                    )}
                  </div>
                </div>

                {testsResult.message && <div className="mt-2 text-sm text-gray-300">{testsResult.message}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
