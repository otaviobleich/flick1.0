"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/current-user-context";
import { listSessions } from "@/lib/queries";
import { Session, USERS, otherUser } from "@/lib/types";

export default function PerfilPage() {
  const { userId, setUserId } = useCurrentUser();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  if (!userId) return null;
  const you = USERS[userId];

  const yourRatings = sessions.flatMap(
    (s) => s.ratings?.filter((r) => r.user_id === userId) || []
  );
  const avg = yourRatings.length
    ? yourRatings.reduce((a, r) => a + Number(r.score), 0) / yourRatings.length
    : null;

  return (
    <main className="px-5 pt-8">
      <h1 className="font-[var(--font-display)] italic text-3xl mb-6">Perfil</h1>

      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-3"
          style={{ background: `${you.color}33`, color: you.color }}
        >
          {you.name[0]}
        </div>
        <p className="font-[var(--font-display)] italic text-2xl">{you.name}</p>
        <p className="text-[var(--muted)] text-sm">Parte da conta compartilhada do Flick</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <p className="text-xs text-[var(--muted)] mb-1">Filmes avaliados</p>
          <p className="font-[var(--font-display)] italic text-2xl">{yourRatings.length}</p>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        >
          <p className="text-xs text-[var(--muted)] mb-1">Sua nota média</p>
          <p className="font-[var(--font-display)] italic text-2xl">
            {avg !== null ? avg.toFixed(1) : "–"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setUserId(otherUser(userId))}
        className="w-full rounded-2xl px-5 py-4 text-left font-semibold"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        Trocar para {USERS[otherUser(userId)].name}
      </button>

      <p className="text-xs text-[var(--muted)] mt-6 text-center">
        flick. · feito para o Otavio e a Larissa
      </p>
    </main>
  );
}
