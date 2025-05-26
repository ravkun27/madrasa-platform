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
import { putFetch, getFetch } from "../../utils/apiCall";
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

interface SectionProgress {
  _id: string;
  title: string;
  description: string;
  lessonIds: string[];
  sectionCompleted: number;
  completedLessons: number;
  totalLessons: number;
}

interface CourseProgress {
  courseCompleted: number;
  completedLessons: number;
  totalLessons: number;
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
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [sectionsProgress, setSectionsProgress] = useState<SectionProgress[]>(
    []
  );
  const [lessonCompletionStates, setLessonCompletionStates] = useState<
    Record<string, boolean>
  >({});
  const [togglingCompletion, setTogglingCompletion] = useState<string | null>(
    null
  );

  // Initialize completion states from lessonMetas and fetch individual lesson states
  useEffect(() => {
    const initialStates: Record<string, boolean> = {};

    // First set from lessonMetas
    lessonMetas.forEach((lesson) => {
      initialStates[lesson._id] = lesson.completed;
    });

    setLessonCompletionStates(initialStates);

    // Then fetch individual lesson states for accuracy
    const fetchLessonStates = async () => {
      const updatedStates = { ...initialStates };
      let needsUpdate = false;

      for (const lesson of lessonMetas) {
        try {
          const response: any = await getFetch(
            `/user/student/course/lesson?lessonId=${lesson._id}&courseId=${courseId}`
          );
          if (response.success && response.lesson) {
            if (updatedStates[lesson._id] !== response.lesson.completed) {
              updatedStates[lesson._id] = response.lesson.completed;
              needsUpdate = true;
            }
          }
        } catch (error) {
          console.error(`Error fetching lesson ${lesson._id} state:`, error);
        }
      }

      if (needsUpdate) {
        setLessonCompletionStates(updatedStates);
      }
    };

    if (courseId) {
      fetchLessonStates();
    }
  }, [courseId, lessonMetas]);

  // Update completion state when selectedLesson changes
  useEffect(() => {
    if (selectedLesson) {
      setLessonCompletionStates((prev) => ({
        ...prev,
        [selectedLesson._id]: selectedLesson.completed,
      }));
    }
  }, [selectedLesson]);

  // Fetch course progress data
  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const response: any = await getFetch(
          `/user/student/course?courseId=${courseId}`
        );
        if (response.success && response.data.course) {
          const courseData = response.data.course;
          setCourseProgress({
            courseCompleted: courseData.courseCompleted,
            completedLessons: courseData.completedLessons,
            totalLessons: courseData.totalLessons,
          });
          setSectionsProgress(courseData.sectionIds || []);
        }
      } catch (error) {
        console.error("Error fetching course progress:", error);
      }
    };

    if (courseId) {
      fetchCourseProgress();
    }
  }, [courseId]);

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
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (togglingCompletion === lessonId) return;

    setTogglingCompletion(lessonId);

    try {
      // First update the UI optimistically
      const newCompletionState = !lessonCompletionStates[lessonId];
      setLessonCompletionStates((prev) => ({
        ...prev,
        [lessonId]: newCompletionState,
      }));

      // Then make the API call
      const response: any = await putFetch(
        `/user/student/course/lesson/completionToggle?courseId=${courseId}&lessonId=${lessonId}`,
        {}
      );

      if (response.success) {
        // Verify the actual state from the API
        const verificationResponse: any = await getFetch(
          `/user/student/course/lesson?lessonId=${lessonId}&courseId=${courseId}`
        );

        if (verificationResponse.success && verificationResponse.lesson) {
          const actualState = verificationResponse.lesson.completed;
          if (actualState !== newCompletionState) {
            // If there's a mismatch, correct it
            setLessonCompletionStates((prev) => ({
              ...prev,
              [lessonId]: actualState,
            }));
          }
        }

        // Notify parent component
        if (onLessonCompletionUpdate) {
          onLessonCompletionUpdate(lessonId, newCompletionState);
        }

        // Refresh course progress data
        const courseResponse: any = await getFetch(
          `/user/student/course?courseId=${courseId}`
        );
        if (courseResponse.success && courseResponse.data.course) {
          const courseData = courseResponse.data.course;
          setCourseProgress({
            courseCompleted: courseData.courseCompleted,
            completedLessons: courseData.completedLessons,
            totalLessons: courseData.totalLessons,
          });
          setSectionsProgress(courseData.sectionIds || []);
        }
      } else {
        // Revert if API call failed
        setLessonCompletionStates((prev) => ({
          ...prev,
          [lessonId]: !newCompletionState,
        }));
      }
    } catch (error) {
      console.error("Error toggling lesson completion:", error);
      // Revert on error
      setLessonCompletionStates((prev) => ({
        ...prev,
        [lessonId]: !lessonCompletionStates[lessonId],
      }));
    } finally {
      setTogglingCompletion(null);
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const ProgressBar = ({
    completed,
    total,
    className = "",
  }: {
    completed: number;
    total: number;
    className?: string;
  }) => {
    const percentage = getProgressPercentage(completed, total);

    return (
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}
      >
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (!course) return null;

  const lessonsBySection = (
    sectionsProgress.length > 0 ? sectionsProgress : course.sectionIds || []
  ).map((section: any) => ({
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
        <div className="p-4 border-b flex-shrink-0 bg-background">
          <div className="flex items-center justify-between mb-3">
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

          {/* Overall Course Progress */}
          {courseProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Overall Progress</span>
                <span className="font-medium">
                  {courseProgress.completedLessons}/
                  {courseProgress.totalLessons} lessons
                </span>
              </div>
              <ProgressBar
                completed={courseProgress.completedLessons}
                total={courseProgress.totalLessons}
              />
              <div className="text-xs text-muted text-center">
                {getProgressPercentage(
                  courseProgress.completedLessons,
                  courseProgress.totalLessons
                )}
                % Complete
              </div>
            </div>
          )}
        </div>

        {/* Content with custom scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 sidebar-scroll">
          {lessonsBySection.map(({ section, lessons: sectionLessons }: any) => {
            const sectionProgress = sectionsProgress.find(
              (s) => s._id === section._id
            );

            return (
              <div key={section._id} className="space-y-2">
                {/* Section toggle button with progress */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleSection(section._id)}
                    className="w-full flex items-center justify-between p-3 bg-card rounded-lg hover:bg-card-hover transition-colors"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {section.title}
                      </div>
                      {sectionProgress && (
                        <div className="text-xs text-muted mt-1">
                          {sectionProgress.completedLessons}/
                          {sectionProgress.totalLessons} lessons
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {sectionProgress && (
                        <div className="text-xs text-muted">
                          {getProgressPercentage(
                            sectionProgress.completedLessons,
                            sectionProgress.totalLessons
                          )}
                          %
                        </div>
                      )}
                      {expandedSections.includes(section._id) ? (
                        <FiChevronUp className="w-5 h-5" />
                      ) : (
                        <FiChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                </div>

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
                        sectionLessons.map((lessonMeta: LessonMeta) => {
                          const isCompleted =
                            lessonCompletionStates[lessonMeta._id] ?? false;
                          const isToggling =
                            togglingCompletion === lessonMeta._id;

                          return (
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

                              {/* Completion Toggle Button */}
                              <button
                                onClick={(e) =>
                                  toggleLessonCompletion(lessonMeta._id, e)
                                }
                                disabled={isToggling}
                                className={`p-1 rounded-full transition-colors flex-shrink-0 ml-2 ${
                                  isCompleted
                                    ? "text-green-500 hover:text-green-600"
                                    : "text-gray-400 hover:text-gray-600"
                                } ${isToggling ? "opacity-50" : ""}`}
                                title={
                                  isCompleted
                                    ? "Mark as incomplete"
                                    : "Mark as complete"
                                }
                              >
                                {isToggling ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isCompleted ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};
