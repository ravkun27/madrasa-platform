import { useState, useEffect } from "react";
import { FiUserPlus, FiTrash } from "react-icons/fi";
import { getFetch, postFetch, deleteFetch } from "../../utils/apiCall";
import toast from "react-hot-toast";
import { ConfirmationModal } from "../Modal/ConfiramtionModal";

const AdminManagement = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminsRes: any = await getFetch("/admin/auth/general/all");
        setAdmins(
          Array.isArray(adminsRes.data.admins) ? adminsRes.data.admins : []
        );
      } catch (error) {
        console.error("Error fetching admins:", error);
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$|^(?:\+964|0)?7[0-9]{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const createAdmin = async () => {
    if (!Object.values(newAdmin).every((val) => val.trim())) {
      toast.error("Please fill all fields.");
      return;
    }
    if (!validateEmail(newAdmin.email)) {
      toast.error("Invalid email format.");
      return;
    }
    if (!validatePhoneNumber(newAdmin.phoneNumber)) {
      toast.error("Invalid phone number. Use India or Iraq format.");
      return;
    }
    if (newAdmin.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const res: any = await postFetch("/admin/auth/general", newAdmin);
      if (res.success) {
        setAdmins([...admins, res.data]);
        setNewAdmin({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
        });
        toast.success("Admin created successfully.");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Error creating admin.");
    }
  };

  const deleteAdmin = async (userId: string) => {
    try {
      await deleteFetch("/admin/auth/general", { userId: adminToDelete });
      setAdmins((prev) => prev.filter((a) => a._id !== userId));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAdminToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      deleteAdmin(adminToDelete);
    }
    setShowDeleteConfirm(false);
    setAdminToDelete(null);
  };

  if (loading) return <div className="text-center py-8">Loading admins...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        Admin Management
      </h2>

      {/* Create New Admin Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
        <h3 className="text-lg font-bold mb-4">Create New Admin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <button
            onClick={createAdmin}
            className="md:col-span-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-1"
          >
            <FiUserPlus /> Create Admin
          </button>
        </div>
      </div>

      {/* Existing Admins List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4">Existing Admins</h3>
        <div className="grid gap-4">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="flex justify-between items-center p-4 border-b dark:border-gray-700"
            >
              <div>
                <h4 className="font-semibold text-text">
                  {admin.firstName} {admin.lastName}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {admin.email}
                </p>
              </div>
              <button
                onClick={() => handleDeleteClick(admin._id)}
                className="p-2 text-red-500 hover:text-red-600"
              >
                <FiTrash />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          message="Are you sure you want to delete this admin?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

export default AdminManagement;
