import { useEffect, useState } from "react";
import { deleteFetch, getFetch, postFetch } from "../../utils/apiCall";

const StudentsManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [suspiciousStudents, setSuspiciousStudents] = useState<any[]>([]);
  const [suspendedStudents, setSuspendedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "suspicious" | "suspended"
  >("all");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [unsuspiciousId, setUnsuspiciousId] = useState<string | null>(null);
  const [suspiciousLoaded, setSuspiciousLoaded] = useState(false);
  const [suspendedLoaded, setSuspendedLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
    new Set()
  );

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
      if (response?.success && response?.data?.suspiciousList) {
        setSuspiciousStudents(response.data.suspiciousList);
      }
    } catch (err) {
      console.error("Failed to fetch suspicious students", err);
    }
  };

  const fetchSuspendedStudents = async () => {
    try {
      const response: any = await getFetch(
        "/admin/auth/student/suspended-list"
      );
      if (
        response?.success &&
        response?.data?.suspendedStudentsListWithCourseAndTeacher
      ) {
        setSuspendedStudents(
          response.data.suspendedStudentsListWithCourseAndTeacher
        );
      }
    } catch (err) {
      console.error("Failed to fetch suspended students", err);
    }
  };

  const suspendStudent = async (userID: string) => {
    setSuspendingId(userID);
    try {
      const response: any = await postFetch(
        `/admin/auth/student/suspend?userID=${userID}`,
        {
          suspend: true,
        }
      );

      if (response.ok) {
        setStudents((prev) => prev.filter((student) => student._id !== userID));
        setSuspiciousStudents((prev) =>
          prev.filter((student) => student._id !== userID)
        );
        // Refresh suspended list if it's loaded
        if (suspendedLoaded) {
          await fetchSuspendedStudents();
        }
      }
    } catch (err) {
      console.error("Failed to suspend student", err);
    } finally {
      setSuspendingId(null);
    }
  };

  const unSuspicious = async (userID: string) => {
    setUnsuspiciousId(userID);
    try {
      let response: any;

      if (activeTab === "suspended") {
        // Unsuspend the student
        response = await postFetch(
          `/admin/auth/student/suspend?userID=${userID}`,
          { suspend: false }
        );

        if (response.success) {
          setSuspendedStudents((prev) =>
            prev.filter((student) => student._id !== userID)
          );
          await fetchSuspendedStudents();
        }
      } else if (activeTab === "suspicious") {
        // Mark student as not suspicious
        response = await postFetch(
          `/admin/auth/student/un-suspicious?userID=${userID}`,
          {}
        );

        if (response.ok) {
          setSuspiciousStudents((prev) =>
            prev.filter((student) => student._id !== userID)
          );
          await fetchSuspiciousStudents();
        }
      }
    } catch (err) {
      console.error("Failed to update student status", err);
    } finally {
      setUnsuspiciousId(null);
    }
  };

  const deleteStudent = async (userID: string) => {
    try {
      const response: any = await deleteFetch(
        `/admin/auth/student/delete?userID=${userID}`
      );
      if (response.ok) {
        setStudents((prev) => prev.filter((student) => student._id !== userID));
        setSuspiciousStudents((prev) =>
          prev.filter((student) => student._id !== userID)
        );
        // Refresh suspended list if it's loaded
        if (suspendedLoaded) {
          await fetchSuspendedStudents();
        }
      }
    } catch (err) {
      console.error("Failed to delete student", err);
    }
  };

  const toggleStudentExpansion = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStudents()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "suspicious" && !suspiciousLoaded) {
      const loadSuspicious = async () => {
        setLoading(true);
        await fetchSuspiciousStudents();
        setSuspiciousLoaded(true);
        setLoading(false);
      };
      loadSuspicious();
    }
  }, [activeTab, suspiciousLoaded]);

  useEffect(() => {
    if (activeTab === "suspended" && !suspendedLoaded) {
      const loadSuspended = async () => {
        setLoading(true);
        await fetchSuspendedStudents();
        setSuspendedLoaded(true);
        setLoading(false);
      };
      loadSuspended();
    }
  }, [activeTab, suspendedLoaded]);

  const getCurrentStudents = () => {
    switch (activeTab) {
      case "suspicious":
        return suspiciousStudents;
      case "suspended":
        return suspendedStudents;
      default:
        return students;
    }
  };

  const filteredStudents = getCurrentStudents().filter(
    (student) =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Loading Students...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Students Management
        </h2>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "all"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            All Students
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
              {students.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("suspicious")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "suspicious"
                ? "border-red-500 text-red-600 dark:text-red-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            Suspicious Students
            <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded-full text-xs">
              {suspiciousStudents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("suspended")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "suspended"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400"
            }`}
          >
            Suspended Students
            <span className="ml-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 px-2 py-1 rounded-full text-xs">
              {suspendedStudents.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                {(activeTab === "suspicious" || activeTab === "suspended") && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStudents.map((student) => (
                <>
                  <tr
                    key={student._id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      activeTab === "suspicious"
                        ? "border-l-4 border-red-400"
                        : activeTab === "suspended"
                          ? "border-l-4 border-orange-400"
                          : ""
                    }`}
                  >
                    {/* Student Info */}
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            {activeTab === "suspended" &&
                              student.coursesAndTeachers?.length > 0 && (
                                <button
                                  onClick={() =>
                                    toggleStudentExpansion(student._id)
                                  }
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                >
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      expandedStudents.has(student._id)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </p>
                          {activeTab === "suspicious" && (
                            <div className="mt-1 space-y-1 max-w-md">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  Suspicious
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Count:{" "}
                                  {typeof student.suspicionCount === "object"
                                    ? student.suspicionCount?.count || 0
                                    : student.suspicionCount ||
                                      student.removableSuspicionCount ||
                                      0}
                                </span>
                              </div>
                              {student.suspensionReason && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                  Reason: {student.suspensionReason}
                                </p>
                              )}
                            </div>
                          )}
                          {activeTab === "suspended" && (
                            <div className="mt-1 space-y-1 max-w-md">
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  Suspended
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Count:{" "}
                                  {typeof student.removableSuspendCount ===
                                  "object"
                                    ? student.removableSuspendCount?.count || 0
                                    : student.removableSuspendCount || 0}
                                </span>
                              </div>
                              {student.suspensionReason && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                  Reason: {student.suspensionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center space-x-1">
                          <span>{student.phoneNumber || "N/A"}</span>
                        </div>
                        {student.TelegramOrWhatsapp && (
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded capitalize">
                              {student.TelegramOrWhatsapp}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                          {student.country || "Unknown"}
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(student.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "short",
                          }
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    {/* Actions */}
                    {(activeTab === "suspicious" ||
                      activeTab === "suspended") && (
                      <td className="px-4 py-4 text-center">
                        <div className="flex space-x-2 justify-center">
                          {activeTab === "suspicious" && (
                            <>
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
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {suspendingId === student._id ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                                  <>
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                                      />
                                    </svg>
                                    Suspend
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Are you sure you want to mark this student as not suspicious?"
                                    )
                                  ) {
                                    unSuspicious(student._id);
                                  }
                                }}
                                disabled={unsuspiciousId === student._id}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {unsuspiciousId === student._id ? (
                                  <>
                                    <svg
                                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Unsuspicious
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {activeTab === "suspended" && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to unsuspend this student?"
                                  )
                                ) {
                                  unSuspicious(student._id);
                                }
                              }}
                              disabled={unsuspiciousId === student._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {unsuspiciousId === student._id ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                                  Processing...
                                </>
                              ) : (
                                <>Unsuspend</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const confirmation = prompt(
                                "To confirm deletion, type: delete this student"
                              );

                              if (
                                confirmation?.trim().toLowerCase() ===
                                "delete this student"
                              ) {
                                deleteStudent(student._id);
                              } else if (confirmation !== null) {
                                alert(
                                  "Student deletion cancelled. Confirmation phrase did not match."
                                );
                              }
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Delete Student
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {/* Expanded Course Information for Suspended Students */}
                  {activeTab === "suspended" &&
                    expandedStudents.has(student._id) &&
                    student.coursesAndTeachers &&
                    student.coursesAndTeachers.length > 0 && (
                      <tr key={`${student._id}-courses`}>
                        <td
                          colSpan={5}
                          className="px-4 py-4 bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Enrolled Courses & Teachers
                            </h4>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {student.coursesAndTeachers.map(
                                (course: any, index: number) => (
                                  <div
                                    key={`${course.courseId}-${index}`}
                                    className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                                  >
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                      {course.courseName}
                                    </h5>
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                          />
                                        </svg>
                                        <span>
                                          {course.teacher.firstName}{" "}
                                          {course.teacher.lastName}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                          />
                                        </svg>
                                        <a
                                          href={`mailto:${course.teacher.email}`}
                                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                        >
                                          {course.teacher.email}
                                        </a>
                                      </div>
                                      {course.teacher.phoneNumber && (
                                        <div className="flex items-center space-x-2">
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                          </svg>
                                          <span>
                                            {course.teacher.phoneNumber}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No{" "}
              {activeTab === "suspicious"
                ? "suspicious "
                : activeTab === "suspended"
                  ? "suspended "
                  : ""}
              students found
            </h3>
            {searchTerm && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
        <span>
          Showing {filteredStudents.length} of {getCurrentStudents().length}{" "}
          students
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentsManagement;
