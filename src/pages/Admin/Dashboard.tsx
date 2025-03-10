import { useState, useEffect } from "react";
import { deleteFetch, getFetch, postFetch } from "../../utils/apiCall";
import {
  FiCheckCircle,
  FiSettings,
  FiTrash,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("teachers");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  // Fetch data based on tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case "teachers":
            const teachersRes: any = await getFetch("/admin/auth/teacher/list");
            setTeachers(teachersRes.data);
            break;
          case "students":
            const studentsRes: any = await getFetch("/admin/student");
            setStudents(studentsRes.data);
            break;
          case "admins":
            const adminsRes: any = await getFetch("/admin/auth/admins");
            setAdmins(adminsRes.data);
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [activeTab]);

  // Teacher Actions
  const handleTeacherApproval = async (userId: string, approve: boolean) => {
    await postFetch("/admin/auth/teacher/approve", {
      userId,
      approved: approve,
    });
    setTeachers(teachers.filter((t) => t._id !== userId));
  };

  const suspendTeacher = async (userId: string) => {
    await postFetch("/admin/auth/teacher/suspend", { userId });
    // Update local state
  };

  // Student Actions
  const clearStudents = async () => {
    if (window.confirm("Are you sure you want to delete all students?")) {
      await deleteFetch("/admin/student/clear");
      setStudents([]);
    }
  };

  // Admin Actions
  const createAdmin = async () => {
    await postFetch("/admin/auth/general", newAdmin);
    setAdmins([...admins, newAdmin]);
    setNewAdmin({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("teachers")}
              className="admin-tab"
            >
              <FiUsers /> Teachers
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className="admin-tab"
            >
              <FiUsers /> Students
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className="admin-tab"
            >
              <FiSettings /> Admins
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "teachers" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Teacher Management</h2>
              <div className="grid gap-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{teacher.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {teacher.email}
                        </p>
                        <span
                          className={`status ${teacher.approved ? "approved" : "pending"}`}
                        >
                          {teacher.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!teacher.approved && (
                          <button
                            onClick={() =>
                              handleTeacherApproval(teacher._id, true)
                            }
                            className="btn-success"
                          >
                            <FiCheckCircle /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => suspendTeacher(teacher._id)}
                          className="btn-warning"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() =>
                            handleTeacherApproval(teacher._id, false)
                          }
                          className="btn-danger"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Student Management</h2>
                <button onClick={clearStudents} className="btn-danger">
                  <FiTrash /> Clear All Students
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {students.map((student) => (
                  <div key={student._id} className="p-4">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {student.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Admin Management</h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-bold mb-4">Create New Admin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newAdmin.firstName}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, firstName: e.target.value })
                    }
                    className="admin-input"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newAdmin.lastName}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, lastName: e.target.value })
                    }
                    className="admin-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                    className="admin-input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAdmin.phoneNumber}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })
                    }
                    className="admin-input"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    className="admin-input"
                  />
                  <button onClick={createAdmin} className="btn-success">
                    <FiUserPlus /> Create Admin
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Existing Admins</h3>
                <div className="grid gap-4">
                  {admins.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex justify-between items-center p-4 border-b"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {admin.firstName} {admin.lastName}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {admin.email}
                        </p>
                      </div>
                      <button className="btn-danger">
                        <FiTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
