// CourseContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import { Course, CourseAction } from "../types";

type CourseContextType = {
  courses: Course[];
  dispatch: React.Dispatch<CourseAction>;
  isLoading: boolean;
};

const CourseContext = createContext<CourseContextType>({
  courses: [],
  dispatch: () => null,
  isLoading: false,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching courses
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Replace with real API call
  }, []);

  return (
    <CourseContext.Provider value={{ courses, dispatch, isLoading }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);
