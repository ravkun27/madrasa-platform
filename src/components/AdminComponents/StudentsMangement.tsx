import { useEffect, useState } from "react";
import { getFetch } from "../../utils/apiCall"; // Adjust path if needed

const StudentsManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [suspiciousStudents, setSuspiciousStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "suspicious">("all");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const response: any = await getFetch("/admin/auth/student/list");

      if (response?.success && response?.data?.StudentList) {
        setStudents(response.data.StudentList);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  const fetchSuspiciousStudents = async () => {
    try {
      const response: any = await getFetch(
        "/admin/auth/student/suspicious-list"
      );

      if (response?.success && response?.data?.StudentList) {
        setSuspiciousStudents(response.data.StudentList);
      }
    } catch (err) {
      console.error("Failed to fetch suspicious students", err);
    }
  };

  const suspendStudent = async (userID: string) => {
    setSuspendingId(userID);
    try {
      const response = await fetch(
        "/admin/auth/student/suspend?userID=" + userID,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Remove the suspended student from both lists
        setStudents((prev) => prev.filter((student) => student._id !== userID));
        setSuspiciousStudents((prev) =>
          prev.filter((student) => student._id !== userID)
        );
        alert("Student suspended successfully");
      } else {
        alert("Failed to suspend student");
      }
    } catch (err) {
      console.error("Failed to suspend student", err);
      alert("Error suspending student");
    } finally {
      setSuspendingId(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (activeTab === "suspicious") {
    fetchSuspiciousStudents();
  }
  const currentStudents = activeTab === "all" ? students : suspiciousStudents;

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300">
        Loading Students...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 py-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4">Students Management</h2>

      {/* Tab Navigation */}
      <div className="absolute top-0 mx-auto mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("suspicious")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "suspicious"
                ? "border-red-500 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Suspicious Students ({suspiciousStudents.length})
          </button>
        </nav>
      </div>

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
            {activeTab === "suspicious" && (
              <th className="px-4 py-2 text-left">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {currentStudents.map((student) => (
            <tr
              key={student._id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                activeTab === "suspicious" ? "bg-red-50 dark:bg-red-900/10" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {student.firstName} {student.lastName}
                {activeTab === "suspicious" && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Suspicious
                  </span>
                )}
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
              {activeTab === "suspicious" && (
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to suspend this student?"
                        )
                      ) {
                        suspendStudent(student._id);
                      }
                    }}
                    disabled={suspendingId === student._id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suspendingId === student._id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Suspending...
                      </>
                    ) : (
                      "Suspend"
                    )}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {currentStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No {activeTab === "suspicious" ? "suspicious " : ""}students found.
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;
