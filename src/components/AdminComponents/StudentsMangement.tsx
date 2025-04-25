import { useEffect, useState } from "react";
import { getFetch } from "../../utils/apiCall"; // Adjust path if needed

const StudentsMangement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const response: any = await getFetch("/admin/auth/student/list");
      console.log("response", response);

      if (response?.success && response?.data?.StudentList) {
        setStudents(response.data.StudentList);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Loading Students...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Students List</h2>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 shadow-sm rounded-md overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left hidden sm:table-cell">Email</th>
            <th className="px-4 py-2 text-left hidden md:table-cell">Phone</th>
            <th className="px-4 py-2 text-left hidden md:table-cell">
              Country
            </th>
            <th className="px-4 py-2 text-left hidden lg:table-cell">
              Contact App
            </th>
            <th className="px-4 py-2 text-left">Registered</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {students.map((student) => (
            <tr
              key={student._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {student.firstName} {student.lastName}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-gray-700 dark:text-gray-300">
                {student.email}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-gray-700 dark:text-gray-300">
                {student.phoneNumber}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-gray-700 dark:text-gray-300">
                {student.country}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell capitalize text-gray-700 dark:text-gray-300">
                {student.TelegramOrWhatsapp}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {new Date(student.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsMangement;
