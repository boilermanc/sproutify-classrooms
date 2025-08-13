import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { GradientBackground } from "@/components/GradientBackground";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative flex items-center">
      <SEO
        title="Sproutify School | Classroom Tower Tracker"
        description="Manage classroom vertical tower gardens: track vitals, pests, plants, and harvests with friendly dashboards."
        canonical="/"
      />
      <GradientBackground className="absolute inset-0" />
      <main className="relative container mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png" 
              alt="Sproutify School Logo" 
              className="w-16 h-16"
            />
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Sproutify School
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            A simple, student‑friendly way to track vertical tower growing in the classroom. Add towers, log pH/EC and lighting, manage pests, record harvests and celebrate wins on leaderboards.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="hero" size="lg">
              <Link to="/auth/register">Register Teacher</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
