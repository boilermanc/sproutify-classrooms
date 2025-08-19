// src/pages/kiosk/StudentDashboard.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

// Define a type for our tower data
type Tower = {
  id: string;
  name: string;
  ports: number;
};

// A new component for displaying a single tower card
const TowerCard = ({ tower }: { tower: Tower }) => (
  <Link to={`/student/tower/${tower.id}`}>
    <Card className="hover:bg-muted/50 hover:border-primary transition-all h-full">
      <CardHeader>
        <CardTitle>{tower.name}</CardTitle>
        <CardDescription>{tower.ports} ports</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

export default function StudentDashboard() {
  // State now holds an array of towers, not just one ID
  const [towers, setTowers] = useState<Tower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const classroomId = localStorage.getItem("student_classroom_id");
    if (!classroomId) {
      setLoading(false);
      return;
    }

    const fetchTowersForClass = async () => {
      // First, get the teacher_id for the classroom
      const { data: classroomData, error: classError } = await supabase
        .from("classrooms")
        .select("teacher_id")
        .eq("id", classroomId)
        .single();
      
      if (classError || !classroomData) {
        console.error("Could not find classroom's teacher");
        setLoading(false);
        return;
      }

      const currentTeacherId = classroomData.teacher_id;
      localStorage.setItem("teacher_id_for_tower", currentTeacherId);
      
      // Now, fetch ALL towers belonging to that teacher
      const { data: towerData, error: towerError } = await supabase
        .from("towers")
        .select("id, name, ports") // Get all the info we need for the cards
        .eq("teacher_id", currentTeacherId);
      
      if (towerError) {
        console.error("Could not find towers for this class:", towerError);
      } else {
        setTowers(towerData || []);
      }
      setLoading(false);
    };

    fetchTowersForClass();
  }, []);

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Student Dashboard | Sproutify School" />
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Select a tower to begin logging data.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Class Towers</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Show skeleton loaders while fetching
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader></Card>
            ))
          ) : towers.length > 0 ? (
            // Map over the towers and display a card for each
            towers.map(tower => <TowerCard key={tower.id} tower={tower} />)
          ) : (
            <p className="text-muted-foreground col-span-full">No towers have been added for this class yet.</p>
          )}
        </div>
      </div>

      <Leaderboard />
    </div>
  );
}
