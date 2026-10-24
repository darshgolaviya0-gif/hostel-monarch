import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../store/AppDataContext';

export function useCurrentStudent() {
  const { user } = useAuth();
  const { students } = useAppData();
  const student = students.find((s) => s.id === user?.studentId) ?? students[0];
  return student;
}
