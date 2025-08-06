
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAttendance } from '@/contexts/attendance-provider';
import { courses } from '@/lib/mock-data';
import { Bot, Loader2 } from 'lucide-react';
import { generateAttendanceReport } from '@/ai/flows/generate-attendance-report';
import { useToast } from '@/hooks/use-toast';

export default function LecturerPage() {
  const { getAllStudentAttendance } = useAttendance();
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [report, setReport] = useState('');
  const allStudentData = useMemo(() => getAllStudentAttendance(), [getAllStudentAttendance]);
  const { toast } = useToast();

  const courseStats = useMemo(() => {
    let totalPresent = 0;
    let totalClasses = 0;
    let enrolledStudents = 0;

   allStudentData.forEach(({ student, attendance }) => {
       const courseRecords = attendance[selectedCourse] || [];
       // Only count students who are "enrolled" in the course (have records)
      if (courseRecords.length > 0) {
        enrolledStudents++;
        totalPresent += courseRecords.filter(r => r.status === 'present').length;
        totalClasses += courseRecords.length;
      } else if (mockStudentAttendance[student.id] && mockStudentAttendance[student.id][selectedCourse]) {
        // Fallback for mock data if live records are empty
        const mockRecords = mockStudentAttendance[student.id][selectedCourse];
        if (mockRecords) {
           enrolledStudents++;
           totalPresent += mockRecords.filter(r => r.status === 'present').length;
           totalClasses += mockRecords.length;
        }
      }
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
  
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport('');
    try {
      const courseName = courses.find(c => c.id === selectedCourse)?.name || 'the course';
      const reportData = await generateAttendanceReport({
        courseName,
        studentAttendance: studentCourseDetails
          .filter(s => s.total > 0) // Only include students with attendance records for the course
          .map(s => ({ name: s.name, id: s.id, percentage: s.percentage, status: s.status})),
      });
      setReport(reportData.report);
    } catch(error) {
      console.error("Failed to generate report:", error);
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: 'Could not generate the AI report. Please try again.',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }

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
                        <Select onValueChange={(value) => { setSelectedCourse(value); setReport(''); }} value={selectedCourse}>
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
                                <span className="text-muted-foreground">Total Students</span>
                                <span className="font-bold">{courseStats.students}</span>
                            </div>
                        </div>
                          <div className="space-y-2">
                           <Button className="w-full" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                            {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            {isGeneratingReport ? 'Analyzing...' : 'Generate AI Report'}
                           </Button>
                           {report && (
                              <Textarea
                                readOnly
                                value={report}
                                className="h-32 text-sm bg-muted/50"
                                placeholder="AI Report will appear here..."
                                />
                           )}
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
