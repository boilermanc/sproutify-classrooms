import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Mail, Key, CheckCircle, AlertCircle, Info, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function SchoolGuide() {
  const { profile } = useProfile();
  
  // Check if user has school admin access
  const hasSchoolAccess = profile?.user_roles?.some((role: any) => role.role === 'school_admin');

  // If user doesn't have school access, show access denied message
  if (!hasSchoolAccess) {
    return (
      <div className="container max-w-4xl py-8">
        <SEO 
          title="School Guide - Access Required | Sproutify School" 
          description="School management features require school administrator access." 
          canonical="/app/school-guide" 
        />
        
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-2xl">School Access Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-lg">
              This guide is only available to school administrators. School features include:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold mb-2">For Teachers:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>Join schools using join codes</li>
                  <li>Access school-wide reports</li>
                  <li>Collaborate with other teachers</li>
                </ul>
              </div>
              
              <div className="text-left">
                <h4 className="font-semibold mb-2">For School Admins:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>Manage teachers and classrooms</li>
                  <li>Create join codes</li>
                  <li>View school analytics</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-muted-foreground mb-4">
                To access school features, you need to either:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/app/help">View General Help</Link>
                </Button>
                <Button asChild>
                  <Link to="/pricing">View Pricing Plans</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <SEO 
        title="School Management Guide | Sproutify School" 
        description="Complete guide to managing schools, teacher onboarding, and school-wide analytics in Sproutify Classrooms." 
        canonical="/app/school-guide" 
      />
      
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">School Management Guide</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about managing your school and onboarding teachers with school join codes.
        </p>
      </header>

      <div className="space-y-8">
        {/* What is a School Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is a School Plan?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                A school plan in Sproutify Classrooms is designed for individual schools to manage their aeroponic garden programs. 
                School plans provide centralized management, teacher oversight, and comprehensive school analytics.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">School Plan Benefits:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Single School Management:</strong> School administrators oversee all teachers and classrooms</li>
                  <li><strong>Teacher Management:</strong> Invite and manage teachers within your school</li>
                  <li><strong>Classroom Oversight:</strong> Monitor all classrooms and student activity</li>
                  <li><strong>School Analytics:</strong> Comprehensive reporting and insights for your school</li>
                  <li><strong>Scalable Growth:</strong> Add teachers and classrooms as your program expands</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">School vs District Plans</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-1">School Plan</h5>
                    <ul className="list-disc pl-4 space-y-1 text-blue-700">
                      <li>Single school management</li>
                      <li>Email invitations + School join codes</li>
                      <li>School-wide analytics</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-1">District Plan</h5>
                    <ul className="list-disc pl-4 space-y-1 text-blue-700">
                      <li>Multiple schools management</li>
                      <li>Email invitations + District join codes</li>
                      <li>District-wide analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Creating a School Account</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the Sproutify Classrooms registration page</li>
                  <li>Select the "School" subscription plan</li>
                  <li>Choose "School" tab in the registration form</li>
                  <li>Enter your school name (e.g., "Roosevelt Elementary School")</li>
                  <li>Complete registration to become a school administrator</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-3">School Administrator Setup</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Access your school dashboard at <code>/school</code></li>
                  <li>Configure school settings and contact information</li>
                  <li>Start inviting teachers to your school</li>
                  <li>Help teachers organize their classrooms</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Onboarding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teacher Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Method 1: Email Invitations</h4>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold text-green-900 mb-2">For School Administrators:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-green-800">
                    <li>Navigate to School → Teachers</li>
                    <li>Click "Invite Teacher"</li>
                    <li>Enter teacher's email and optional information</li>
                    <li>Send invitation and share the generated link</li>
                  </ol>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">For Teachers:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-green-800">
                    <li>Check your email for the invitation link</li>
                    <li>Click the invitation link to access registration</li>
                    <li>Complete the form with your information</li>
                    <li>You'll be automatically added to the school</li>
                  </ol>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Method 2: School Join Codes</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold text-blue-900 mb-2">For School Administrators:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-blue-800">
                    <li>Navigate to School → Join Codes</li>
                    <li>Click "Create Code"</li>
                    <li>Configure code settings (usage limits, expiration)</li>
                    <li>Share the code with teachers</li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">For Teachers:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-blue-800">
                    <li>Get the school join code from your administrator</li>
                    <li>During registration, enter the code in the "School join code" field</li>
                    <li>Your school will be automatically linked</li>
                    <li>You'll have access to school-wide features</li>
                  </ol>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <h5 className="font-semibold mb-2">Registration Form Example:</h5>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              School Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Dashboard Overview</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Total towers at your school</li>
                  <li>Total participating classrooms</li>
                  <li>Total enrolled students</li>
                  <li>Recent activity charts</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Teacher Management</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>View and manage all teachers</li>
                  <li>Search and filter capabilities</li>
                  <li>Send teacher invitations</li>
                  <li>Monitor teacher activity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Join Code Management</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Create and manage join codes</li>
                  <li>Set usage limits and expiration</li>
                  <li>Track code usage</li>
                  <li>Deactivate codes when needed</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Reporting & Analytics</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>School-wide reports</li>
                  <li>Activity tracking</li>
                  <li>Performance metrics</li>
                  <li>Data export capabilities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-200 pl-4">
                <h5 className="font-semibold text-red-800">Teacher Invitation Not Received</h5>
                <p className="text-sm text-red-700">Check spam folders, verify email address, and resend invitation if needed.</p>
              </div>
              
              <div className="border-l-4 border-yellow-200 pl-4">
                <h5 className="font-semibold text-yellow-800">Invalid School Join Code</h5>
                <p className="text-sm text-yellow-700">Verify the code with your school administrator. Codes are case-sensitive and may have usage limits.</p>
              </div>
              
              <div className="border-l-4 border-blue-200 pl-4">
                <h5 className="font-semibold text-blue-800">Teacher Not Linked to School</h5>
                <p className="text-sm text-blue-700">The system automatically links teachers when they register with valid join codes.</p>
              </div>
              
              <div className="border-l-4 border-green-200 pl-4">
                <h5 className="font-semibold text-green-800">Missing School Features</h5>
                <p className="text-sm text-green-700">Ensure your profile has school_id set and you completed registration with a valid join code.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Quick Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">School Administrator Actions</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Create School:</strong> Registration → School Plan → School Tab</li>
                  <li><strong>Invite Teachers:</strong> School → Teachers → Invite Teacher</li>
                  <li><strong>Create Join Codes:</strong> School → Join Codes → Create Code</li>
                  <li><strong>View Reports:</strong> School → Reports</li>
                  <li><strong>Manage Settings:</strong> School → Settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Teacher Actions</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Join School:</strong> Registration → Enter School Join Code</li>
                  <li><strong>Accept Invitation:</strong> Click invitation link → Complete registration</li>
                  <li><strong>Access Features:</strong> Login → Navigate to school sections</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Common Join Code Formats</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Format:</strong> Usually 6-8 characters (letters and numbers)</li>
                <li><strong>Examples:</strong> SCH123, TEACH456, ROOSE789</li>
                <li><strong>Case Sensitive:</strong> Always enter exactly as provided</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Need More Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you need additional assistance with school management:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact your school administrator for join codes and school-specific issues</li>
                <li>Check the main Help Center for general application support</li>
                <li>Verify your account settings and profile configuration</li>
                <li>Contact Sproutify Classrooms support with specific error messages</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
