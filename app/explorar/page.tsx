"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/current-user-context";
import {
  addMovie,
  addToWatchlist,
  listMovies,
  listSessions,
  listWatchlist,
  removeFromWatchlist,
} from "@/lib/queries";
import { Movie, Session, USERS, WatchlistItem } from "@/lib/types";
import MoviePoster from "@/components/MoviePoster";
import { searchTmdbMovies, tmdbEnabled, TmdbResult } from "@/lib/tmdb";
import { Plus, Bookmark, BookmarkCheck, Shuffle, Sparkles, Search } from "lucide-react";

export default function ExplorarPage() {
  const { userId } = useCurrentUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [drawn, setDrawn] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [m, w, s] = await Promise.all([
      listMovies(),
      listWatchlist(),
      listSessions(),
    ]);
    setMovies(m);
    setWatchlist(w);
    setSessions(s);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  if (!userId) return null;

  const watchedIds = new Set(sessions.map((s) => s.movie_id));

  const watchlistByMovie = groupWatchlistByMovie(watchlist);

  const matches = movies.filter((m) => {
    const users = watchlistByMovie.get(m.id);
    return users && users.size === 2 && !watchedIds.has(m.id);
  });

  function isWanted(movieId: string, uid = userId!) {
    return watchlistByMovie.get(movieId)?.has(uid) ?? false;
  }

  async function toggleWant(movieId: string) {
    if (isWanted(movieId)) {
      await removeFromWatchlist(movieId, userId!);
    } else {
      await addToWatchlist(movieId, userId!);
    }
    refresh();
  }

  function sortear() {
    const pool = matches.length
      ? matches
      : movies.filter((m) => !watchedIds.has(m.id));
    if (pool.length === 0) {
      setDrawn(null);
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDrawn(pick);
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="font-[var(--font-display)] italic text-3xl mb-1">Explorar</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Busque, adicione e combinem o próximo filme.
      </p>

      {matches.length > 0 && (
        <section className="mb-6">
          <p className="text-sm font-semibold flex items-center gap-1.5 mb-3">
            <Sparkles size={14} color="var(--gold)" /> Combinação encontrada
          </p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
            {matches.map((m) => (
              <div key={m.id} className="shrink-0 w-32 rounded-2xl overflow-hidden" style={{ border: `1px solid var(--gold)` }}>
                <div className="w-32 h-44">
                  <MoviePoster title={m.title} posterUrl={m.poster_url} className="w-full h-full" />
                </div>
                <div className="px-2 py-2">
                  <p className="text-xs font-medium truncate">{m.title}</p>
                  <p className="text-[10px] text-[var(--muted)]">Os dois querem assistir</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={sortear}
        className="w-full rounded-2xl px-5 py-4 mb-6 flex items-center justify-center gap-2 font-semibold"
        style={{ background: "var(--surface-2)", border: "1px solid var(--violet-dim)" }}
      >
        <Shuffle size={16} color="var(--violet)" /> Escolher por nós
      </button>

      {drawn && (
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="flex gap-4 p-4">
            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0">
              <MoviePoster title={drawn.title} posterUrl={drawn.poster_url} className="w-full h-full" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--muted)]">Hoje vocês vão assistir...</p>
              <p className="font-[var(--font-display)] italic text-xl mt-1">{drawn.title}</p>
              {drawn.genres?.length > 0 && (
                <p className="text-xs text-[var(--muted)] mt-1">{drawn.genres.join(" • ")}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={sortear}
                  className="text-xs rounded-full px-3 py-1.5"
                  style={{ background: "var(--surface-2)" }}
                >
                  Sortear de novo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">Todos os filmes</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs rounded-full px-3 py-1.5 flex items-center gap-1 font-semibold"
          style={{ background: "var(--violet)", color: "#0a0a0d" }}
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>

      {showForm && (
        <AddMovieForm
          userId={userId}
          existingMovies={movies}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Nenhum filme ainda. Adicione o primeiro acima.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {movies.map((m) => (
            <div key={m.id} className="relative">
              <div className="w-full h-40 rounded-xl overflow-hidden">
                <MoviePoster title={m.title} posterUrl={m.poster_url} className="w-full h-full" />
              </div>
              <p className="text-xs font-medium mt-1.5 truncate">{m.title}</p>
              <button
                onClick={() => toggleWant(m.id)}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(10,10,13,0.75)" }}
                aria-label="Quero assistir"
              >
                {isWanted(m.id) ? (
                  <BookmarkCheck size={14} color="var(--violet)" />
                ) : (
                  <Bookmark size={14} color="white" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function groupWatchlistByMovie(watchlist: WatchlistItem[]) {
  const map = new Map<string, Set<string>>();
  for (const w of watchlist) {
    if (!map.has(w.movie_id)) map.set(w.movie_id, new Set());
    map.get(w.movie_id)!.add(w.user_id);
  }
  return map;
}

function AddMovieForm({
  userId,
  existingMovies,
  onDone,
}: {
  userId: keyof typeof USERS;
  existingMovies: Movie[];
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"search" | "manual">(
    tmdbEnabled() ? "search" : "manual"
  );

  return (
    <div
      className="rounded-2xl p-4 mb-5"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {tmdbEnabled() && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("search")}
            className="text-xs rounded-full px-3 py-1.5 font-semibold"
            style={{
              background: mode === "search" ? "var(--violet)" : "var(--surface-2)",
              color: mode === "search" ? "#0a0a0d" : "var(--muted)",
            }}
          >
            Buscar filme
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="text-xs rounded-full px-3 py-1.5 font-semibold"
            style={{
              background: mode === "manual" ? "var(--violet)" : "var(--surface-2)",
              color: mode === "manual" ? "#0a0a0d" : "var(--muted)",
            }}
          >
            Adicionar manualmente
          </button>
        </div>
      )}

      {mode === "search" ? (
        <TmdbSearchForm userId={userId} existingMovies={existingMovies} onDone={onDone} />
      ) : (
        <ManualMovieForm userId={userId} onDone={onDone} />
      )}
    </div>
  );
}

function TmdbSearchForm({
  userId,
  existingMovies,
  onDone,
}: {
  userId: keyof typeof USERS;
  existingMovies: Movie[];
  onDone: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError("");
    const timeout = setTimeout(() => {
      searchTmdbMovies(query)
        .then(setResults)
        .catch(() => setError("Não consegui buscar agora. Tenta de novo?"))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  async function pick(result: TmdbResult) {
    const already = existingMovies.find((m) => m.tmdb_id === result.tmdb_id);
    if (already) {
      onDone();
      return;
    }
    setSavingId(result.tmdb_id);
    try {
      await addMovie(
        {
          tmdb_id: result.tmdb_id,
          title: result.title,
          release_year: result.release_year,
          poster_url: result.poster_url,
          backdrop_url: result.backdrop_url,
          overview: result.overview,
          genres: result.genres,
        },
        userId
      );
      onDone();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div className="relative mb-3">
        <Search
          size={15}
          color="var(--muted)"
          className="absolute left-0 top-1/2 -translate-y-1/2"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full bg-transparent border-b border-[var(--line)] pb-2 pl-6 text-sm outline-none"
          autoFocus
        />
      </div>

      {error && <p className="text-xs text-[var(--rose)] mb-2">{error}</p>}
      {searching && <p className="text-xs text-[var(--muted)]">Buscando...</p>}

      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
        {results.map((r) => {
          const already = existingMovies.some((m) => m.tmdb_id === r.tmdb_id);
          return (
            <button
              key={r.tmdb_id}
              type="button"
              onClick={() => pick(r)}
              disabled={savingId === r.tmdb_id}
              className="flex items-center gap-3 text-left rounded-xl px-2 py-2"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="w-9 h-13 rounded overflow-hidden shrink-0" style={{ height: 52 }}>
                <MoviePoster title={r.title} posterUrl={r.poster_url} className="w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{r.title}</p>
                <p className="text-[10px] text-[var(--muted)]">
                  {r.release_year || "sem data"} {already ? "· já está na coleção" : ""}
                </p>
              </div>
              {savingId === r.tmdb_id && (
                <span className="text-[10px] text-[var(--muted)]">salvando...</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ManualMovieForm({
  userId,
  onDone,
}: {
  userId: keyof typeof USERS;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [genres, setGenres] = useState("");
  const [poster, setPoster] = useState("");
  const [runtime, setRuntime] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addMovie(
        {
          title: title.trim(),
          release_year: year ? Number(year) : null,
          genres: genres
            ? genres.split(",").map((g) => g.trim()).filter(Boolean)
            : [],
          poster_url: poster.trim() || null,
          runtime_minutes: runtime ? Number(runtime) : null,
        },
        userId
      );
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título do filme"
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Ano"
          inputMode="numeric"
          className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
        />
        <input
          value={runtime}
          onChange={(e) => setRuntime(e.target.value)}
          placeholder="Duração (min)"
          inputMode="numeric"
          className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
        />
      </div>
      <input
        value={genres}
        onChange={(e) => setGenres(e.target.value)}
        placeholder="Gêneros (separados por vírgula)"
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
      />
      <input
        value={poster}
        onChange={(e) => setPoster(e.target.value)}
        placeholder="Link do pôster (opcional)"
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full py-2.5 text-sm font-semibold mt-1"
        style={{ background: "var(--violet)", color: "#0a0a0d" }}
      >
        {saving ? "Salvando..." : "Salvar filme"}
      </button>
    </form>
  );
}
