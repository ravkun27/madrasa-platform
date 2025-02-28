// CourseContext.tsx
import React, { createContext, useContext, useReducer } from "react";
import { Course, CourseAction } from "../types";

type CourseContextType = {
  courses: Course[];
  dispatch: React.Dispatch<CourseAction>;
};

const CourseContext = createContext<CourseContextType>({
  courses: [],
  dispatch: () => null,
});

const courseReducer = (state: Course[], action: CourseAction): Course[] => {
  switch (action.type) {
    case "CREATE_COURSE":
      return [...state, action.payload];

    case "ADD_SECTION":
      return state.map((course) =>
        course.id === action.payload.courseId
          ? {
              ...course,
              sections: [...course.sections, action.payload.section],
            }
          : course
      );

    case "DELETE_SECTION":
      return state.map((course) =>
        course.id === action.payload.courseId
          ? {
              ...course,
              sections: course.sections.filter(
                (s) => s.id !== action.payload.sectionId
              ),
            }
          : course
      );

    case "ADD_CONTENT":
      return state.map((course) => {
        if (course.id === action.payload.courseId) {
          return {
            ...course,
            sections: course.sections.map((section) =>
              section.id === action.payload.sectionId
                ? {
                    ...section,
                    contents: [...section.contents, action.payload.content],
                  }
                : section
            ),
          };
        }
        return course;
      });

    case "DELETE_CONTENT":
      return state.map((course) => {
        if (course.id === action.payload.courseId) {
          return {
            ...course,
            sections: course.sections.map((section) =>
              section.id === action.payload.sectionId
                ? {
                    ...section,
                    contents: section.contents.filter(
                      (c) => c.id !== action.payload.contentId
                    ),
                  }
                : section
            ),
          };
        }
        return course;
      });

    case "EDIT_SECTION_NAME":
      return state.map((course) => {
        if (course.id === action.payload.courseId) {
          return {
            ...course,
            sections: course.sections.map((section) =>
              section.id === action.payload.sectionId
                ? { ...section, name: action.payload.newName }
                : section
            ),
          };
        }
        return course;
      });

    case "EDIT_CONTENT_NAME":
      return state.map((course) => {
        if (course.id === action.payload.courseId) {
          return {
            ...course,
            sections: course.sections.map((section) =>
              section.id === action.payload.sectionId
                ? {
                    ...section,
                    contents: section.contents.map((content) =>
                      content.id === action.payload.contentId
                        ? { ...content, name: action.payload.newName }
                        : content
                    ),
                  }
                : section
            ),
          };
        }
        return course;
      });

    case "PUBLISH_COURSE":
      return state.map((course) =>
        course.id === action.payload ? { ...course, isPublished: true } : course
      );

    default:
      return state;
  }
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [courses, dispatch] = useReducer(courseReducer, []);

  return (
    <CourseContext.Provider value={{ courses, dispatch }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);
