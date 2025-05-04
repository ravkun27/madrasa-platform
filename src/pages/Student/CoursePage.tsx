// CoursePage.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { CourseSidebar } from "../../components/Courses/CourseSidebar";
import { LessonContent } from "../../components/Courses/LessonContent";
import { MeetingSection } from "../../components/Courses/MeetingSection";
import { NotesSection } from "../../components/Courses/NotesSection";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

export const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        const res: any = await getFetch(`/user/student/course/all`);
        const courseData = res.data.courseList.find(
          (c: any) => c._id === courseId
        );

        if (courseData) {
          setCourse(courseData);

          // Fetch all lessons
          const lessonsPromises = courseData.sectionIds.flatMap(
            (section: any) =>
              section.lessonIds.map(async (lessonId: string) => {
                const lessonRes: any = await getFetch(
                  `/user/student/course/lesson?lessonId=${lessonId}&courseId=${courseId}`
                );
                return { ...lessonRes.lesson, sectionId: section._id };
              })
          );

          const allLessons = await Promise.all(lessonsPromises);
          setLessons(allLessons.flat().filter(Boolean));
          setSelectedLesson(allLessons[0] || null);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={`flex`}>
      <CourseSidebar
        course={course}
        lessons={lessons}
        selectedLesson={selectedLesson}
        onLessonSelect={setSelectedLesson}
        courseId={courseId!}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen p-6 lg:p-8">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden mb-6 p-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark"
        >
          {language === "ar" ? "عرض الدروس" : "Show Lessons"}
        </button>

        {selectedLesson ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {course?.meetingDetails && (
              <MeetingSection meeting={course.meetingDetails} />
            )}

            <LessonContent lesson={selectedLesson} />
            <NotesSection lesson={selectedLesson} courseId={courseId!} />
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted text-lg">
            {language === "ar"
              ? "اختر درسًا للبدء"
              : "Select a lesson to begin"}
          </div>
        )}
      </main>
    </div>
  );
};
