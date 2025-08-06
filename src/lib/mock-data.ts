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

export type Student = {
  id: string;
  name: string;
  enrolledPhotoDataUri: string;
}

export const students: Student[] = [
    {
    id: 'UMAT2024001',
    name: 'Kofi Mensah',
    enrolledPhotoDataUri: 'https://placehold.co/400x400.png',
  },
  {
    id: 'UMAT2024002',
    name: 'Ama Serwaa',
    enrolledPhotoDataUri: 'https://placehold.co/400x400.png',
  },
   {
    id: 'UMAT2024003',
    name: 'Yaw Boateng',
    enrolledPhotoDataUri: 'https://placehold.co/400x400.png',
  }
];


export const student = students[0];

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

// Mock data for other students for lecturer view
export const mockStudentAttendance: {[studentId: string]: AttendanceData} = {
    [students[0].id]: initialAttendance,
    [students[1].id]: {
        MIN101: [
            { date: '2024-07-15', status: 'present' },
            { date: '2024-07-17', status: 'absent' },
            { date: '2024-07-22', status: 'present' },
        ],
        CSE305: [
            { date: '2024-07-15', status: 'present' },
            { date: '2024-07-17', status: 'present' },
            { date: '2024-07-22', status: 'present' },
            { date: '2024-07-24', status: 'absent' },
        ]
    },
    [students[2].id]: {
         MIN101: [
            { date: '2024-07-15', status: 'absent' },
            { date: '2024-07-17', status: 'absent' },
            { date: '2024-07-22', status: 'present' },
        ],
        GEO202: [
            { date: '2024-07-16', status: 'present' },
            { date: '2024-07-18', status: 'present' },
            { date: '2024-07-23', status: 'present' },
        ],
    }
}
