// SeedingPage v2.0 - Fixed database schema issues
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EducationalPackageProvider } from '@/context/EducationalPackageContext';
import ExperienceSelector from '@/components/educational/ExperienceSelector';
import SeedingInterface from '@/components/educational/SeedingInterface';
import StudentSeedingList from '@/components/educational/StudentSeedingList';
import ClassSeedingOverview from '@/components/educational/ClassSeedingOverview';
import { supabase } from '@/integrations/supabase/client';
import { Sprout, Settings, Users, BarChart3 } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  educational_package: string;
}

interface Student {
  id: string;
  display_name: string;
  classroom_id: string;
}

export default function SeedingPage() {
  const { classroomId } = useParams<{ classroomId?: string }>();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>(classroomId || '');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showExperienceSelector, setShowExperienceSelector] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (classroomId) {
      setSelectedClassroom(classroomId);
    }
  }, [classroomId]);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudents(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) return;

      // Check if user is a teacher (has classrooms) or student
      const { data: teacherClassrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id, name, educational_package')
        .eq('teacher_id', user.id);

      if (classroomsError) throw classroomsError;

      if (teacherClassrooms && teacherClassrooms.length > 0) {
        // User is a teacher
        setUserRole('teacher');
        setClassrooms(teacherClassrooms);
        
        // If a classroom ID is provided in the URL, validate it belongs to this teacher
        if (classroomId) {
          const validClassroom = teacherClassrooms.find(c => c.id === classroomId);
          if (validClassroom) {
            setSelectedClassroom(classroomId);
          } else {
            // Invalid classroom ID, use first available classroom
            setSelectedClassroom(teacherClassrooms[0].id);
          }
        } else {
          setSelectedClassroom(teacherClassrooms[0].id);
        }
      } else {
        // Check if user is a student
        const { data: studentRecord, error: studentError } = await supabase
          .from('students')
          .select('id, classroom_id, classrooms(id, name, educational_package)')
          .eq('id', user.id)
          .single();

        if (studentError && studentError.code !== 'PGRST116') throw studentError;

        if (studentRecord) {
          setUserRole('student');
          setSelectedStudent(studentRecord.id);
          setSelectedClassroom(studentRecord.classroom_id);
          // For students, we still need the classroom info
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('id, name, educational_package')
            .eq('id', studentRecord.classroom_id)
            .single();
          
          if (classroom) {
            setClassrooms([classroom]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (classroomId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, display_name, classroom_id')
        .eq('classroom_id', classroomId)
        .order('display_name');

      if (error) throw error;
      setStudents(data || []);
      
      // Auto-select first student if teacher and no student selected
      if (userRole === 'teacher' && data && data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sprout className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Loading seeding workspace...</p>
        </div>
      </div>
    );
  }

  if (!selectedClassroom) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Classroom Found</h3>
            <p className="text-muted-foreground">
              You need to be part of a classroom to access seeding features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom);
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <EducationalPackageProvider classroomId={selectedClassroom}>
      <div className="container mx-auto py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-primary" />
              <span>Seeding</span>
            </h1>
            <p className="text-muted-foreground">
              Track and manage seed starting for your hydroponic towers
            </p>
          </div>
          
          {userRole === 'teacher' && (
            <Button 
              variant="outline" 
              onClick={() => setShowExperienceSelector(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Learning Settings
            </Button>
          )}
        </div>

        {/* Classroom & Student Selection (Teachers only) */}
        {userRole === 'teacher' && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Classroom</label>
                  <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          <div className="flex items-center space-x-2">
                            <span>{classroom.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {classroom.educational_package}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Student</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Selector Modal */}
        {showExperienceSelector && userRole === 'teacher' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <ExperienceSelector 
                  classroomId={selectedClassroom}
                  onExperienceSelected={() => setShowExperienceSelector(false)}
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowExperienceSelector(false)}
                  className="mt-4 w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {userRole === 'teacher' ? (
          // Teacher View
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <BarChart3 className="h-4 w-4 mr-2" />
                Class Overview
              </TabsTrigger>
              <TabsTrigger value="student-seeding" disabled={!selectedStudent}>
                <Sprout className="h-4 w-4 mr-2" />
                Student Seeding
              </TabsTrigger>
              <TabsTrigger value="student-list" disabled={!selectedStudent}>
                <Users className="h-4 w-4 mr-2" />
                Student's Plants
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <ClassSeedingOverview 
                classroomId={selectedClassroom} 
                onActionClick={(action) => {
                  switch (action) {
                    case 'start-seeding':
                      // Switch to student seeding tab
                      setSelectedStudent(students[0]?.id || '');
                      break;
                    case 'check-germination':
                      // Switch to student list tab to review germination
                      setSelectedStudent(students[0]?.id || '');
                      break;
                    case 'transfer-towers':
                      // Switch to student list tab to transfer seedlings
                      setSelectedStudent(students[0]?.id || '');
                      break;
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="student-seeding">
              {selectedStudent && selectedStudentData && (
                <SeedingInterface
                  studentId={selectedStudent}
                  classroomId={selectedClassroom}
                  studentName={selectedStudentData.display_name}
                  onSeedingComplete={() => {
                    // Refresh overview or switch to student list
                  }}
                />
              )}
            </TabsContent>
            
            <TabsContent value="student-list">
              {selectedStudent && (
                <StudentSeedingList
                  studentId={selectedStudent}
                  classroomId={selectedClassroom}
                  onStartNewSeeding={() => {
                    // Switch to student seeding tab
                    // The tab switching will be handled by the parent component
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Student View
          <Tabs defaultValue="seeding" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="seeding">
                <Sprout className="h-4 w-4 mr-2" />
                New Seeding
              </TabsTrigger>
              <TabsTrigger value="my-plants">
                <Users className="h-4 w-4 mr-2" />
                My Plants
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="seeding">
              <SeedingInterface
                studentId={selectedStudent}
                classroomId={selectedClassroom}
                studentName={selectedStudentData?.display_name || "Student"}
                onSeedingComplete={() => {
                  // Could auto-switch to my-plants tab
                }}
              />
            </TabsContent>
            
            <TabsContent value="my-plants">
              <StudentSeedingList
                studentId={selectedStudent}
                classroomId={selectedClassroom}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </EducationalPackageProvider>
  );
}