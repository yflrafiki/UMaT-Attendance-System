"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd perform authentication here.
    // For this demo, we'll just navigate to the dashboard.
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <CardTitle className="font-headline text-3xl text-primary">UMaT Attendance Assist</CardTitle>
              <CardDescription>Secure, intelligent attendance automation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input id="student-id" placeholder="e.g., UMAT2024001" defaultValue="UMAT2024001" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Sign In
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
