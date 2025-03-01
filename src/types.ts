// types.ts
export type ContentType = "video" | "quiz" | "lecture";

export interface Content {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  createdAt: Date;
  fileUrl: string | null;
}

export interface Section {
  id: string;
  name: string;
  contents: Content[];
}

export interface Course {
  _id:string;
  title: string;
  description: string;
  banner: File | null;
  category: string;
  published: boolean;
}

export type CourseAction =
  | { type: "SET_COURSE"; payload: any }
  | { type: "ADD_SECTION"; payload: { courseId: string; section: Section } }
  | { type: "DELETE_SECTION"; payload: { courseId: string; sectionId: string } }
  | {
      type: "ADD_CONTENT";
      payload: { courseId: string; sectionId: string; content: Content };
    }
  | {
      type: "DELETE_CONTENT";
      payload: { courseId: string; sectionId: string; contentId: string };
    }
  | {
      type: "EDIT_SECTION_NAME";
      payload: { courseId: string; sectionId: string; newName: string };
    }
  | {
      type: "EDIT_CONTENT_NAME";
      payload: {
        courseId: string;
        sectionId: string;
        contentId: string;
        newName: string;
      };
    }
  | { type: "PUBLISH_COURSE"; payload: string };
