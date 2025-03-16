// pages/AdminDashboard.tsx
import { useState } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TeacherManagement from "../../components/AdminComponents/TeacherManagement";
import StudentManagement from "../../components/AdminComponents/StudentManagement";
import AdminManagement from "../../components/AdminComponents/AdminManagement";
import StatsOverview from "../../components/AdminComponents/StatsOverview";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("teachers");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 p-4 md:p-8">
          {activeTab === "teachers" && <TeacherManagement />}
          {activeTab === "students" && <StudentManagement />}
          {activeTab === "admins" && <AdminManagement />}
          {activeTab === "stats" && <StatsOverview />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
