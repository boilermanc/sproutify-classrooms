import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Monitor, Network, Sprout, HelpCircle } from "lucide-react";

// Feature flag check
const FEATURE_FLAGS = {
  GARDEN_NETWORK: process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_GARDEN_NETWORK === 'true',
};

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="container max-w-4xl py-8">
      <SEO 
        title="Help Center | Sproutify School" 
        description="Complete guide to managing students, using Kiosk Mode, tracking your garden, and connecting with other classrooms." 
        canonical="/app/help" 
      />
      
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about managing your classroom aeroponic garden
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-5 w-full">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="kiosk" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Kiosk Mode</span>
          </TabsTrigger>
          <TabsTrigger value="garden" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            <span className="hidden sm:inline">Garden</span>
          </TabsTrigger>
          {FEATURE_FLAGS.GARDEN_NETWORK && (
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Network</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="troubleshooting" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>

        {/* Student Management Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setting Up Your Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Creating Your Class Roster</h4>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Go to <strong>Classrooms</strong> and create your class with a memorable Kiosk PIN.</li>
                    <li>Click <strong>"Add Student"</strong> to build your class roster.</li>
                    <li>Add each student's full name, school ID (optional), and grade level (optional).</li>
                    <li>Share the <strong>Classroom PIN</strong> with your students.</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Important Naming Guidelines</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use students' <strong>full names</strong> - this is what they'll type to log in</li>
                    <li>Names must be unique within each classroom</li>
                    <li>If you have duplicate names, add middle initials (e.g., "Sarah J." and "Sarah K.")</li>
                    <li>You can edit student information anytime after adding them</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Student Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Login Activity Tracking</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>See which students have logged into the kiosk system</li>
                    <li>Track when students first logged in and their most recent access</li>
                    <li>Use this data to understand student engagement with the garden</li>
                    <li>Encourage students who haven't participated yet</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Activity Status Badges</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Active:</strong> Student has logged in at least once</li>
                    <li><strong>Not logged in:</strong> Student has never accessed the kiosk</li>
                    <li>View detailed login timestamps in the student management area</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kiosk Mode Tab */}
        <TabsContent value="kiosk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How Students Use Kiosk Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Student Login Process</h4>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classroom PIN Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">PIN Basics</h4>
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
        </TabsContent>

        {/* Garden Management Tab */}
        <TabsContent value="garden" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tower Management Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Setting Up Towers</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Create towers for each aeroponic system in your classroom</li>
                    <li>Use descriptive names (e.g., "Window Tower", "Corner System")</li>
                    <li>Set the correct number of ports for accurate tracking</li>
                    <li>Take photos to help students identify different towers</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Data Collection</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Encourage students to log vitals (pH, EC) regularly</li>
                    <li>Track plant growth from seeding to harvest</li>
                    <li>Record harvest weights and waste for analysis</li>
                    <li>Monitor pest issues and solutions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Encouraging Participation</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Assign students to specific towers or ports</li>
                    <li>Create friendly competitions for best growth</li>
                    <li>Use the leaderboard to celebrate achievements</li>
                    <li>Have students document growth with photos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Garden Network Tab - Only show if feature is enabled */}
        {FEATURE_FLAGS.GARDEN_NETWORK && (
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started with Garden Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Joining the Network</h4>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Go to <strong>Garden Network → Settings</strong></li>
                      <li>Toggle on <strong>"Join the Garden Network"</strong></li>
                      <li>Fill out your classroom profile (display name, description, region)</li>
                      <li>Choose your privacy settings and data sharing preferences</li>
                      <li>Save your settings to join the network</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Privacy Levels</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Public:</strong> Discoverable by all network members</li>
                      <li><strong>Invite Only:</strong> Accept connection requests, but not searchable</li>
                      <li><strong>Connected Only:</strong> Only visible to classrooms you're already connected with</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connecting with Other Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Finding Classrooms</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use <strong>Discover Classrooms</strong> to find others by region or grade level</li>
                      <li>Send connection requests to classrooms you'd like to collaborate with</li>
                      <li>Accept or decline incoming connection requests</li>
                      <li>Choose connection types: Competition, Collaboration, or Mentorship</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Network Activities</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Participate in harvest challenges and competitions</li>
                      <li>Compare your progress on network leaderboards</li>
                      <li>Share tips and learn from successful classrooms</li>
                      <li>View network statistics and your classroom's rank</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sharing & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What Gets Shared</h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Harvest Data:</strong> Total weights and plant counts for leaderboards</li>
                      <li><strong>Photos:</strong> Tower photos (only if you enable sharing)</li>
                      <li><strong>Tips:</strong> Growing advice and success stories</li>
                      <li><strong>Never Shared:</strong> Individual student information or personal data</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Privacy Controls</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You control exactly what data is shared</li>
                      <li>Can disable network participation anytime</li>
                      <li>Block specific classrooms if needed</li>
                      <li>All data sharing is classroom-level, never individual students</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Student Login Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Login Problems</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>"Student not found":</strong> Check that you've added them to the class list</li>
                    <li><strong>"Invalid PIN":</strong> Verify they're using the correct classroom PIN</li>
                    <li><strong>Name spelling:</strong> Student must type their name exactly as you entered it</li>
                    <li><strong>Case sensitive:</strong> Names are case-sensitive, so "john" ≠ "John"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Duplicate Name Issues</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Add middle initials or middle names to distinguish students</li>
                    <li>Use "First Last Jr." or "First Last II" for family members</li>
                    <li>Consider using "First L." format for common names</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Garden Management Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Data Entry Problems</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>pH/EC readings:</strong> Make sure values are in reasonable ranges</li>
                    <li><strong>Missing data:</strong> Check that towers are properly set up</li>
                    <li><strong>Plant tracking:</strong> Ensure plants are assigned to correct ports</li>
                    <li><strong>Photo uploads:</strong> Use supported image formats (JPG, PNG)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Student Engagement Issues</h4>
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

          {FEATURE_FLAGS.GARDEN_NETWORK && (
            <Card>
              <CardHeader>
                <CardTitle>Network Connection Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Connection Problems</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Can't find classrooms:</strong> Check your visibility settings</li>
                      <li><strong>Connection requests not working:</strong> Verify network is enabled</li>
                      <li><strong>Data not appearing:</strong> Check data sharing preferences</li>
                      <li><strong>Leaderboard issues:</strong> Ensure harvest data sharing is enabled</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Getting Additional Help</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're still having issues after trying these solutions:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Check that you have the latest version of the app</li>
                <li>Try refreshing your browser or clearing cache</li>
                <li>Make sure all required fields are filled out</li>
                <li>Contact support with specific error messages</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}