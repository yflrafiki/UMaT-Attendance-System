
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAttendance } from '@/contexts/attendance-provider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { setStudent } = useAttendance();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !studentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your full name and student ID.',
      });
      return;
    }
    setStudent({ name: fullName, id: studentId, enrolledPhotoDataUri: 'https://placehold.co/400x400.png' });
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignup}>
          <Card className="shadow-2xl">
              <Button asChild variant="ghost" size="sm" className="absolute m-4">
                  <Link href="/">
                      <ArrowLeft className="mr-2"/>
                      Back
                  </Link>
              </Button>
            <CardHeader className="text-center pt-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary">Student Account</CardTitle>
              <CardDescription>Create your account to get started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="e.g., Kofi Mensah" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input 
                  id="student-id" 
                  placeholder="e.g., UMAT2024001" 
                  required 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Sign Up & Enter
              </Button>
            </CardFooter>
          </Card>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Built for the University of Mines and Technology, Tarkwa.
        </p>
      </div>
    </main>
  );
}

