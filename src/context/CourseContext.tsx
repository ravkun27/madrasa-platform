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

const courseReducer = (state: any, action: CourseAction): any => {
  switch (action.type) {
    case "SET_COURSE":
      return action.payload;
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
