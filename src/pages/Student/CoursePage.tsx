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

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNoteAdded = () => {
    console.log("Note added, refreshing data...");
    // You might want to implement a proper refresh here
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <CourseSidebar
        course={course}
        lessons={lessons}
        selectedLesson={selectedLesson}
        onLessonSelect={handleLessonSelect}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {course?.meetingDetails && (
          <MeetingSection meeting={course.meetingDetails} />
        )}

        {selectedLesson ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <LessonContent lesson={selectedLesson} />
            <NotesSection
              lesson={selectedLesson}
              courseId={courseId || ""}
              onNoteAdded={handleNoteAdded}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select a lesson from the sidebar to begin
          </div>
        )}
      </div>
    </div>
  );
};
