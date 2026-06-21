"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Zap } from "lucide-react";
import GameButton from "@/components/GameButton";
import ErrorAlert from "@/components/common/ErrorAlert";
import { ApiClientError } from "@/lib/api";
import { setCurrentUser, setToken } from "@/lib/session";
import * as authService from "@/services/auth.service";

function validateLogin(email: string, password: string) {
  if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
    return "Ingresa un correo válido.";
  }

  if (!password.trim()) {
    return "La contraseña es obligatoria.";
  }

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login({
        email: email.trim(),
        password,
      });

      setToken(response.token);
      setCurrentUser(response.user);
      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/MoneyHeroImage.png"
        alt="MoneyHero"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,33,24,0.35),rgba(12,33,24,0.15))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-white/35 bg-white/92 p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <p className="font-comic text-4xl text-mh-green">MoneyHero</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-mh-dark">
              Regresa a tu partida
            </h1>
            <p className="mt-2 text-sm text-mh-dark/60">
              Inicia sesión para seguir tu progreso financiero real.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                Correo electrónico
              </span>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-mh-dark/10 bg-white px-4 py-3 focus-within:border-mh-green">
                <Mail size={18} className="text-mh-dark/35" />
                <input
                  aria-label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="heroe@moneyhero.com"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-mh-dark/45">
                Contraseña
              </span>
              <div className="flex items-center gap-2 rounded-2xl border-2 border-mh-dark/10 bg-white px-4 py-3 focus-within:border-mh-green">
                <Lock size={18} className="text-mh-dark/35" />
                <input
                  aria-label="Contraseña"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </label>

            {error ? <ErrorAlert message={error} /> : null}

            <GameButton type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              <Zap size={18} />
              {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
            </GameButton>
          </form>

          <p className="mt-6 text-center text-sm text-mh-dark/60">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="font-bold text-mh-green hover:underline">
              Crea tu héroe
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
