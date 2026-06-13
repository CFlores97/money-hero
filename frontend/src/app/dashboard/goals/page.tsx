import { Target } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import GameButton from "@/components/GameButton";
import { goals } from "@/lib/demoData";

const currency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
});

export default function GoalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-mh-dark">
          <Target className="text-mh-green" /> Metas de ahorro
        </h1>
        <p className="mt-1 text-mh-dark/60">
          Cada meta es una quest a largo plazo. Avanza poco a poco hasta completarla.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.id} className="flex flex-col rounded-2xl border-2 border-mh-dark/5 bg-white p-5">
              <div className="mb-3 inline-flex w-fit rounded-2xl bg-mh-green/10 p-3 text-mh-green">
                <goal.icon size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-mh-dark">{goal.title}</h3>
              <p className="mt-1 text-sm text-mh-dark/60">
                {currency.format(goal.current)} de {currency.format(goal.target)}
              </p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-mh-dark/50">
                  <span>Progreso</span>
                  <span>{pct}%</span>
                </div>
                <ProgressBar value={goal.current} max={goal.target} colorClass="bg-mh-green" heightClass="h-3.5" />
              </div>

              <div className="mt-4">
                <GameButton variant="primary" className="w-full">
                  Agregar ahorro
                </GameButton>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-mh-dark/15 bg-transparent p-5 text-center">
          <p className="font-display text-lg font-bold text-mh-dark">¿Una nueva aventura?</p>
          <p className="mt-1 text-sm text-mh-dark/60">Crea una nueva meta de ahorro.</p>
          <div className="mt-4">
            <GameButton variant="outline">+ Nueva meta</GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
