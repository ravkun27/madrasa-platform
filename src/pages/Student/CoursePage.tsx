import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import { CourseSidebar } from "../../components/Courses/CourseSidebar";
import { LessonContent } from "../../components/Courses/LessonContent";
import { MeetingSection } from "../../components/Courses/MeetingSection";
import { NotesSection } from "../../components/Courses/NotesSection";
import { Course } from "../../types";

export const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const courseRes: any = await getFetch(`/user/student/course/all`);

        if (!courseRes.success) throw new Error("Failed to fetch course");

        const courseData = courseRes.data.courseList.find(
          (c: Course) => c._id === courseId
        );
        if (!courseData) throw new Error("Course not found");

        setCourse(courseData);

        const lessonsPromises = courseData.sectionIds.flatMap((section: any) =>
          section.lessonIds.map(async (lessonId: string) => {
            const lessonRes: any = await getFetch(
              `/user/student/course/lesson?lessonId=${lessonId}&courseId=${courseId}`
            );
            return lessonRes.lesson
              ? { ...lessonRes.lesson, sectionId: section._id }
              : null;
          })
        );

        const allLessons: any = (await Promise.all(lessonsPromises)).filter(
          Boolean
        );
        setLessons(allLessons);

        if (allLessons.length > 0) {
          setSelectedLesson(allLessons[0]);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load course"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text font-medium">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar for mobile */}
      <div className="md:hidden bg-card shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-button text-buttonText"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <h2 className="font-heading font-bold truncate">
          {course?.title || "Course"}
        </h2>
        <div className="w-8"></div> {/* Empty div for flex alignment */}
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar with transition */}
        <div
          className={`
            fixed md:sticky top-0 left-0 h-screen bg-card z-20 md:z-0
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            border-r border-cardBorder md:w-80 w-3/4 shadow-lg md:shadow-none
          `}
        >
          <CourseSidebar
            course={course}
            lessons={lessons}
            selectedLesson={selectedLesson}
            onLessonSelect={handleLessonSelect}
          />
        </div>

        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 transition-all duration-300 ease-in-out md:ml-0">
          <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10">
            {course?.meetingDetails && (
              <div className="mb-8">
                <MeetingSection meeting={course.meetingDetails} />
              </div>
            )}

            {selectedLesson ? (
              <div className="space-y-8">
                <div className="bg-card rounded-xl shadow-sm p-6 border border-cardBorder">
                  <LessonContent lesson={selectedLesson} />
                </div>

                <div className="bg-card rounded-xl shadow-sm p-6 border border-cardBorder">
                  <NotesSection
                    lesson={selectedLesson}
                    courseId={courseId || ""}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-card rounded-xl p-6 border border-cardBorder">
                <svg
                  className="w-16 h-16 text-muted mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                <h3 className="text-xl font-medium text-text">
                  Select a lesson to begin
                </h3>
                <p className="text-muted mt-2 text-center">
                  Choose a lesson from the sidebar to start learning
                </p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="mt-4 md:hidden px-4 py-2 bg-button text-buttonText rounded-md"
                >
                  Show Lessons
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
