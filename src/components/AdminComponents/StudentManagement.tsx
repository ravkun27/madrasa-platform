import { useState, useEffect } from "react";
import { FiTrash } from "react-icons/fi";
import { getFetch, deleteFetch } from "../../utils/apiCall";

const StudentManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsRes: any = await getFetch("/admin/student");
        setStudents(studentsRes.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const clearStudents = async () => {
    if (window.confirm("Are you sure you want to delete all students?")) {
      await deleteFetch("/admin/student/clear");
      setStudents([]);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading students...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Student Management
        </h2>
        <button
          onClick={clearStudents}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
        >
          <FiTrash /> Clear All Students
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.length === 0 && (
          <div className="text-center py-8">No students found</div>
        )}
        {students.length > 0 && (
          <div className="flex justify-between items-start text-gray-500 dark:text-gray-400">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700"
              >
                <h3 className="font-semibold mb-2">{student.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {student.email}
                </p>
                {student.phoneNumber && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Phone: {student.phoneNumber}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
