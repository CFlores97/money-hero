"use client";

import type { ReactNode } from "react";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { getToken } from "@/lib/session";

interface AuthGuardProps {
  children: ReactNode;
}

const serverAuthState = {
  checked: false,
  token: null as string | null,
};

let clientAuthState = serverAuthState;

function subscribe() {
  return () => undefined;
}

function getClientSnapshot() {
  const token = getToken();

  if (clientAuthState.checked && clientAuthState.token === token) {
    return clientAuthState;
  }

  clientAuthState = {
    checked: true,
    token,
  };

  return clientAuthState;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const authState = useSyncExternalStore(subscribe, getClientSnapshot, () => serverAuthState);

  useEffect(() => {
    if (authState.checked && !authState.token) {
      router.replace("/login");
    }
  }, [authState, router]);

  if (!authState.checked) {
    return <LoadingState label="Validando sesión..." />;
  }

  if (!authState.token) {
    return <LoadingState label="Abriendo tu acceso..." />;
  }

  return <>{children}</>;
}
