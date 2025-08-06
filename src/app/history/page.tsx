
"use client";

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/contexts/attendance-provider';
import { courses } from '@/lib/mock-data';
import { format } from 'date-fns';

export default function HistoryPage() {
  const { attendance, getCourseAttendance } = useAttendance();
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');

  const { presentDays, absentDays, attendanceRecords } = useMemo(() => {
    const records = attendance[selectedCourse] || [];
    const presentDays: Date[] = [];
    const absentDays: Date[] = [];
    
    records.forEach(record => {
      if (record.status === 'present') {
        presentDays.push(new Date(record.date));
      } else {
        absentDays.push(new Date(record.date));
      }
    });

    return {
      presentDays,
      absentDays,
      attendanceRecords: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [attendance, selectedCourse]);
  
  const courseStats = getCourseAttendance(selectedCourse);
  const totalClasses = courses.find(c => c.id === selectedCourse)?.totalClasses || courseStats.total;


  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">Review your attendance records for each course.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Select Course</CardTitle>
                    <CardDescription>Pick a course to see your detailed attendance.</CardDescription>
                </CardHeader>
                <CardContent>
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
                    
                    <div className="mt-6 flex justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold">{courseStats.present}</p>
                            <p className="text-sm text-muted-foreground">Present</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalClasses - courseStats.present}</p>
                            <p className="text-sm text-muted-foreground">Absent</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold">{courseStats.percentage.toFixed(0)}%</p>
                            <p className="text-sm text-muted-foreground">Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="flex flex-col md:flex-row">
              <CardContent className="p-4 md:w-1/2 md:border-r">
                <Calendar
                  mode="multiple"
                  selected={[...presentDays, ...absentDays]}
                  modifiers={{
                    present: presentDays,
                    absent: absentDays,
                  }}
                  modifiersStyles={{
                    present: { 
                      color: 'hsl(var(--primary-foreground))',
                      backgroundColor: 'hsl(var(--primary))',
                     },
                    absent: { 
                      color: 'hsl(var(--destructive-foreground))',
                      backgroundColor: 'hsl(var(--destructive))',
                    },
                  }}
                  className="mx-auto"
                />
              </CardContent>
              <div className="md:w-1/2">
                <CardHeader className='pb-2'>
                    <CardTitle>Records</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 max-h-72 overflow-y-auto">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map(record => (
                          <TableRow key={record.date}>
                            <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={record.status === 'present' ? 'default' : 'destructive'} className="capitalize">
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No records found for this course.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
