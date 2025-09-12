import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  Users, 
  Trophy, 
  Settings, 
  Search, 
  MessageSquare,
  Shield,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";

interface GardenNetworkQuickRefProps {
  className?: string;
}

export function GardenNetworkQuickRef({ className }: GardenNetworkQuickRefProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Garden Network Quick Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Getting Started */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Getting Started
          </h4>
          <div className="space-y-1 text-sm">
            <div>1. Go to <strong>Garden Network → Settings</strong></div>
            <div>2. Toggle <strong>"Join the Garden Network"</strong> ON</div>
            <div>3. Fill out your classroom profile</div>
            <div>4. Choose privacy settings</div>
            <div>5. Click <strong>"Save Settings"</strong></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/network/settings">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/network/discover">
                <Search className="h-3 w-3 mr-1" />
                Discover
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/network/connections">
                <MessageSquare className="h-3 w-3 mr-1" />
                Connections
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/network/challenges">
                <Trophy className="h-3 w-3 mr-1" />
                Challenges
              </Link>
            </Button>
          </div>
        </div>

        {/* Privacy Levels */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy Levels
          </h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">🌍</Badge>
              <span className="text-sm">Public - Discoverable by all</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">🛡️</Badge>
              <span className="text-sm">Invite Only - Accept requests</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">👥</Badge>
              <span className="text-sm">Connected Only - Visible to connections</span>
            </div>
          </div>
        </div>

        {/* Connection Types */}
        <div>
          <h4 className="font-semibold mb-2">Connection Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">🏆</Badge>
              <span className="text-sm">Competition</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">🤝</Badge>
              <span className="text-sm">Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">🎓</Badge>
              <span className="text-sm">Mentorship</span>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link to="/app/help">
              <HelpCircle className="h-4 w-4 mr-2" />
              View Full Help Guide
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
