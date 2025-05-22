import { getFetch } from "../apiCall";

export const fetchStudentsForCourse = async (courseId: string) => {
  try {
    const response: any = await getFetch(
      `/user/teacher/course/students?courseId=${courseId}`
    );
    if (Array.isArray(response?.data?.students)) {
      return response.data.students;
    } else {
      console.error("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};
