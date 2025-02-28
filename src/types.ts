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
  id: string;
  title: string;
  description: string;
  banner: string;
  sections: Section[];
  isPublished: boolean;
  createdAt: Date;
}

export type CourseAction =
  | { type: "CREATE_COURSE"; payload: Course }
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
