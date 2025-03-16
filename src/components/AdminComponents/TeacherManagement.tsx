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

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const approveTeacher = async (userID: string) => {
    await patchFetch("/admin/auth/teacher/approve", { userID, approved: true });
    setTeachers(
      teachers.map((t) => (t._id === userID ? { ...t, approved: true } : t))
    );
  };

  const approveAllTeachers = async () => {
    patchFetch("/admin/auth/teacher/approve/all", {});
    setTeachers(teachers.map((t) => ({ ...t, approved: true })));
    toast.success("All teachers approved successfully");
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
      console.error("Error suspending teacher:", error);
    }
  };
  const deleteTeacher = async (teacherId: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      await deleteFetch(`/admin/auth/teacher?teacherId=${teacherId}`);
      setTeachers(teachers.filter((t) => t._id !== teacherId));
    }
  };

  const getCourseStatus = (course: any) => {
    if (!course.active) return "Deleted";
    return course.published ? "Published" : "Draft";
  };

  // Fetch all teachers initially
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
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch courses for each teacher
  const getTeachersCourses = async (teachersList: any[]) => {
    return Promise.all(
      teachersList.map(async (teacher) => {
        const courses = await Promise.all(
          teacher.courseIds.map(async (courseId: string) => {
            const courseRes: any = await getFetch(
              `/admin/auth/course?courseId=${courseId}`
            );
            return courseRes.data.course;
          })
        );
        return { ...teacher, courses };
      })
    );
  };

  // Search functionality
  const filteredTeachers = async (query: string) => {
    try {
      if (!query.trim()) {
        // If the search query is empty, refetch the original list
        const teachersRes: any = await getFetch("/admin/auth/teacher/list");
        const teachersWithCourses = await getTeachersCourses(
          teachersRes.data.teacherList
        );
        setTeachers(teachersWithCourses);
        return;
      }

      // Perform search using POST request
      const results: any = await patchFetch("/admin/auth/teacher/search", {
        value: query.trim(),
      });

      // Process search results
      if (results?.data) {
        const teachersWithCourses = await getTeachersCourses(results.data);
        setTeachers(teachersWithCourses);
      } else {
        setTeachers([]); // Fallback to empty array if no results
      }
    } catch (error) {
      console.error("Error searching teachers:", error);
      setTeachers([]); // Handle errors gracefully
    }
  };

  // Throttled search function
  const throttledFilterTeachers = useCallback(
    throttle((query) => {
      filteredTeachers(query);
    }, 500), // Throttle for 500ms
    []
  );

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    throttledFilterTeachers(query); // Trigger throttled search
  };

  if (loading)
    return <div className="text-center py-8">Loading teachers...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCourseFilter("all")}
            className={`px-4 py-2 rounded-lg ${courseFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            All Courses
          </button>
          <button
            onClick={() => setCourseFilter("active")}
            className={`px-4 py-2 rounded-lg ${courseFilter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Active
          </button>
          <button
            onClick={() => setCourseFilter("deleted")}
            className={`px-4 py-2 rounded-lg ${courseFilter === "deleted" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Deleted
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            Pending Approvals ({teachers.filter((t) => !t.approved).length})
          </h3>
          <button
            onClick={approveAllTeachers}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiCheckCircle /> Approve All
          </button>
        </div>
        {teachers
          .filter((t) => !t.approved)
          .map((teacher) => (
            <div
              key={teacher._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold capitalize">
                    {teacher.firstName} {teacher.lastName}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {teacher.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => approveTeacher(teacher._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
      </div>

      <h3 className="text-xl font-bold mb-4">Existing Teachers</h3>
      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg capitalize">
                    {teacher.firstName} {teacher.lastName}
                  </h4>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      teacher.suspended
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {teacher.suspended ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Email:</span> {teacher.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {teacher.phoneNumber}
                  </p>
                  <p>
                    <span className="font-medium">Joined:</span>{" "}
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Courses:</span>{" "}
                    {teacher.courses.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setExpandedTeacher(
                    expandedTeacher === teacher._id ? null : teacher._id
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {expandedTeacher === teacher._id ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}
              </button>
            </div>

            {expandedTeacher === teacher._id && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-semibold mb-3">Courses</h5>
                <div className="space-y-3">
                  {teacher.courses
                    .filter((c: any) =>
                      courseFilter === "all"
                        ? true
                        : courseFilter === "active"
                          ? c.active
                          : !c.active
                    )
                    .sort((a: any, b: any) =>
                      !a.active
                        ? new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime()
                        : 0
                    )
                    .map((course: any) => (
                      <div
                        key={course._id}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <h6 className="font-medium">{course.title}</h6>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  getCourseStatus(course) === "Published"
                                    ? "bg-green-100 text-green-800"
                                    : getCourseStatus(course) === "Deleted"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100"
                                }`}
                              >
                                {getCourseStatus(course)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300">
                                Students:{" "}
                                {course.enrolledStudentIds?.length || 0}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Created:{" "}
                              {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                            {course.published && !course.active && (
                              <p className="text-sm text-red-600">
                                Deleted:
                                {new Date(
                                  course.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                  <button
                    onClick={() => suspendTeacher(teacher._id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
                  >
                    {teacher.suspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    onClick={() => deleteTeacher(teacher._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Remove Teacher
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherManagement;
