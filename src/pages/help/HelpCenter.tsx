import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Monitor, Network, Sprout, HelpCircle, Trophy, Shield, Star, Building2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Feature flag check
const FEATURE_FLAGS = {
  GARDEN_NETWORK: process.env.NODE_ENV === 'development' || process.env.VITE_FEATURE_GARDEN_NETWORK === 'true',
};

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState("students");
  const { profile } = useProfile();
  
  // Check if user has district access
  const hasDistrictAccess = profile?.district_id || profile?.user_roles?.some((role: any) => role.role === 'district_admin');
  
  // Check if user has school access
  const hasSchoolAccess = profile?.user_roles?.some((role: any) => role.role === 'school_admin');
  
  // Calculate grid columns based on available tabs
  const getGridCols = () => {
    let cols = 4; // students, kiosk, garden, troubleshooting
    if (hasSchoolAccess) cols++;
    if (hasDistrictAccess) cols++;
    if (FEATURE_FLAGS.GARDEN_NETWORK) cols++;
    return cols;
  };

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
        <TabsList className={`grid grid-cols-${getGridCols()} lg:grid-cols-${getGridCols()} w-full`}>
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
          {hasSchoolAccess && (
            <TabsTrigger value="school" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">School</span>
            </TabsTrigger>
          )}
          {hasDistrictAccess && (
            <TabsTrigger value="district" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">District</span>
            </TabsTrigger>
          )}
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

        {/* School Management Tab - Only show if user has school access */}
        {profile?.user_roles?.some((role: any) => role.role === 'school_admin') && (
          <TabsContent value="school" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  School administrators can manage teachers, classrooms, and school-wide analytics. 
                  Teachers can join schools using join codes or email invitations.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">For School Administrators:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Invite teachers via email</li>
                      <li>Create and manage school join codes</li>
                      <li>Monitor school-wide activity</li>
                      <li>Generate school reports</li>
                      <li>Manage teacher access</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">For Teachers:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Join schools using join codes</li>
                      <li>Accept email invitations</li>
                      <li>Access school-wide features</li>
                      <li>Collaborate with other teachers</li>
                      <li>View school analytics</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Teacher Registration with School Join Code:</h4>
                  <div className="text-sm font-mono">
                    <div className="text-blue-600">┌─ Teacher Registration Form ─────────────────┐</div>
                    <div className="text-gray-700">│ First Name: [Jane]                         │</div>
                    <div className="text-gray-700">│ Last Name: [Smith]                         │</div>
                    <div className="text-gray-700">│ School Name: [Roosevelt Elementary]        │</div>
                    <div className="text-green-600">│ School Join Code: [SCH123] ← Enter here!   │</div>
                    <div className="text-gray-700">│ Email: [jane@school.edu]                   │</div>
                    <div className="text-gray-700">│ Password: [••••••••]                        │</div>
                    <div className="text-blue-600">└─────────────────────────────────────────────┘</div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    For detailed school management instructions, see our comprehensive guide:
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/school-guide">View School Management Guide</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* District Management Tab - Only show if user has district access */}
        {hasDistrictAccess && (
          <TabsContent value="district" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Joining a District
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">What is a District?</h4>
                  <p className="text-muted-foreground mb-4">
                    A district is a group of schools that work together to manage aeroponic gardens across multiple locations. 
                    District administrators can invite teachers, manage schools, and view district-wide reports.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">How to Join a District</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Method 1: Using a District Join Code</h5>
                      <ol className="list-decimal pl-6 space-y-2 text-blue-800">
                        <li>Get the district join code from your district administrator</li>
                        <li>During teacher registration, enter the join code in the "District join code" field</li>
                        <li>Your school will be automatically linked to the district</li>
                        <li>You'll have access to district-wide features and reports</li>
                      </ol>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">Method 2: Accepting an Invitation</h5>
                      <ol className="list-decimal pl-6 space-y-2 text-green-800">
                        <li>District administrators can send you an email invitation</li>
                        <li>Click the invitation link in your email</li>
                        <li>Complete your account setup with the provided information</li>
                        <li>You'll be automatically added to the district</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Registration with District Join Code</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-mono">
                      <div className="text-blue-600">┌─ Teacher Registration Form ─────────────────┐</div>
                      <div className="text-gray-700">│ First Name: [John]                        │</div>
                      <div className="text-gray-700">│ Last Name: [Smith]                         │</div>
                      <div className="text-gray-700">│ School Name: [Roosevelt Elementary]        │</div>
                      <div className="text-green-600">│ District Join Code: [ABC123] ← Enter here! │</div>
                      <div className="text-gray-700">│ Email: [john@school.edu]                   │</div>
                      <div className="text-gray-700">│ Password: [••••••••]                       │</div>
                      <div className="text-blue-600">└─────────────────────────────────────────────┘</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>District Administrator Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Managing Your District</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Invite Teachers:</strong> Send email invitations to teachers in your district</li>
                    <li><strong>Manage Schools:</strong> Add and organize schools within your district</li>
                    <li><strong>District Reports:</strong> View analytics across all schools and teachers</li>
                    <li><strong>Join Codes:</strong> Generate and share district join codes for easy teacher onboarding</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Creating a District</h4>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Select the "School" plan during registration</li>
                    <li>Choose "District" tab instead of "School"</li>
                    <li>Enter your district name (e.g., "Springfield School District")</li>
                    <li>Complete registration to become a district administrator</li>
                    <li>Share your district join code with schools</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting District Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Common Issues</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-red-200 pl-4">
                      <h5 className="font-semibold text-red-800">Invalid District Join Code</h5>
                      <p className="text-sm text-red-700">Double-check the code with your district administrator. Codes are case-sensitive.</p>
                    </div>
                    <div className="border-l-4 border-yellow-200 pl-4">
                      <h5 className="font-semibold text-yellow-800">School Not Linked to District</h5>
                      <p className="text-sm text-yellow-700">If your school exists but isn't linked, the system will automatically link it when you register with a valid join code.</p>
                    </div>
                    <div className="border-l-4 border-blue-200 pl-4">
                      <h5 className="font-semibold text-blue-800">Missing District Features</h5>
                      <p className="text-sm text-blue-700">Make sure you're logged in with an account that has district_id set in your profile.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Getting Help</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Contact your district administrator for join codes</li>
                    <li>Check that your email matches what the district has on file</li>
                    <li>Verify you're using the correct school name</li>
                    <li>Contact support if you continue having issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Garden Network Tab - Only show if feature is enabled */}
        {FEATURE_FLAGS.GARDEN_NETWORK && (
          <TabsContent value="network" className="space-y-6">
            {/* Getting Started */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Getting Started with Garden Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Step 1: Enable Network Participation</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-green-600">┌─ Garden Network Settings ─────────────────┐</div>
                        <div className="text-green-600">│                                           │</div>
                        <div className="text-green-600">│  ☐ Join the Garden Network              │</div>
                        <div className="text-green-600">│     ↳ Toggle this ON to enable          │</div>
                        <div className="text-green-600">│                                           │</div>
                        <div className="text-green-600">│  Display Name: [Your Classroom Name]     │</div>
                        <div className="text-green-600">│  Description: [Tell others about you]    │</div>
                        <div className="text-green-600">│  Region: [California, UK, etc.]         │</div>
                        <div className="text-green-600">│                                           │</div>
                        <div className="text-green-600">│  [Save Settings]                        │</div>
                        <div className="text-green-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Navigate to <strong>Garden Network → Settings</strong></li>
                      <li>Toggle <strong>"Join the Garden Network"</strong> to ON</li>
                      <li>Fill out your classroom profile with a display name and description</li>
                      <li>Set your region and grade level for better matching</li>
                      <li>Click <strong>"Save Settings"</strong> to join the network</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Step 2: Configure Privacy Settings</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-blue-600">┌─ Visibility & Privacy ────────────────────┐</div>
                        <div className="text-blue-600">│                                           │</div>
                        <div className="text-blue-600">│  Who can discover your classroom?        │</div>
                        <div className="text-blue-600">│  ┌─────────────────────────────────────┐ │</div>
                        <div className="text-blue-600">│  │ 🌍 Public - Discoverable by all    │ │</div>
                        <div className="text-blue-600">│  │ 🛡️ Invite Only - Accept requests    │ │</div>
                        <div className="text-blue-600">│  │ 👥 Connected Only - Visible to      │ │</div>
                        <div className="text-blue-600">│  │     connections only               │ │</div>
                        <div className="text-blue-600">│  └─────────────────────────────────────┘ │</div>
                        <div className="text-blue-600">│                                           │</div>
                        <div className="text-blue-600">│  Data Sharing:                          │</div>
                        <div className="text-blue-600">│  ☑️ Share harvest data                 │</div>
                        <div className="text-blue-600">│  ☐ Share photos                        │</div>
                        <div className="text-blue-600">│  ☑️ Share growth tips                  │</div>
                        <div className="text-blue-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>🌍 Public:</strong> Your classroom appears in search results and can be discovered by anyone</li>
                      <li><strong>🛡️ Invite Only:</strong> Others can send you connection requests, but you won't appear in searches</li>
                      <li><strong>👥 Connected Only:</strong> Only classrooms you're already connected with can see you</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Understanding Your Network Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Dashboard Overview</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-purple-600">┌─ Garden Network Dashboard ────────────────┐</div>
                        <div className="text-purple-600">│                                           │</div>
                        <div className="text-purple-600">│  Welcome to your network dashboard!      │</div>
                        <div className="text-purple-600">│                                           │</div>
                        <div className="text-purple-600">│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │</div>
                        <div className="text-purple-600">│  │  5  │ │  2  │ │  3  │ │ #12│        │</div>
                        <div className="text-purple-600">│  │Conn │ │Pend │ │Chal │ │Rank │        │</div>
                        <div className="text-purple-600">│  └─────┘ └─────┘ └─────┘ └─────┘        │</div>
                        <div className="text-purple-600">│                                           │</div>
                        <div className="text-purple-600">│  Quick Actions:                         │</div>
                        <div className="text-purple-600">│  🔍 Discover New Classrooms             │</div>
                        <div className="text-purple-600">│  👥 Manage Connections                  │</div>
                        <div className="text-purple-600">│  🏆 Browse Challenges                   │</div>
                        <div className="text-purple-600">│  📊 View Network Leaderboard           │</div>
                        <div className="text-purple-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Connections:</strong> Number of active classroom connections</li>
                      <li><strong>Pending:</strong> Connection requests waiting for your response</li>
                      <li><strong>Challenges:</strong> Active competitions you're participating in</li>
                      <li><strong>Rank:</strong> Your position on the network leaderboard</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discovering Classrooms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Finding and Connecting with Classrooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Using the Discovery Page</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-orange-600">┌─ Discover Classrooms ────────────────────┐</div>
                        <div className="text-orange-600">│                                           │</div>
                        <div className="text-orange-600">│  Search & Filters:                      │</div>
                        <div className="text-orange-600">│  ┌─────────────────────────────────────┐ │</div>
                        <div className="text-orange-600">│  │ Search: [California Elementary...]  │ │</div>
                        <div className="text-orange-600">│  │ Region: [California]                │ │</div>
                        <div className="text-orange-600">│  │ Grade: [3-5] School: [Elementary]  │ │</div>
                        <div className="text-orange-600">│  └─────────────────────────────────────┘ │</div>
                        <div className="text-orange-600">│                                           │</div>
                        <div className="text-orange-600">│  Results (12 Classrooms Found):         │</div>
                        <div className="text-orange-600">│  ┌─────────────────────────────────────┐ │</div>
                        <div className="text-orange-600">│  │ 🌱 Green Valley Elementary          │ │</div>
                        <div className="text-orange-600">│  │    📍 California, Grade 3-5        │ │</div>
                        <div className="text-orange-600">│  │    "Growing lettuce and herbs..."   │ │</div>
                        <div className="text-orange-600">│  │    [Connect] [View Profile]        │ │</div>
                        <div className="text-orange-600">│  └─────────────────────────────────────┘ │</div>
                        <div className="text-orange-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Go to <strong>Garden Network → Discover Classrooms</strong></li>
                      <li>Use search to find classrooms by name or description</li>
                      <li>Filter by region, grade level, or school type</li>
                      <li>Click <strong>"Connect"</strong> to send a connection request</li>
                      <li>Add a personal message explaining why you want to connect</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Connection Types</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="font-semibold text-red-700 mb-2">🏆 Competition</div>
                        <div className="text-sm text-red-600">Friendly rivalry and harvest competitions</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-700 mb-2">🤝 Collaboration</div>
                        <div className="text-sm text-blue-600">Sharing tips and working together</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="font-semibold text-green-700 mb-2">🎓 Mentorship</div>
                        <div className="text-sm text-green-600">Learning from experienced classrooms</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Managing Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Managing Your Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Connection Management Interface</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-indigo-600">┌─ My Connections ────────────────────────┐</div>
                        <div className="text-indigo-600">│                                           │</div>
                        <div className="text-indigo-600">│  [Connections] [Incoming] [Outgoing]    │</div>
                        <div className="text-indigo-600">│                                           │</div>
                        <div className="text-indigo-600">│  Incoming Requests (2):                 │</div>
                        <div className="text-indigo-600">│  ┌─────────────────────────────────────┐ │</div>
                        <div className="text-indigo-600">│  │ 🌱 Oak Tree Elementary              │ │</div>
                        <div className="text-indigo-600">│  │    "Would love to collaborate!"    │ │</div>
                        <div className="text-indigo-600">│  │    [✓ Accept] [✗ Decline] [🚫 Block]│ │</div>
                        <div className="text-indigo-600">│  └─────────────────────────────────────┘ │</div>
                        <div className="text-indigo-600">│                                           │</div>
                        <div className="text-indigo-600">│  Active Connections (5):                │</div>
                        <div className="text-indigo-600">│  ┌─────────────────────────────────────┐ │</div>
                        <div className="text-indigo-600">│  │ 🌱 Green Valley Elementary          │ │</div>
                        <div className="text-indigo-600">│  │    🤝 Collaboration                 │ │</div>
                        <div className="text-indigo-600">│  │    [View Profile] [Remove]          │ │</div>
                        <div className="text-indigo-600">│  └─────────────────────────────────────┘ │</div>
                        <div className="text-indigo-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Incoming Tab:</strong> Review and respond to connection requests</li>
                      <li><strong>Outgoing Tab:</strong> Track requests you've sent to others</li>
                      <li><strong>Connections Tab:</strong> Manage your active classroom connections</li>
                      <li><strong>Actions:</strong> Accept, decline, block, or remove connections as needed</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Connection Actions</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <span className="font-medium">Accept</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-8">Creates an active connection for collaboration</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-xs">✗</span>
                          </div>
                          <span className="font-medium">Decline</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-8">Politely declines the connection request</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs">🚫</span>
                          </div>
                          <span className="font-medium">Block</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-8">Prevents future requests from this classroom</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs">🗑</span>
                          </div>
                          <span className="font-medium">Remove</span>
                        </div>
                        <div className="text-sm text-muted-foreground ml-8">Ends an existing connection</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Participating in Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Challenge Center Interface</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-yellow-600">┌─ Challenge Center ───────────────────────┐</div>
                        <div className="text-yellow-600">│                                           │</div>
                        <div className="text-yellow-600">│  ┌─────┐ ┌─────┐ ┌─────┐                │</div>
                        <div className="text-yellow-600">│  │  3  │ │  1  │ │ 45  │                │</div>
                        <div className="text-yellow-600">│  │Actv │ │Part │ │Tot  │                │</div>
                        <div className="text-yellow-600">│  └─────┘ └─────┘ └─────┘                │</div>
                        <div className="text-yellow-600">│                                           │</div>
                        <div className="text-yellow-600">│  🏆 Monthly Harvest Challenge           │</div>
                        <div className="text-yellow-600">│     "Grow the heaviest harvest!"        │</div>
                        <div className="text-yellow-600">│     📅 Ends in 5 days                   │</div>
                        <div className="text-yellow-600">│     👥 23 participants                   │</div>
                        <div className="text-yellow-600">│     🎁 Prize: Garden supplies            │</div>
                        <div className="text-yellow-600">│     [Join Challenge]                    │</div>
                        <div className="text-yellow-600">│                                           │</div>
                        <div className="text-yellow-600">│  ⚡ Innovation Challenge                 │</div>
                        <div className="text-yellow-600">│     "Most creative growing method"       │</div>
                        <div className="text-yellow-600">│     📅 Ends in 12 days                   │</div>
                        <div className="text-yellow-600">│     👥 8 participants                    │</div>
                        <div className="text-yellow-600">│     [Join Challenge]                    │</div>
                        <div className="text-yellow-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Visit <strong>Garden Network → Challenge Center</strong></li>
                      <li>Browse active challenges and read descriptions</li>
                      <li>Check participation requirements and rewards</li>
                      <li>Click <strong>"Join Challenge"</strong> to participate</li>
                      <li>Track your progress and compete with other classrooms</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Challenge Types</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="font-semibold text-green-700 mb-2">🏆 Harvest Challenge</div>
                        <div className="text-sm text-green-600">Compete for the heaviest or most productive harvest</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-700 mb-2">📈 Growth Challenge</div>
                        <div className="text-sm text-blue-600">Track plant growth rates and development</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="font-semibold text-yellow-700 mb-2">⚡ Innovation Challenge</div>
                        <div className="text-sm text-yellow-600">Creative growing methods and techniques</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing & Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Sharing & Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">What Data Gets Shared</h4>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <div className="text-sm font-mono">
                        <div className="text-gray-600">┌─ Data Sharing Settings ──────────────────┐</div>
                        <div className="text-gray-600">│                                           │</div>
                        <div className="text-gray-600">│  ☑️ Share harvest data                   │</div>
                        <div className="text-gray-600">│     ↳ Total weights, plant counts        │</div>
                        <div className="text-gray-600">│     ↳ Used for leaderboards              │</div>
                        <div className="text-gray-600">│                                           │</div>
                        <div className="text-gray-600">│  ☐ Share photos                          │</div>
                        <div className="text-gray-600">│     ↳ Tower and plant photos             │</div>
                        <div className="text-gray-600">│     ↳ Optional sharing                   │</div>
                        <div className="text-gray-600">│                                           │</div>
                        <div className="text-gray-600">│  ☑️ Share growth tips                    │</div>
                        <div className="text-gray-600">│     ↳ Success stories and advice         │</div>
                        <div className="text-gray-600">│     ↳ Help other classrooms               │</div>
                        <div className="text-gray-600">│                                           │</div>
                        <div className="text-gray-600">│  ❌ Never Shared:                        │</div>
                        <div className="text-gray-600">│     ↳ Individual student information     │</div>
                        <div className="text-gray-600">│     ↳ Personal data or contact info      │</div>
                        <div className="text-gray-600">│     ↳ Specific tower locations           │</div>
                        <div className="text-gray-600">└───────────────────────────────────────────┘</div>
                      </div>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Harvest Data:</strong> Total weights and plant counts for leaderboards and competitions</li>
                      <li><strong>Photos:</strong> Tower and plant photos (only if you enable this option)</li>
                      <li><strong>Tips:</strong> Growing advice and success stories to help other classrooms</li>
                      <li><strong>Never Shared:</strong> Individual student information, personal data, or specific locations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Privacy Controls</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <div>
                            <div className="font-medium">Full Control</div>
                            <div className="text-sm text-muted-foreground">You decide exactly what to share</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-blue-600 text-xs">🔄</span>
                          </div>
                          <div>
                            <div className="font-medium">Change Anytime</div>
                            <div className="text-sm text-muted-foreground">Update settings whenever you want</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-red-600 text-xs">🚫</span>
                          </div>
                          <div>
                            <div className="font-medium">Block Classrooms</div>
                            <div className="text-sm text-muted-foreground">Prevent unwanted connections</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-purple-600 text-xs">👥</span>
                          </div>
                          <div>
                            <div className="font-medium">Classroom-Level Only</div>
                            <div className="text-sm text-muted-foreground">No individual student data shared</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Best Practices for Garden Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Building Meaningful Connections</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-medium text-green-700">✅ Do:</div>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Write personalized connection messages</li>
                          <li>Share your classroom's goals and interests</li>
                          <li>Respond to connection requests promptly</li>
                          <li>Participate actively in challenges</li>
                          <li>Share helpful tips and success stories</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-red-700">❌ Don't:</div>
                        <ul className="list-disc pl-6 space-y-1 text-sm">
                          <li>Send generic connection requests</li>
                          <li>Ignore incoming requests for too long</li>
                          <li>Share personal student information</li>
                          <li>Spam multiple classrooms at once</li>
                          <li>Use inappropriate language or content</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Maximizing Network Benefits</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium mb-2">For New Teachers:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Connect with experienced classrooms</li>
                            <li>Ask questions and get advice</li>
                            <li>Learn from successful growing methods</li>
                            <li>Build confidence through mentorship</li>
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium mb-2">For Experienced Teachers:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Share your knowledge and expertise</li>
                            <li>Mentor newer classrooms</li>
                            <li>Participate in friendly competitions</li>
                            <li>Build a network of collaborators</li>
                          </ul>
                        </div>
                      </div>
                    </div>
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