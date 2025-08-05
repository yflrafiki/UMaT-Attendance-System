"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Camera, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { detectImpersonation, type DetectImpersonationOutput } from '@/ai/flows/detect-impersonation';
import { courses, student } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/contexts/attendance-provider';

// This is a 1x1 red pixel PNG as a base64 data URI, simulating a "live" photo.
const LIVE_PHOTO_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epv2AAAAABJRU5ErkJggg==';

export default function CapturePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectImpersonationOutput | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const { markAttendance, isOnline } = useAttendance();

  const handleCapture = async () => {
    if (!selectedCourse) {
      toast({
        variant: 'destructive',
        title: 'No course selected',
        description: 'Please select a course to mark attendance for.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectImpersonation({
        livePhotoDataUri: LIVE_PHOTO_URI,
        enrolledPhotoDataUri: student.enrolledPhotoDataUri,
      });
      setResult(detectionResult);
    } catch (error) {
      console.error('Impersonation detection failed:', error);
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'Could not complete the verification process. Please try again.',
      });
      setResult(null);
    } finally {
      setIsLoading(false);
      setIsAlertOpen(true);
    }
  };

  const handleConfirmAttendance = () => {
    if (!selectedCourse || !result || result.isImpersonation) return;

    const today = new Date().toISOString().split('T')[0];
    markAttendance(selectedCourse, { date: today, status: 'present' });

    toast({
      title: 'Attendance Marked!',
      description: `Your attendance for ${courses.find(c => c.id === selectedCourse)?.name} has been recorded.`,
    });
    setIsAlertOpen(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Capture Attendance</h1>
          <p className="text-muted-foreground">Verify your presence for today's class.</p>
        </div>

        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>Select your course and capture your photo to mark attendance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
              <Camera className="h-16 w-16 text-muted-foreground" />
            </div>
            <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleCapture} disabled={isLoading || !selectedCourse}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {isLoading ? 'Verifying...' : 'Capture & Verify'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          {result && (
            <>
              <AlertDialogHeader>
                <div className="mx-auto mb-4">
                  {result.isImpersonation ? (
                    <ShieldAlert className="h-16 w-16 text-destructive" />
                  ) : (
                    <ShieldCheck className="h-16 w-16 text-green-600" />
                  )}
                </div>
                <AlertDialogTitle className="text-center font-headline text-2xl">
                  {result.isImpersonation ? 'Impersonation Alert!' : 'Verification Successful'}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  {result.reason} (Confidence: {(result.confidence * 100).toFixed(0)}%)
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                {result.isImpersonation ? (
                  <AlertDialogAction onClick={() => setIsAlertOpen(false)}>Close</AlertDialogAction>
                ) : (
                  <>
                    <AlertDialogCancel>Retake</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAttendance}>Mark as Present</AlertDialogAction>
                  </>
                )}
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
