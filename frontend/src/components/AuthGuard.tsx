"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { getToken } from "@/lib/session";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      setIsReady(true);
      return;
    }

    setIsAllowed(true);
    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return <LoadingState label="Validando sesión..." />;
  }

  if (!isAllowed) {
    return <LoadingState label="Redirigiendo al inicio de sesión..." />;
  }

  return <>{children}</>;
}
