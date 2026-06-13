"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flag,
  Flame,
  Home,
  LogOut,
  Medal,
  Swords,
  Target,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { player } from "@/lib/demoData";

const DEMO_USER_KEY = "moneyhero_demo_user";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/missions", label: "Misiones", icon: Flag },
  { href: "/dashboard/goals", label: "Metas", icon: Target },
  { href: "/dashboard/bosses", label: "Jefes", icon: Swords },
  { href: "/dashboard/achievements", label: "Logros", icon: Trophy },
  { href: "/dashboard/ranking", label: "Ranking", icon: Medal },
  { href: "/dashboard/transactions", label: "Movimientos", icon: Wallet },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(window.localStorage.getItem(DEMO_USER_KEY) === "true");
  }, []);

  function handleExit() {
    window.localStorage.removeItem(DEMO_USER_KEY);
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/Dash_Fondo.png')] bg-cover bg-center bg-no-repeat" />
      <div className="fixed inset-0 -z-10 bg-mh-cream/90" />

      <header className="sticky top-0 z-20 border-b-2 border-mh-dark/5 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/dashboard" className="font-comic text-2xl text-mh-green">
            MoneyHero
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-mh-dark/5 px-3 py-1.5 text-sm font-bold text-mh-dark">
              <Zap size={16} className="text-mh-gold" /> {player.xp.toLocaleString("es-HN")} XP
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-mh-dark/5 px-3 py-1.5 text-sm font-bold text-mh-dark">
              <Flame size={16} className="text-orange-500" /> Racha {player.streak}
            </div>
            <div className="rounded-full bg-mh-green px-3 py-1.5 text-sm font-bold text-white">
              Nivel {player.level} · {player.title}
            </div>
            <Link
              href="/"
              onClick={handleExit}
              className="flex items-center gap-1.5 text-sm font-semibold text-mh-dark/50 transition-colors hover:text-mh-dark"
            >
              <LogOut size={16} /> Salir
            </Link>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
                  active
                    ? "bg-mh-green text-white"
                    : "text-mh-dark/60 hover:bg-mh-dark/5 hover:text-mh-dark"
                }`}
              >
                <item.icon size={15} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {isDemo && (
          <div className="mb-6 rounded-2xl border-2 border-mh-gold/50 bg-mh-gold/10 px-4 py-3 text-sm font-semibold text-mh-dark">
            🎮 Estás en modo demo — estos datos son de ejemplo.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
