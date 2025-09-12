import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  Type, 
  Layout, 
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle
} from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StyleGuide() {
  return (
    <div className="space-y-8">
      <SEO title="Style Guide" description="Sproutify Design System Style Guide" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sproutify Style Guide</h1>
          <p className="text-muted-foreground">
            Complete design system reference for Sproutify Classrooms
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Palette className="h-3 w-3 text-primary" />
          Design System v1.0
        </Badge>
      </div>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-full h-20 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">Primary</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Sproutify Green</p>
                  <p className="text-sm text-muted-foreground">hsl(142 60% 38%)</p>
                  <p className="text-sm text-muted-foreground font-mono">#2D7A3D</p>
                  <p className="text-xs text-muted-foreground">Main brand color for buttons, links, and primary actions</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-20 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">Primary Glow</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Lighter Green</p>
                  <p className="text-sm text-muted-foreground">hsl(145 60% 55%)</p>
                  <p className="text-sm text-muted-foreground font-mono">#4A9B5A</p>
                  <p className="text-xs text-muted-foreground">Used for gradients and hover states</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-20 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-secondary-foreground font-semibold">Secondary</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Pale Green</p>
                  <p className="text-sm text-muted-foreground">hsl(156 30% 96%)</p>
                  <p className="text-sm text-muted-foreground font-mono">#F0F7F4</p>
                  <p className="text-xs text-muted-foreground">Background color for cards and sections</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Accent Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold text-sm">Accent</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Accent Green</p>
                  <p className="text-sm text-muted-foreground font-mono">#F0F7F4</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground font-semibold text-sm">Muted</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Muted Blue</p>
                  <p className="text-sm text-muted-foreground font-mono">#F1F5F9</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-border flex items-center justify-center">
                  <span className="text-foreground font-semibold text-sm">Border</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Border Gray</p>
                  <p className="text-sm text-muted-foreground font-mono">#E2E8F0</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-card flex items-center justify-center">
                  <span className="text-card-foreground font-semibold text-sm">Card</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Card Background</p>
                  <p className="text-sm text-muted-foreground font-mono">#FFFFFF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-green-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Success</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Success Green</p>
                  <p className="text-sm text-muted-foreground font-mono">#22C55E</p>
                  <p className="text-xs text-muted-foreground">pH test strips, success states</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Info</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Info Blue</p>
                  <p className="text-sm text-muted-foreground font-mono">#3B82F6</p>
                  <p className="text-xs text-muted-foreground">EC test strips, info states</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Warning</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Warning Yellow</p>
                  <p className="text-sm text-muted-foreground font-mono">#EAB308</p>
                  <p className="text-xs text-muted-foreground">pH test strips, warning states</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-red-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">Error</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Error Red</p>
                  <p className="text-sm text-muted-foreground font-mono">#EF4444</p>
                  <p className="text-xs text-muted-foreground">pH test strips, error states</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
              <p className="text-sm text-muted-foreground">Used for main page titles</p>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold">Heading 2 - 3xl Bold</h2>
              <p className="text-sm text-muted-foreground">Used for section headers</p>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold">Heading 3 - 2xl Semibold</h3>
              <p className="text-sm text-muted-foreground">Used for subsection headers</p>
            </div>
            
            <div>
              <h4 className="text-xl font-semibold">Heading 4 - xl Semibold</h4>
              <p className="text-sm text-muted-foreground">Used for card titles</p>
            </div>
            
            <div>
              <h5 className="text-lg font-medium">Heading 5 - lg Medium</h5>
              <p className="text-sm text-muted-foreground">Used for small headers</p>
            </div>
            
            <div>
              <h6 className="text-base font-medium">Heading 6 - base Medium</h6>
              <p className="text-sm text-muted-foreground">Used for labels</p>
            </div>
            
            <div>
              <p className="text-base">Body Text - base Regular</p>
              <p className="text-sm text-muted-foreground">Used for main content</p>
            </div>
            
            <div>
              <p className="text-sm">Small Text - sm Regular</p>
              <p className="text-sm text-muted-foreground">Used for captions and secondary info</p>
            </div>
            
            <div>
              <p className="text-xs">Extra Small - xs Regular</p>
              <p className="text-sm text-muted-foreground">Used for timestamps and fine print</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Badges</h3>
            <div className="flex flex-wrap gap-4">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
            </div>
          </div>

          {/* Status Badges */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
            <div className="flex flex-wrap gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Success
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                Warning
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Info className="h-3 w-3 text-blue-500" />
                Info
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                Error
              </Badge>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is a basic card component with header and content.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-primary">Highlighted Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This card has a primary border to highlight important content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Strip Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Test Strip Color System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* pH Test Strip Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">pH Test Strip Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-red-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">4.5</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Very Acidic</p>
                  <p className="text-xs text-muted-foreground">4.0-5.0</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">5.2</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Acidic</p>
                  <p className="text-xs text-muted-foreground">5.0-5.5</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">5.5</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Ideal</p>
                  <p className="text-xs text-muted-foreground">5.2-5.8</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-green-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">6.0</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Slightly Basic</p>
                  <p className="text-xs text-muted-foreground">5.8-6.5</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">6.8</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Basic</p>
                  <p className="text-xs text-muted-foreground">6.5-7.0</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">7.2</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Very Basic</p>
                  <p className="text-xs text-muted-foreground">7.0+</p>
                </div>
              </div>
            </div>
          </div>

          {/* EC Test Strip Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4">EC Test Strip Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center">
                  <span className="text-slate-700 font-semibold text-sm">0.5</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Very Low</p>
                  <p className="text-xs text-muted-foreground">0.0-0.8</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-blue-200 flex items-center justify-center">
                  <span className="text-blue-800 font-semibold text-sm">1.0</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Low</p>
                  <p className="text-xs text-muted-foreground">0.8-1.2</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">1.6</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Ideal</p>
                  <p className="text-xs text-muted-foreground">1.2-2.0</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-blue-700 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">2.2</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">High</p>
                  <p className="text-xs text-muted-foreground">2.0-2.4</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-16 rounded-lg bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">2.8</span>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Very High</p>
                  <p className="text-xs text-muted-foreground">2.4+</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Principles */}
      <Card>
        <CardHeader>
          <CardTitle>Design Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Color Usage Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use primary green for main actions and branding</li>
                <li>• Use secondary colors for backgrounds and subtle elements</li>
                <li>• Test strip colors should match scientific standards</li>
                <li>• Status colors should be consistent across the app</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Typography Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use clear hierarchy with consistent font weights</li>
                <li>• Maintain good contrast ratios for accessibility</li>
                <li>• Keep line heights comfortable for reading</li>
                <li>• Use appropriate font sizes for different contexts</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Component Guidelines</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maintain consistent spacing and padding</li>
                <li>• Use rounded corners for friendly, approachable feel</li>
                <li>• Apply shadows sparingly for depth</li>
                <li>• Ensure interactive elements have clear states</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Accessibility</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure sufficient color contrast ratios</li>
                <li>• Provide alternative text for images</li>
                <li>• Use semantic HTML elements</li>
                <li>• Test with screen readers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          This style guide represents the current design system for Sproutify Classrooms.
          <br />
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
