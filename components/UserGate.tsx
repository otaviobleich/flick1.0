"use client";

import { useCurrentUser } from "@/lib/current-user-context";
import { USERS, UserId } from "@/lib/types";

export default function UserGate({ children }: { children: React.ReactNode }) {
  const { userId, setUserId, ready } = useCurrentUser();

  if (!ready) return null;

  if (!userId) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-8 text-center gap-10">
        <div>
          <h1 className="font-[var(--font-display)] italic text-5xl tracking-tight">
            flick<span className="text-[var(--violet)]">.</span>
          </h1>
          <p className="text-[var(--muted)] mt-3 text-sm leading-relaxed max-w-xs">
            Dois usuários. Um histórico. Mil filmes para assistir.
          </p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <p className="text-sm text-[var(--muted)] mb-1">
            Quem está com o celular?
          </p>
          {(Object.values(USERS) as (typeof USERS)[UserId][]).map((u) => (
            <button
              key={u.id}
              onClick={() => setUserId(u.id)}
              className="rounded-2xl px-5 py-4 text-left font-semibold text-lg transition-transform active:scale-[0.98]"
              style={{
                background: "var(--surface)",
                border: `1px solid ${u.color}55`,
              }}
            >
              <span style={{ color: u.color }}>●</span>{" "}
              <span>Sou {u.name}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
