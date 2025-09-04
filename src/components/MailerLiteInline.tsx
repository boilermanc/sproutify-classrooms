// src/components/MailerLiteNoScript.tsx
import React from "react";

/**
 * A zero-JavaScript MailerLite form that posts directly to MailerLite.
 * - No script tags, no env vars required.
 * - Opens the MailerLite confirmation/thank-you in a new tab.
 */
export default function MailerLiteNoScript() {
  return (
    <form
      action="https://assets.mailerlite.com/jsonp/829365/forms/164107087019771240/subscribe"
      method="post"
      target="_blank"
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="ml-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="ml-email"
          type="email"
          name="fields[email]"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ml-name" className="text-sm font-medium">
          First Name
        </label>
        <input
          id="ml-name"
          type="text"
          name="fields[name]"
          placeholder="First name"
          autoComplete="given-name"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ml-school" className="text-sm font-medium">
          School Name
        </label>
        <input
          id="ml-school"
          type="text"
          name="fields[school_name]"
          placeholder="Your school"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="ml-optin"
          type="checkbox"
          // MailerLite’s no-script markup didn’t include a name for this box,
          // so it’s informational only. Keep it required for UX.
          required
          className="mt-1 h-4 w-4"
        />
        <label htmlFor="ml-optin" className="text-sm text-muted-foreground">
          I’m interested in receiving updates about educational resources and early access opportunities.
        </label>
      </div>

      {/* Required hidden inputs for the MailerLite endpoint */}
      <input type="hidden" name="ml-submit" value="1" />
      <input type="hidden" name="anticsrf" value="true" />

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Subscribe
      </button>

      <p className="text-xs text-muted-foreground">
        We’ll keep you updated on Sproutify School and notify you when our educational platform is ready for classrooms.
      </p>
    </form>
  );
}
