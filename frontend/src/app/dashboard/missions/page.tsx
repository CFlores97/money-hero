import { Flag } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import { missions } from "@/lib/demoData";

const categoryStyles: Record<string, string> = {
  Diaria: "bg-mh-green/10 text-mh-green",
  Semanal: "bg-mh-gold/15 text-amber-600",
  "Logro único": "bg-mh-dark/10 text-mh-dark",
};

export default function MissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Flag className="text-mh-green" /> Misiones
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Completa retos para ganar XP y subir de nivel más rápido.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {missions.map((mission) => {
          const completed = mission.progress >= mission.total;
          return (
            <div key={mission.id} className="flex flex-col rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${categoryStyles[mission.category] ?? "bg-mh-dark/10 text-mh-dark"}`}
                >
                  {mission.category}
                </span>
                <span className="shrink-0 rounded-full bg-mh-gold/15 px-2.5 py-1 text-xs font-bold text-amber-600">
                  +{mission.xp} XP
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-mh-dark">{mission.title}</h3>
              <p className="mt-1 text-sm text-mh-dark/60">{mission.description}</p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                  <span>Progreso</span>
                  <span>
                    {mission.progress} / {mission.total}
                  </span>
                </div>
                <ProgressBar
                  value={mission.progress}
                  max={mission.total}
                  colorClass={completed ? "bg-mh-gold" : "bg-mh-green"}
                />
              </div>

              <div className="mt-4">
                {completed ? (
                  <GameButton variant="gold" className="w-full">
                    Reclamar recompensa
                  </GameButton>
                ) : (
                  <GameButton variant="outline" className="w-full">
                    En progreso
                  </GameButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
