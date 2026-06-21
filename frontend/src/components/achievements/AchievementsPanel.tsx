import { Award, Lock, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import { formatDateTime } from "@/lib/formatters";
import type { Achievement } from "@/types/domain";

interface AchievementsPanelProps {
  achievements: Achievement[];
}

function AchievementIcon({ iconName, unlocked }: { iconName: string | null; unlocked: boolean }) {
  const className = unlocked ? "text-amber-600" : "text-mh-dark/35";

  switch (iconName) {
    case "award":
      return <Award size={24} className={className} />;
    case "shield":
      return <ShieldCheck size={24} className={className} />;
    case "sparkles":
      return <Sparkles size={24} className={className} />;
    default:
      return unlocked ? <Trophy size={24} className={className} /> : <Lock size={24} className={className} />;
  }
}

export default function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  if (!achievements.length) {
    return (
      <EmptyState
        title="No hay logros para mostrar"
        description="Ajusta el filtro o completa más acciones dentro de tu progreso financiero."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {achievements.map((achievement) => (
        <article
          key={achievement.id}
          className={`rounded-3xl border-2 p-5 shadow-sm ${
            achievement.unlocked
              ? "border-mh-gold/30 bg-mh-gold/10"
              : "border-mh-dark/5 bg-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                achievement.unlocked ? "bg-white/70" : "bg-mh-dark/5"
              }`}
            >
              <AchievementIcon iconName={achievement.icon} unlocked={achievement.unlocked} />
            </div>
            <div>
              <h3 className="font-display text-xl font-extrabold text-mh-dark">{achievement.title}</h3>
              <p className="mt-2 text-sm text-mh-dark/60">{achievement.description}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-sm text-mh-dark/65">
            <p className="font-semibold text-mh-dark">Criterio</p>
            <p className="mt-1">{achievement.criteria}</p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                achievement.unlocked
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-mh-dark/8 text-mh-dark/55"
              }`}
            >
              {achievement.unlocked ? "Desbloqueado" : "Bloqueado"}
            </span>
            {achievement.unlockedAt ? (
              <span className="text-xs font-semibold text-mh-dark/45">
                {formatDateTime(achievement.unlockedAt)}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
