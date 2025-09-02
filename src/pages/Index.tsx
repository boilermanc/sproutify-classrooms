// src/pages/Index.tsx - Updated for Clarity

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
      <main className="relative container mx-auto px-6 py-16 sm:py-24 flex-1 flex items-center">
        <div className="max-w-3xl w-full"> {/* Added w-full for better alignment */}
          <img
            src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png"
            alt="Sproutify School Logo"
            className="h-20 sm:h-24 object-contain mb-6"
          />
          <p className="text-lg text-muted-foreground mb-10">
            A simple, student‑friendly way to track vertical tower growing in the classroom. Add towers, log pH/EC and lighting, manage pests, record harvests and celebrate wins on leaderboards.
          </p>

          {/* --- NEW: Main container for the two user roles --- */}
          <div className="space-y-8">
            
            {/* --- NEW: Card for Teacher Actions --- */}
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
              <h2 className="text-2xl font-bold mb-2">For Teachers</h2>
              <p className="text-muted-foreground mb-4">
                Manage your classroom, track tower progress, and view leaderboards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant="hero" size="lg">
                  {/* Changed text for better clarity */}
                  <Link to="/auth/register">Register Your School</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  {/* Changed text for better clarity */}
                  <Link to="/auth/login">Teacher Sign In</Link>
                </Button>
              </div>
            </div>

            {/* --- NEW: Card for Student Actions --- */}
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
              <h2 className="text-2xl font-bold mb-2">For Students</h2>
              <p className="text-muted-foreground mb-4">
                Log your tower's vitals, record harvests, and see your class progress.
              </p>
              {/* This is the new, clear button for students */}
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link to="/kiosk">Enter Class PIN to Log In</Link>
              </Button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;