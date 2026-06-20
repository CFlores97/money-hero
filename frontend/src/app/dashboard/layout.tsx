"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Flag,
  Flame,
  Home,
  LogOut,
  Medal,
  PiggyBank,
  Swords,
  Target,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { player } from "@/lib/demoData";
import {
  logout,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type AuthUser,
  type Notification,
} from "@/lib/api";
import { clearSession, getStoredUser, getToken } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/missions", label: "Misiones", icon: Flag },
  { href: "/dashboard/goals", label: "Metas", icon: Target },
  { href: "/dashboard/budgets", label: "Presupuesto", icon: PiggyBank },
  { href: "/dashboard/bosses", label: "Jefes", icon: Swords },
  { href: "/dashboard/achievements", label: "Logros", icon: Trophy },
  { href: "/dashboard/ranking", label: "Ranking", icon: Medal },
  { href: "/dashboard/transactions", label: "Movimientos", icon: Wallet },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
      getNotifications(token)
        .then(setNotifications)
        .catch(() => {});
    } else {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  function handleBellClick() {
    const token = getToken();
    if (!bellOpen && token) {
      getNotifications(token)
        .then(setNotifications)
        .catch(() => {});
    }
    setBellOpen((prev) => !prev);
  }

  async function handleMarkRead(id: string) {
    const token = getToken();
    if (!token) return;
    try {
      const updated = await markNotificationRead(token, id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {}
  }

  async function handleMarkAllRead() {
    const token = getToken();
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch {}
  }

  async function handleExit() {
    const token = getToken();
    if (token) {
      try {
        await logout(token);
      } catch {}
    }
    clearSession();
    router.replace("/");
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
            {user && (
              <span className="text-sm font-bold text-mh-dark/70">Hola, {user.name}</span>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-mh-dark/5 px-3 py-1.5 text-sm font-bold text-mh-dark">
              <Zap size={16} className="text-mh-gold" /> {player.xp.toLocaleString("es-HN")} XP
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-mh-dark/5 px-3 py-1.5 text-sm font-bold text-mh-dark">
              <Flame size={16} className="text-orange-500" /> Racha {player.streak}
            </div>
            <div className="rounded-full bg-mh-green px-3 py-1.5 text-sm font-bold text-white">
              Nivel {player.level} · {player.title}
            </div>

            {/* Campanita */}
            <div ref={bellRef} className="relative">
              <button
                onClick={handleBellClick}
                className="relative flex items-center justify-center rounded-full bg-mh-dark/5 p-2 transition-colors hover:bg-mh-dark/10"
              >
                <Bell size={18} className="text-mh-dark" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-mh-dark/10 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-mh-dark/5 px-4 py-3">
                    <p className="font-display font-bold text-mh-dark">Notificaciones</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-mh-green hover:underline"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="py-8 text-center text-sm text-mh-dark/40">Sin notificaciones</p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => !n.readStatus && handleMarkRead(n.id)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-mh-dark/[0.03]"
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            n.readStatus ? "bg-transparent" : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <p className={`text-sm text-mh-dark ${n.readStatus ? "font-normal" : "font-bold"}`}>
                            {n.message}
                          </p>
                          <p className="mt-0.5 text-xs text-mh-dark/40">
                            {new Date(n.createdAt).toLocaleDateString("es-HN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 text-sm font-semibold text-mh-dark/50 transition-colors hover:text-mh-dark"
            >
              <LogOut size={16} /> Salir
            </button>
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

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
