"use client";

import type { AttendanceData, AttendanceRecord, Course } from '@/lib/mock-data';
import { initialAttendance } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type AttendanceQueueItem = {
  courseId: string;
  record: AttendanceRecord;
};

type AttendanceContextType = {
  attendance: AttendanceData;
  markAttendance: (courseId: string, record: AttendanceRecord) => void;
  getCourseAttendance: (courseId: string) => { present: number; total: number; percentage: number };
  isOnline: boolean;
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const getLocalStorageItem = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

export const AttendanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [attendance, setAttendance] = useState<AttendanceData>(() => getLocalStorageItem('attendanceData', initialAttendance));
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const processQueue = useCallback(() => {
    const queue = getLocalStorageItem<AttendanceQueueItem[]>('attendanceQueue', []);
    if (queue.length === 0) return;

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
      description: `${queue.length} offline attendance record(s) have been synced.`,
    });
  }, [toast]);

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('attendanceData', JSON.stringify(attendance));
    }
  }, [attendance]);

  const markAttendance = (courseId: string, record: AttendanceRecord) => {
    const update = (prev: AttendanceData): AttendanceData => {
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
      setAttendance(update);
    } else {
      const queue = getLocalStorageItem<AttendanceQueueItem[]>('attendanceQueue', []);
      queue.push({ courseId, record });
      window.localStorage.setItem('attendanceQueue', JSON.stringify(queue));
      toast({
        title: 'You are offline',
        description: 'Attendance has been saved locally and will be synced when you are back online.',
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

  return (
    <AttendanceContext.Provider value={{ attendance, markAttendance, getCourseAttendance, isOnline }}>
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
