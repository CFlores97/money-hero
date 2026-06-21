"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { getToken } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/dashboard" : "/login");
  }, [router]);

  return <LoadingState label="Preparando tu ruta de acceso..." />;
}
