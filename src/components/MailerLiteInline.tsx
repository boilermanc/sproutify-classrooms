// src/components/MailerLiteInline.tsx
import { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  /** Either your numeric account id "829365" OR a token like "pk_..." */
  accountId?: string;
  /** The embedded form id, e.g. "C39UIG" */
  formId: string;
  className?: string;
};

export default function MailerLiteInline({ accountId, formId, className }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uniqueId = useId();
  const scriptId = useMemo(() => "ml-universal", []);

  useEffect(() => {
    if (!accountId) {
      setError("Missing MailerLite account id (numeric like 829365 or a pk_ token).");
      return;
    }

    // Create global ml() queue once
    const w = window as any;
    if (!w.ml) {
      const ml = function (...args: any[]) {
        (ml as any).q = (ml as any).q || [];
        (ml as any).q.push(args);
      };
      (w as any).ml = ml;
    }

    // Inject the universal script once
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://assets.mailerlite.com/js/universal.js";
      script.async = true;
      script.defer = true;

      // If it's a token (starts with pk_), MailerLite wants data-token attr
      if (accountId.startsWith("pk_")) {
        script.setAttribute("data-token", accountId);
      }

      script.onload = () => {
        // If it's a numeric account id, initialize via ml('account', '123456')
        if (!accountId.startsWith("pk_")) {
          (window as any).ml?.("account", accountId);
        }
        setReady(true);
      };
      script.onerror = () => setError("Failed to load MailerLite script.");
      document.head.appendChild(script);
    } else {
      // Script already present; ensure numeric account is set
      if (!accountId.startsWith("pk_")) {
        (window as any).ml?.("account", accountId);
      }
      setReady(true);
    }
  }, [accountId, scriptId]);

  // Ask ML to (re)hydrate this embedded form when ready
  useEffect(() => {
    if (!ready || !accountId || !containerRef.current) return;
    const target = containerRef.current.querySelector(".ml-embedded") as HTMLElement | null;
    if (!target) return;

    target.setAttribute("data-form", formId);
    try {
      (window as any).ml?.("refresh"); // harmless if not supported
    } catch {
      /* no-op */
    }
  }, [ready, accountId, formId]);

  if (error) {
    return (
      <div className={`rounded-md border p-4 text-sm ${className ?? ""}`}>
        <div className="font-medium mb-1">MailerLite not configured</div>
        <div className="text-muted-foreground">{error}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {/* This is what the universal script hydrates */}
      <div id={`ml-wrapper-${uniqueId}`} className="ml-embedded" data-form={formId} />
    </div>
  );
}
