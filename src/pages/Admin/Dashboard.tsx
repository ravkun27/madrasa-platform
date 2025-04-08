// pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/AdminComponents/Sidebar";
import TeacherManagement from "../../components/AdminComponents/TeacherManagement";
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
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 p-4 md:p-8">
          {activeTab === "teachers" && <TeacherManagement />}
          {role === "superadmin" && activeTab === "admins" && (
            <AdminManagement />
          )}
          {role === "superadmin" && activeTab === "editPages" && <EditPages />}

          {activeTab === "stats" && <StatsOverview />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
