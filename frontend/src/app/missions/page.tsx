"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import { emitDataSync } from "@/lib/data-events";
import { ApiClientError } from "@/lib/api";
import MissionsPanel from "@/components/missions/MissionsPanel";
import * as missionsService from "@/services/missions.service";
import type { Mission, MissionFrequency, MissionStatus } from "@/types/domain";

type MissionsFilter = "all" | MissionFrequency;
type MissionsStatusFilter = "all" | MissionStatus;

export default function MissionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [frequencyFilter, setFrequencyFilter] = useState<MissionsFilter>("all");
  const [statusFilter, setStatusFilter] = useState<MissionsStatusFilter>("all");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMissions() {
      try {
        const response = await missionsService.getMissions({
          frequency: frequencyFilter === "all" ? undefined : frequencyFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        });

        if (isMounted) {
          setMissions(response);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las misiones.");
          setLoading(false);
        }
      }
    }

    void loadMissions();

    return () => {
      isMounted = false;
    };
  }, [frequencyFilter, statusFilter]);

  async function handleClaim(missionId: string) {
    setClaimingId(missionId);
    setError(null);

    try {
      await missionsService.completeMission(missionId);
      setMissions((current) =>
        current.map((mission) =>
          mission.id === missionId ? { ...mission, status: "claimed" } : mission
        )
      );
      emitDataSync();
    } catch (claimError) {
      setError(
        claimError instanceof ApiClientError
          ? claimError.message
          : "No se pudo reclamar la misión."
      );
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando misiones..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Misiones"
          description="Retos activos y completados usando los datos reales disponibles en el backend."
        />

        <div className="flex flex-wrap gap-3">
          {(["all", "daily", "weekly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFrequencyFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                frequencyFilter === value ? "bg-mh-green text-white" : "bg-white text-mh-dark/60"
              }`}
            >
              {value === "all" ? "Todas" : value === "daily" ? "Diarias" : "Semanales"}
            </button>
          ))}
          {(["all", "active", "completed", "claimed"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                statusFilter === value ? "bg-mh-gold text-mh-black" : "bg-white text-mh-dark/60"
              }`}
            >
              {value === "all" ? "Todos los estados" : value}
            </button>
          ))}
        </div>

        {error ? <ErrorAlert message={error} /> : null}

        <MissionsPanel
          missions={missions}
          claimingId={claimingId}
          onClaim={(id) => void handleClaim(id)}
        />
      </div>
    </ProtectedPage>
  );
}
