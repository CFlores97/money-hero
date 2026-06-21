"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BadgeInfo, Save } from "lucide-react";
import ProtectedPage from "@/components/ProtectedPage";
import GameButton from "@/components/GameButton";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import { emitDataSync } from "@/lib/data-events";
import { formatDateTime } from "@/lib/formatters";
import { setCurrentUser } from "@/lib/session";
import { ApiClientError } from "@/lib/api";
import * as usersService from "@/services/users.service";
import type { UserProfile } from "@/types/domain";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await usersService.getMe();
        if (isMounted) {
          setProfile(response);
          setName(response.name);
          setAvatar(response.avatar ?? "");
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil.");
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile?.name) {
      return "MH";
    }

    return profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [profile?.name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const updatedProfile = await usersService.updateMe({
        name: name.trim(),
        avatar: avatar.trim() || null,
      });

      setProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      emitDataSync();
    } catch (submissionError) {
      setError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo actualizar el perfil."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando perfil..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Perfil"
          description="Consulta tu usuario actual y actualiza los campos que realmente soporta el backend."
        />

        {error ? <ErrorAlert message={error} /> : null}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1f8a4c,#ffc933)] text-4xl font-black text-white">
              {initials}
            </div>
            <h2 className="mt-5 text-center font-display text-3xl font-extrabold text-mh-dark">
              {profile?.name}
            </h2>
            <p className="mt-1 text-center text-sm text-mh-dark/55">{profile?.email}</p>

            <div className="mt-6 rounded-3xl bg-mh-cream px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Creado</p>
              <p className="mt-2 text-sm font-semibold text-mh-dark">
                {profile ? formatDateTime(profile.createdAt) : ""}
              </p>
            </div>

            <div className="mt-4 rounded-3xl bg-mh-cream px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-mh-dark/45">Avatar</p>
              <p className="mt-2 text-sm text-mh-dark/60">
                {profile?.avatar ? "Configurado mediante URL" : "No configurado"}
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border-2 border-mh-dark/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-mh-lime/20 p-3 text-mh-green">
                <BadgeInfo size={22} />
              </div>
              <div>
                <h2 className="font-display text-3xl font-extrabold text-mh-dark">Editar perfil</h2>
                <p className="text-sm text-mh-dark/55">Campos soportados: nombre y avatar.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">Nombre</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                  URL de avatar
                </span>
                <input
                  type="url"
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-2xl border-2 border-mh-dark/10 px-4 py-3 text-sm outline-none focus:border-mh-green"
                />
              </label>

              <GameButton type="submit" variant="primary" className="w-full" disabled={isSaving}>
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </GameButton>
            </form>
          </article>
        </section>
      </div>
    </ProtectedPage>
  );
}
