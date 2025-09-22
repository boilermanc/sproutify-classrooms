// Debug page for testing authentication issues
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

export default function AuthTestPage() {
  const [email, setEmail] = useState(import.meta.env.DEV ? "test@example.com" : "");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing auth with:', { email, password: password ? '[REDACTED]' : '[EMPTY]' });
      
      // Test 1: Basic auth request
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });
      
      setResult({
        success: !error,
        data: data,
        error: error,
        timestamp: new Date().toISOString()
      });
      
      console.log('Auth result:', { data, error });
      
    } catch (err: any) {
      console.error('Auth test error:', err);
      setResult({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      setResult({
        success: !error,
        connectionTest: true,
        data: data,
        error: error,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setResult({
        success: false,
        connectionTest: true,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={testAuth} disabled={loading}>
              {loading ? "Testing..." : "Test Authentication"}
            </Button>
            <Button onClick={testSupabaseConnection} variant="outline">
              Test Supabase Connection
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
