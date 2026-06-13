import Link from "next/link";
import {
  Bot,
  ChevronRight,
  Coins,
  Flag,
  Medal,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import {
  achievements,
  bosses,
  goals,
  missions,
  player,
  ranking,
  stats,
} from "@/lib/demoData";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

const rankMedalClass = ["bg-mh-gold text-mh-black", "bg-gray-300 text-mh-dark", "bg-amber-600 text-white"];

export default function DashboardPage() {
  const mainBoss = bosses[0];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero / profile banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mh-dark to-mh-green p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-20 bottom-0 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 sm:h-20 sm:w-20">
              <Bot size={36} className="text-mh-lime" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/70">¡Bienvenido de nuevo!</p>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{player.name}</h1>
              <p className="mt-0.5 text-sm font-bold text-mh-lime">
                Nivel {player.level} · {player.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 font-bold">
              <Coins size={20} className="text-mh-gold" /> {player.coins.toLocaleString("es-HN")}
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/70">
            <span>Progreso al Nivel {player.level + 1}</span>
            <span>
              {player.xp.toLocaleString("es-HN")} / {player.xpToNext.toLocaleString("es-HN")} XP
            </span>
          </div>
          <ProgressBar
            value={player.xp}
            max={player.xpToNext}
            colorClass="bg-mh-gold"
            trackClass="bg-white/15"
            heightClass="h-4"
          />
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-3 inline-flex rounded-xl bg-mh-green/10 p-3 text-mh-green">
            <Wallet size={22} />
          </div>
          <p className="text-sm font-semibold text-mh-dark/50">Balance total</p>
          <p className="font-display text-2xl font-extrabold text-mh-dark">{currency.format(stats.balance)}</p>
        </div>
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-3 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
            <TrendingUp size={22} />
          </div>
          <p className="text-sm font-semibold text-mh-dark/50">Ingresos del mes</p>
          <p className="font-display text-2xl font-extrabold text-emerald-600">+{currency.format(stats.income)}</p>
        </div>
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-3 inline-flex rounded-xl bg-red-500/10 p-3 text-red-500">
            <TrendingDown size={22} />
          </div>
          <p className="text-sm font-semibold text-mh-dark/50">Gastos del mes</p>
          <p className="font-display text-2xl font-extrabold text-red-500">-{currency.format(stats.expenses)}</p>
        </div>
      </section>

      {/* Game panels */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Misiones activas */}
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-mh-green/10 p-2 text-mh-green">
                <Flag size={20} />
              </div>
              <h2 className="font-display text-lg font-bold text-mh-dark">Misiones activas</h2>
            </div>
            <Link
              href="/dashboard/missions"
              className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline"
            >
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {missions.slice(0, 3).map((mission) => (
              <div key={mission.id}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-mh-dark">{mission.title}</span>
                  <span className="shrink-0 rounded-full bg-mh-gold/15 px-2 py-0.5 text-xs font-bold text-amber-600">
                    +{mission.xp} XP
                  </span>
                </div>
                <ProgressBar value={mission.progress} max={mission.total} colorClass="bg-mh-green" />
              </div>
            ))}
          </div>
        </div>

        {/* Jefes financieros */}
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-red-500/10 p-2 text-red-500">
                <Swords size={20} />
              </div>
              <h2 className="font-display text-lg font-bold text-mh-dark">Jefe financiero activo</h2>
            </div>
            <Link
              href="/dashboard/bosses"
              className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline"
            >
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mh-dark text-red-400">
              <Swords size={26} />
            </div>
            <div className="w-full">
              <p className="font-semibold text-mh-dark">{mainBoss.name}</p>
              <div className="mb-1 mt-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                <span>HP</span>
                <span>
                  {mainBoss.hp.toLocaleString("es-HN")} / {mainBoss.maxHp.toLocaleString("es-HN")}
                </span>
              </div>
              <ProgressBar value={mainBoss.hp} max={mainBoss.maxHp} colorClass="bg-red-500" heightClass="h-3.5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-mh-dark/60">{mainBoss.description}</p>
        </div>

        {/* Metas de ahorro */}
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-mh-lime/20 p-2 text-mh-green">
                <Target size={20} />
              </div>
              <h2 className="font-display text-lg font-bold text-mh-dark">Metas de ahorro</h2>
            </div>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline"
            >
              Ver todas <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {goals.slice(0, 2).map((goal) => (
              <div key={goal.id}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-mh-dark">
                    <goal.icon size={16} className="text-mh-green" /> {goal.title}
                  </span>
                  <span className="shrink-0 text-xs font-bold text-mh-dark/50">
                    {currency.format(goal.current)} / {currency.format(goal.target)}
                  </span>
                </div>
                <ProgressBar value={goal.current} max={goal.target} colorClass="bg-mh-green" />
              </div>
            ))}
          </div>
        </div>

        {/* Logros + Ranking */}
        <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-mh-gold/15 p-2 text-amber-600">
                <Trophy size={20} />
              </div>
              <h2 className="font-display text-lg font-bold text-mh-dark">Logros</h2>
            </div>
            <Link
              href="/dashboard/achievements"
              className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline"
            >
              Ver todos <ChevronRight size={16} />
            </Link>
          </div>

          <p className="mb-3 text-sm text-mh-dark/60">
            Has desbloqueado <span className="font-bold text-mh-dark">{unlockedCount}</span> de{" "}
            {achievements.length} insignias.
          </p>

          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                title={achievement.title}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 ${
                  achievement.unlocked
                    ? "border-mh-gold/40 bg-mh-gold/10 text-amber-600"
                    : "border-mh-dark/5 bg-mh-dark/5 text-mh-dark/30"
                }`}
              >
                <achievement.icon size={20} />
              </div>
            ))}
          </div>

          <div className="my-4 h-px bg-mh-dark/5" />

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-mh-dark/5 p-2 text-mh-dark">
                <Medal size={20} />
              </div>
              <h2 className="font-display text-lg font-bold text-mh-dark">Ranking</h2>
            </div>
            <Link
              href="/dashboard/ranking"
              className="flex items-center gap-1 text-sm font-bold text-mh-green hover:underline"
            >
              Ver todo <ChevronRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {ranking.slice(0, 3).map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                  entry.name === player.name ? "bg-mh-green/10" : "bg-mh-dark/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${rankMedalClass[index]}`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-mh-dark">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-mh-dark/50">{entry.xp.toLocaleString("es-HN")} XP</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
