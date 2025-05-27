// CoursePage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getFetch } from "../../utils/apiCall";
import { CourseSidebar } from "../../components/Courses/CourseSidebar";
import { LessonContent } from "../../components/Courses/LessonContent";
import { MeetingSection } from "../../components/Courses/MeetingSection";
import { NotesSection } from "../../components/Courses/NotesSection";
import { useLanguage } from "../../context/LanguageContext";
import { motion } from "framer-motion";

interface LessonMeta {
  _id: string;
  title?: string;
  sectionId: string;
  completed: boolean;
}

interface FullLesson extends LessonMeta {
  content?: any; // Full lesson content
  [key: string]: any; // Other lesson properties
}

export const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessonMetas, setLessonMetas] = useState<LessonMeta[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonCache, setLessonCache] = useState<Map<string, FullLesson>>(new Map());
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language } = useLanguage();

  // Memoize the selected lesson to prevent unnecessary re-renders
  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    return lessonCache.get(selectedLessonId) || null;
  }, [selectedLessonId, lessonCache]);

  // Fetch ONLY course structure - no lesson content
  useEffect(() => {
    const fetchCourseStructure = async () => {
      if (!courseId) return;

      try {
        const res: any = await getFetch(`/user/student/course/all`);
        const courseData = res.data.courseList.find(
          (c: any) => c._id === courseId
        );

        if (courseData) {
          setCourse(courseData);

          // Build array of promises to fetch each lesson's full data
          const lessonsPromises = courseData.sectionIds.flatMap(
            (section: any) =>
              section.lessonIds.map(async (lessonId: string) => {
                const lessonRes: any = await getFetch(
                  `/user/student/course/lesson?lessonId=${lessonId}&courseId=${courseId}`
                );

                const lessonTitle = lessonRes?.lesson?.title || "Untitled";

                return {
                  _id: lessonId,
                  sectionId: section._id,
                  completed: false,
                  title: lessonTitle,
                };
              })
          );

          // Wait for all lesson titles to be fetched
          const metas = await Promise.all(lessonsPromises);

          setLessonMetas(metas);
        } else {
          console.warn("⚠️ No course found with ID:", courseId);
        }
      } catch (error) {
        console.error("❌ Error loading course structure or lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStructure();
  }, [courseId]);

  // Fetch individual lesson content ONLY when selected
  const fetchAndCacheLesson = useCallback(
    async (lessonMeta: LessonMeta) => {
      if (!courseId) return null;

      // Check if lesson is already cached
      if (lessonCache.has(lessonMeta._id)) {
        return lessonCache.get(lessonMeta._id)!;
      }

      setLessonLoading(true);

      try {
        const lessonRes: any = await getFetch(
          `/user/student/course/lesson?lessonId=${lessonMeta._id}&courseId=${courseId}`
        );

        const fullLesson: FullLesson = {
          ...lessonRes.lesson,
          _id: lessonMeta._id,
          sectionId: lessonMeta.sectionId,
        };

        // Cache the lesson using setState callback to ensure we get the latest Map
        setLessonCache(prevCache => {
          const newCache = new Map(prevCache);
          newCache.set(lessonMeta._id, fullLesson);
          return newCache;
        });

        // Update the lesson meta with title and completion status
        setLessonMetas((prev) =>
          prev.map((meta) =>
            meta._id === lessonMeta._id
              ? {
                  ...meta,
                  title: fullLesson.title || meta.title,
                  completed: fullLesson.completed || meta.completed,
                }
              : meta
          )
        );

        return fullLesson;
      } catch (error) {
        console.error("Error loading lesson:", error);
        return null;
      } finally {
        setLessonLoading(false);
      }
    },
    [courseId, lessonCache]
  );

  // Handle lesson selection from sidebar
  const handleLessonSelect = useCallback(
    async (lessonMeta: LessonMeta) => {
      // Only fetch if it's a different lesson
      if (selectedLessonId !== lessonMeta._id) {
        // Set the selected lesson ID immediately
        setSelectedLessonId(lessonMeta._id);
        
        // If not cached, fetch the lesson
        if (!lessonCache.has(lessonMeta._id)) {
          await fetchAndCacheLesson(lessonMeta);
        }
      }
    },
    [selectedLessonId, lessonCache, fetchAndCacheLesson]
  );

  // Update lesson completion status
  const updateLessonCompletion = useCallback(
    (lessonId: string, completed: boolean) => {
      // Update lesson metas
      setLessonMetas((prev) =>
        prev.map((meta) =>
          meta._id === lessonId ? { ...meta, completed } : meta
        )
      );

      // Update cached lesson if it exists
      setLessonCache(prevCache => {
        const cachedLesson = prevCache.get(lessonId);
        if (cachedLesson) {
          const newCache = new Map(prevCache);
          newCache.set(lessonId, { ...cachedLesson, completed });
          return newCache;
        }
        return prevCache;
      });
    },
    []
  );

  // Memoize the motion div props to prevent unnecessary re-renders
  const motionProps = useMemo(() => ({
    key: selectedLessonId || 'no-lesson',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    className: "space-y-8"
  }), [selectedLessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex">
      <CourseSidebar
        course={course}
        lessonMetas={lessonMetas}
        selectedLesson={selectedLesson}
        onLessonSelect={handleLessonSelect}
        courseId={courseId!}
        isMobileOpen={isSidebarOpen}
        onMobileOpen={() => setIsSidebarOpen(true)}
        onMobileClose={() => setIsSidebarOpen(false)}
        onLessonCompletionUpdate={updateLessonCompletion}
      />

      <main className="flex-1 min-h-screen p-6 lg:p-8">
        {lessonLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
            <span className="ml-3 text-muted">
              {language === "ar" ? "جاري تحميل الدرس..." : "Loading lesson..."}
            </span>
          </div>
        ) : selectedLesson ? (
          <motion.div {...motionProps}>
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