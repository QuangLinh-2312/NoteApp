import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  XCircle,
} from "lucide-react";

const AppDialogContext = createContext(null);

const VARIANT_ALERT = {
  info: {
    Icon: Info,
    iconWrap: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  success: {
    Icon: CheckCircle2,
    iconWrap: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  error: {
    Icon: XCircle,
    iconWrap: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrap: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
};

export function AppDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const alert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: "alert",
        title: options.title ?? "Thông báo",
        message: String(message),
        variant: options.variant ?? "info",
        onClose: () => {
          setDialog(null);
          resolve();
        },
      });
    });
  }, []);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        type: "confirm",
        title: options.title ?? "Xác nhận",
        message: String(message),
        danger: !!options.danger,
        confirmLabel: options.confirmLabel ?? "Xác nhận",
        cancelLabel: options.cancelLabel ?? "Hủy",
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const value = { alert, confirm };

  return (
    <AppDialogContext.Provider value={value}>
      {children}
      {dialog ? <AppDialogModal dialog={dialog} /> : null}
    </AppDialogContext.Provider>
  );
}

function AppDialogModal({ dialog }) {
  const isAlert = dialog.type === "alert";
  const variantKey =
    isAlert && VARIANT_ALERT[dialog.variant] ? dialog.variant : "info";
  const { Icon, iconWrap } = VARIANT_ALERT[variantKey];
  const ConfirmIcon = dialog.danger ? AlertTriangle : HelpCircle;
  const confirmIconWrap = dialog.danger
    ? "bg-red-500/15 text-red-600 dark:text-red-400"
    : "bg-violet-500/15 text-violet-600 dark:text-violet-400";

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (isAlert) dialog.onClose?.();
        else dialog.onCancel?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [dialog, isAlert]);

  const handleBackdrop = () => {
    if (isAlert) dialog.onClose?.();
    else dialog.onCancel?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
      aria-describedby="app-dialog-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={handleBackdrop}
        aria-label="Đóng"
      />
      <div
        className="relative w-full max-w-md rounded-3xl border border-gray-200/80 dark:border-gray-600/80 bg-white dark:bg-gray-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7">
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isAlert ? iconWrap : confirmIconWrap
              }`}
            >
              {isAlert ? (
                <Icon className="h-6 w-6" strokeWidth={2} />
              ) : (
                <ConfirmIcon className="h-6 w-6" strokeWidth={2} />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id="app-dialog-title"
                className="text-lg font-bold text-gray-900 dark:text-white leading-snug"
              >
                {dialog.title}
              </h2>
              <p
                id="app-dialog-desc"
                className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed"
              >
                {dialog.message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isAlert ? (
              <button
                type="button"
                onClick={dialog.onClose}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-all"
              >
                Đã hiểu
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={dialog.onCancel}
                  className="w-full sm:w-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-colors"
                >
                  {dialog.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={dialog.onConfirm}
                  className={`w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 transition-all ${
                    dialog.danger
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus-visible:ring-red-500"
                      : "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus-visible:ring-blue-500"
                  }`}
                >
                  {dialog.confirmLabel}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function useAppDialog() {
  const ctx = useContext(AppDialogContext);
  if (!ctx) {
    throw new Error("useAppDialog must be used within AppDialogProvider");
  }
  return ctx;
}
