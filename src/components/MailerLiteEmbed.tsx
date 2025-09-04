// src/components/MailerLiteEmbed.tsx
import { useEffect, useRef } from "react";

const ML_SRC = "https://assets.mailerlite.com/js/universal.js";
const ML_ACCOUNT = "829365";

type Props = {
  formId: string;      // e.g., "C39UIG"
  inline?: boolean;    // inline form vs modal trigger
};

export default function MailerLiteEmbed({ formId, inline = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as any;

    const loadScriptIfNeeded = () =>
      new Promise<void>((resolve) => {
        // If ml already exists, just ensure account is set and resolve
        if (w.ml && typeof w.ml === "function") {
          try { w.ml("account", ML_ACCOUNT); } catch {}
          return resolve();
        }
        // Check if script tag already present
        const existing = Array.from(document.scripts).find((s) => s.src?.startsWith(ML_SRC));
        if (existing) {
          existing.addEventListener("load", () => {
            try { w.ml?.("account", ML_ACCOUNT); } catch {}
            resolve();
          });
          return;
        }
        // Inject script
        const s = document.createElement("script");
        s.src = ML_SRC;
        s.async = true;
        s.onload = () => {
          try { w.ml?.("account", ML_ACCOUNT); } catch {}
          resolve();
        };
        document.body.appendChild(s);
      });

    const rescan = () => {
      const w = window as any;
      // MailerLite doesn’t document a public rescan, but this works in practice:
      try {
        // This prompts the script to (re)hydrate inline embeds on SPA routes.
        w.ml && w.ml("forms", "load");
      } catch {
        // No-op; if ML doesn’t expose 'forms:load' we still have the inline div present.
      }
    };

    // Ensure the container placeholder exists
    if (ref.current && inline) {
      ref.current.innerHTML = `<div class="ml-embedded" data-form="${formId}"></div>`;
    }

    loadScriptIfNeeded().then(() => {
      // Give the script a moment to attach MutationObservers, then rescan
      setTimeout(rescan, 50);
    });
  }, [formId, inline]);

  if (!inline) {
    return (
      <button
        className="ml-onclick-form w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => (window as any).ml?.("show", formId, true)}
      >
        Join Our Educator Community
      </button>
    );
  }

  return <div ref={ref} className="max-w-md mx-auto" />;
}
