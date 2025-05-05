// pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TeacherManagement from "../../components/AdminComponents/TeacherManagement";
import StudentsManagement from "../../components/AdminComponents/StudentsMangement";
import AdminManagement from "../../components/AdminComponents/AdminManagement";
import StatsOverview from "../../components/AdminComponents/StatsOverview";
import EditPages from "../../components/AdminComponents/EditPages";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("teachers");
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    setRole(savedRole); // Save role from localStorage
  }, []);
  return (
    <div className="min-h-screen bg-background flex mt-8 md:mt-0">
      {/* Fixed Sidebar */}
      <div className="md:w-64 fixed top-0 left-0 h-screen overflow-y-auto z-40">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content (scrollable) */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto max-h-screen">
        {activeTab === "teachers" && <TeacherManagement />}
        {activeTab === "students" && <StudentsManagement />}
        {role === "superadmin" && activeTab === "admins" && <AdminManagement />}
        {role === "superadmin" && activeTab === "editPages" && <EditPages />}
        {activeTab === "stats" && <StatsOverview />}
      </div>
    </div>
  );
};

export default AdminDashboard;
