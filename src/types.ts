export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface CourseFile {
  id: string;
  name: string;
  type: "video" | "quiz" | "lecture" | "file";
  url: string;
}

export interface Post {
  id: string;
  type: "video" | "quiz" | "zoom" | "lecture";
  content: string;
  files: CourseFile[];
}

export interface Course {
  id: string;
  name: string;
  banner: string;
  description: string;
  isLocked: boolean;
  posts: Post[];
  enrolledStudents: Student[];
}

export interface NewCourse {
  id: string;
  name: string;
  banner: string;
  description: string;
  posts: Post[];
}
