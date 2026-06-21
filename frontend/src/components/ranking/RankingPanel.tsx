import EmptyState from "@/components/common/EmptyState";
import type { RankingEntry } from "@/types/domain";

interface RankingPanelProps {
  entries: RankingEntry[];
  currentUserId?: string;
  showFriendsEmptyState?: boolean;
}

const positionClasses = [
  "bg-mh-gold text-mh-black",
  "bg-slate-200 text-mh-dark",
  "bg-amber-700 text-white",
];

export default function RankingPanel({
  entries,
  currentUserId,
  showFriendsEmptyState = false,
}: RankingPanelProps) {
  if (showFriendsEmptyState) {
    return (
      <EmptyState
        title="Aún no tienes amistades en ranking"
        description="Cuando existan amistades aceptadas en el backend, el ranking social aparecerá aquí."
      />
    );
  }

  if (!entries.length) {
    return (
      <EmptyState
        title="No hay posiciones disponibles"
        description="Todavía no hay datos suficientes para construir el ranking."
      />
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentUser = currentUserId === entry.userId;

        return (
          <article
            key={`${entry.userId}-${entry.position}`}
            className={`rounded-3xl border-2 px-5 py-4 shadow-sm ${
              isCurrentUser ? "border-mh-green/25 bg-mh-green/8" : "border-mh-dark/5 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    positionClasses[index] ?? "bg-mh-dark/10 text-mh-dark"
                  }`}
                >
                  {entry.position}
                </span>
                <div>
                  <p className="font-display text-xl font-extrabold text-mh-dark">
                    {entry.name} {isCurrentUser ? <span className="text-sm text-mh-green">(Tú)</span> : null}
                  </p>
                  <p className="text-sm text-mh-dark/55">
                    Nivel {entry.level} · {entry.league}
                  </p>
                </div>
              </div>
              <p className="font-display text-2xl font-extrabold text-mh-dark">
                {entry.totalXp.toLocaleString("es-HN")} XP
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
