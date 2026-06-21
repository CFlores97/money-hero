"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Zap } from "lucide-react";
import GameButton from "@/components/GameButton";
import ErrorAlert from "@/components/common/ErrorAlert";
import { ApiClientError } from "@/lib/api";
import { setCurrentUser, setToken } from "@/lib/session";
import * as authService from "@/services/auth.service";

function validateRegister(name: string, email: string, password: string) {
  if (!name.trim()) {
    return "El nombre es obligatorio.";
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return "Ingresa un correo válido.";
  }

  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateRegister(name, email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { token, user } = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setToken(token);
      setCurrentUser(user);
      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof ApiClientError
          ? submissionError.message
          : "No se pudo crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full">
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border-2 border-mh-dark/5 bg-white/95 p-6 shadow-2xl shadow-mh-dark/30 backdrop-blur-sm sm:p-10 lg:translate-y-16 lg:-translate-x-16">
          <h2 className="text-center font-display text-3xl font-extrabold text-mh-dark">
            Crea tu héroe
          </h2>
          <p className="mt-1 text-center text-sm text-mh-dark/60">
            Regístrate y comienza tu aventura financiera.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                Nombre de héroe
              </span>
              <div className="flex items-center gap-2 rounded-xl border-2 border-mh-dark/10 px-4 py-3 transition-colors focus-within:border-mh-green">
                <User size={18} className="text-mh-dark/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                  minLength={2}
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-mh-dark/50">
                Correo electrónico
              </span>
              <div className="flex items-center gap-2 rounded-xl border-2 border-mh-dark/10 px-4 py-3 transition-colors focus-within:border-mh-green">
                <Mail size={18} className="text-mh-dark/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full bg-transparent text-sm outline-none"
                  required
                  minLength={8}
                />
              </div>
            </label>

            {error ? <ErrorAlert message={error} /> : null}

            <GameButton type="submit" variant="primary" className="mt-2 w-full" disabled={loading}>
              <Zap size={18} /> {loading ? "Creando héroe..." : "Crear cuenta"}
            </GameButton>
          </form>

          <p className="mt-6 text-center text-sm text-mh-dark/60">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-bold text-mh-green hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
