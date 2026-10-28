import type { Admission, AdmissionDocument } from '../types';

const DOC_TYPES: AdmissionDocument['type'][] = [
  'Aadhaar',
  'Student ID',
  'College ID',
  'Address Proof',
  'Passport Photo',
  'Guardian ID',
  'Medical Document',
];

function makeDocs(uploaded: number, verified: number): AdmissionDocument[] {
  return DOC_TYPES.map((type, idx) => {
    if (idx < verified) {
      return { id: `${type}-v`, type, status: 'Verified', fileName: `${type.replace(/\s/g, '_')}.pdf`, uploadedAt: '2026-06-18' };
    }
    if (idx < uploaded) {
      return { id: `${type}-u`, type, status: 'Uploaded', fileName: `${type.replace(/\s/g, '_')}.pdf`, uploadedAt: '2026-06-20' };
    }
    return { id: `${type}-p`, type, status: 'Pending', fileName: '', uploadedAt: null };
  });
}

export const ADMISSIONS: Admission[] = [
  {
    id: 'ADM-2026-001',
    applicationNo: 'HM/ADM/2026/0145',
    studentName: 'Ishita Trivedi',
    studentId: 'HM-STU-1007',
    avatar: '',
    course: 'B.Tech Information Technology',
    college: 'Sarvajanik College of Engineering & Technology',
    phone: '+91 97370 66778',
    email: 'ishita.trivedi@hostelmonarch.in',
    appliedOn: '2026-06-15',
    stage: 'Verification',
    documents: makeDocs(7, 5),
    history: [
      { stage: 'Application Started', date: '2026-06-15', by: 'Ishita Trivedi' },
      { stage: 'Documents Uploaded', date: '2026-06-20', by: 'Ishita Trivedi' },
      { stage: 'Under Review', date: '2026-06-22', by: 'Meera Iyer' },
      { stage: 'Verification', date: '2026-06-25', by: 'Rajesh Kulkarni', remark: 'Awaiting medical document confirmation.' },
    ],
    preferredBuilding: 'Rajwada Bhavan',
  },
  {
    id: 'ADM-2026-002',
    applicationNo: 'HM/ADM/2026/0146',
    studentName: 'Om Prajapati',
    studentId: 'HM-STU-2002',
    avatar: '',
    course: 'B.Tech Mechanical Engineering',
    college: 'Dr. S. & S.S. Ghandhy College of Engineering',
    phone: '+91 91234 55667',
    email: 'om.prajapati@hostelmonarch.in',
    appliedOn: '2026-07-01',
    stage: 'Documents Uploaded',
    documents: makeDocs(4, 0),
    history: [
      { stage: 'Application Started', date: '2026-07-01', by: 'Om Prajapati' },
      { stage: 'Documents Uploaded', date: '2026-07-03', by: 'Om Prajapati' },
    ],
    preferredBuilding: 'Shivaji Bhavan',
  },
  {
    id: 'ADM-2026-003',
    applicationNo: 'HM/ADM/2026/0147',
    studentName: 'Tanvi Mistry',
    studentId: 'HM-STU-2003',
    avatar: '',
    course: 'B.Tech Computer Engineering',
    college: 'Bhagwan Mahavir College of Engineering',
    phone: '+91 93765 11223',
    email: 'tanvi.mistry@hostelmonarch.in',
    appliedOn: '2026-05-28',
    stage: 'Approved',
    documents: makeDocs(7, 7),
    history: [
      { stage: 'Application Started', date: '2026-05-28', by: 'Tanvi Mistry' },
      { stage: 'Documents Uploaded', date: '2026-05-30', by: 'Tanvi Mistry' },
      { stage: 'Under Review', date: '2026-06-02', by: 'Meera Iyer' },
      { stage: 'Verification', date: '2026-06-05', by: 'Rajesh Kulkarni' },
      { stage: 'Approved', date: '2026-06-08', by: 'Meera Iyer', remark: 'Room B-204 allocated.' },
    ],
    preferredBuilding: 'Rajwada Bhavan',
  },
  {
    id: 'ADM-2026-004',
    applicationNo: 'HM/ADM/2026/0144',
    studentName: 'Meet Kansara',
    studentId: 'HM-STU-2004',
    avatar: '',
    course: 'B.Tech Civil Engineering',
    college: 'Sarvajanik College of Engineering & Technology',
    phone: '+91 90123 44556',
    email: 'meet.kansara@hostelmonarch.in',
    appliedOn: '2026-05-20',
    stage: 'Rejected',
    documents: makeDocs(7, 3),
    history: [
      { stage: 'Application Started', date: '2026-05-20', by: 'Meet Kansara' },
      { stage: 'Documents Uploaded', date: '2026-05-22', by: 'Meet Kansara' },
      { stage: 'Under Review', date: '2026-05-25', by: 'Meera Iyer' },
      { stage: 'Rejected', date: '2026-05-29', by: 'Meera Iyer', remark: 'Address proof document invalid / expired.' },
    ],
    preferredBuilding: 'Shivaji Bhavan',
  },
  {
    id: 'ADM-2026-005',
    applicationNo: 'HM/ADM/2026/0148',
    studentName: 'Darshan Raval',
    studentId: 'HM-STU-2005',
    avatar: '',
    course: 'B.Tech Electronics Engineering',
    college: 'Dr. S. & S.S. Ghandhy College of Engineering',
    phone: '+91 98123 77889',
    email: 'darshan.raval@hostelmonarch.in',
    appliedOn: '2026-07-10',
    stage: 'Application Started',
    documents: makeDocs(1, 0),
    history: [{ stage: 'Application Started', date: '2026-07-10', by: 'Darshan Raval' }],
    preferredBuilding: 'Shivaji Bhavan',
  },
  {
    id: 'ADM-2026-006',
    applicationNo: 'HM/ADM/2026/0149',
    studentName: 'Priya Kothari',
    studentId: 'HM-STU-2006',
    avatar: '',
    course: 'B.Tech Information Technology',
    college: 'Bhagwan Mahavir College of Engineering',
    phone: '+91 99887 22334',
    email: 'priya.kothari@hostelmonarch.in',
    appliedOn: '2026-07-12',
    stage: 'Under Review',
    documents: makeDocs(7, 2),
    history: [
      { stage: 'Application Started', date: '2026-07-12', by: 'Priya Kothari' },
      { stage: 'Documents Uploaded', date: '2026-07-14', by: 'Priya Kothari' },
      { stage: 'Under Review', date: '2026-07-16', by: 'Meera Iyer' },
    ],
    preferredBuilding: 'Rajwada Bhavan',
  },
];
