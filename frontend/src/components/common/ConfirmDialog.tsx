import GameButton from "@/components/GameButton";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mh-dark/45 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="font-display text-2xl font-extrabold text-mh-dark">{title}</h3>
        <p className="mt-3 text-sm text-mh-dark/60">{description}</p>
        <div className="mt-6 flex gap-3">
          <GameButton
            type="button"
            variant="gold"
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </GameButton>
          <GameButton type="button" variant="outline" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
