"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Flag,
  Medal,
  PiggyBank,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/common/EmptyState";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { subscribeToDataSync } from "@/lib/data-events";
import { compactCurrencyFormatter, formatDateTime } from "@/lib/formatters";
import { ApiClientError } from "@/lib/api";
import * as achievementsService from "@/services/achievements.service";
import * as budgetsService from "@/services/budgets.service";
import * as gamificationService from "@/services/gamification.service";
import * as goalsService from "@/services/goals.service";
import * as missionsService from "@/services/missions.service";
import * as notificationsService from "@/services/notifications.service";
import * as rankingService from "@/services/ranking.service";
import type {
  Achievement,
  Budget,
  GamificationProgress,
  Goal,
  Mission,
  Notification,
  RankingResponse,
} from "@/types/domain";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamification, setGamification] = useState<GamificationProgress | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setError(null);

      const results = await Promise.allSettled([
        gamificationService.getProgress(),
        budgetsService.getCurrentBudget(),
        goalsService.getGoals("active"),
        missionsService.getMissions({ status: "active" }),
        notificationsService.getNotifications(false),
        rankingService.getGlobalRanking(5),
        achievementsService.getAchievements(true),
      ]);

      if (!isMounted) {
        return;
      }

      const budgetResult = results[1];
      if (budgetResult.status === "rejected") {
        const budgetError = budgetResult.reason;
        if (!(budgetError instanceof ApiClientError) || budgetError.statusCode !== 404) {
          setError(budgetError instanceof Error ? budgetError.message : "No se pudo cargar el dashboard.");
        }
      }

      if (results[0].status === "fulfilled") {
        setGamification(results[0].value);
      }

      if (budgetResult.status === "fulfilled") {
        setBudget(budgetResult.value);
      } else if (budgetResult.reason instanceof ApiClientError && budgetResult.reason.statusCode === 404) {
        setBudget(null);
      }

      if (results[2].status === "fulfilled") {
        setGoals(results[2].value);
      }

      if (results[3].status === "fulfilled") {
        setMissions(results[3].value);
      }

      if (results[4].status === "fulfilled") {
        setNotifications(results[4].value);
      }

      if (results[5].status === "fulfilled") {
        setRanking(results[5].value);
      }

      if (results[6].status === "fulfilled") {
        setAchievements(results[6].value);
      }

      setLoading(false);
    }

    void loadDashboard();

    const unsubscribe = subscribeToDataSync(() => {
      void loadDashboard();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando tu dashboard..." />
      </ProtectedPage>
    );
  }

  const activeGoals = goals.slice(0, 3);
  const pendingMissions = missions.slice(0, 3);
  const unreadNotifications = notifications.slice(0, 4);
  const unlockedAchievements = achievements.length;

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Resumen real de tu progreso, presupuesto y actividad financiera gamificada."
        />

        {error ? <ErrorAlert message={error} /> : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="XP total"
            value={gamification ? `${gamification.totalXp.toLocaleString("es-HN")} XP` : "0 XP"}
            icon={<Zap size={22} />}
            hint={gamification ? `Faltan ${gamification.xpToNextLevel} XP para el siguiente nivel` : undefined}
          />
          <StatCard
            label="Liga actual"
            value={gamification?.league ?? "Sin liga"}
            icon={<Trophy size={22} />}
            hint={gamification ? `Nivel ${gamification.level} · Racha ${gamification.streakDays}` : undefined}
            accentClass="bg-mh-gold/15 text-amber-700"
          />
          <StatCard
            label="Metas activas"
            value={String(goals.length)}
            icon={<Target size={22} />}
            hint="Objetivos con progreso disponible"
            accentClass="bg-mh-lime/20 text-mh-green"
          />
          <StatCard
            label="No leídas"
            value={String(notifications.length)}
            icon={<Bell size={22} />}
            hint="Alertas pendientes por revisar"
            accentClass="bg-red-50 text-red-600"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] bg-[linear-gradient(135deg,#0c2118,#1f8a4c)] p-6 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
                  Gamificación
                </p>
                <h2 className="mt-3 font-display text-4xl font-extrabold">
                  Nivel {gamification?.level ?? 0}
                </h2>
                <p className="mt-2 text-sm text-white/75">
                  Último XP recibido: {gamification?.recentXpGained ?? 0}
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 px-5 py-4 text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Racha</p>
                <p className="font-display text-3xl font-extrabold">{gamification?.streakDays ?? 0}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/70">
                <span>Progreso al siguiente nivel</span>
                <span>{gamification?.xpToNextLevel ?? 0} XP restantes</span>
              </div>
              <ProgressBar
                value={gamification ? Math.max(250 - gamification.xpToNextLevel, 0) : 0}
                max={250}
                colorClass="bg-mh-gold"
                trackClass="bg-white/15"
                heightClass="h-4"
              />
            </div>
          </article>

          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                  <PiggyBank size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-mh-dark">Presupuesto actual</h2>
                  <p className="text-sm text-mh-dark/55">Vista conectada a `/budgets/current`</p>
                </div>
              </div>
              <Link href="/budgets" className="text-sm font-bold text-mh-green hover:underline">
                Ver más
              </Link>
            </div>

            {budget ? (
              <div className="mt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-mh-dark/55">Gastado</p>
                    <p className="font-display text-3xl font-extrabold text-mh-dark">
                      {compactCurrencyFormatter.format(budget.spentAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-mh-dark/55">Límite</p>
                    <p className="font-display text-2xl font-extrabold text-mh-dark">
                      {compactCurrencyFormatter.format(budget.limitAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar
                    value={budget.spentAmount}
                    max={budget.limitAmount}
                    colorClass={budget.percentageUsed >= 100 ? "bg-red-500" : "bg-mh-green"}
                    heightClass="h-4"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-mh-dark/60">
                  {budget.percentageUsed}% usado {budget.alertTriggered ? "· alerta activada" : ""}
                </p>
              </div>
            ) : (
              <EmptyState
                title="Sin presupuesto para el mes actual"
                description="Crea uno desde la pantalla de presupuestos para activar alertas reales."
              />
            )}
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-mh-lime/20 p-3 text-mh-green">
                  <Target size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-mh-dark">Metas activas</h2>
                  <p className="text-sm text-mh-dark/55">Progreso directo desde `/goals`</p>
                </div>
              </div>
              <Link href="/goals" className="text-sm font-bold text-mh-green hover:underline">
                Ver todas
              </Link>
            </div>

            {activeGoals.length ? (
              <div className="space-y-4">
                {activeGoals.map((goal) => (
                  <div key={goal.id} className="rounded-2xl bg-mh-cream px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-mh-dark">{goal.name}</p>
                        <p className="text-sm text-mh-dark/55">
                          {compactCurrencyFormatter.format(goal.currentAmount)} de{" "}
                          {compactCurrencyFormatter.format(goal.targetAmount)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-mh-dark/60">{goal.percentageCompleted}%</span>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={goal.currentAmount} max={goal.targetAmount} colorClass="bg-mh-green" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Aún no hay metas activas" description="Tu próxima meta aparecerá aquí." />
            )}
          </article>

          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                  <Flag size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-mh-dark">Misiones pendientes</h2>
                  <p className="text-sm text-mh-dark/55">Retos activos sincronizados</p>
                </div>
              </div>
              <Link href="/missions" className="text-sm font-bold text-mh-green hover:underline">
                Ver todas
              </Link>
            </div>

            {pendingMissions.length ? (
              <div className="space-y-3">
                {pendingMissions.map((mission) => (
                  <div key={mission.id} className="rounded-2xl bg-mh-cream px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-mh-dark">{mission.title}</p>
                      <span className="rounded-full bg-mh-gold/15 px-2.5 py-1 text-xs font-bold text-amber-700">
                        +{mission.xpReward} XP
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-mh-dark/55">{mission.description}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                      Progreso actual: {mission.progress}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin misiones activas" description="No hay misiones disponibles por ahora." />
            )}
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                  <Bell size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-mh-dark">Notificaciones no leídas</h2>
                  <p className="text-sm text-mh-dark/55">Alertas más recientes</p>
                </div>
              </div>
              <Link href="/notifications" className="text-sm font-bold text-mh-green hover:underline">
                Abrir centro
              </Link>
            </div>

            {unreadNotifications.length ? (
              <div className="space-y-3">
                {unreadNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-2xl bg-mh-cream px-4 py-4">
                    <p className="font-semibold text-mh-dark">{notification.message}</p>
                    <p className="mt-2 text-xs font-semibold text-mh-dark/45">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Todo está al día" description="No hay notificaciones pendientes por revisar." />
            )}
          </article>

          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-mh-gold/15 p-3 text-amber-700">
                  <Medal size={24} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-mh-dark">Ranking global</h2>
                  <p className="text-sm text-mh-dark/55">
                    {unlockedAchievements} logros desbloqueados en tu perfil
                  </p>
                </div>
              </div>
              <Link href="/ranking" className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline">
                Ver ranking <ChevronRight size={16} />
              </Link>
            </div>

            {ranking?.data.length ? (
              <div className="space-y-3">
                {ranking.data.map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between rounded-2xl bg-mh-cream px-4 py-4">
                    <div>
                      <p className="font-semibold text-mh-dark">
                        #{entry.position} {entry.name}
                      </p>
                      <p className="text-sm text-mh-dark/55">
                        Nivel {entry.level} · {entry.league}
                      </p>
                    </div>
                    <p className="font-display text-xl font-extrabold text-mh-dark">
                      {entry.totalXp.toLocaleString("es-HN")} XP
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Sin ranking disponible" description="Aún no hay suficiente actividad." />
            )}
          </article>
        </section>
      </div>
    </ProtectedPage>
  );
}
