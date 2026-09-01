"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CirclePlus, Heart, User } from "lucide-react";
import { useCurrentUser } from "@/lib/current-user-context";

const TABS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/explorar", label: "Explorar", icon: Search },
  { href: "/registrar", label: "Registrar", icon: CirclePlus },
  { href: "/nos", label: "Nós", icon: Heart },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { userId } = useCurrentUser();

  if (!userId) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 z-40"
      style={{
        background:
          "linear-gradient(to top, var(--bg) 60%, transparent)",
      }}
    >
      <div
        className="flex items-center justify-between rounded-[22px] px-2 py-2 backdrop-blur"
        style={{ background: "rgba(23,21,29,0.9)", border: "1px solid var(--line)" }}
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 py-1.5 rounded-2xl transition-colors"
              style={{
                color: active ? "var(--text)" : "var(--muted)",
              }}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                color={active ? "var(--violet)" : "var(--muted)"}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
