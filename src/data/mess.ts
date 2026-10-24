import type { DietRequest, MealParticipationEntry, MessFeedback, MessMenuDay } from '../types';

export const WEEKLY_MENU: MessMenuDay[] = [
  {
    date: '2026-10-04',
    day: 'Sunday',
    meals: {
      Breakfast: { items: ['Poha', 'Tea', 'Boiled Egg (optional)'], time: '7:30 – 9:00 AM' },
      Lunch: { items: ['Dal', 'Rice', 'Roti', 'Mix Veg Sabzi', 'Papad'], time: '12:30 – 2:00 PM' },
      Snacks: { items: ['Samosa', 'Masala Chai'], time: '5:00 – 6:00 PM' },
      Dinner: { items: ['Paneer Butter Masala', 'Roti', 'Jeera Rice', 'Salad'], time: '7:30 – 9:00 PM' },
    },
  },
  {
    date: '2026-10-05',
    day: 'Monday',
    meals: {
      Breakfast: { items: ['Idli Sambhar', 'Coconut Chutney', 'Tea'], time: '7:30 – 9:00 AM' },
      Lunch: { items: ['Kadhi', 'Rice', 'Roti', 'Bhindi Sabzi'], time: '12:30 – 2:00 PM' },
      Snacks: { items: ['Dhokla', 'Green Chutney'], time: '5:00 – 6:00 PM' },
      Dinner: { items: ['Rajma', 'Rice', 'Roti', 'Salad'], time: '7:30 – 9:00 PM' },
    },
  },
  {
    date: '2026-10-06',
    day: 'Tuesday',
    meals: {
      Breakfast: { items: ['Upma', 'Banana', 'Tea'], time: '7:30 – 9:00 AM' },
      Lunch: { items: ['Chole', 'Rice', 'Bhatura', 'Salad'], time: '12:30 – 2:00 PM' },
      Snacks: { items: ['Bread Pakora', 'Tea'], time: '5:00 – 6:00 PM' },
      Dinner: { items: ['Mix Veg', 'Dal Fry', 'Roti', 'Rice'], time: '7:30 – 9:00 PM' },
    },
  },
];

export const MEAL_PARTICIPATION: MealParticipationEntry[] = [
  { studentId: 'HM-STU-1001', studentName: 'Aarav Patel', room: 'A-204', breakfast: true, lunch: true, snacks: false, dinner: true, diet: 'Regular' },
  { studentId: 'HM-STU-1002', studentName: 'Riya Shah', room: 'B-102', breakfast: true, lunch: false, snacks: true, dinner: true, diet: 'Vegetarian' },
  { studentId: 'HM-STU-1003', studentName: 'Krish Mehta', room: 'A-101', breakfast: false, lunch: true, snacks: true, dinner: true, diet: 'Regular' },
  { studentId: 'HM-STU-1004', studentName: 'Dhruv Shah', room: 'A-204', breakfast: true, lunch: true, snacks: true, dinner: false, diet: 'Jain' },
  { studentId: 'HM-STU-1005', studentName: 'Ananya Desai', room: 'B-201', breakfast: true, lunch: true, snacks: false, dinner: true, diet: 'Vegetarian' },
  { studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', room: 'A-101', breakfast: true, lunch: true, snacks: true, dinner: true, diet: 'Regular' },
  { studentId: 'HM-STU-1007', studentName: 'Ishita Trivedi', room: 'B-102', breakfast: false, lunch: false, snacks: false, dinner: true, diet: 'Medical/Special' },
  { studentId: 'HM-STU-1008', studentName: 'Kabir Chaudhary', room: 'A-301', breakfast: true, lunch: true, snacks: true, dinner: true, diet: 'Regular' },
  { studentId: 'HM-STU-1009', studentName: 'Sanya Agarwal', room: 'B-201', breakfast: true, lunch: true, snacks: false, dinner: true, diet: 'Jain' },
  { studentId: 'HM-STU-1011', studentName: 'Aditi Pandya', room: 'B-101', breakfast: true, lunch: false, snacks: true, dinner: true, diet: 'Vegetarian' },
  { studentId: 'HM-STU-1012', studentName: 'Rohan Bhatt', room: 'A-203', breakfast: true, lunch: true, snacks: true, dinner: true, diet: 'Regular' },
];

export const DIET_REQUESTS: DietRequest[] = [
  { id: 'DR-001', studentId: 'HM-STU-1007', studentName: 'Ishita Trivedi', room: 'B-102', diet: 'Medical/Special', reason: 'Low-oil, low-spice diet on doctor\'s advice post surgery.', status: 'Approved', requestedOn: '2026-09-15' },
  { id: 'DR-002', studentId: 'HM-STU-1004', studentName: 'Dhruv Shah', room: 'A-204', diet: 'Jain', reason: 'Family follows strict Jain dietary practice — no onion/garlic/root vegetables.', status: 'Approved', requestedOn: '2026-07-20' },
  { id: 'DR-003', studentId: 'HM-STU-1009', studentName: 'Sanya Agarwal', room: 'B-201', diet: 'Jain', reason: 'Personal religious dietary preference.', status: 'Approved', requestedOn: '2026-07-22' },
  { id: 'DR-004', studentId: 'HM-STU-1012', studentName: 'Rohan Bhatt', room: 'A-203', diet: 'Medical/Special', reason: 'Diabetic — requires low-sugar meal options.', status: 'Pending', requestedOn: '2026-10-02' },
];

export const MESS_FEEDBACK: MessFeedback[] = [
  { id: 'FB-001', studentId: 'HM-STU-1001', studentName: 'Aarav Patel', date: '2026-10-03', meal: 'Dinner', rating: 4, comment: 'Paneer was really good today, loved it!' },
  { id: 'FB-002', studentId: 'HM-STU-1006', studentName: 'Vivaan Joshi', date: '2026-10-03', meal: 'Lunch', rating: 3, comment: 'Dal was a bit watery, otherwise fine.' },
  { id: 'FB-003', studentId: 'HM-STU-1009', studentName: 'Sanya Agarwal', date: '2026-10-02', meal: 'Breakfast', rating: 5, comment: 'Poha was perfect, just the right amount of spice.' },
  { id: 'FB-004', studentId: 'HM-STU-1002', studentName: 'Riya Shah', date: '2026-10-02', meal: 'Dinner', rating: 2, comment: 'Food was cold by the time I reached the mess hall.' },
  { id: 'FB-005', studentId: 'HM-STU-1011', studentName: 'Aditi Pandya', date: '2026-10-01', meal: 'Snacks', rating: 4, comment: 'Dhokla was fresh and tasty.' },
];

export const MEAL_TREND = [
  { day: 'Mon', breakfast: 82, lunch: 95, dinner: 101 },
  { day: 'Tue', breakfast: 88, lunch: 90, dinner: 98 },
  { day: 'Wed', breakfast: 79, lunch: 93, dinner: 105 },
  { day: 'Thu', breakfast: 85, lunch: 97, dinner: 99 },
  { day: 'Fri', breakfast: 90, lunch: 101, dinner: 110 },
  { day: 'Sat', breakfast: 76, lunch: 88, dinner: 92 },
  { day: 'Sun', breakfast: 94, lunch: 100, dinner: 108 },
];
