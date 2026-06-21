import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";

interface ProtectedPageProps {
  children: ReactNode;
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
