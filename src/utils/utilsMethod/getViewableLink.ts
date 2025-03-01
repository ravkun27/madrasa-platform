import { getFetch } from "../apiCall";

export async function getViewableLink(filePath: any) {
  try {
    return await getFetch(
      `/user/teacher/course/getViewableLink?filename=${filePath}`
    );
  } catch (error) {
    console.log("error while : getting viewable url", error);
  }
}
