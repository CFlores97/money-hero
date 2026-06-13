"use client";

import type { FormEvent } from "react";
import Image from "next/image";
import { Lock, Mail, Trophy, Zap } from "lucide-react";
import GameButton from "@/components/GameButton";

const DEMO_USER_KEY = "moneyhero_demo_user";

export default function LoginPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleDemoLogin() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_USER_KEY, "true");
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Full-screen background image */}
      <Image
        src="/MoneyHeroImage.png"
        alt="MoneyHero - Gestor financiero personal gamificado"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-[center_15%]"
      />
      <div className="absolute inset-0 bg-mh-dark/10" />

      {/* Login card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border-2 border-mh-dark/5 bg-white/95 p-6 shadow-2xl shadow-mh-dark/30 backdrop-blur-sm sm:p-10 lg:translate-y-16 lg:-translate-x-16">
          <h2 className="text-center font-display text-3xl font-extrabold text-mh-dark">
            ¡Bienvenido, héroe!
          </h2>
          <p className="mt-1 text-center text-sm text-mh-dark/60">
            Inicia sesión y continúa tu aventura financiera.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                Correo electrónico
              </span>
              <div className="flex items-center gap-2 rounded-xl border-2 border-mh-dark/10 px-4 py-3 transition-colors focus-within:border-mh-green">
                <Mail size={18} className="text-mh-dark/40" />
                <input
                  type="email"
                  placeholder="heroe@moneyhero.com"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                Contraseña
              </span>
              <div className="flex items-center gap-2 rounded-xl border-2 border-mh-dark/10 px-4 py-3 transition-colors focus-within:border-mh-green">
                <Lock size={18} className="text-mh-dark/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                />
              </div>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 text-mh-dark/60">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-mh-dark/20 accent-mh-green"
                />
                Recordarme
              </label>
              <a href="#" className="font-semibold text-mh-green hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <GameButton type="submit" variant="primary" className="mt-2 w-full">
              <Zap size={18} /> Iniciar sesión
            </GameButton>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-mh-dark/10" />
            <span className="text-xs font-bold uppercase text-mh-dark/40">o</span>
            <div className="h-px flex-1 bg-mh-dark/10" />
          </div>

          <GameButton
            variant="gold"
            href="/dashboard"
            onClick={handleDemoLogin}
            className="w-full"
          >
            <Trophy size={18} /> Entrar como héroe de prueba
          </GameButton>

          <p className="mt-6 text-center text-sm text-mh-dark/60">
            ¿No tienes cuenta?{" "}
            <a href="#" className="font-bold text-mh-green hover:underline">
              Crea tu héroe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
