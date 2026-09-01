"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/current-user-context";
import { listMovies, listSessions, listWatchlist } from "@/lib/queries";
import { Movie, Session, WatchlistItem, USERS } from "@/lib/types";
import MoviePoster from "@/components/MoviePoster";
import { sessionCoupleScore } from "@/lib/stats";
import { Popcorn, Bookmark, Star, Users } from "lucide-react";

export default function HomePage() {
  const { userId } = useCurrentUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listMovies(), listWatchlist(), listSessions()])
      .then(([m, w, s]) => {
        setMovies(m);
        setWatchlist(w);
        setSessions(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!userId) return null;
  const you = USERS[userId];

  const matchMovieIds = new Set(
    Object.keys(
      watchlist.reduce<Record<string, Set<string>>>((acc, w) => {
        (acc[w.movie_id] ||= new Set()).add(w.user_id);
        return acc;
      }, {})
    ).filter((movieId) => {
      const users = new Set(
        watchlist.filter((w) => w.movie_id === movieId).map((w) => w.user_id)
      );
      return users.size === 2;
    })
  );

  const featured =
    movies.find((m) => matchMovieIds.has(m.id)) ||
    watchlist.find((w) => w.user_id === userId)?.movie ||
    movies[0];

  const recent = sessions.slice(0, 6);

  return (
    <main className="px-5 pt-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="font-[var(--font-display)] italic text-2xl">flick.</p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: `${you.color}33`, color: you.color }}
        >
          {you.name[0]}
        </div>
      </header>

      <p className="text-2xl font-semibold">Oi, {you.name}</p>
      <p className="text-[var(--muted)] mt-1 mb-6">Hoje é dia de filme?</p>

      {loading ? (
        <div className="h-64 rounded-3xl animate-pulse" style={{ background: "var(--surface)" }} />
      ) : featured ? (
        <Link
          href="/registrar"
          className="block rounded-3xl overflow-hidden relative"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <div className="h-48 relative">
            <MoviePoster
              title={featured.title}
              posterUrl={featured.backdrop_url || featured.poster_url}
              className="w-full h-full"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, var(--surface) 5%, transparent 60%)",
              }}
            />
          </div>
          <div className="px-5 pb-5 -mt-2 relative">
            <p className="text-xs uppercase tracking-wide text-[var(--violet)] font-semibold mb-1">
              {matchMovieIds.has(featured.id) ? "Combinação encontrada" : "Filme da vez"}
            </p>
            <p className="font-[var(--font-display)] italic text-3xl leading-tight">
              {featured.title}
            </p>
            {featured.release_year && (
              <p className="text-[var(--muted)] text-sm mt-1">{featured.release_year}</p>
            )}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ background: "var(--violet)", color: "#0a0a0d" }}
            >
              <Popcorn size={16} /> Assistir juntos
            </div>
          </div>
        </Link>
      ) : (
        <EmptyHero />
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <p className="text-sm font-semibold text-[var(--muted)] mb-3">
            Sessões recentes
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5 no-scrollbar">
            {recent.map((s) => (
              <Link
                key={s.id}
                href="/nos"
                className="shrink-0 w-28"
              >
                <div className="w-28 h-40 rounded-2xl overflow-hidden mb-2" style={{ border: "1px solid var(--line)" }}>
                  <MoviePoster
                    title={s.movie?.title || ""}
                    posterUrl={s.movie?.poster_url}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs font-medium truncate">{s.movie?.title}</p>
                {sessionCoupleScore(s) !== null && (
                  <p className="text-xs text-[var(--gold)] flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> {sessionCoupleScore(s)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 grid grid-cols-3 gap-3">
        <QuickLink href="/nos" icon={Users} label="Nossa coleção" />
        <QuickLink href="/explorar" icon={Bookmark} label="Quero assistir" />
        <QuickLink href="/nos" icon={Star} label="Favoritos" />
      </section>
    </main>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Popcorn;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl px-3 py-4 flex flex-col items-center gap-2 text-center"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <Icon size={18} color="var(--violet)" />
      <span className="text-xs text-[var(--muted)] leading-tight">{label}</span>
    </Link>
  );
}

function EmptyHero() {
  return (
    <div
      className="rounded-3xl px-6 py-10 text-center"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <p className="font-[var(--font-display)] italic text-2xl mb-2">
        Ainda sem filmes por aqui
      </p>
      <p className="text-[var(--muted)] text-sm mb-5">
        Adicione um filme na aba Explorar para começar a história de vocês dois.
      </p>
      <Link
        href="/explorar"
        className="inline-block rounded-full px-5 py-2.5 text-sm font-semibold"
        style={{ background: "var(--violet)", color: "#0a0a0d" }}
      >
        Adicionar primeiro filme
      </Link>
    </div>
  );
}
