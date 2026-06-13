import { Lock, Trophy } from "lucide-react";
import { achievements } from "@/lib/demoData";

export default function AchievementsPage() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Trophy className="text-amber-500" /> Logros
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Has desbloqueado {unlockedCount} de {achievements.length} insignias.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-start gap-4 rounded-2xl border-2 p-5 ${
              achievement.unlocked ? "border-mh-gold/40 bg-mh-gold/10" : "border-mh-dark/5 bg-white"
            }`}
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                achievement.unlocked ? "bg-mh-gold/20 text-amber-600" : "bg-mh-dark/5 text-mh-dark/30"
              }`}
            >
              {achievement.unlocked ? <achievement.icon size={26} /> : <Lock size={24} />}
            </div>
            <div>
              <h3 className={`font-display text-lg font-bold ${achievement.unlocked ? "text-mh-dark" : "text-mh-dark/40"}`}>
                {achievement.title}
              </h3>
              <p className={`mt-1 text-sm ${achievement.unlocked ? "text-mh-dark/60" : "text-mh-dark/35"}`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <span className="mt-2 inline-block rounded-full bg-mh-gold/20 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                  Desbloqueado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
