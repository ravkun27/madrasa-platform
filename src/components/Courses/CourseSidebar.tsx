import { useState, useEffect } from "react";
import {
  FiChevronUp,
  FiChevronDown,
  FiBook,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { putFetch } from "../../utils/apiCall";
import { Check, Circle, Loader2 } from "lucide-react";

interface LessonMeta {
  _id: string;
  title?: string;
  sectionId: string;
  completed: boolean;
}

interface FullLesson extends LessonMeta {
  [key: string]: any;
}

export const CourseSidebar = ({
  course,
  lessonMetas,
  selectedLesson,
  onLessonSelect,
  courseId,
  isMobileOpen,
  onMobileClose,
  onMobileOpen,
  onLessonCompletionUpdate,
}: {
  course: any;
  lessonMetas: LessonMeta[];
  selectedLesson: FullLesson | null;
  onLessonSelect: (lessonMeta: LessonMeta) => Promise<void>;
  courseId: string;
  isMobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  onLessonCompletionUpdate?: (lessonId: string, completed: boolean) => void;
}) => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const [completionLoading, setCompletionLoading] = useState<Set<string>>(
    new Set()
  );

  // Auto-expand section containing selected lesson
  useEffect(() => {
    if (
      selectedLesson &&
      !expandedSections.includes(String(selectedLesson.sectionId))
    ) {
      setExpandedSections((prev) => [
        ...prev,
        String(selectedLesson.sectionId),
      ]);
    }
  }, [selectedLesson, expandedSections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleLessonClick = async (lessonMeta: LessonMeta) => {
    // Don't trigger if already selected and loading
    if (
      selectedLesson?._id === lessonMeta._id ||
      loadingLesson === lessonMeta._id
    ) {
      return;
    }

    setLoadingLesson(lessonMeta._id);

    try {
      await onLessonSelect(lessonMeta);
      onMobileClose();
    } catch (error) {
      console.error("Error selecting lesson:", error);
    } finally {
      setLoadingLesson(null);
    }
  };

  const toggleLessonCompletion = async (
    lessonId: string,
    currentCompleted: boolean
  ) => {
    if (!courseId) return;

    setCompletionLoading((prev) => new Set(prev.add(lessonId)));

    // Optimistic update
    const newCompleted = !currentCompleted;
    onLessonCompletionUpdate?.(lessonId, newCompleted);

    try {
      await putFetch(
        `/user/student/course/lesson/completionToggle?courseId=${courseId}&lessonId=${lessonId}`,
        {}
      );
    } catch (error) {
      // Revert on error
      onLessonCompletionUpdate?.(lessonId, currentCompleted);
      console.error("Error toggling completion:", error);
    } finally {
      setCompletionLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
    }
  };

  const calculateProgress = (sectionId: string): number => {
    const section = course?.sectionIds.find((s: any) => s._id === sectionId);
    if (!section) return 0;

    const sectionLessons = lessonMetas.filter(
      (meta) => meta.sectionId === sectionId
    );
    const completed = sectionLessons.filter((meta) => meta.completed).length;

    return sectionLessons.length > 0
      ? Math.round((completed / sectionLessons.length) * 100)
      : 0;
  };

  if (!course) return null;

  const lessonsBySection = course.sectionIds.map((section: any) => ({
    section,
    lessons: lessonMetas.filter(
      (meta: LessonMeta) => meta.sectionId === section._id
    ),
  }));

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => (isMobileOpen ? onMobileClose() : onMobileOpen())}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary transition-transform duration-200 ease-in-out"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        className={`bg-background border flex flex-col z-50 
    fixed md:relative inset-y-0 left-0 w-80 max-w-full rounded-md
    transform transition-transform duration-300 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    h-screen md:h-auto md:max-h-screen`}
        dir={language}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FiBook className="text-text flex-shrink-0" />
            <h2 className="text-lg font-bold truncate">{course.title}</h2>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 hover:bg-gray-500/30 rounded-full flex-shrink-0"
          >
            <FiX className="text-text" />
          </button>
        </div>

        {/* Content with custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 sidebar-scroll">
          {lessonsBySection.map(({ section, lessons: sectionLessons }: any) => (
            <div key={section._id} className="space-y-2">
              {/* Section toggle button */}
              <button
                onClick={() => toggleSection(section._id)}
                className="w-full flex items-center justify-between p-3 bg-card rounded-lg hover:bg-card-hover transition-colors"
              >
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium truncate">{section.title}</div>
                  {sectionLessons.length > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{
                            width: `${calculateProgress(section._id)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted mx-2">
                        {calculateProgress(section._id)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {expandedSections.includes(section._id) ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* Lessons */}
              <AnimatePresence>
                {expandedSections.includes(section._id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1 ml-4 overflow-hidden"
                  >
                    {sectionLessons.length === 0 ? (
                      <p className="text-muted text-sm py-2">
                        No content available
                      </p>
                    ) : (
                      sectionLessons.map((lessonMeta: LessonMeta) => (
                        <div
                          key={lessonMeta._id}
                          className={`w-full flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedLesson?._id === lessonMeta._id
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-white/5"
                          } ${loadingLesson === lessonMeta._id ? "opacity-70" : ""}`}
                          onClick={() => handleLessonClick(lessonMeta)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {loadingLesson === lessonMeta._id && (
                              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-primary" />
                            )}
                            <span className="truncate text-sm">
                              {lessonMeta.title || "Untitled Lesson"}
                            </span>
                          </div>

                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonCompletion(
                                lessonMeta._id,
                                lessonMeta.completed
                              );
                            }}
                            className={`p-1 rounded-full cursor-pointer flex-shrink-0 transition-colors ${
                              lessonMeta.completed
                                ? "text-green-500 hover:bg-green-50"
                                : "text-muted hover:bg-gray-100"
                            } ${completionLoading.has(lessonMeta._id) ? "opacity-50" : ""}`}
                            title={
                              lessonMeta.completed
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            {completionLoading.has(lessonMeta._id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : lessonMeta.completed ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};
