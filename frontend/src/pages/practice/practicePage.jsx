// pages/PracticePage.jsx
// import React from "react";

// export default function PracticePage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white">
//       <h2 className="text-2xl">Hi — this is Practice page</h2>
//     </div>
//   );
// }
// pages/PracticePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";

/**
 * PracticePage - lists problems, supports search, tag filter and pagination.
 * Expects backend:
 *  - GET /api/problems?page=NUM
 *  - GET /api/problems/search?text=...&tags=tag1,tag2&page=NUM&limit=NUM
 *
 * Tailwind classes used to match dark theme of other pages.
 */

const DEFAULT_TAGS = [
  "All Topics",
  "Algorithms",
  "dp",
  "Greedy",
  "Graphs",
  "Math",
  "Data Structures",
  "String",
  "Sorting",
  "Binary Search",
  "Queue",
  "Stack",
];

function useDebounced(value, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function PracticePage() {
  const navigate = useNavigate();

  // UI state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 400);
  const [selectedTags, setSelectedTags] = useState([]); // array of tag strings
  const [sortByAcceptance, setSortByAcceptance] = useState(true);

  // remote results
  const [problems, setProblems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // whether we are in "search mode" (text or tags present)
  const inSearchMode = useMemo(
    () => (debouncedQuery && debouncedQuery.trim() !== "") || selectedTags.length > 0,
    [debouncedQuery, selectedTags]
  );

  useEffect(() => {
    // Whenever page / debouncedQuery / tags / sort change, fetch appropriate endpoint
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    (async () => {
      try {
        let url;
        if (inSearchMode) {
          const params = new URLSearchParams();
          if (debouncedQuery && debouncedQuery.trim() !== "") params.set("text", debouncedQuery.trim());
          if (selectedTags.length > 0 && !selectedTags.includes("All Topics"))
            params.set("tags", selectedTags.join(","));
          params.set("page", page);
          params.set("limit", limit);
          url = `http://localhost:4000/v1/problem/search?${params.toString()}`;
        } else {
          // fetch all problems page
          url = `http://localhost:4000/v1/problem?page=${page}`;
        }

       
        const res = await fetch(url, {
          //signal: controller.signal,
           method: "GET",
          credentials: "include", // <<< important — sends HttpOnly cookie
          headers:  { "Content-Type": "application/json" }
        });
        
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || `Server returned ${res.status}`);
        }
        const data = await res.json();

        // normalize results
        // getAllProblems returns { page, limit, total, results }
        // searchProblems returns same shape
        setProblems(data.results || data.results || []);
        
        setTotal(data.total ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch problems:", err);
          setError(err.message || "Failed to load problems");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [page, limit, debouncedQuery, selectedTags, inSearchMode]);

  function onToggleTag(tag) {
    if (tag === "All Topics") {
      setSelectedTags([]); // clear filters
      setPage(1);
      return;
    }
    setPage(1);
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      return [...prev, tag];
    });
  }

  function handleProblemClick(problem) {
    // navigate to detail page
    navigate(`/practice/${problem._id || problem.id}`, {
      state: { problem }, // optional preloaded
    });
  }

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(total / limit));
  function goto(pageNo) {
    setPage(Math.max(1, Math.min(totalPages, pageNo)));
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#070707] to-[#0b0b0b] text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Tags row */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap items-center">
            {DEFAULT_TAGS.map((t) => {
              const active =
                t === "All Topics" ? selectedTags.length === 0 : selectedTags.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => onToggleTag(t)}
                  className={`text-sm px-4 py-2 rounded-full ${
                    active
                      ? "bg-gray-800 text-white border border-gray-700 shadow"
                      : "bg-[#0f0f0f] text-gray-300 border border-transparent hover:border-gray-700"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
          <div className="flex items-center gap-3 w-full sm:w-2/3">
            <div className="flex items-center bg-[#0f0f0f] border border-gray-800 rounded-full px-3 py-2 w-full">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17.65 17.65A7.5 7.5 0 1110.5 3 7.5 7.5 0 0117.65 17.65z" /></svg>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search questions"
                className="bg-transparent flex-1 outline-none text-sm text-gray-200"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  className="text-xs text-gray-400 ml-2"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 items-center mt-2 sm:mt-0">
            <div className="text-sm text-gray-400 hidden sm:block">
              {loading ? "Loading..." : `${total} problems`}
            </div>
            <button
              onClick={() => {
                setSortByAcceptance((s) => !s);
                setPage(1);
              }}
              className="px-3 py-2 rounded-full bg-[#0f0f0f] border border-gray-800 text-sm"
              title="Toggle sort"
            >
              {sortByAcceptance ? "Sort: Acceptance" : "Sort: Newest"}
            </button>
          </div>
        </div>

        {/* Problems list */}
        <div className="space-y-3">
          {loading && (
            <div className="py-12 text-center text-gray-400">Loading problems...</div>
          )}

          {!loading && error && (
            <div className="py-6 text-center text-red-400 bg-red-900/5 border border-red-800 rounded">
              {error}
            </div>
          )}

          {!loading && problems.length === 0 && !error && (
            <div className="py-12 text-center text-gray-400">No problems found.</div>
          )}

          {!loading &&
            problems.map((p) => (
              <div
                key={p._id || p.id}
                onClick={() => handleProblemClick(p)}
                className="cursor-pointer group bg-[#0b0b0c] border border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-[#0f0f10] flex items-center justify-center text-gray-400 font-medium">
                    {/* index or icon could go here */}
                    #
                  </div>

                  <div>
                    <div className="font-medium text-gray-200">{p.title}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1">{p.description || ""}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    p.difficulty === "Easy" ? "text-green-300 bg-green-900/5" : p.difficulty === "Hard" ? "text-red-300 bg-red-900/5" : "text-amber-300 bg-amber-900/5"
                  }`}>
                    {p.difficulty || "Med."}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">Page {page} of {totalPages}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goto(1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-800 text-xs disabled:opacity-50"
            >
              ⏮
            </button>
            <button
              onClick={() => goto(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-800 text-xs disabled:opacity-50"
            >
              ◀
            </button>
            <div className="px-3 py-1 text-sm bg-[#0b0b0c] border border-gray-800 rounded text-gray-200">{page}</div>
            <button
              onClick={() => goto(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-800 text-xs disabled:opacity-50"
            >
              ▶
            </button>
            <button
              onClick={() => goto(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-[#0f0f0f] border border-gray-800 text-xs disabled:opacity-50"
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

