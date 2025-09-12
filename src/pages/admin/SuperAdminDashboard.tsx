import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SalesDashboard from "@/components/admin/SalesDashboard";
import TeamManager from "@/components/admin/TeamManager";
import { SEO } from "@/components/SEO";

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <SEO title="Super Admin Dashboard" description="Sproutify Super Admin Dashboard" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Advanced administration tools for the Sproutify team
          </p>
        </div>
      </div>

      {/* Sales Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesDashboard />
        </CardContent>
      </Card>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamManager />
        </CardContent>
      </Card>

    </div>
  );
}
