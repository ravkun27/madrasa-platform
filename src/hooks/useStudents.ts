import { useEffect, useState } from "react";
import { fetchStudentsForCourse } from "../utils/utilsMethod/fetchStudentsForCourse";
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
export const useStudents = (courseId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const loadStudents = async () => {
      try {
        setLoading(true);
        const result = await fetchStudentsForCourse(courseId);
        setStudents(result || []);
      } catch (err) {
        setError("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [courseId]);

  return { students, setStudents, loading, error }; // ✅ include setStudents
};
