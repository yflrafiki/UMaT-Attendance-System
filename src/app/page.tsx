"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, ShieldCheck, User } from 'lucide-react';
import { useAttendance } from '@/contexts/attendance-provider';
import { useToast } from '@/hooks/use-toast';

export default function WelcomePage() {
  const router = useRouter();
  // const { setStudent } = useAttendance();
  // const { toast } = useToast();
  // const [fullName, setFullName] = useState('');
  // const [studentId, setStudentId] = useState('');

  // const handleSignup = (e: React.FormEvent) => {
  //   e.preventDefault();
  //    if (!fullName || !studentId) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Missing Information',
  //       description: 'Please enter your full name and student ID.',
  //     });
  //     return;
  //    }
  //    // In a real app, you'd perform authentication here.
  //   // For this demo, we'll just navigate to the dashboard.
  //   setStudent({ name: fullName, id: studentId });
  //   router.push('/dashboard');
  // };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-headline text-4xl font-bold text-primary">UMaT Attendance Assist</h1>
        <p className="mt-2 text-lg text-muted-foreground">Secure, intelligent attendance automation.</p>
         <p className="mt-4 text-center text-xs text-muted-foreground">
          Built for the University of Mines and Technology, Tarkwa.
        </p>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow">
          <CardHeader className="text-center">
             <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-7 w-7" />
              </div>
            <CardTitle className="font-headline text-2xl">Student Portal</CardTitle>
            <CardDescription>Access your dashboard, mark attendance, and view your history.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button onClick={() => router.push('/student/signup')} className="w-full">
              Enter Student Portal
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-xl hover:shadow-2xl transition-shadow">
          <CardHeader className="text-center">
             <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-7 w-7" />
              </div>
            <CardTitle className="font-headline text-2xl">Lecturer Portal</CardTitle>
            <CardDescription>Monitor course attendance and student engagement.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Button onClick={() => router.push('/lecturer/login')} className="w-full">
              Enter Lecturer Portal
            </Button>
          </CardContent>
        </Card>
        
      </div>
    </main>
  );
}
