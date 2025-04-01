import { useState } from "react";
import { FiChevronUp, FiChevronDown, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Course, Section, Lesson } from "../../types";

export const CourseSidebar = ({
  course,
  lessons,
  selectedLesson,
  onLessonSelect,
}: {
  course: Course | null;
  lessons: Lesson[];
  selectedLesson: Lesson | null;
  onLessonSelect: (lesson: Lesson) => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (!course) return null;

  return (
    <div className="w-full md:w-80 bg-white border-r shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold truncate">{course.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {course.sectionIds.map((section: Section) => (
          <div key={section._id} className="space-y-2">
            <button
              onClick={() => toggleSection(section._id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <span className="font-medium truncate">{section.title}</span>
              {expandedSections.includes(section._id) ? (
                <FiChevronUp className="text-gray-500 shrink-0" />
              ) : (
                <FiChevronDown className="text-gray-500 shrink-0" />
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
                  {lessons
                    .filter((lesson) => lesson.sectionId === section._id)
                    .map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => onLessonSelect(lesson)}
                        className={`w-full text-left p-2 rounded-lg ${
                          selectedLesson?._id === lesson._id
                            ? "bg-blue-50 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {lesson.completed && (
                            <FiCheckCircle className="text-green-500 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};
