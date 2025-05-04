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
import { Check, Circle } from "lucide-react";

export const CourseSidebar = ({
  course,
  lessons,
  selectedLesson,
  onLessonSelect,
  courseId,
  isMobileOpen,
  onMobileClose,
}: {
  course: any;
  lessons: any;
  selectedLesson: any;
  onLessonSelect: (lesson: any) => void;
  courseId: string;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}) => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [localLessons, setLocalLessons] = useState(lessons);

  useEffect(() => {
    setLocalLessons(lessons);
  }, [lessons]);

  useEffect(() => {
    if (
      selectedLesson &&
      !expandedSections.includes(selectedLesson.sectionId)
    ) {
      setExpandedSections((prev) => [...prev, selectedLesson.sectionId]);
    }
  }, [selectedLesson]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!courseId) return;

    setLocalLessons((prevLessons: any) =>
      prevLessons.map((lesson: any) =>
        lesson._id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      )
    );

    try {
      await putFetch(
        `/user/student/course/lesson/completionToggle?courseId=${courseId}&lessonId=${lessonId}`,
        {}
      );
    } catch (error) {
      setLocalLessons(lessons); // Revert on error
      console.error("Error toggling completion:", error);
    }
  };

  const calculateProgress = (sectionId: string): number => {
    const section = course?.sectionIds.find((s: any) => s._id === sectionId);
    if (!section) return 0;

    const completed = localLessons.filter(
      (lesson: any) => lesson.sectionId === sectionId && lesson.completed
    ).length;

    return Math.round((completed / section.lessonIds.length) * 100);
  };

  if (!course) return null;

  const lessonsBySection = course.sectionIds.map((section: any) => ({
    section,
    lessons: localLessons.filter(
      (lesson: any) => lesson.sectionId === section._id
    ),
  }));

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => onMobileClose()}
        className={`md:hidden fixed bottom-4 right-4 z-40 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary transition-transform`}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <motion.div
        className={`bg-background border-r flex flex-col z-50 fixed md:relative md:flex inset-y-0 
        left-0
         w-80 max-w-full transform transition-transform duration-300 ease-in-out ${
           isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
         }`}
        dir={language}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <FiBook className="text-text" />
            <h2 className="text-lg font-bold truncate">{course.title}</h2>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 hover:bg-gray-500/30 rounded-full"
          >
            <FiX className="text-text" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {lessonsBySection.map(({ section, lessons }: any) => (
            <div key={section._id} className="space-y-2">
              <button
                onClick={() => toggleSection(section._id)}
                className={`w-full flex items-center justify-between p-3 bg-card rounded-lg hover:bg-card-hover`}
              >
                <div className={`flex-1 text-left `}>
                  <div className="font-medium truncate">{section.title}</div>
                  {section.lessonIds.length > 0 && (
                    <div className={`flex items-center `}>
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
                {expandedSections.includes(section._id) ? (
                  <FiChevronUp className="shrink-0" />
                ) : (
                  <FiChevronDown className="shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {expandedSections.includes(section._id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 ml-4"
                  >
                    {lessons.length === 0 ? (
                      <p className="text-muted text-sm">No content available</p>
                    ) : (
                      lessons.map((lesson: any) => (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            onLessonSelect(lesson);
                            onMobileClose();
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg ${
                            selectedLesson?._id === lesson._id
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-white/10"
                          }`}
                        >
                          <span className="truncate text-sm">
                            {lesson.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonCompletion(lesson._id);
                            }}
                            className={`p-1 rounded-full ${
                              lesson.completed
                                ? "text-green-500 hover:bg-green-50"
                                : "text-muted hover:bg-gray-100"
                            }`}
                          >
                            {lesson.completed ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                        </button>
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
