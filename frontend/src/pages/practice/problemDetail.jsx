// src/pages/practice/ProblemDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// Ace editor & modes (ESM imports for Vite)
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-tomorrow_night";

/**
 * ProblemDetail.jsx
 *
 * - Fetches a problem object from /api/problem/:id
 * - Opens a websocket to ws://localhost:8080 for running/submitting jobs
 * - Editor persists to localStorage by problem id + language
 * - Run -> sends first 3 testcases
 * - Submit -> sends all testcases
 * - Submit result UI shows only one failing testcase (if any), number passed, and overall verdict
 *
 * Editor:
 * - If react-ace is installed, it will be used with syntax highlighting.
 * - Otherwise, the component will fall back to a simple textarea.
 *
 * Notes:
 * - Adjust fetch URL prefixes if your API uses /v1/... (e.g. /v1/problem/:id)
 * - Ensure websocket server is running on ws://localhost:8080
 */

// Using ESM imports above; AceEditor will be available if dependencies are installed

const LANG_OPTIONS = [
  { value: "C++", label: "C++" },
  { value: "Python", label: "Python" },
  { value: "Javascript", label: "JavaScript" },
  { value: "Java", label: "Java" },
];

// Language-specific boilerplate templates
const BOILERPLATES = {
  "C++": `// write your code here
#include <bits/stdc++.h>
using namespace std;

int main() {
    // your logic
    return 0;
}`,
  Python: `# write your code here
def solve():
    pass

if __name__ == "__main__":
    solve()`,
  Javascript: `// write your code here
function main() {
  // your logic
}

main();`,
  Java: `// write your code here
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // your logic
    }
}`,
};

function generateJobId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Problem state
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState(null);

  // Editor & language
  const [language, setLanguage] = useState("C++");
  const [editorCode, setEditorCode] = useState("");

  // WebSocket & worker states
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Last job info and response
  const [lastJobId, setLastJobId] = useState(null);
  const [lastResult, setLastResult] = useState(null); // raw message returned by worker
  const [workerError, setWorkerError] = useState(null);

  // Track whether last job was a submit (affects UI)
  const [lastJobWasSubmit, setLastJobWasSubmit] = useState(false);

  // localStorage key helper
  const storageKey = (pid, lang) => `code_${pid}_${lang}`;

  // Fetch problem on mount
  useEffect(() => {
    if (!id) {
      setProblemError("Invalid problem id");
      setLoadingProblem(false);
      return;
    }

    let cancelled = false;
    setLoadingProblem(true);

    (async () => {
      try {
    const token = localStorage.getItem("token");
    const res = await fetch(`https://api.elitecode-ai.club/v1/problem/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || `Server returned ${res.status}`);
        }

        const data = await res.json();
        // controller might return an array (per your sample). Normalize to single object.
        const normalized = Array.isArray(data) ? data[0] : data;
        if (!cancelled) {
          setProblem(normalized);
          // load saved code if present, else use boilerplate
          const saved = localStorage.getItem(storageKey(id, language));
          if (saved && saved.trim().length > 0) {
            setEditorCode(saved);
          } else {
            setEditorCode(BOILERPLATES[language] || "");
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load problem:", err);
          setProblemError(err.message || "Failed to fetch problem");
        }
      } finally {
        if (!cancelled) setLoadingProblem(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load saved code when language changes (don't clobber unsaved edits)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(id, language));
    if (saved && saved.trim().length > 0) {
      setEditorCode(saved);
    } else {
      setEditorCode(BOILERPLATES[language] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Save editor to localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!id) return;
      localStorage.setItem(storageKey(id, language), editorCode);
    }, 600);
    return () => clearTimeout(t);
  }, [editorCode, id, language]);

  // Open websocket on mount, close on unmount
  useEffect(() => {
    const WS_URL = "ws://api.elitecode-ai.club";
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        console.log("Worker response:", msg);
        setLastResult(msg);
        setWorkerError(null);
        setRunLoading(false);
        setSubmitLoading(false);
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setWorkerError("WebSocket error");
      setConnected(false);
      setRunLoading(false);
      setSubmitLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    return () => {
      try {
        ws.close();
      } catch (e) {}
      wsRef.current = null;
    };
  }, []);

  // helper: pick first N testcases for run
  const pickFirstNTestcases = (all, n = 3) => {
    if (!Array.isArray(all)) return [];
    return all.slice(0, n).map((tc) => ({
      input: tc.input,
      expected: tc.expected,
    }));
  };

  // send job to worker through websocket
  const sendJob = ({ isSubmit = false }) => {
    setWorkerError(null);
    setLastResult(null);

    if (!problem) {
      alert("Problem not loaded");
      return;
    }

    if (!editorCode || editorCode.trim().length === 0) {
      alert("Please write code before running/submitting");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket not connected. Start ws server at ws://api.elitecode-ai.club");
      return;
    }

    const job_id = generateJobId();
    setLastJobId(job_id);
    setLastJobWasSubmit(isSubmit);

    const testCase = isSubmit ? (problem.testCase || []) : pickFirstNTestcases(problem.testCase || [], 3);

    const job = {
      job_id,
      editorCode,
      selectedLanguage: language,
      testCase,
      timeout: 2000,
    };

    try {
      wsRef.current.send(JSON.stringify(job));
      if (isSubmit) {
        setSubmitLoading(true);
      } else {
        setRunLoading(true);
      }
    } catch (err) {
      console.error("Failed to send job:", err);
      setWorkerError("Failed to send job to worker");
    }
  };

  // Render helpers
  const renderDifficulty = (d) => {
    if (!d) return null;
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    const low = String(d).toLowerCase();
    if (low.includes("easy")) return <span className={`${base} text-green-300 bg-green-900/5`}>Easy</span>;
    if (low.includes("hard")) return <span className={`${base} text-red-300 bg-red-900/5`}>Hard</span>;
    return <span className={`${base} text-amber-300 bg-amber-900/5`}>Medium</span>;
  };

  // UI: render submit/run result per your requested compact format
  const renderResultPanel = () => {
    if (!lastResult) {
      return <div className="text-sm text-gray-400">Run / Submit results will appear here.</div>;
    }

    // handle compilation / runtime errors first
    if (lastResult.compilationError) {
      return (
        <div>
          <div className="text-red-300 font-semibold">Compilation failed</div>
          <pre className="whitespace-pre-wrap bg-black/30 p-2 mt-2 rounded text-xs text-red-200">{lastResult.stderr || lastResult.error}</pre>
          <div className="mt-2 text-sm">Verdict: <span className="text-red-300">Compilation Error</span></div>
        </div>
      );
    }

    if (lastResult.runtimeError) {
      return (
        <div>
          <div className="text-yellow-300 font-semibold">Runtime error</div>
          <pre className="whitespace-pre-wrap bg-black/30 p-2 mt-2 rounded text-xs text-yellow-200">{lastResult.stderr || lastResult.error}</pre>
          <div className="mt-2 text-sm">Verdict: <span className="text-yellow-300">Runtime Error</span></div>
        </div>
      );
    }

    // If we have results array (per-test details)
    if (Array.isArray(lastResult.results) && lastResult.results.length > 0) {
      const allResults = lastResult.results;
      const totalCount = allResults.length;
      const passedCount = allResults.reduce((acc, r) => acc + (r.passed ? 1 : 0), 0);
      const allPassed = typeof lastResult.allPassed === "boolean" ? lastResult.allPassed : passedCount === totalCount;

      // decide if this was a "submit" job
      const isSubmitJob = lastJobWasSubmit || (problem?.testCase && allResults.length >= (problem.testCase.length || 0));

      // Summary header
      return (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-400">Submission Summary</div>
              <div className="text-lg font-semibold mt-1">
                {allPassed ? (
                  <span className="text-green-300">Accepted</span>
                ) : (
                  <span className="text-yellow-300">Wrong Answer</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">Passed: {passedCount} / {totalCount}</div>
            </div>

            <div className="text-sm text-gray-400">
              <div>Job id</div>
              <div className="text-gray-200 mt-1">{lastJobId ?? "—"}</div>
            </div>
          </div>

          {/* If not all passed and this was a submit, show first failing testcase */}
          {!allPassed && isSubmitJob && (() => {
            const failing = allResults.find((r) => !r.passed) || allResults[0];
            return (
              <div className="bg-[#0b0b0c] border border-gray-800 rounded p-3">
                <div className="text-sm font-medium text-gray-200 mb-2">First failing testcase</div>

                <div className="text-xs text-gray-400 mb-1">Input</div>
                <div className="bg-[#070708] p-2 rounded text-sm text-gray-200">
                  {Array.isArray(failing.input) ? failing.input.join("\n") : String(failing.input)}
                </div>

                <div className="text-xs text-gray-400 mt-2 mb-1">Expected</div>
                <div className="bg-[#070708] p-2 rounded text-sm text-gray-200">{String(failing.expected)}</div>

                <div className="text-xs text-gray-400 mt-2 mb-1">Your Output</div>
                <div className="bg-[#070708] p-2 rounded text-sm text-gray-200">{String(failing.actual ?? failing.output ?? failing.result ?? "")}</div>

                {failing.stderr && (
                  <div className="text-xs text-red-300 mt-2">
                    <div className="font-medium">Error output</div>
                    <pre className="whitespace-pre-wrap text-xs mt-1 bg-black/30 p-2 rounded text-red-200">{failing.stderr}</pre>
                  </div>
                )}
              </div>
            );
          })()}

          {/* If it was a run (not submit), show compact per-case results */}
          {!isSubmitJob && (
            <div className="mt-3">
              <div className="text-sm text-gray-400 mb-2">Run results</div>
              <div className="space-y-2">
                {allResults.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0b0b0c] border border-gray-800 rounded p-2">
                    <div className="text-sm">
                      <div className="text-xs text-gray-400">Case {r.testCaseId ?? idx}</div>
                      <div className="text-sm text-gray-200 mt-1">Output: {String(r.actual ?? r.output ?? "")}</div>
                    </div>
                    <div>
                      {r.passed ? (
                        <div className="text-xs text-green-300 bg-green-900/5 px-2 py-1 rounded">Passed</div>
                      ) : (
                        <div className="text-xs text-red-300 bg-red-900/5 px-2 py-1 rounded">Failed</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allPassed && <div className="mt-3 text-sm text-green-300">All testcases passed. Well done!</div>}
        </div>
      );
    }

    // If result doesn't match expected shape, show raw data
    return (
      <div>
        <div className="text-sm text-gray-400">Worker response</div>
        <pre className="whitespace-pre-wrap bg-black/20 p-2 mt-2 rounded text-xs text-gray-200">{JSON.stringify(lastResult, null, 2)}</pre>
      </div>
    );
  };

  // Loading / error early returns
  if (loadingProblem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>Loading problem...</div>
      </div>
    );
  }

  if (problemError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <div className="text-red-400 mb-4">{problemError}</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-800">Go back</button>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div>No problem found.</div>
      </div>
    );
  }

  // pick first 3 sample testcases for display
  const sampleTests = pickFirstNTestcases(problem.testCase || [], 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#0b0b0b] text-white py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Problem details */}
        <div className="bg-[#0b0b0c] border border-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">{problem.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                {renderDifficulty(problem.difficulty)}
                {Array.isArray(problem.tags) && problem.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {problem.tags.map((t) => (
                      <span key={t} className="text-xs bg-[#0f0f0f] px-2 py-1 rounded text-gray-300 border border-gray-800">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-400">#{String(problem._id).slice(0, 8)}</div>
          </div>

          <hr className="border-gray-800 my-4" />

          <div className="prose prose-invert max-w-none text-sm text-gray-200 whitespace-pre-wrap">
            {problem.description || "No description provided."}
          </div>

          {problem.constraints && (
            <div className="mt-6">
              <div className="text-sm text-gray-400 mb-2">Constraints</div>
              <div className="text-sm text-gray-300 bg-[#070708] p-3 rounded border border-gray-800">
                {problem.constraints}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Sample testcases</div>
              <div className="text-xs text-gray-500">{(problem.testCase || []).length} total</div>
            </div>

            <div className="mt-3 space-y-3">
              {sampleTests.length === 0 && <div className="text-gray-400">No sample testcases provided.</div>}

              {sampleTests.map((tc, idx) => (
                <div key={tc._id ?? idx} className="bg-[#070708] border border-gray-800 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">Case {idx + 1}</div>
                  <div className="text-sm text-gray-100 font-medium mb-1">Input</div>
                  <div className="text-sm text-gray-200 bg-[#0b0b0c] p-2 rounded">{Array.isArray(tc.input) ? tc.input.join("\n") : String(tc.input)}</div>
                  <div className="text-sm text-gray-100 mt-2 mb-1 font-medium">Expected</div>
                  <div className="text-sm text-gray-200 bg-[#0b0b0c] p-2 rounded">{tc.expected}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor and controls */}
        <div className="bg-[#0b0b0c] border border-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">Code</div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0f0f0f] border border-gray-800 text-sm rounded px-3 py-1 text-gray-200"
              >
                {LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setEditorCode(BOILERPLATES[language] || "")}
                className="px-3 py-1 rounded-full bg-[#0f0f0f] border border-gray-800 text-sm hover:bg-[#1f1f1f]"
                title="Reset to boilerplate"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">{connected ? "WS connected" : "WS disconnected"}</div>

              <button
                onClick={() => sendJob({ isSubmit: false })}
                disabled={runLoading || submitLoading}
                className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-sm disabled:opacity-60"
              >
                {runLoading ? "Running..." : "Run"}
              </button>

              <button
                onClick={() => sendJob({ isSubmit: true })}
                disabled={submitLoading || runLoading}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-sm font-medium disabled:opacity-60"
              >
                {submitLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[360px]">
            {AceEditor ? (
              <AceEditor
                mode={language === "python" ? "python" : language === "C++" ? "c_cpp" : language === "javascript" ? "javascript" : "java"}
                theme="tomorrow_night"
                name={`editor-${id}`}
                value={editorCode}
                onChange={(val) => setEditorCode(val)}
                width="100%"
                height="100%"
                setOptions={{ useWorker: false }}
                editorProps={{ $blockScrolling: true }}
              />
            ) : (
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                className="w-full h-full bg-[#070708] rounded p-3 text-sm font-mono text-gray-200 border border-gray-900 resize-none"
                placeholder="// write your solution here..."
              />
            )}
          </div>

          <div className="mt-3">
            {workerError && <div className="text-red-400 mb-2">{workerError}</div>}
            <div className="bg-[#070708] border border-gray-800 rounded p-3">
              {renderResultPanel()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}