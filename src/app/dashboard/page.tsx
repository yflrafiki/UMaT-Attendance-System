"use client";

import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAttendance } from '@/contexts/attendance-provider';
import { courses, type Course } from '@/lib/mock-data';
import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--destructive))'];

export default function DashboardPage() {
  const { attendance, getCourseAttendance } = useAttendance();

  const overallStats = React.useMemo(() => {
    let totalPresent = 0;
    let totalClasses = 0;
    courses.forEach(course => {
      const courseRecords = attendance[course.id] || [];
      totalPresent += courseRecords.filter(r => r.status === 'present').length;
      totalClasses += courseRecords.length;
    });
    const totalAbsent = totalClasses - totalPresent;
    return [
      { name: 'Present', value: totalPresent },
      { name: 'Absent', value: totalAbsent },
    ];
  }, [attendance]);

  const overallPercentage =
    overallStats[0].value + overallStats[1].value > 0
      ? (overallStats[0].value / (overallStats[0].value + overallStats[1].value)) * 100
      : 0;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your attendance summary.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Overall Attendance</CardTitle>
              <CardDescription>A summary of your attendance across all courses.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overallStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {overallStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        borderRadius: 'var(--radius)',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="font-headline text-4xl font-bold">{overallPercentage.toFixed(1)}%</p>
                <p className="text-muted-foreground">Attendance Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Detailed attendance for each course.</CardDescription>
              </div>
              <Button asChild>
                <Link href="/capture">
                  Mark Attendance <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-center">Attended</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="w-[120px]">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => {
                    const stats = getCourseAttendance(course.id);
                    const totalClasses = course.totalClasses || stats.total;
                    const percentage = totalClasses > 0 ? (stats.present / totalClasses) * 100 : 0;
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell className="text-center">{stats.present}</TableCell>
                        <TableCell className="text-center">{totalClasses}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={percentage} className="h-2" />
                            <span className="text-xs font-medium">{percentage.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
