"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/current-user-context";
import { addMovie, createSession, listMovies, removeFromWatchlist } from "@/lib/queries";
import { Movie, USERS, otherUser } from "@/lib/types";
import MoviePoster from "@/components/MoviePoster";
import { Check } from "lucide-react";

export default function RegistrarPage() {
  const { userId } = useCurrentUser();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Movie | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [snack, setSnack] = useState("");
  const [drink, setDrink] = useState("");
  const [comment, setComment] = useState("");
  const [scoreYou, setScoreYou] = useState(8);
  const [scoreOther, setScoreOther] = useState(8);
  const [reviewYou, setReviewYou] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    listMovies().then(setMovies);
  }, []);

  if (!userId) return null;
  const you = USERS[userId];
  const partner = USERS[otherUser(userId)];

  const filtered = query
    ? movies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
    : movies;

  async function handleSubmit() {
    if (!selected && !newTitle.trim()) return;
    setSaving(true);
    try {
      let movie = selected;
      if (!movie) {
        movie = await addMovie({ title: newTitle.trim() }, userId!);
      }
      await createSession({
        movie_id: movie.id,
        watched_at: date,
        snack,
        drink,
        comment,
        ratings: [
          { user_id: userId!, score: scoreYou, review: reviewYou },
          { user_id: otherUser(userId!), score: scoreOther },
        ],
      });
      await Promise.all([
        removeFromWatchlist(movie.id, "otavio"),
        removeFromWatchlist(movie.id, "larissa"),
      ]);
      setDone(true);
      setTimeout(() => router.push("/nos"), 1200);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <main className="px-5 pt-24 text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ background: "var(--violet)" }}
        >
          <Check color="#0a0a0d" size={26} />
        </div>
        <p className="font-[var(--font-display)] italic text-2xl">Sessão registrada!</p>
        <p className="text-[var(--muted)] text-sm mt-1">Levando você para o Nós...</p>
      </main>
    );
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="font-[var(--font-display)] italic text-3xl mb-1">Registrar sessão</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Guardem esse momento de cinema de vocês dois.
      </p>

      {!selected ? (
        <section className="mb-6">
          <p className="text-sm font-semibold mb-2">Qual filme?</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar na coleção de vocês..."
            className="w-full bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none mb-3"
          />
          <div className="max-h-56 overflow-y-auto flex flex-col gap-1 mb-3">
            {filtered.slice(0, 8).map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className="flex items-center gap-3 text-left rounded-xl px-2 py-2"
                style={{ background: "var(--surface)" }}
              >
                <div className="w-8 h-11 rounded overflow-hidden shrink-0">
                  <MoviePoster title={m.title} posterUrl={m.poster_url} className="w-full h-full" />
                </div>
                <span className="text-sm">{m.title}</span>
              </button>
            ))}
          </div>

          {!creatingNew ? (
            <button
              onClick={() => setCreatingNew(true)}
              className="text-xs text-[var(--violet)] font-semibold"
            >
              + Não está na lista, adicionar filme novo
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do filme novo"
                className="flex-1 bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none"
              />
              <button
                disabled={!newTitle.trim()}
                onClick={() => setSelected({ id: "", title: newTitle.trim() } as Movie)}
                className="text-xs rounded-full px-3 font-semibold"
                style={{ background: "var(--violet)", color: "#0a0a0d" }}
              >
                Usar
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          <div
            className="flex items-center gap-3 rounded-2xl p-3 mb-6"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0">
              <MoviePoster title={selected.title} posterUrl={selected.poster_url} className="w-full h-full" />
            </div>
            <p className="font-[var(--font-display)] italic text-lg flex-1">{selected.title}</p>
            <button
              onClick={() => {
                setSelected(null);
                setNewTitle("");
                setCreatingNew(false);
              }}
              className="text-xs text-[var(--muted)]"
            >
              trocar
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <Field label="Data">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm outline-none w-full"
              />
            </Field>
            <Field label="Pipoca / lanche">
              <input
                value={snack}
                onChange={(e) => setSnack(e.target.value)}
                placeholder="Pipoca"
                className="bg-transparent text-sm outline-none w-full"
              />
            </Field>
          </div>

          <Field label="Bebida" className="mb-5">
            <input
              value={drink}
              onChange={(e) => setDrink(e.target.value)}
              placeholder="Coca-Cola"
              className="bg-transparent text-sm outline-none w-full"
            />
          </Field>

          <p className="text-sm font-semibold mb-3">Avaliação</p>
          <RatingRow name={you.name} color={you.color} value={scoreYou} onChange={setScoreYou} />
          <textarea
            value={reviewYou}
            onChange={(e) => setReviewYou(e.target.value)}
            placeholder={`O que ${you.name} achou?`}
            rows={2}
            className="w-full bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none mb-5 mt-1 resize-none"
          />
          <RatingRow name={partner.name} color={partner.color} value={scoreOther} onChange={setScoreOther} />

          <div className="mt-4 mb-2">
            <p className="text-xs text-[var(--muted)]">Comentário da sessão</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='"Assistimos enquanto chovia lá fora."'
              rows={2}
              className="w-full bg-transparent border-b border-[var(--line)] pb-2 text-sm outline-none mt-1 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-full py-3.5 text-sm font-semibold mt-6"
            style={{ background: "var(--violet)", color: "#0a0a0d" }}
          >
            {saving ? "Salvando..." : "Salvar sessão"}
          </button>
        </>
      )}
    </main>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2.5 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <p className="text-[10px] text-[var(--muted)] mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function RatingRow({
  name,
  color,
  value,
  onChange,
}: {
  name: string;
  color: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color }}>
          {name}
        </span>
        <span className="text-sm font-[var(--font-display)] italic">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--violet)]"
        style={{ accentColor: color }}
      />
    </div>
  );
}
