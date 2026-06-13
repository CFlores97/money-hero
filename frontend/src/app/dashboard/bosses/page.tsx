import { Swords } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import { bosses } from "@/lib/demoData";

export default function BossesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Swords className="text-red-500" /> Jefes financieros
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Tus deudas y metas grandes son jefes con barra de vida. Cada pago les baja HP.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {bosses.map((boss) => {
          const pct = Math.round((boss.hp / boss.maxHp) * 100);
          return (
            <div key={boss.id} className="flex flex-col gap-4 rounded-2xl border-2 border-mh-dark/5 bg-white p-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-mh-dark text-red-400">
                <Swords size={28} />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-mh-dark">{boss.name}</h3>
                  <span className="text-xs font-bold text-mh-dark/50">{pct}% HP restante</span>
                </div>
                <p className="mt-1 text-sm text-mh-dark/60">{boss.description}</p>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                    <span>HP</span>
                    <span>
                      {boss.hp.toLocaleString("es-HN")} / {boss.maxHp.toLocaleString("es-HN")}
                    </span>
                  </div>
                  <ProgressBar value={boss.hp} max={boss.maxHp} colorClass="bg-red-500" heightClass="h-4" />
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-amber-600">
                  Recompensa al derrotarlo: {boss.reward}
                </p>
              </div>

              <GameButton variant="primary" className="sm:w-auto">
                Registrar pago
              </GameButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}
