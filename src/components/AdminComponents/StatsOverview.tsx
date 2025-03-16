// components/AdminDashboard/StatsOverview.tsx
import { useEffect, useState } from "react";
import { getFetch } from "../../utils/apiCall";
import StatCard from "./StatCard";

interface StatsResponse {
  success: boolean;
  message: string;
  data: {
    totalCourses?: number;
    totalEnrolledStudents?: number;
  };
}

const StatsOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    monthlyVisits: 0,
    activeCourses: 0,
  });

  const fetchStats = async () => {
    try {
      const statsRes: StatsResponse = await getFetch(
        "/admin/auth/course/stats"
      );
      const teachersRes: any = await getFetch("/admin/auth/teacher/list");
      const totalTeachers = teachersRes.data.teacherList.length; // Adjust if needed

      if (statsRes.success) {
        setStats({
          totalStudents: statsRes.data.totalEnrolledStudents ?? 0,
          totalTeachers: totalTeachers ?? 0, // Adjust if needed
          monthlyVisits: 0, // Adjust if needed
          activeCourses: statsRes.data.totalCourses ?? 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Students" value={stats.totalStudents} />
      <StatCard title="Total Teachers" value={stats.totalTeachers} />
      <StatCard title="Monthly Visits" value={stats.monthlyVisits} />
      <StatCard title="Active Courses" value={stats.activeCourses} />
    </div>
  );
};

export default StatsOverview;
