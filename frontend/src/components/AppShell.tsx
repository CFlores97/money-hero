"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Flame,
  Home,
  LogOut,
  Medal,
  PiggyBank,
  ShieldCheck,
  Target,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import { subscribeToDataSync } from "@/lib/data-events";
import { clearSession, getCurrentUser, setCurrentUser } from "@/lib/session";
import * as authService from "@/services/auth.service";
import * as gamificationService from "@/services/gamification.service";
import * as notificationsService from "@/services/notifications.service";
import * as usersService from "@/services/users.service";
import type { AuthUser, GamificationProgress } from "@/types/domain";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transacciones", icon: Wallet },
  { href: "/budgets", label: "Presupuestos", icon: PiggyBank },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/missions", label: "Misiones", icon: ShieldCheck },
  { href: "/achievements", label: "Logros", icon: Trophy },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
  { href: "/profile", label: "Perfil", icon: User },
];

function getXpProgress(progress: GamificationProgress) {
  const currentLevelFloor = Math.max((progress.level - 1) * 250, 0);
  return Math.max(progress.totalXp - currentLevelFloor, 0);
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(getCurrentUser());
  const [gamification, setGamification] = useState<GamificationProgress | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateShell() {
      const storedUser = getCurrentUser();
      if (storedUser && isMounted) {
        setUser(storedUser);
      }

      const [userResult, notificationsResult, progressResult] = await Promise.allSettled([
        usersService.getMe(),
        notificationsService.getNotifications(false),
        gamificationService.getProgress(),
      ]);

      if (!isMounted) {
        return;
      }

      if (userResult.status === "fulfilled") {
        setCurrentUser(userResult.value);
        setUser(userResult.value);
      }

      if (notificationsResult.status === "fulfilled") {
        setUnreadCount(notificationsResult.value.length);
      }

      if (progressResult.status === "fulfilled") {
        setGamification(progressResult.value);
      }
    }

    void hydrateShell();

    const unsubscribe = subscribeToDataSync(() => {
      void hydrateShell();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const xpHint = useMemo(() => {
    if (!gamification) {
      return null;
    }

    return `${gamification.recentXpGained.toLocaleString("es-HN")} XP recientes`;
  }, [gamification]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch {
      // Si el token ya expiró, limpiamos sesión local igualmente.
    } finally {
      clearSession();
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(163,230,53,0.18),_transparent_28%),linear-gradient(180deg,_rgba(244,249,241,0.98),_rgba(244,249,241,1))]">
      <header className="sticky top-0 z-30 border-b border-mh-dark/8 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="font-comic text-3xl text-mh-green">
                MoneyHero
              </Link>
              {gamification ? (
                <div className="min-w-56 rounded-2xl border border-mh-dark/8 bg-mh-dark px-4 py-3 text-white">
                  <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-white/70">
                    <span>Nivel {gamification.level}</span>
                    <span>{gamification.league}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={getXpProgress(gamification)}
                      max={250}
                      colorClass="bg-mh-gold"
                      trackClass="bg-white/15"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-white/80">
                    <span>{gamification.totalXp.toLocaleString("es-HN")} XP</span>
                    <span>Faltan {gamification.xpToNextLevel} XP</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {gamification ? (
                <div className="rounded-full bg-mh-gold/20 px-4 py-2 text-sm font-bold text-amber-700">
                  <Zap size={16} className="mr-1 inline-block" />
                  {gamification.totalXp.toLocaleString("es-HN")} XP
                </div>
              ) : null}
              {gamification ? (
                <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                  <Flame size={16} className="mr-1 inline-block" />
                  Racha {gamification.streakDays}
                </div>
              ) : null}
              <Link
                href="/notifications"
                className="relative rounded-full border border-mh-dark/10 bg-white px-4 py-2 text-sm font-bold text-mh-dark transition-colors hover:border-mh-green hover:text-mh-green"
              >
                <Bell size={16} className="mr-1 inline-block" />
                Notificaciones
                {unreadCount > 0 ? (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
              <div className="rounded-2xl border border-mh-dark/8 bg-white px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Héroe</p>
                <p className="font-display text-lg font-extrabold text-mh-dark">
                  {user?.name ?? "Cargando..."}
                </p>
                <p className="text-xs text-mh-dark/50">{xpHint ?? user?.email ?? ""}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="rounded-full bg-mh-dark px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <LogOut size={16} className="mr-1 inline-block" />
                {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-mh-green text-white"
                      : "bg-white text-mh-dark/60 hover:bg-mh-dark/5 hover:text-mh-dark"
                  }`}
                >
                  <item.icon size={16} className="mr-1 inline-block" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
