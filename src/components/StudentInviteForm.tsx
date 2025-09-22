// src/components/StudentInviteForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, UserPlus, Users, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface StudentInviteFormProps {
  classroomId: string;
  classroomName: string;
  onSuccess?: () => void;
}

export const StudentInviteForm: React.FC<StudentInviteFormProps> = ({
  classroomId,
  classroomName,
  onSuccess
}) => {
  const [singleName, setSingleName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [inviteMode, setInviteMode] = useState<'single' | 'bulk'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { checkStudentLimit, checkStudentLimitBulk, refreshLimits } = useSubscriptionLimits();

  const parseBulkNames = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
  };

  const generateRandomPin = (existingPins: Set<string> = new Set()): string => {
    const maxRetries = 1000;
    let attempts = 0;
    
    // Check if crypto.getRandomValues is available
    const hasSecureRandom = typeof globalThis.crypto?.getRandomValues === 'function';
    
    while (attempts < maxRetries) {
      let pin: string;
      
      if (hasSecureRandom) {
        // Use crypto.getRandomValues for secure random generation
        const array = new Uint32Array(1);
        globalThis.crypto.getRandomValues(array);
        
        // Generate a 4-digit PIN (1000-9999)
        pin = (1000 + (array[0] % 9000)).toString();
      } else {
        // Fallback to Math.random with rejection sampling to avoid modulo bias
        pin = Math.floor(1000 + Math.random() * 9000).toString();
      }
      
      // Check for uniqueness if existing pins provided
      if (!existingPins.has(pin)) {
        return pin;
      }
      
      attempts++;
    }
    
    // If we still can't generate a unique PIN, throw an error
    const errorMsg = `Could not generate unique PIN after ${maxRetries} attempts. Existing pins: ${existingPins.size}`;
    console.error(`StudentInviteForm.generateRandomPin: ${errorMsg}`);
    throw new Error(errorMsg);
  };

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleName.trim()) {
      setError('Please enter a student name');
      return;
    }

    // Check subscription limits
    const canCreate = await checkStudentLimit();
    if (!canCreate) {
      return; // User will see toast about limits
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get existing PINs to avoid duplicates
      const { data: existingStudents } = await supabase
        .from('students')
        .select('student_pin')
        .eq('classroom_id', classroomId);
      
      const existingPins = new Set(existingStudents?.map(s => s.student_pin).filter(Boolean) || []);
      const studentPin = generateRandomPin(existingPins);
      
      const { error: insertError } = await supabase
        .from('students')
        .insert({
          classroom_id: classroomId,
          display_name: singleName.trim(),
          student_pin: studentPin,
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Student Added",
        description: `${singleName.trim()} has been added to ${classroomName}. Their PIN is ${studentPin}.`,
      });

      setSingleName('');
      refreshLimits();
      onSuccess?.();

    } catch (err: any) {
      console.error('Error inviting student:', err);
      setError(err.message || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkNames.trim()) {
      setError('Please enter student names');
      return;
    }

    const names = parseBulkNames(bulkNames);
    
    if (names.length === 0) {
      setError('Please enter valid student names');
      return;
    }

    // Check subscription limits for bulk creation
    const canCreate = await checkStudentLimitBulk(names.length);
    if (!canCreate) {
      return; // User will see toast about limits
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use a transaction to prevent race conditions in PIN generation
      const { data: studentsToInsert, error: insertError } = await supabase.rpc('create_students_with_unique_pins', {
        classroom_id: classroomId,
        student_names: names,
        teacher_id: teacherId
      });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Students Added",
        description: `${names.length} student${names.length === 1 ? '' : 's'} added to ${classroomName}. Each student has been assigned a random PIN.`,
      });

      setBulkNames('');
      refreshLimits();
      onSuccess?.();

    } catch (err: any) {
      console.error('Error bulk inviting students:', err);
      setError(err.message || 'Failed to add students');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulkPreview = parseBulkNames(bulkNames);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Students to {classroomName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={inviteMode === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInviteMode('single')}
            disabled={isSubmitting}
          >
            Single Student
          </Button>
          <Button
            variant={inviteMode === 'bulk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInviteMode('bulk')}
            disabled={isSubmitting}
          >
            Multiple Students
          </Button>
        </div>

        {/* Single Student Form */}
        {inviteMode === 'single' && (
          <form onSubmit={handleSingleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="e.g. Alex Smith"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting || !singleName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Student...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </>
              )}
            </Button>
          </form>
        )}

        {/* Bulk Students Form */}
        {inviteMode === 'bulk' && (
          <form onSubmit={handleBulkInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkNames">Student Names</Label>
              <Textarea
                id="bulkNames"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder="Enter student names, separated by commas or new lines:&#10;Alex Smith, Jordan Lee&#10;Casey Brown&#10;Taylor Wilson"
                rows={6}
                disabled={isSubmitting}
                required
              />
              <p className="text-sm text-muted-foreground">
                Separate names with commas or new lines
              </p>
            </div>

            {/* Bulk Preview */}
            {bulkPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Preview ({bulkPreview.length} student{bulkPreview.length === 1 ? '' : 's'}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {bulkPreview.map((name, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {name}
                      <button
                        type="button"
                        onClick={() => {
                          const names = parseBulkNames(bulkNames);
                          names.splice(index, 1);
                          setBulkNames(names.join(', '));
                        }}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting || bulkPreview.length === 0}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding {bulkPreview.length} Students...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Add {bulkPreview.length} Student{bulkPreview.length === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};