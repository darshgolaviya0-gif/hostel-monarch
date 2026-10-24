import type { AllocationHistoryEntry } from '../types';

export const ALLOCATION_HISTORY: AllocationHistoryEntry[] = [
  { id: 'AH-001', studentId: 'HM-STU-1001', studentName: 'Aarav Patel', room: 'A-204', bed: 'Bed 3', action: 'Allocated', date: '2023-07-10', by: 'Meera Iyer' },
  { id: 'AH-002', studentId: 'HM-STU-1004', studentName: 'Dhruv Shah', room: 'A-204', bed: 'Bed 1', action: 'Allocated', date: '2023-07-10', by: 'Meera Iyer' },
  { id: 'AH-003', studentId: 'HM-STU-1010', studentName: 'Yash Rana', room: 'A-301', bed: 'Bed 2', action: 'Allocated', date: '2024-07-05', by: 'Meera Iyer' },
  { id: 'AH-004', studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', room: 'A-102', bed: 'Bed 1', action: 'Allocated', date: '2022-07-08', by: 'Meera Iyer' },
  { id: 'AH-005', studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', room: 'A-101', bed: 'Bed 1', action: 'Transferred', date: '2024-01-15', by: 'Rajesh Kulkarni' },
  { id: 'AH-006', studentId: 'HM-STU-1007', studentName: 'Ishita Trivedi', room: 'B-102', bed: 'Bed 2', action: 'Allocated', date: '2024-07-02', by: 'Meera Iyer' },
];

export const MONTHLY_ADMISSIONS = [
  { month: 'May', applications: 8, approved: 6 },
  { month: 'Jun', applications: 14, approved: 11 },
  { month: 'Jul', applications: 22, approved: 18 },
  { month: 'Aug', applications: 10, approved: 7 },
  { month: 'Sep', applications: 6, approved: 4 },
  { month: 'Oct', applications: 5, approved: 2 },
];

export const COMPLAINT_DISTRIBUTION = [
  { name: 'Electrical', value: 14 },
  { name: 'Plumbing', value: 11 },
  { name: 'Wi-Fi', value: 9 },
  { name: 'Cleaning', value: 7 },
  { name: 'Furniture', value: 5 },
  { name: 'Water', value: 6 },
  { name: 'Other', value: 3 },
];

export const COMPLAINT_STATUS_SPLIT = [
  { name: 'Open', value: 6 },
  { name: 'Assigned', value: 5 },
  { name: 'In Progress', value: 4 },
  { name: 'Resolved', value: 12 },
  { name: 'Closed', value: 28 },
];
