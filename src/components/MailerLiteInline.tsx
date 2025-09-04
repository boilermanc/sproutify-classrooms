import React from "react";

/**
 * Zero-JS MailerLite form (direct POST to JSONP endpoint).
 * - Uses your account id: 829365
 * - Uses your form numeric id: 164107087019771240
 * - Opens ML confirmation in a new tab (target="_blank")
 *
 * If you ever change forms in MailerLite, update ACCOUNT_ID / FORM_ID below.
 */
const ACCOUNT_ID = "829365";
const FORM_ID = "164107087019771240";

export default function MailerLiteNoScript({ className = "" }: { className?: string }) {
  const action = `https://assets.mailerlite.com/jsonp/${ACCOUNT_ID}/forms/${FORM_ID}/subscribe`;

  return (
    <form
      action={action}
      method="post"
      target="_blank"
      className={`space-y-4 ${className}`}
      aria-label="Subscribe to Sproutify School updates"
    >
      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="ml-email" className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="ml-email"
          name="fields[email]"
          type="email"
          required
          autoComplete="email"
          placeholder="you@school.org"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* First name */}
      <div className="space-y-1">
        <label htmlFor="ml-name" className="text-sm font-medium">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          id="ml-name"
          name="fields[name]"
          type="text"
          required
          autoComplete="given-name"
          placeholder="Alex"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* School name */}
      <div className="space-y-1">
        <label htmlFor="ml-school" className="text-sm font-medium">
          School Name <span className="text-red-500">*</span>
        </label>
        <input
          id="ml-school"
          name="fields[school_name]"
          type="text"
          required
          placeholder="Riverdale High"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {/* Optional consent (not required by endpoint unless the form enforces it) */}
      <div className="flex items-start gap-2">
        <input id="ml-consent" type="checkbox" defaultChecked className="mt-1" />
        <label htmlFor="ml-consent" className="text-sm text-muted-foreground">
          I’d like updates about educational resources and early access opportunities.
        </label>
      </div>

      {/* Hidden inputs ML expects */}
      <input type="hidden" name="ml-submit" value="1" />
      <input type="hidden" name="anticsrf" value="true" />

      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white text-sm font-medium">
        Subscribe
      </button>

      {/* Small note about new tab behavior */}
      <p className="text-xs text-muted-foreground">
        You’ll be redirected to a MailerLite confirmation page in a new tab.
      </p>
    </form>
  );
}
