"use client";

import type { AttendanceData, AttendanceRecord, Course, Student } from '@/lib/mock-data';
import { initialAttendance, students, student as defaultStudent, mockStudentAttendance } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type AttendanceQueueItem = {
  courseId: string;
  record: AttendanceRecord;
};

// type Student = {
//   id: string;
//   name: string;
// }

type AttendanceContextType = {
  attendance: AttendanceData;
  markAttendance: (courseId: string, record: AttendanceRecord) => void;
  getCourseAttendance: (courseId: string) => { present: number; total: number; percentage: number };
  isOnline: boolean;
  student: Student;
  setStudent: (student: Student) => void;
  enrolledPhoto: string;
  setEnrolledPhoto: (photoDataUri: string) => void;
    // For lecturer view
  getAllStudentAttendance: () => { student: Student; attendance: AttendanceData }[];
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const getLocalStorageItem = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const item = window.localStorage.getItem(key);
  try {
     return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing localStorage item "${key}":`, e);
    return fallback;
  }
};

export const AttendanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [attendance, setAttendance] = useState<AttendanceData>(() => getLocalStorageItem('attendanceData', initialAttendance));
  const [isOnline, setIsOnline] = useState(true);
  const [student, setStudentState] = useState<Student>(() => getLocalStorageItem('student', defaultStudent));
  const [enrolledPhoto, setEnrolledPhotoState] = useState<string>(() => getLocalStorageItem('enrolledPhoto', defaultStudent.enrolledPhotoDataUri));
  const { toast } = useToast();

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     setIsOnline(navigator.onLine);
  //     const handleOnline = () => setIsOnline(true);
  //     const handleOffline = () => setIsOnline(false);
  //     window.addEventListener('online', handleOnline);
  //     window.addEventListener('offline', handleOffline);
  //     return () => {
  //       window.removeEventListener('online', handleOnline);
  //       window.removeEventListener('offline', handleOffline);
  //     };
  //   }
  // }, []);

  const processQueue = useCallback(() => {
    const queue = getLocalStorageItem<AttendanceQueueItem[]>('attendanceQueue', []);
    if (queue.length === 0) return;

    // Mock API call
    console.log('Syncing offline data to server...', queue);

    setAttendance(prevAttendance => {
      const newAttendance = { ...prevAttendance };
      queue.forEach(({ courseId, record }) => {
        if (!newAttendance[courseId]) {
          newAttendance[courseId] = [];
        }
        // Avoid duplicates
        if (!newAttendance[courseId].some(r => r.date === record.date)) {
          newAttendance[courseId].push(record);
        }
      });
      return newAttendance;
    });

    window.localStorage.removeItem('attendanceQueue');
    toast({
      title: 'Data Synced',
      description: `${queue.length} offline attendance record(s) have been synced with the server.`,
    });
  }, [toast]);

  useEffect(() => {
 
    if (typeof window !== 'undefined') {
      const goOnline = () => {
        setIsOnline(true);
        toast({ title: 'You are back online!' });
        processQueue();
      };
      const goOffline = () => {
        setIsOnline(false);
        toast({
          variant: 'destructive',
          title: 'You are offline',
          description: 'Your data will be saved locally and synced when you are back online.',
        });
      };

      setIsOnline(navigator.onLine);
      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);
      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, [processQueue, toast]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('attendanceData', JSON.stringify(attendance));
    }
  }, [attendance]);

    const setStudent = (newStudent: Student) => {
    setStudentState(newStudent);
    if(typeof window !== 'undefined'){
      window.localStorage.setItem('student', JSON.stringify(newStudent));
      // For demo purposes, if this student has mock data, load it.
      const studentMockData = mockStudentAttendance[newStudent.id];
      if (studentMockData) {
        setAttendance(studentMockData);
      } else {
        setAttendance(getLocalStorageItem(`attendanceData_${newStudent.id}`, {}));
      }
    }
  }

    const setEnrolledPhoto = (photoDataUri: string) => {
    setEnrolledPhotoState(photoDataUri);
     if (typeof window !== 'undefined') {
      window.localStorage.setItem('enrolledPhoto', JSON.stringify(photoDataUri));
    }
  }


  const markAttendance = (courseId: string, record: AttendanceRecord) => {
    const updateLocalState = (prev: AttendanceData): AttendanceData =>{
      const newAttendance = { ...prev };
      if (!newAttendance[courseId]) {
        newAttendance[courseId] = [];
      }
      const existingRecordIndex = newAttendance[courseId].findIndex(r => r.date === record.date);
      if (existingRecordIndex > -1) {
        newAttendance[courseId][existingRecordIndex] = record;
      } else {
        newAttendance[courseId].push(record);
      }
      return newAttendance;
    };
    
    if (isOnline) {
      // In a real app, this would be an API call.
      console.log('Marking attendance online...');
      setAttendance(updateLocalState);
    } else {
      console.log('Marking attendance offline...');
      const queue = getLocalStorageItem<AttendanceQueueItem[]>('attendanceQueue', []);
      // Prevent duplicate actions in the queue for the same date
      const existingQueueIndex = queue.findIndex(item => item.courseId === courseId && item.record.date === record.date);
      if(existingQueueIndex > -1) {
        queue[existingQueueIndex] = { courseId, record };
      } else {
         queue.push({ courseId, record });
      }
      window.localStorage.setItem('attendanceQueue', JSON.stringify(queue));
      toast({
       title: 'Attendance Saved Locally',
        description: 'This record will be synced automatically when you are back online.',
      });
    }
  };

  const getCourseAttendance = (courseId: string) => {
    const records = attendance[courseId] || [];
    const present = records.filter(r => r.status === 'present').length;
    const total = records.length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { present, total, percentage };
  };

   const getAllStudentAttendance = () => {
    // This is a mock implementation for the lecturer view.
    // It combines the current student's data with the mock data.
    const allData = students.map(s => {
      // The currently logged-in student's data is live
      if(s.id === student.id) {
        return { student: s, attendance: attendance };
      }
      // Other students use the mock data.
      return { student: s, attendance: mockStudentAttendance[s.id] || {} };
    });
    return allData;
  }

  return (
    <AttendanceContext.Provider value={{ attendance, markAttendance, getCourseAttendance, isOnline, student, setStudent, enrolledPhoto, setEnrolledPhoto, getAllStudentAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
