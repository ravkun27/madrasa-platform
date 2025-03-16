// components/AdminDashboard/CourseDetails.tsx

const CourseDetails = ({ teacher, courseFilter }: any) => {
  const getCourseStatus = (course: any) => {
    if (!course.active) return "Deleted";
    return course.published ? "Published" : "Draft";
  };

  return (
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
          .map((course: any) => (
            <div
              key={course._id}
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h6 className="font-medium">{course.title}</h6>
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
                      Students: {course.enrolledStudentIds?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {course.description}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CourseDetails;
