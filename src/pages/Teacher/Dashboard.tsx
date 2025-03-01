// import { useCourses } from "../../context/CourseContext";
import ManageCourses from "./ManageCourses";

const Dashboard = () => {
  // const { courses } = useCourses();

  // const publishedCourses = courses.filter((course) => course.isPublished);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Published Courses</h1>
      <div className="space-y-6">
        {/* {publishedCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600 mt-2">{course.description}</p>
            {course.banner && (
              <img
                src={course.banner}
                alt="Course banner"
                className="mt-4 w-full h-48 object-cover rounded-lg"
              />
            )}
            <div className="mt-4">
              <h3 className="font-medium">Sections:</h3>
              <ul className="list-disc list-inside">
                {course.sections.map((section: any) => (
                  <li key={section.id} className="mt-2">
                    {section.name} ({section.contents.length} items)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))} */}
      </div>
      <ManageCourses />
    </div>
  );
};

export default Dashboard;
