import type { Invoice, Payment } from '../types';

export const INVOICES: Invoice[] = [
  { id: 'INV-001', invoiceNo: 'HM/INV/2026/1001', studentId: 'HM-STU-1001', studentName: 'Aarav Patel', room: 'A-204', title: 'Hostel Fee — Term 2', amount: 45000, paidAmount: 32500, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Partially Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-002', invoiceNo: 'HM/INV/2026/1002', studentId: 'HM-STU-1002', studentName: 'Riya Shah', room: 'B-102', title: 'Hostel Fee — Term 2', amount: 45000, paidAmount: 45000, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-003', invoiceNo: 'HM/INV/2026/1003', studentId: 'HM-STU-1003', studentName: 'Krish Mehta', room: 'A-101', title: 'Hostel Fee — Term 2', amount: 42000, paidAmount: 33800, dueDate: '2026-10-05', issuedDate: '2026-09-01', status: 'Partially Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-004', invoiceNo: 'HM/INV/2026/1004', studentId: 'HM-STU-1004', studentName: 'Dhruv Shah', room: 'A-204', title: 'Hostel Fee — Term 2', amount: 40000, paidAmount: 27500, dueDate: '2026-09-25', issuedDate: '2026-08-20', status: 'Overdue', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-005', invoiceNo: 'HM/INV/2026/1005', studentId: 'HM-STU-1005', studentName: 'Ananya Desai', room: 'B-201', title: 'Hostel Fee — Term 2', amount: 45000, paidAmount: 45000, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-006', invoiceNo: 'HM/INV/2026/1006', studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', room: 'A-101', title: 'Hostel Fee — Term 2', amount: 42000, paidAmount: 37500, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Partially Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-007', invoiceNo: 'HM/INV/2026/1007', studentId: 'HM-STU-1007', studentName: 'Ishita Trivedi', room: 'B-102', title: 'Hostel Fee — Term 1', amount: 45000, paidAmount: 30000, dueDate: '2026-09-15', issuedDate: '2026-07-02', status: 'Overdue', period: 'Jul 2026 – Oct 2026', semester: 'Semester 1' },
  { id: 'INV-008', invoiceNo: 'HM/INV/2026/1008', studentId: 'HM-STU-1008', studentName: 'Kabir Chaudhary', room: 'A-301', title: 'Hostel Fee — Term 2', amount: 42000, paidAmount: 42000, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-009', invoiceNo: 'HM/INV/2026/1009', studentId: 'HM-STU-1009', studentName: 'Sanya Agarwal', room: 'B-201', title: 'Hostel Fee — Term 2', amount: 45000, paidAmount: 38200, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Partially Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-010', invoiceNo: 'HM/INV/2026/1010', studentId: 'HM-STU-1010', studentName: 'Yash Rana', room: 'A-301', title: 'Hostel Fee — Term 1', amount: 42000, paidAmount: 27000, dueDate: '2026-09-20', issuedDate: '2026-07-05', status: 'Overdue', period: 'Jul 2026 – Oct 2026', semester: 'Semester 1' },
  { id: 'INV-011', invoiceNo: 'HM/INV/2026/1011', studentId: 'HM-STU-1011', studentName: 'Aditi Pandya', room: 'B-101', title: 'Hostel Fee — Term 2', amount: 45000, paidAmount: 45000, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-012', invoiceNo: 'HM/INV/2026/1012', studentId: 'HM-STU-1012', studentName: 'Rohan Bhatt', room: 'A-203', title: 'Hostel Fee — Term 2', amount: 40000, paidAmount: 37900, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Partially Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-013', invoiceNo: 'HM/INV/2026/1013', studentId: 'HM-STU-1001', studentName: 'Aarav Patel', room: 'A-204', title: 'Mess Fee — Term 2', amount: 14000, paidAmount: 14000, dueDate: '2026-10-10', issuedDate: '2026-09-01', status: 'Paid', period: 'Oct 2026 – Jan 2027', semester: 'Semester 2' },
  { id: 'INV-014', invoiceNo: 'HM/INV/2026/1014', studentId: 'HM-STU-1003', studentName: 'Krish Mehta', room: 'A-101', title: 'Security Deposit (Refundable)', amount: 10000, paidAmount: 10000, dueDate: '2026-08-01', issuedDate: '2026-07-01', status: 'Paid', period: 'One-time', semester: 'One-time' },
];

export const PAYMENTS: Payment[] = [
  { id: 'PAY-001', transactionId: 'HM-TXN-993201', invoiceId: 'INV-002', invoiceNo: 'HM/INV/2026/1002', studentId: 'HM-STU-1002', studentName: 'Riya Shah', amount: 45000, method: 'UPI', status: 'Success', date: '2026-09-08 11:24 AM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-002', transactionId: 'HM-TXN-993311', invoiceId: 'INV-005', invoiceNo: 'HM/INV/2026/1005', studentId: 'HM-STU-1005', studentName: 'Ananya Desai', amount: 45000, method: 'Razorpay Link', status: 'Success', date: '2026-09-10 09:02 AM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-003', transactionId: 'HM-TXN-993455', invoiceId: 'INV-008', invoiceNo: 'HM/INV/2026/1008', studentId: 'HM-STU-1008', studentName: 'Kabir Chaudhary', amount: 42000, method: 'Net Banking', status: 'Success', date: '2026-09-12 04:40 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-004', transactionId: 'HM-TXN-993500', invoiceId: 'INV-011', invoiceNo: 'HM/INV/2026/1011', studentId: 'HM-STU-1011', studentName: 'Aditi Pandya', amount: 45000, method: 'UPI', status: 'Success', date: '2026-09-15 10:10 AM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-005', transactionId: 'HM-TXN-993612', invoiceId: 'INV-001', invoiceNo: 'HM/INV/2026/1001', studentId: 'HM-STU-1001', studentName: 'Aarav Patel', amount: 32500, method: 'UPI', status: 'Success', date: '2026-09-18 06:12 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-006', transactionId: 'HM-TXN-993721', invoiceId: 'INV-003', invoiceNo: 'HM/INV/2026/1003', studentId: 'HM-STU-1003', studentName: 'Krish Mehta', amount: 33800, method: 'Card', status: 'Success', date: '2026-09-20 02:48 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-007', transactionId: 'HM-TXN-993855', invoiceId: 'INV-004', invoiceNo: 'HM/INV/2026/1004', studentId: 'HM-STU-1004', studentName: 'Dhruv Shah', amount: 27500, method: 'UPI', status: 'Success', date: '2026-09-02 08:05 AM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-008', transactionId: 'HM-TXN-994012', invoiceId: 'INV-006', invoiceNo: 'HM/INV/2026/1006', studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', amount: 37500, method: 'Razorpay Link', status: 'Success', date: '2026-09-22 07:33 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-009', transactionId: 'HM-TXN-994150', invoiceId: 'INV-009', invoiceNo: 'HM/INV/2026/1009', studentId: 'HM-STU-1009', studentName: 'Sanya Agarwal', amount: 38200, method: 'UPI', status: 'Success', date: '2026-09-25 01:15 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-010', transactionId: 'HM-TXN-994305', invoiceId: 'INV-012', invoiceNo: 'HM/INV/2026/1012', studentId: 'HM-STU-1012', studentName: 'Rohan Bhatt', amount: 37900, method: 'Net Banking', status: 'Success', date: '2026-09-28 03:50 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-011', transactionId: 'HM-TXN-994420', invoiceId: 'INV-007', invoiceNo: 'HM/INV/2026/1007', studentId: 'HM-STU-1007', studentName: 'Ishita Trivedi', amount: 30000, method: 'UPI', status: 'Success', date: '2026-07-20 05:05 PM', verifiedBy: 'Nilesh Shah' },
  { id: 'PAY-012', transactionId: 'HM-TXN-994501', invoiceId: 'INV-010', invoiceNo: 'HM/INV/2026/1010', studentId: 'HM-STU-1010', studentName: 'Yash Rana', amount: 27000, method: 'UPI', status: 'Success', date: '2026-07-22 11:40 AM', verifiedBy: 'Nilesh Shah' },
];

export const MONTHLY_COLLECTION = [
  { month: 'May', collected: 480000, due: 520000 },
  { month: 'Jun', collected: 610000, due: 650000 },
  { month: 'Jul', collected: 720000, due: 760000 },
  { month: 'Aug', collected: 690000, due: 740000 },
  { month: 'Sep', collected: 810000, due: 860000 },
  { month: 'Oct', collected: 455000, due: 900000 },
];
