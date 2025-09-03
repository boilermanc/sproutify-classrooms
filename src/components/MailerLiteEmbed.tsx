import { useEffect, useRef } from "react";

type Props = {
  formId: string;     // e.g. "C39UIG"
  inline?: boolean;   // inline form vs. open-on-click
};

export default function MailerLiteEmbed({ formId, inline = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the script loaded before this component mounts, ML will auto-initialize.
    // If not, the ML script will init after downloading and hydrate the div below.
    // No extra work needed here.
  }, []);

  return (
    <div className="max-w-md mx-auto">
      {inline ? (
        <div className="ml-embedded" data-form={formId} ref={ref} />
      ) : (
        <button
          className="ml-onclick-form w-full"
          onClick={() => (window as any).ml?.('show', formId, true)}
        >
          Join Our Educator Community
        </button>
      )}
    </div>
  );
}
