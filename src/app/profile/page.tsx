
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { student as defaultStudent } from '@/lib/mock-data';
import { Upload, User, Save } from 'lucide-react';
import { useAttendance } from '@/contexts/attendance-provider';

export default function ProfilePage() {
  const { enrolledPhoto, setEnrolledPhoto, student } = useAttendance();
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (newPhoto) {
      setEnrolledPhoto(newPhoto);
      toast({
        title: 'Profile Updated',
        description: 'Your new enrollment photo has been saved.',
      });
      setNewPhoto(null);
      setNewPhotoFile(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and enrollment photo.</p>
        </div>

        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>Enrollment Photo</CardTitle>
            <CardDescription>
              This photo is used to verify your identity during attendance capture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
               <Image
                src={newPhoto || enrolledPhoto}
                alt="Enrollment photo"
                width={200}
                height={200}
                className="rounded-full aspect-square object-cover border-4 border-primary/20"
                data-ai-hint="person"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {enrolledPhoto ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </div>
            <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input id="student-id" value={student.id} readOnly disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input id="student-name" value={student.name} readOnly disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSave} disabled={!newPhoto}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
