import { useEffect, useState } from "react";

export function useMailerLite(accountId: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = "mailerlite-universal";
    const existing = document.getElementById(id) as HTMLScriptElement | null;

    const onLoad = () => setReady(true);

    if (existing) {
      if (existing.getAttribute("data-account") !== accountId) {
        existing.setAttribute("data-account", accountId);
      }
      if ((existing as any).dataset.loaded === "true") {
        setReady(true);
      } else {
        existing.addEventListener("load", onLoad, { once: true });
      }
      return () => existing.removeEventListener("load", onLoad);
    }

    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.src = "https://assets.mailerlite.com/js/universal.js";
    s.setAttribute("data-account", accountId);
    s.addEventListener("load", () => {
      (s as any).dataset.loaded = "true";
      onLoad();
    });
    document.body.appendChild(s);

    return () => s.removeEventListener("load", onLoad);
  }, [accountId]);

  return ready;
}
