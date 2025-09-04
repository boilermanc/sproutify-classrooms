import { useMailerLite } from "@/lib/useMailerLite";

type Props = {
  accountId: string;
  formId: string;   // your form code, e.g. "C39UIG"
};

export default function MailerLiteInline({ accountId, formId }: Props) {
  const ready = useMailerLite(accountId);

  return (
    <div>
      <div className="ml-embedded" data-form={formId} />
      {!ready && (
        <p className="text-sm text-muted-foreground mt-2">Loading form…</p>
      )}
      <noscript>Please enable JavaScript to view the signup form.</noscript>
    </div>
  );
}
