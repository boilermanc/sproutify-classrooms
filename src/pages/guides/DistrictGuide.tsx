import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Mail, Key, CheckCircle, AlertCircle, Info, Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function DistrictGuide() {
  const { profile } = useProfile();
  
  // Check if user has district access
  const hasDistrictAccess = profile?.district_id || profile?.user_roles?.some((role: any) => role.role === 'district_admin');

  // If user doesn't have district access, show access denied message
  if (!hasDistrictAccess) {
    return (
      <div className="container max-w-4xl py-8">
        <SEO 
          title="District Guide - Access Required | Sproutify School" 
          description="District management features require district access." 
          canonical="/app/district-guide" 
        />
        
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-2xl">District Access Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-lg">
              This guide is only available to users with district access. District features include:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="text-left">
                <h4 className="font-semibold mb-2">For Teachers:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>Join districts using join codes</li>
                  <li>Access district-wide reports</li>
                  <li>Collaborate with other schools</li>
                </ul>
              </div>
              
              <div className="text-left">
                <h4 className="font-semibold mb-2">For District Admins:</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                  <li>Manage multiple schools</li>
                  <li>Invite teachers</li>
                  <li>Generate join codes</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-muted-foreground mb-4">
                To access district features, you need to either:
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
        title="District Management Guide | Sproutify School" 
        description="Complete guide to managing school districts, teacher onboarding, and district-wide analytics in Sproutify Classrooms." 
        canonical="/app/district-guide" 
      />
      
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">District Management Guide</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about managing school districts and onboarding teachers with district join codes.
        </p>
      </header>

      <div className="space-y-8">
        {/* What is a District */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is a District?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                A district in Sproutify Classrooms is a collection of schools that work together to manage aeroponic gardens across multiple locations. 
                Districts provide centralized management, unified reporting, and streamlined teacher onboarding.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">District Benefits:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Centralized Management:</strong> District administrators can oversee all schools and teachers</li>
                  <li><strong>Unified Reporting:</strong> View analytics and progress across the entire district</li>
                  <li><strong>Easy Teacher Onboarding:</strong> Streamlined process for adding new teachers</li>
                  <li><strong>Resource Sharing:</strong> Share best practices and curriculum across schools</li>
                  <li><strong>Scalable Growth:</strong> Add new schools and teachers as your program expands</li>
                </ul>
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
                <h4 className="font-semibold mb-3">Creating a District</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Navigate to the Sproutify Classrooms registration page</li>
                  <li>Select the "School" subscription plan</li>
                  <li>Choose "District" tab instead of "School" in the registration form</li>
                  <li>Enter your district name (e.g., "Springfield School District")</li>
                  <li>Complete registration to become a district administrator</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-3">District Administrator Setup</h4>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Access your district dashboard at <code>/district</code></li>
                  <li>Configure district settings and contact information</li>
                  <li>Your district join code is automatically generated</li>
                  <li>Share the join code with schools in your district</li>
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
                <h4 className="font-semibold mb-3">Method 1: District Join Codes</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold text-blue-900 mb-2">For Teachers:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-blue-800">
                    <li>Get the district join code from your district administrator</li>
                    <li>During teacher registration, enter the join code in the "District join code" field</li>
                    <li>Your school will be automatically linked to the district</li>
                    <li>You'll have access to district-wide features and reports</li>
                  </ol>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h5 className="font-semibold mb-2">Registration Form Example:</h5>
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

              <div>
                <h4 className="font-semibold mb-3">Method 2: Email Invitations</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-2">For District Administrators:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-green-800">
                    <li>Navigate to District → Teachers</li>
                    <li>Click "Invite Teacher"</li>
                    <li>Enter teacher's email and optional information</li>
                    <li>Send invitation and share the generated link</li>
                  </ol>
                </div>

                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <h5 className="font-semibold text-green-900 mb-2">For Teachers:</h5>
                  <ol className="list-decimal pl-6 space-y-2 text-green-800">
                    <li>Check your email for the invitation link</li>
                    <li>Click the invitation link to access registration</li>
                    <li>Complete the form with your information</li>
                    <li>You'll be automatically added to the district</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* District Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              District Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Dashboard Overview</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Total schools in your district</li>
                  <li>Total active teachers</li>
                  <li>Total aeroponic towers</li>
                  <li>Activity charts and analytics</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Management Tools</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>View and manage all teachers</li>
                  <li>Search and filter by school</li>
                  <li>Send teacher invitations</li>
                  <li>Monitor teacher activity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Reporting & Analytics</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>District-wide reports</li>
                  <li>School performance comparisons</li>
                  <li>Growth tracking</li>
                  <li>Data export capabilities</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Settings & Configuration</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>District information management</li>
                  <li>Join code generation</li>
                  <li>Subscription management</li>
                  <li>Privacy settings</li>
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
                <h5 className="font-semibold text-red-800">Invalid District Join Code</h5>
                <p className="text-sm text-red-700">Double-check the code with your district administrator. Codes are case-sensitive.</p>
              </div>
              
              <div className="border-l-4 border-yellow-200 pl-4">
                <h5 className="font-semibold text-yellow-800">School Not Linked to District</h5>
                <p className="text-sm text-yellow-700">The system automatically links schools when teachers register with valid join codes.</p>
              </div>
              
              <div className="border-l-4 border-blue-200 pl-4">
                <h5 className="font-semibold text-blue-800">Missing District Features</h5>
                <p className="text-sm text-blue-700">Ensure your profile has district_id set and you completed registration with a valid join code.</p>
              </div>
              
              <div className="border-l-4 border-green-200 pl-4">
                <h5 className="font-semibold text-green-800">Invitation Not Received</h5>
                <p className="text-sm text-green-700">Check spam folders, verify email address, and resend invitation if needed.</p>
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
                <h4 className="font-semibold mb-3">District Administrator Actions</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Create District:</strong> Registration → School Plan → District Tab</li>
                  <li><strong>Invite Teachers:</strong> District → Teachers → Invite Teacher</li>
                  <li><strong>View Reports:</strong> District → Reports</li>
                  <li><strong>Manage Settings:</strong> District → Settings</li>
                  <li><strong>Share Join Code:</strong> District → Join Codes</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Teacher Actions</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Join District:</strong> Registration → Enter District Join Code</li>
                  <li><strong>Accept Invitation:</strong> Click invitation link → Complete registration</li>
                  <li><strong>Access Features:</strong> Login → Navigate to district sections</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Common Join Code Formats</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Format:</strong> Usually 6-8 characters (letters and numbers)</li>
                <li><strong>Examples:</strong> ABC123, DIST456, SCH789</li>
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
                If you need additional assistance with district management:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact your district administrator for join codes and district-specific issues</li>
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
