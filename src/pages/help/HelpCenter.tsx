// src/pages/help/HelpCenter.tsx - Updated for new student management system

import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpCenter() {
  return (
    <div className="container max-w-3xl py-8">
      <SEO title="Help Center | Sproutify School" description="How to manage students, use Kiosk Mode, and track your garden." canonical="/app/help" />
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Help Center</h1>
      </header>

      <Card id="student-management" className="mb-6">
        <CardHeader>
          <CardTitle>Managing Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Setting Up Your Class</h4>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Go to <strong>Classrooms</strong> and create your class with a memorable Kiosk PIN.</li>
                <li>Click <strong>"Add Student"</strong> to build your class roster.</li>
                <li>Add each student's full name, school ID (optional), and grade level (optional).</li>
                <li>Share the <strong>Classroom PIN</strong> with your students.</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Important Tips</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use students' <strong>full names</strong> - this is what they'll type to log in</li>
                <li>Names must be unique within each classroom</li>
                <li>If you have duplicate names, add middle initials (e.g., "Sarah J." and "Sarah K.")</li>
                <li>You can edit student information anytime</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="kiosk-mode" className="mb-6">
        <CardHeader>
          <CardTitle>Kiosk Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How Students Log In</h4>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Students go to <strong>Kiosk Mode</strong> on the shared device.</li>
                <li>They enter their <strong>full name</strong> exactly as you added it to the class.</li>
                <li>They enter the <strong>Classroom PIN</strong> you shared with the class.</li>
                <li>The system validates their identity and logs them in.</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Teacher Setup</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Keep your teacher account signed in on the kiosk device</li>
                <li>Open Kiosk Mode from the Classrooms page</li>
                <li>Students can hand the device to each other after logging in</li>
                <li>The system tracks who has logged in and when</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Troubleshooting Student Login Issues</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>"Student not found":</strong> Check that you've added them to the class list</li>
                <li><strong>"Invalid PIN":</strong> Verify they're using the correct classroom PIN</li>
                <li><strong>Name spelling:</strong> Student must type their name exactly as you entered it</li>
                <li><strong>Case sensitive:</strong> Names are case-sensitive, so "john" ≠ "John"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="tracking-activity" className="mb-6">
        <CardHeader>
          <CardTitle>Tracking Student Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Login Activity</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>See which students have logged into the kiosk system</li>
                <li>Track when students first logged in and their most recent access</li>
                <li>Use this data to understand student engagement with the garden</li>
                <li>Encourage students who haven't participated yet</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Activity Badges</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Active:</strong> Student has logged in at least once</li>
                <li><strong>Not logged in:</strong> Student has never accessed the kiosk</li>
                <li>View detailed login timestamps in the student management area</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="classroom-pins" className="mb-6">
        <CardHeader>
          <CardTitle>Classroom PINs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">PIN Management</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Each classroom has <strong>one permanent PIN</strong> that students use to log in</li>
                <li>PINs are typically 4-6 digits for easy memorization</li>
                <li>Use the <strong>Copy</strong> button to share PINs with students</li>
                <li>Write the PIN on the board or share it verbally with your class</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">PIN Security</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Only share your classroom PIN with your students</li>
                <li>Students cannot access other classrooms without the correct PIN</li>
                <li>Each PIN is unique to your classroom</li>
                <li>If needed, create a new classroom with a different PIN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="best-practices" className="mb-6">
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Setting Up Your Class</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Add all students to your class roster before the first kiosk session</li>
                <li>Use consistent naming conventions (first and last name)</li>
                <li>Test the kiosk login process with a few students first</li>
                <li>Keep a backup list of student names in case of questions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">During Kiosk Sessions</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Have students help each other with name spelling</li>
                <li>Remind students to use their full name as listed</li>
                <li>Keep the classroom PIN visible or easily accessible</li>
                <li>Monitor the activity tracking to ensure all students participate</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Ongoing Management</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Regularly check which students haven't logged in recently</li>
                <li>Update student information as needed (new students, name changes)</li>
                <li>Use login activity data for engagement insights</li>
                <li>Celebrate student participation in garden activities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="troubleshooting">
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Student Can't Log In</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Check spelling:</strong> Name must match exactly what you entered</li>
                <li><strong>Verify PIN:</strong> Make sure they're using the right classroom PIN</li>
                <li><strong>Add missing student:</strong> Use "Add Student" if they're not in the system</li>
                <li><strong>Edit name:</strong> Update the student's name if it was entered incorrectly</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Duplicate Name Error</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Add middle initials or middle names to distinguish students</li>
                <li>Use "First Last Jr." or "First Last II" for family members</li>
                <li>Consider using "First L." format for common names</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Students Not Participating</h4>
              <ul className="list-disc pl-6 space-y-1">
                <li>Check the activity tracking to see who hasn't logged in</li>
                <li>Remind non-participating students about the garden project</li>
                <li>Consider buddy systems to help students get started</li>
                <li>Make sure all students know the classroom PIN</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}