"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import AchievementsPanel from "@/components/achievements/AchievementsPanel";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import * as achievementsService from "@/services/achievements.service";
import type { Achievement } from "@/types/domain";

type AchievementFilter = "all" | "unlocked" | "locked";

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<AchievementFilter>("all");

  useEffect(() => {
    let isMounted = true;

    async function loadAchievements() {
      try {
        const response = await achievementsService.getAchievements(
          filter === "all" ? undefined : filter === "unlocked"
        );

        if (isMounted) {
          const nextAchievements =
            filter === "locked" ? response.filter((achievement) => !achievement.unlocked) : response;

          setAchievements(nextAchievements);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los logros.");
          setLoading(false);
        }
      }
    }

    void loadAchievements();

    return () => {
      isMounted = false;
    };
  }, [filter]);

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando logros..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Logros"
          description="Diferencia visual entre logros bloqueados y desbloqueados usando el backend real."
        />

        <div className="flex flex-wrap gap-3">
          {(["all", "unlocked", "locked"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                filter === value ? "bg-mh-green text-white" : "bg-white text-mh-dark/60"
              }`}
            >
              {value === "all" ? "Todos" : value === "unlocked" ? "Desbloqueados" : "Bloqueados"}
            </button>
          ))}
        </div>

        {error ? <ErrorAlert message={error} /> : null}

        <AchievementsPanel achievements={achievements} />
      </div>
    </ProtectedPage>
  );
}
