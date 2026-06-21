"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import RankingPanel from "@/components/ranking/RankingPanel";
import { getCurrentUser } from "@/lib/session";
import * as rankingService from "@/services/ranking.service";
import type { RankingResponse } from "@/types/domain";

type RankingScope = "global" | "friends";

export default function RankingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<RankingScope>("global");
  const [ranking, setRanking] = useState<RankingResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRanking() {
      try {
        const response =
          scope === "global"
            ? await rankingService.getGlobalRanking(20)
            : await rankingService.getFriendsRanking();

        if (isMounted) {
          setRanking(response);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ranking.");
          setLoading(false);
        }
      }
    }

    void loadRanking();

    return () => {
      isMounted = false;
    };
  }, [scope]);

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando ranking..." />
      </ProtectedPage>
    );
  }

  const currentUserId = getCurrentUser()?.id;
  const shouldShowFriendsEmpty = scope === "friends" && (ranking?.data.length ?? 0) <= 1;

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Ranking"
          description="Compara tu progreso con el ranking global o con tu círculo de amistades."
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setScope("global")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              scope === "global" ? "bg-mh-green text-white" : "bg-white text-mh-dark/60"
            }`}
          >
            Global
          </button>
          <button
            type="button"
            onClick={() => setScope("friends")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              scope === "friends" ? "bg-mh-gold text-mh-black" : "bg-white text-mh-dark/60"
            }`}
          >
            Amigos
          </button>
        </div>

        {error ? <ErrorAlert message={error} /> : null}

        <RankingPanel
          entries={ranking?.data ?? []}
          currentUserId={currentUserId}
          showFriendsEmptyState={shouldShowFriendsEmpty}
        />
      </div>
    </ProtectedPage>
  );
}
