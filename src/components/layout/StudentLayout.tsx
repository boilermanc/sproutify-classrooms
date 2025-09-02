// src/components/layout/StudentLayout.tsx

import { useEffect, useState, PropsWithChildren } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { LogOut, Book } from "lucide-react";

export default function StudentLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [className, setClassName] = useState<string | null>(null);

  useEffect(() => {
    // This is the "auth check" for the student portal
    const classroomId = localStorage.getItem("student_classroom_id");
    const classroomName = localStorage.getItem("student_classroom_name");

    if (!classroomId || !classroomName) {
      // If not "logged in", redirect to the kiosk page
      navigate("/app/kiosk");
    } else {
      setClassName(classroomName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("student_classroom_id");
    localStorage.removeItem("student_classroom_name");
    // Navigate to home page instead of kiosk
    navigate("/");
  };

  // Don't render anything until the auth check is complete
  if (!className) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/student/dashboard" className="font-bold text-xl">
            {className}
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/pest-disease-guide">
                <Book className="mr-2 h-4 w-4" />
                Learning Guide
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}