
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAttendance } from '@/contexts/attendance-provider';

export default function LecturerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setStudent } = useAttendance(); // Re-using student context for simplicity
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter your fullname, email and password.',
      });
      return;
    }
    // In a real app, you would authenticate the lecturer here.
    // For this demo, we'll use a mock lecturer identity.
    setStudent({ name: fullName, id: `LECTURER${Date.now().toString().slice(-4)}`, enrolledPhotoDataUri: '' });
    router.push('/lecturers');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <Card className="shadow-2xl">
             <Button asChild variant="ghost" size="sm" className="absolute m-4">
                  <Link href="/">
                      <ArrowLeft className="mr-2"/>
                      Back
                  </Link>
              </Button>
            <CardHeader className="text-center pt-12">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary">Lecturer Login</CardTitle>
              <CardDescription>Sign in to access the lecturer dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="e.g., Dr. Jane Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="e.g., lecturer@umat.edu.gh" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="********" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Login
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

