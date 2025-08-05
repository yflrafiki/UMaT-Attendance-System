"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Loader2, ShieldAlert, ShieldCheck, RefreshCcw, Send } from 'lucide-react';
import { detectImpersonation, type DetectImpersonationOutput } from '@/ai/flows/detect-impersonation';
import { courses, student } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/contexts/attendance-provider';

export default function CapturePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectImpersonationOutput | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { markAttendance } = useAttendance();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (hasCameraPermission) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [hasCameraPermission, toast]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(dataUri);
  };
  
  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleVerify = async () => {
    if (!selectedCourse) {
      toast({
        variant: 'destructive',
        title: 'No course selected',
        description: 'Please select a course to mark attendance for.',
      });
      return;
    }

    if (!capturedPhoto) {
      toast({
        variant: 'destructive',
        title: 'No Photo Captured',
        description: 'Please capture a photo first.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const detectionResult = await detectImpersonation({
        livePhotoDataUri: capturedPhoto,
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
    setCapturedPhoto(null);
  };

  const closeAlertAndRetake = () => {
    setIsAlertOpen(false);
    handleRetake();
  }

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
            <CardDescription>Select your course, capture your photo, and verify to mark attendance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative w-full aspect-video">
              {capturedPhoto ? (
                 <Image src={capturedPhoto} alt="Captured photo" layout="fill" objectFit="cover" className="rounded-md"/>
              ) : (
                <>
                <video ref={videoRef} className="w-full h-full rounded-md bg-muted object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Camera access is required. Please allow camera permissions in your browser.
                    </p>
                  </div>
                )}
                 {hasCameraPermission === null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                </>
              )}
               <canvas ref={canvasRef} className="hidden" />
            </div>
             <Select onValueChange={setSelectedCourse} value={selectedCourse} disabled={!!capturedPhoto}>
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
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            {capturedPhoto ? (
              <>
                <Button className="w-full sm:w-auto" variant="outline" onClick={handleRetake} disabled={isLoading}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retake Photo
                </Button>
                <Button className="w-full sm:flex-1" onClick={handleVerify} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={handleCapture} disabled={isLoading || !selectedCourse || !hasCameraPermission}>
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            )}
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
                  <AlertDialogAction onClick={() => closeAlertAndRetake()}>Try Again</AlertDialogAction>
                ) : (
                  <>
                    <AlertDialogCancel onClick={closeAlertAndRetake}>Retake</AlertDialogCancel>
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
