export type Course = {
  id: string;
  name: string;
  totalClasses?: number;
};

export type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent';
};

export type AttendanceData = {
  [courseId: string]: AttendanceRecord[];
};

export const student = {
  id: 'UMAT2024001',
  name: 'Kofi Mensah',
  // This is a placeholder image. In a real app, this would be a proper photo.
  // Using a larger, more complex image to avoid model errors.
  enrolledPhotoDataUri: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
};

export const courses: Course[] = [
  { id: 'MIN101', name: 'Introduction to Mining Engineering', totalClasses: 20 },
  { id: 'GEO202', name: 'Structural Geology', totalClasses: 24 },
  { id: 'CSE305', name: 'Database Systems', totalClasses: 18 },
  { id: 'ELE401', name: 'Digital Signal Processing', totalClasses: 22 },
];

export const initialAttendance: AttendanceData = {
  MIN101: [
    { date: '2024-07-15', status: 'present' },
    { date: '2024-07-17', status: 'present' },
    { date: '2024-07-22', status: 'present' },
  ],
  GEO202: [
    { date: '2024-07-16', status: 'present' },
    { date: '2024-07-18', status: 'absent' },
    { date: '2024-07-23', status: 'present' },
  ],
  CSE305: [
    { date: '2024-07-15', status: 'present' },
    { date: '2024-07-17', status: 'present' },
    { date: '2024-07-22', status: 'present' },
    { date: '2024-07-24', status: 'present' },
  ],
  ELE401: [
    { date: '2024-07-16', status: 'present' },
    { date: '2024-07-23', status: 'present' },
  ],
};
