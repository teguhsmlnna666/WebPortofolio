import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({ open, title = "Konfirmasi", message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <AlertTriangle size={22} className="text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <p className="mt-5 text-sm font-medium leading-6 text-foreground/80">{message}</p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
