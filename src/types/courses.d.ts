// types/course.d.ts
export interface CourseType {
  _id: string;
  title: string;
  description: string;
  banner?: string;
  published: boolean;
  enrollable: boolean;
  meetingDetails?: {
    title: string;
    description: string;
    link: string;
    startTime?: Date;
  };
  sectionIds: any[];
  // Add other fields as needed
}
