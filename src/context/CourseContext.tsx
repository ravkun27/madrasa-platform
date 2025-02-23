// src/context/CourseContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { Course, Post, Student, CourseFile, NewCourse } from "../types";

interface CourseContextType {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: NewCourse) => void;
  updateCourse: (courseId: string, updatedCourse: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  toggleCourseLock: (courseId: string) => void;
  addPostToCourse: (courseId: string, post: Post) => void;
  addFileToPost: (courseId: string, postId: string, file: CourseFile) => void;
  enrollStudent: (courseId: string, student: Student) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);

  const addCourse = (newCourse: NewCourse) => {
    const course: Course = {
      ...newCourse,
      isLocked: false,
      enrolledStudents: [],
    };
    setCourses([...courses, course]);
  };

  const updateCourse = (courseId: string, updatedCourse: Partial<Course>) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, ...updatedCourse } : course
      )
    );
  };

  const deleteCourse = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId));
  };

  const toggleCourseLock = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, isLocked: !course.isLocked }
          : course
      )
    );
  };

  const addPostToCourse = (courseId: string, post: Post) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? { ...course, posts: [...course.posts, post] }
          : course
      )
    );
  };

  const addFileToPost = (
    courseId: string,
    postId: string,
    file: CourseFile
  ) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              posts: course.posts.map((post) =>
                post.id === postId
                  ? { ...post, files: [...post.files, file] }
                  : post
              ),
            }
          : course
      )
    );
  };

  const enrollStudent = (courseId: string, student: Student) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId && !course.isLocked
          ? {
              ...course,
              enrolledStudents: [...course.enrolledStudents, student],
            }
          : course
      )
    );
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        setCourses,
        addCourse,
        updateCourse,
        deleteCourse,
        toggleCourseLock,
        addPostToCourse,
        addFileToPost,
        enrollStudent,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourseContext() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
}
