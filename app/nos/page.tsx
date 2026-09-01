"use client";

import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/lib/current-user-context";
import {
  addSpecialMovie,
  listMovies,
  listSessions,
  listSpecialMovies,
} from "@/lib/queries";
import { Movie, Session, SPECIAL_CATEGORIES, SpecialMovie, USERS } from "@/lib/types";
import { computeStats, formatMinutes, sessionCoupleScore } from "@/lib/stats";
import MoviePoster from "@/components/MoviePoster";
import { Star } from "lucide-react";

export default function NosPage() {
  const { userId } = useCurrentUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [specials, setSpecials] = useState<SpecialMovie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tab, setTab] = useState<"stats" | "diario" | "especiais">("stats");
  const [addingSpecial, setAddingSpecial] = useState(false);

  async function refresh() {
    const [s, sp, m] = await Promise.all([
      listSessions(),
      listSpecialMovies(),
      listMovies(),
    ]);
    setSessions(s);
    setSpecials(sp);
    setMovies(m);
  }

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => computeStats(sessions), [sessions]);

  const sessionsByMonth = useMemo(() => {
    const groups = new Map<string, Session[]>();
    for (const s of sessions) {
      const d = new Date(s.watched_at + "T00:00:00");
      const key = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    }
    return Array.from(groups.entries());
  }, [sessions]);

  if (!userId) return null;

  return (
    <main className="px-5 pt-8">
      <h1 className="font-[var(--font-display)] italic text-3xl mb-1">
        Nós
      </h1>
      <p className="text-[var(--muted)] text-sm mb-5">
        {stats.totalSessions} filmes e ainda não conseguimos escolher o próximo. 😂
      </p>

      <div className="flex gap-2 mb-6">
        {[
          ["stats", "Nossa história"],
          ["diario", "Diário"],
          ["especiais", "Filmes especiais"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className="text-xs rounded-full px-3 py-1.5 font-semibold"
            style={{
              background: tab === key ? "var(--violet)" : "var(--surface)",
              color: tab === key ? "#0a0a0d" : "var(--muted)",
              border: tab === key ? "none" : "1px solid var(--line)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Filmes assistidos" value={String(stats.distinctMovies)} />
            <StatCard label="Tempo juntos" value={formatMinutes(stats.totalMinutes)} />
            <StatCard
              label="Nota média"
              value={stats.averageScore !== null ? stats.averageScore.toFixed(1) : "–"}
            />
            <StatCard label="Favoritos" value={String(specials.length)} />
          </div>

          {stats.mostWatchedTitle && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <p className="text-xs text-[var(--muted)] mb-1">Filme mais assistido</p>
              <p className="font-[var(--font-display)] italic text-xl">
                {stats.mostWatchedTitle.title}
                <span className="text-sm text-[var(--muted)] not-italic font-[var(--font-body)]">
                  {" "}
                  · {stats.mostWatchedTitle.count}x
                </span>
              </p>
            </div>
          )}

          {stats.favoriteGenres.length > 0 && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <p className="text-xs text-[var(--muted)] mb-3">Gênero favorito</p>
              {stats.favoriteGenres.map((g, i) => (
                <div key={g.genre} className="flex items-center justify-between mb-1.5 last:mb-0">
                  <span className="text-sm">
                    {["🥇", "🥈", "🥉"][i]} {g.genre}
                  </span>
                  <span className="text-sm text-[var(--muted)]">{g.count} filmes</span>
                </div>
              ))}
            </div>
          )}

          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <p className="text-xs text-[var(--muted)] mb-3">Quem dá notas maiores?</p>
            <div className="flex gap-4">
              {(Object.keys(USERS) as (keyof typeof USERS)[]).map((uid) => (
                <div key={uid} className="flex-1">
                  <p className="text-sm font-medium" style={{ color: USERS[uid].color }}>
                    {USERS[uid].name}
                  </p>
                  <p className="font-[var(--font-display)] italic text-2xl">
                    {stats.averageByUser[uid]?.toFixed(1) ?? "–"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <p className="text-xs text-[var(--muted)] mb-3">Quem adiciona mais filmes?</p>
            <div className="h-2 rounded-full overflow-hidden flex" style={{ background: "var(--surface-2)" }}>
              <div style={{ width: `${stats.pickShareByUser.otavio}%`, background: USERS.otavio.color }} />
              <div style={{ width: `${stats.pickShareByUser.larissa}%`, background: USERS.larissa.color }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--muted)]">
              <span>Otavio {stats.pickShareByUser.otavio}%</span>
              <span>Larissa {stats.pickShareByUser.larissa}%</span>
            </div>
          </div>
        </section>
      )}

      {tab === "diario" && (
        <section className="flex flex-col gap-6">
          {sessionsByMonth.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Nenhuma sessão registrada ainda.</p>
          )}
          {sessionsByMonth.map(([month, list]) => (
            <div key={month}>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)] mb-3">{month}</p>
              <div className="flex flex-col gap-3">
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="flex gap-3 rounded-2xl p-3"
                    style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                      <MoviePoster title={s.movie?.title || ""} posterUrl={s.movie?.poster_url} className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[var(--font-display)] italic truncate">{s.movie?.title}</p>
                      <p className="text-[10px] text-[var(--muted)] mb-1">
                        {new Date(s.watched_at + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex gap-3 text-xs">
                        {s.ratings?.map((r) => (
                          <span key={r.id} style={{ color: USERS[r.user_id].color }}>
                            {USERS[r.user_id].name}: {Number(r.score).toFixed(1)}
                          </span>
                        ))}
                      </div>
                      {s.comment && (
                        <p className="text-xs text-[var(--muted)] italic mt-1">&quot;{s.comment}&quot;</p>
                      )}
                    </div>
                    {sessionCoupleScore(s) !== null && (
                      <div className="flex flex-col items-center justify-center text-[var(--gold)] shrink-0">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-semibold">{sessionCoupleScore(s)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "especiais" && (
        <section>
          <button
            onClick={() => setAddingSpecial((v) => !v)}
            className="text-xs rounded-full px-3 py-1.5 font-semibold mb-4"
            style={{ background: "var(--surface-2)", border: "1px solid var(--violet-dim)" }}
          >
            + Adicionar filme especial
          </button>

          {addingSpecial && (
            <AddSpecialForm
              movies={movies}
              onDone={() => {
                setAddingSpecial(false);
                refresh();
              }}
            />
          )}

          <div className="flex flex-col gap-3">
            {specials.length === 0 && (
              <p className="text-sm text-[var(--muted)]">
                Nenhum filme especial ainda. Marque o primeiro filme de vocês, o favorito de cada um, e mais.
              </p>
            )}
            {specials.map((s) => (
              <div
                key={s.id}
                className="flex gap-3 rounded-2xl p-3"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                  <MoviePoster title={s.movie?.title || ""} posterUrl={s.movie?.poster_url} className="w-full h-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--rose)] font-semibold">{s.category}</p>
                  <p className="font-[var(--font-display)] italic truncate">{s.movie?.title}</p>
                  {s.note && <p className="text-xs text-[var(--muted)] italic mt-0.5">&quot;{s.note}&quot;</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
      <p className="font-[var(--font-display)] italic text-2xl">{value}</p>
    </div>
  );
}

function AddSpecialForm({
  movies,
  onDone,
}: {
  movies: Movie[];
  onDone: () => void;
}) {
  const [movieId, setMovieId] = useState("");
  const [category, setCategory] = useState<string>(SPECIAL_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!movieId) return;
    setSaving(true);
    try {
      await addSpecialMovie(movieId, category, note);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <select
        value={movieId}
        onChange={(e) => setMovieId(e.target.value)}
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
        required
      >
        <option value="" disabled>
          Escolha o filme
        </option>
        {movies.map((m) => (
          <option key={m.id} value={m.id} className="bg-[#17151d]">
            {m.title}
          </option>
        ))}
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
      >
        {SPECIAL_CATEGORIES.map((c) => (
          <option key={c} value={c} className="bg-[#17151d]">
            {c}
          </option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Por que é especial? (opcional)"
        className="bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full py-2.5 text-sm font-semibold mt-1"
        style={{ background: "var(--rose)", color: "#0a0a0d" }}
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
