"use client";

export function FullWidthModalStyles() {
  return (
    <style>{`
      @keyframes fw-alert-in {
        from { opacity: 0; transform: translateY(-16px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes fw-alert-out {
        from { opacity: 1; }
        to   { opacity: 0; }
      }
      @keyframes fw-alert-backdrop-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes fw-alert-backdrop-out {
        from { opacity: 1; }
        to   { opacity: 0; }
      }
      dialog.fw-alert-open {
        animation: fw-alert-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      dialog.fw-alert-closing {
        animation: fw-alert-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
      }
      dialog.fw-alert-open::backdrop {
        animation: fw-alert-backdrop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      dialog.fw-alert-closing::backdrop {
        animation: fw-alert-backdrop-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        dialog.fw-alert-open,
        dialog.fw-alert-closing,
        dialog.fw-alert-open::backdrop,
        dialog.fw-alert-closing::backdrop {
          animation: none;
        }
      }
    `}</style>
  );
}
