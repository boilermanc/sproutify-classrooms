import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpCenter() {
  return (
    <div className="container max-w-3xl py-8">
      <SEO title="Help Center | Sproutify School" description="How to invite students, use Kiosk Mode, and manage your garden." canonical="/app/help" />
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Help Center</h1>
      </header>

      <Card id="invite-students" className="mb-6">
        <CardHeader>
          <CardTitle>Invite Students</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Go to Classrooms and create your class (set a Kiosk PIN).</li>
            <li>Click Generate to create a Join Code for the class.</li>
            <li>Open Kiosk Mode and have students enter their name and the Join Code.</li>
            <li>Codes can be disabled any time and new ones generated.</li>
          </ol>
        </CardContent>
      </Card>

      <Card id="kiosk-mode" className="mb-6">
        <CardHeader>
          <CardTitle>Kiosk Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Open Kiosk Mode from the Classrooms page.</li>
            <li>Keep the teacher account signed in on the kiosk device.</li>
            <li>Students enter name + Join Code to be added to the class.</li>
            <li>Use short, readable codes for faster entry (e.g., 6 characters).</li>
          </ul>
        </CardContent>
      </Card>

      <Card id="join-codes">
        <CardHeader>
          <CardTitle>Join Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Only active codes work. Generating a new code disables previous ones.</li>
            <li>Click Copy to share a code in class or on a board.</li>
            <li>Disable codes when you’re done enrolling students.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
