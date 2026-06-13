import { Medal } from "lucide-react";
import { player, ranking } from "@/lib/demoData";

const rankStyles = [
  "bg-mh-gold text-mh-black",
  "bg-gray-300 text-mh-dark",
  "bg-amber-600 text-white",
];

export default function RankingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Medal className="text-mh-dark" /> Ranking
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Compite con tus amigos por experiencia (XP) total. ¡Sigue subiendo de nivel!
        </p>
      </div>

      <div className="rounded-2xl border-2 border-mh-dark/5 bg-white p-2 sm:p-4">
        {ranking.map((entry, index) => {
          const isPlayer = entry.name === player.name;
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
                isPlayer ? "bg-mh-green/10" : index % 2 === 0 ? "bg-transparent" : "bg-mh-dark/[0.02]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    rankStyles[index] ?? "bg-mh-dark/10 text-mh-dark"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-mh-dark">
                    {entry.name} {isPlayer && <span className="text-xs font-bold text-mh-green">(Tú)</span>}
                  </p>
                  <p className="text-xs text-mh-dark/50">Nivel {entry.level}</p>
                </div>
              </div>
              <span className="font-display text-lg font-bold text-mh-dark">
                {entry.xp.toLocaleString("es-HN")} XP
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
