import { useState, type FormEvent } from "react";
import { fetchUserData, type UserData } from "./index";

const PER_PAGE = 12;
const MAX_RESULTS = 1000;

function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex h-11 w-20 items-center rounded-full p-1 border transition-all duration-300 cursor-pointer shadow-lg outline-none ${isDark
          ? "border-slate-800 bg-[#0f172a] shadow-indigo-950/40 hover:border-slate-700"
          : "border-slate-300 bg-slate-200/90 shadow-slate-300/50 hover:border-slate-400"
        }`}
    >
      {/* Sun Icon (Light Mode indicator) */}
      <span
        className={`flex h-9 w-9 items-center justify-center z-10 transition-all duration-300 ${!isDark ? "opacity-100 scale-105" : "opacity-35 hover:opacity-70"
          }`}
      >
        <svg
          className="h-5 w-5 text-amber-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
        </svg>
      </span>

      {/* Moon Icon (Dark Mode indicator) */}
      <span
        className={`flex h-9 w-9 items-center justify-center z-10 transition-all duration-300 ${isDark ? "opacity-100 scale-105" : "opacity-35 hover:opacity-70"
          }`}
      >
        <svg
          className="h-5 w-5 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Sliding Circular Thumb matching the screenshot */}
      <span
        className={`absolute top-1 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 ease-in-out shadow-md ${isDark
            ? "translate-x-9 border border-slate-700/80 bg-slate-800/90 shadow-slate-950/70"
            : "translate-x-0 border border-slate-200 bg-white shadow-slate-400/30"
          }`}
      >
        {isDark ? (
          <svg
            className="h-4.5 w-4.5 text-indigo-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg
            className="h-4.5 w-4.5 text-amber-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="6.34" y1="17.66" x2="4.93" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="17.66" y2="6.34" />
          </svg>
        )}
      </span>
    </button>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");

  const isDark = theme === "dark";

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const totalPages = Math.ceil(
    Math.min(total, MAX_RESULTS) / PER_PAGE
  );

  async function loadUsers(username: string, page: number) {
    setLoading(true);
    setError("");
    setUsers([]);
    setSearched(true);

    try {
      const result = await fetchUserData(username, page, PER_PAGE);

      setUsers(result.users);
      setTotal(result.total);
      setCurrentPage(page);
      setSearchedQuery(username);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchQuery = query.trim();

    if (!searchQuery) {
      setError("Please enter a username.");
      setUsers([]);
      setSearched(false);
      return;
    }

    await loadUsers(searchQuery, 1);
  }

  function changePage(page: number) {
    if (
      loading ||
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    void loadUsers(searchedQuery, page);
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  return (
    <main
      className={`min-h-screen px-4 py-12 transition-colors duration-300 sm:px-6 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Top bar with Dual-Icon Theme Toggle */}
        <div className="mb-8 flex justify-end">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            GitHub{" "}
            <span
              className={
                isDark
                  ? "bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
              }
            >
              User Search
            </span>
          </h1>

          <p className={`mt-4 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Discover developers and explore their profiles.
          </p>

          <form
            onSubmit={handleSubmit}
            className={`mx-auto mt-8 flex max-w-2xl gap-2 rounded-2xl border p-2 shadow-xl transition-colors ${isDark
                ? "border-slate-700 bg-slate-900 shadow-indigo-950/20"
                : "border-slate-300 bg-white shadow-slate-200/70"
              }`}
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search GitHub username..."
              autoComplete="off"
              aria-label="GitHub username"
              className={`min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none sm:px-4 sm:text-base ${isDark
                  ? "text-slate-100 placeholder:text-slate-500"
                  : "text-slate-900 placeholder:text-slate-400"
                }`}
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 sm:px-7 cursor-pointer"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </header>

        {loading && (
          <p className={`py-10 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Searching GitHub users...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className={`mx-auto max-w-2xl rounded-xl border p-4 text-center ${isDark
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-red-300 bg-red-50 text-red-700"
              }`}
          >
            {error}
          </div>
        )}

        {!loading && !error && searched && users.length === 0 && (
          <p className={`py-10 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            No users found. Try another username.
          </p>
        )}

        {!loading && users.length > 0 && (
          <>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Showing {users.length} profiles for{" "}
                <span className={`font-semibold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                  &quot;{searchedQuery}&quot;
                </span>
              </p>

              <span className={`text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {total.toLocaleString()} matching results
              </span>
            </div>

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <article
                  key={user.id}
                  className={`group rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 ${isDark
                      ? "border-slate-800 bg-slate-900/80 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-950/20 text-slate-100"
                      : "border-slate-200 bg-white shadow-md hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 text-slate-900"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={user.avatar_url}
                      alt={`${user.login}'s avatar`}
                      loading="lazy"
                      className={`h-20 w-20 rounded-full border-2 object-cover transition ${isDark
                          ? "border-slate-700 group-hover:border-indigo-400"
                          : "border-slate-200 group-hover:border-indigo-500"
                        }`}
                    />

                    <span
                      className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${isDark
                          ? "border-slate-700 bg-slate-800 text-indigo-300"
                          : "border-indigo-200 bg-indigo-50 text-indigo-700"
                        }`}
                    >
                      Repositories: {user.public_repos ?? 0}
                    </span>
                  </div>

                  <h2 className="mt-5 break-words text-xl font-bold">
                    {user.name || user.login}
                  </h2>

                  <p className={`mt-1 break-all text-sm ${isDark ? "text-indigo-400" : "text-indigo-600 font-medium"}`}>
                    @{user.login}
                  </p>

                  <p className={`mt-4 min-h-12 break-words text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {user.bio || "No bio available."}
                  </p>

                  <p className={`mt-3 flex items-start gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span aria-hidden="true">📍</span>
                    <span>
                      {user.location || "Location not provided"}
                    </span>
                  </p>

                  <div
                    className={`mt-6 flex items-center justify-between gap-3 border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-100"
                      }`}
                  >
                    <a
                      href={user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-semibold transition ${isDark
                          ? "text-indigo-400 hover:text-indigo-300"
                          : "text-indigo-600 hover:text-indigo-700"
                        }`}
                    >
                      View Github Profile
                    </a>
                  </div>
                </article>
              ))}
            </section>

            {totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-2"
              >
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => changePage(currentPage - 1)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 transition-colors ${isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
                    }`}
                >
                  Previous
                </button>

                {pageNumbers.map((page, index) => (
                  <span key={page} className="contents">
                    {index > 0 &&
                      page - pageNumbers[index - 1] > 1 && (
                        <span className={`px-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          ...
                        </span>
                      )}

                    <button
                      type="button"
                      disabled={loading}
                      aria-current={
                        currentPage === page ? "page" : undefined
                      }
                      onClick={() => changePage(page)}
                      className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 transition-colors ${currentPage === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : isDark
                            ? "border border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                        }`}
                    >
                      {page}
                    </button>
                  </span>
                ))}

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages || loading
                  }
                  onClick={() => changePage(currentPage + 1)}
                  className={`rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 transition-colors ${isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm"
                    }`}
                >
                  Next
                </button>
              </nav>
            )}

            {total >= MAX_RESULTS && (
              <p className={`mt-5 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                GitHub Search API supports up to 1,000 results per
                query. Try a more specific search to find other users.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
