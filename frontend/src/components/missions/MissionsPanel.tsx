"use client";

import GameButton from "@/components/GameButton";
import EmptyState from "@/components/common/EmptyState";
import type { Mission } from "@/types/domain";

interface MissionsPanelProps {
  missions: Mission[];
  claimUnavailable?: boolean;
  claimingId?: string | null;
  onClaim?: (id: string) => void;
}

const frequencyLabels: Record<Mission["frequency"], string> = {
  daily: "Diaria",
  weekly: "Semanal",
};

const statusLabels: Record<Mission["status"], string> = {
  active: "Activa",
  completed: "Lista para reclamar",
  claimed: "Reclamada",
};

export default function MissionsPanel({
  missions,
  claimUnavailable = false,
  claimingId = null,
  onClaim,
}: MissionsPanelProps) {
  if (!missions.length) {
    return (
      <EmptyState
        title="No hay misiones vigentes"
        description="Cuando el backend genere nuevas misiones activas aparecerán aquí."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {missions.map((mission) => (
        <article
          key={mission.id}
          className="rounded-3xl border-2 border-mh-dark/5 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-mh-green/10 px-3 py-1 text-xs font-bold uppercase text-mh-green">
              {frequencyLabels[mission.frequency] ?? mission.frequency}
            </span>
            <span className="rounded-full bg-mh-gold/15 px-3 py-1 text-xs font-bold text-amber-700">
              +{mission.xpReward} XP
            </span>
          </div>

          <h3 className="mt-4 font-display text-2xl font-extrabold text-mh-dark">{mission.title}</h3>
          <p className="mt-2 text-sm text-mh-dark/60">{mission.description}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-mh-cream px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-mh-dark/40">Estado</dt>
              <dd className="mt-1 font-semibold text-mh-dark">{statusLabels[mission.status]}</dd>
            </div>
            <div className="rounded-2xl bg-mh-cream px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-mh-dark/40">Progreso</dt>
              <dd className="mt-1 font-semibold text-mh-dark">{mission.progress}</dd>
            </div>
            <div className="rounded-2xl bg-mh-cream px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-mh-dark/40">Condición</dt>
              <dd className="mt-1 font-semibold text-mh-dark">{mission.conditionType}</dd>
            </div>
            <div className="rounded-2xl bg-mh-cream px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-wide text-mh-dark/40">Vence</dt>
              <dd className="mt-1 font-semibold text-mh-dark">{mission.expiresAt.slice(0, 10)}</dd>
            </div>
          </dl>

          {mission.status === "completed" ? (
            <div className="mt-5">
              <GameButton
                type="button"
                variant="gold"
                className="w-full"
                disabled={claimUnavailable}
                onClick={onClaim ? () => onClaim(mission.id) : undefined}
              >
                {claimingId === mission.id ? "Reclamando..." : "Reclamar recompensa"}
              </GameButton>
              {claimUnavailable ? (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  El backend actual no expone todavía la ruta HTTP para reclamar esta misión.
                </p>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
