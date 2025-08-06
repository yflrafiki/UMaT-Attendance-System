
"use client";

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAttendance } from '@/contexts/attendance-provider';
import { courses } from '@/lib/mock-data';

export default function LecturerPage() {
  const { getAllStudentAttendance } = useAttendance();
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const allStudentData = useMemo(() => getAllStudentAttendance(), [getAllStudentAttendance]);

  const courseStats = useMemo(() => {
    let totalPresent = 0;
    let totalClasses = 0;

    allStudentData.forEach(({ attendance }) => {
      const courseRecords = attendance[selectedCourse] || [];
      totalPresent += courseRecords.filter(r => r.status === 'present').length;
      totalClasses += courseRecords.length;
    });

    const percentage = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
    return {
      percentage: percentage,
      students: allStudentData.length,
    };
  }, [allStudentData, selectedCourse]);

  const studentCourseDetails = useMemo(() => {
    return allStudentData.map(({ student, attendance }) => {
      const courseRecords = attendance[selectedCourse] || [];
      const present = courseRecords.filter(r => r.status === 'present').length;
      const total = courseRecords.length;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      
      let status: "good" | "at_risk" | "poor" = "good";
      if (percentage < 75 && percentage >= 50) {
        status = "at_risk";
      } else if (percentage < 50) {
        status = "poor";
      }

      return {
        ...student,
        present,
        total,
        percentage,
        status,
      };
    }).sort((a,b) => a.percentage - b.percentage);
  }, [allStudentData, selectedCourse]);
  

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">Monitor course attendance and student engagement.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>Course Overview</CardTitle>
                        <CardDescription>Select a course to view its statistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <div className="space-y-2 rounded-lg border p-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Overall Attendance</span>
                                <span className="font-bold">{courseStats.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={courseStats.percentage} className="h-2" />
                             <div className="flex justify-between pt-2">
                                <span className="text-muted-foreground">Enrolled Students</span>
                                <span className="font-bold">{courseStats.students}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Student Performance</CardTitle>
                        <CardDescription>Attendance breakdown for {courses.find(c => c.id === selectedCourse)?.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">Student</TableHead>
                            <TableHead>Attendance</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentCourseDetails.map(student => (
                               <TableRow key={student.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">{student.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={student.percentage} className="h-2 w-24" />
                                        <span className="text-xs font-medium">{student.percentage.toFixed(0)}%</span>
                                     </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={student.status === 'poor' ? 'destructive' : student.status === 'at_risk' ? 'secondary' : 'default'} className="capitalize">
                                        {student.status === 'poor' ? 'Poor' : student.status === 'at_risk' ? 'At Risk' : 'Good'}
                                    </Badge>
                                </TableCell>
                               </TableRow>
                            ))}
                        </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>
    </AppLayout>
  );
}
