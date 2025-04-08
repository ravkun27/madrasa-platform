import { useState, useEffect, useCallback } from "react";
import {
  FiCheckCircle,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { getFetch, deleteFetch, patchFetch } from "../../utils/apiCall";
import toast from "react-hot-toast";
import { throttle } from "../../utils/utilsMethod/Throttle";
import CoursesTable from "./CourseTable";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletedCoursesMap, setDeletedCoursesMap] = useState<
    Record<string, any[]>
  >({});

  // Fetch deleted courses when teacher expands
  useEffect(() => {
    const fetchDeletedCourses = async (teacherId: string) => {
      try {
        const response: any = await getFetch(
          `/admin/auth/course/deleted/${teacherId}`
        );
        setDeletedCoursesMap((prev) => ({
          ...prev,
          [teacherId]: response.data.deletedCourses,
        }));
      } catch (error) {
        console.error("Error fetching deleted courses:", error);
        toast.error("Failed to load deleted courses");
      }
    };

    if (expandedTeacher && !deletedCoursesMap[expandedTeacher]) {
      fetchDeletedCourses(expandedTeacher);
    }
  }, [expandedTeacher]);

  // Combine courses function
  const getCombinedCourses = (teacher: any) => {
    const existingCourses = teacher.courses || [];
    const deletedCourses = deletedCoursesMap[teacher._id] || [];

    return [
      ...existingCourses,
      ...deletedCourses.map((course) => ({
        ...course,
        active: false,
        deletedAt: course.deletedAt,
      })),
    ];
  };

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersRes: any = await getFetch("/admin/auth/teacher/list");
        const teachersWithCourses = await getTeachersCourses(
          teachersRes.data.teacherList
        );
        setTeachers(teachersWithCourses);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const approveTeacher = async (userID: string) => {
    try {
      await patchFetch("/admin/auth/teacher/approve", {
        userID,
        approved: true,
      });
      setTeachers(
        teachers.map((t) => (t._id === userID ? { ...t, approved: true } : t))
      );
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Approval failed");
    }
  };

  const approveAllTeachers = async () => {
    try {
      await patchFetch("/admin/auth/teacher/approve/all", {});
      setTeachers(teachers.map((t) => ({ ...t, approved: true })));
      toast.success("All teachers approved successfully");
    } catch (error) {
      console.error("Bulk approval failed:", error);
      toast.error("Bulk approval failed");
    }
  };

  const suspendTeacher = async (userID: string) => {
    try {
      const teacher = teachers.find((t) => t._id === userID);
      if (!teacher) return;

      await patchFetch("/admin/auth/teacher/suspend", {
        userID,
        suspended: !teacher.suspended,
      });

      setTeachers(
        teachers.map((t) =>
          t._id === userID ? { ...t, suspended: !t.suspended } : t
        )
      );
    } catch (error) {
      console.error("Suspension failed:", error);
      toast.error("Suspension failed");
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      await deleteFetch(`/admin/auth/teacher?teacherId=${teacherId}`);
      setTeachers(teachers.filter((t) => t._id !== teacherId));
      toast.success("Teacher deleted successfully");
    } catch (error) {
      console.error("Deletion failed:", error);
      toast.error("Deletion failed");
    }
  };
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const teachersRes = await getFetch<{ data: { teacherList: any[] } }>(
        "/admin/auth/teacher/list"
      );
      const teachersWithCourses = await getTeachersCourses(
        teachersRes.data.teacherList
      );
      setTeachers(teachersWithCourses);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        // If the query is empty, fetch all teachers
        await fetchTeachers();
        return;
      }

      // Fetch searched teachers
      const results = await patchFetch<{ data: any[] }>(
        "/admin/auth/teacher/search",
        {
          value: trimmedQuery,
        }
      );

      const teachersWithCourses = await getTeachersCourses(results.data || []);
      setTeachers(teachersWithCourses);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("No Teacher found");
    }
  };

  const throttledSearch = useCallback(
    throttle((query: string) => {
      handleSearch(query);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // If the query is empty, fetch all teachers immediately
    if (!query.trim()) {
      fetchTeachers();
    } else {
      throttledSearch(query);
    }
  };

  // Update the getTeachersCourses function to handle empty courseIds
  const getTeachersCourses = async (teachersList: any[]) => {
    return Promise.all(
      teachersList.map(async (teacher) => {
        // Add null check for courseIds
        const courseIds = teacher.courseIds || [];
        try {
          const courses = await Promise.all(
            courseIds.map(async (courseId: string) => {
              try {
                const courseRes: any = await getFetch(
                  `/admin/auth/course?courseId=${courseId}`
                );
                return courseRes.data?.course || null;
              } catch (error) {
                console.error("Error fetching course:", error);
                return null;
              }
            })
          );
          return { ...teacher, courses: courses.filter(Boolean) };
        } catch (error) {
          console.error("Error processing teacher courses:", error);
          return { ...teacher, courses: [] };
        }
      })
    );
  };

  if (loading)
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-3 bg-gray-200 dark:bg-gray-600 rounded"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-xl font-bold">
            Pending Approvals ({teachers.filter((t) => !t.approved).length})
          </h3>
          <button
            onClick={approveAllTeachers}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiCheckCircle /> Approve All
          </button>
        </div>

        <div className="space-y-4">
          {teachers
            .filter((t) => !t.approved)
            .map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h4 className="font-semibold capitalize text-lg">
                      {teacher.firstName} {teacher.lastName}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {teacher.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied:{" "}
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => approveTeacher(teacher._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mt-2 md:mt-0"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Existing Teachers</h3>

      {teachers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No teachers found matching your criteria
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="text-lg font-semibold">
                      {teacher.firstName} {teacher.lastName}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        teacher.suspended
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {teacher.suspended ? "Suspended" : "Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2 gap-x-4 text-sm">
                    <div className="overflow-hidden">
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Email:
                      </span>{" "}
                      <span className="truncate block">{teacher.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Phone:
                      </span>{" "}
                      <span>{teacher.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Joined:
                      </span>{" "}
                      <span>
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-300">
                        Communication:
                      </span>{" "}
                      <span>{teacher.TelegramOrWhatsapp}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedTeacher(
                      expandedTeacher === teacher._id ? null : teacher._id
                    )
                  }
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors self-start ml-auto"
                  aria-label={
                    expandedTeacher === teacher._id
                      ? "Collapse details"
                      : "Expand details"
                  }
                >
                  {expandedTeacher === teacher._id ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </button>
              </div>

              {expandedTeacher === teacher._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Courses
                  </h5>
                  <div>
                    <CoursesTable courses={getCombinedCourses(teacher)} />
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <div className="inline-flex space-x-3">
                      <button
                        onClick={() => suspendTeacher(teacher._id)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      >
                        {teacher.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        onClick={() => deleteTeacher(teacher._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Remove Teacher
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
