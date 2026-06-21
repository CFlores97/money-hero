interface LoadingStateProps {
  label?: string;
}

export default function LoadingState({ label = "Cargando..." }: LoadingStateProps) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-mh-dark/10 bg-white/70 px-6 py-12 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-mh-green/20 border-t-mh-green" />
      <p className="mt-4 text-sm font-semibold text-mh-dark/55">{label}</p>
    </div>
  );
}
