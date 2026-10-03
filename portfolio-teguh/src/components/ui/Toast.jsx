import { useEffect } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
    },
    error: {
      icon: XCircle,
      iconClass: "text-red-500",
    },
    info: {
      icon: Info,
      iconClass: "text-primary",
    },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <div
      className="
        fixed
        left-1/2
        top-1/2
        z-[9999]
        -translate-x-1/2
        -translate-y-1/2
        px-4
      "
    >
      <div
        className="
          flex
          min-w-[280px]
          max-w-[420px]
          items-center
          gap-4
          rounded-3xl
          border
          border-border
          bg-card
          px-5
          py-4
          shadow-2xl
          backdrop-blur-xl
        "
      >
        <Icon size={24} strokeWidth={2} className={`shrink-0 ${current.iconClass}`} />

        <p className="flex-1 text-sm font-medium text-foreground">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="
            inline-flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            text-muted-foreground
            transition-colors
            hover:bg-secondary
            hover:text-foreground
          "
          title="Tutup"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
