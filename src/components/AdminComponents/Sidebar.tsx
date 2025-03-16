// components/AdminDashboard/Sidebar.tsx
import { FiUsers, FiBarChart2, FiSettings } from "react-icons/fi";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <div className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 border-r">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("teachers")}
          className={`w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "teachers"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <FiUsers className="inline mr-2" /> Teachers
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "students"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <FiUsers className="inline mr-2" /> Students
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "admins"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <FiSettings className="inline mr-2" /> Admins
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "stats"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          <FiBarChart2 className="inline mr-2" /> Statistics
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
