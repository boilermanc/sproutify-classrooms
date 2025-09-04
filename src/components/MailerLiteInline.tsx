// src/components/MailerLiteInline.tsx
import { useEffect, useId, useMemo, useRef, useState } from "react";

type Props = {
  /** Your MailerLite token, e.g. "pk_xxxxxxxx..." (a.k.a. accountId) */
  accountId: string | undefined;
  /** The EMBED form id from MailerLite (new ML looks like a random string) */
  formId: string;
  /** Optional className for outer container */
  className?: string;
};

/**
 * Safe, idempotent MailerLite embed for React/Vite.
 * - Injects the universal script once
 * - Handles SSR/strict mode double-mount
 * - Shows clear fallback when env var is missing
 */
export default function MailerLiteInline({ accountId, formId, className }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scriptId = useMemo(() => "ml-universal", []);
  const uniqueId = useId(); // ensures unique wrapper id in case of multiple forms

  useEffect(() => {
    if (!accountId) {
      setError("Missing MailerLite account token (VITE_MAILERLITE_ACCOUNT).");
      return;
    }

    // 1) Create global ml() queue if needed
    const w = window as any;
    if (!w.ml) {
      const ml = function (...args: any[]) {
        (ml as any).q = (ml as any).q || [];
        (ml as any).q.push(args);
      };
      (w as any).ml = ml;
    }

    // 2) Add universal script once
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!existing) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://assets.mailerlite.com/js/universal.js";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-token", accountId);
      s.onload = () => setReady(true);
      s.onerror = () => setError("Failed to load MailerLite script.");
      document.head.appendChild(s);
    } else {
      // If already present but not yet “ready”, we can still proceed —
