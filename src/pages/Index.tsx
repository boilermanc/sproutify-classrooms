// src/pages/Index.tsx (Based on your retrieved git history)

import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { GradientBackground } from "@/components/GradientBackground";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <SEO
        title="Sproutify School | Classroom Tower Tracker"
        description="Manage classroom vertical tower gardens: track vitals, pests, plants, and harvests with friendly dashboards."
        canonical="/"
      />
      <GradientBackground className="absolute inset-0" />
      <main className="relative container mx-auto px-6 py-24 flex-1 flex items-center">
        <div className="max-w-3xl">
          <img
            src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png"
            alt="Sproutify School Logo"
            className="h-24 object-contain mb-6"
          />
          <p className="text-lg text-muted-foreground mb-8">
            A simple, student‑friendly way to track vertical tower growing in the classroom. Add towers, log pH/EC and lighting, manage pests, record harvests and celebrate wins on leaderboards.
          </p>

          {/* This container holds the action buttons and the new student link */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/auth/register">Register Teacher</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth/login">Sign In</Link>
              </Button>
            </div>
            
            {/* This is the only addition: the Student Login link */}
            <p className="text-sm text-muted-foreground">
              Are you a student?{" "}
              <Link to="/student-login" className="underline font-semibold hover:text-primary">
                Log in with your class PIN
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
