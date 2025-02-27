import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { postFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import {
  FiEdit,
  FiLock,
  FiMail,
  FiPhone,
  FiTrash2,
  FiUser,
  FiLogOut,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
  name: string;
  email: string;
  phone: string;
  telegram?: string;
  whatsapp?: string;
}

const UserSettingsPage = ({
  isOpen = false,
  onClose = () => {},
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState<UserData>({
    name: "John Doe",
    email: "john@example.com",
    phone: "07901234567",
    telegram: "@johndoe",
    whatsapp: "07901234567",
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    phone: false,
    contact: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    newName: "",
    newPhone: "",
    newTelegram: "",
    newWhatsapp: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mobile animation variants
  const mobileMenuVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const handleLogout = async () => {
    try {
      await postFetch("/auth/logout", {}); // Add empty body
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await postFetch("/user/delete", {}); // Add empty body
        toast.success("Account deleted");
      } catch (error) {
        toast.error("Deletion failed");
      }
    }
  };

  const handleUpdate = async (type: keyof typeof isEditing) => {
    try {
      let payload = {};
      switch (type) {
        case "name":
          if (!formData.newName.trim()) {
            return toast.error("Name cannot be empty");
          }
          payload = { name: formData.newName };
          break;
        case "phone":
          if (!/^0?\d{10}$/.test(formData.newPhone)) {
            return toast.error("Invalid phone number");
          }
          payload = { phone: formData.newPhone };
          break;
        case "contact":
          payload = {
            telegram: formData.newTelegram,
            whatsapp: formData.newWhatsapp,
          };
          break;
        case "password":
          if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
          }
          if (formData.newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters");
          }
          payload = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          };
          break;
      }

      const result: {
        success: boolean;
        data?: Partial<UserData>;
        message?: string;
      } = await postFetch(`/user/update-${type}`, payload);
      if (result.success) {
        toast.success("Update successful");
        setUserData((prev) => ({ ...prev, ...payload }));
        setIsEditing((prev) => ({ ...prev, [type]: false }));
      }
    } catch (error) {
      toast.error("Update failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Settings Panel */}
          <motion.div
            variants={mobileMenuVariants}
            className="absolute right-0 top-0 h-full w-full max-w-lg bg-background dark:bg-background-dark shadow-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute left-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FiX className="w-6 h-6" />
              </button>

              {/* Header */}
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-3xl font-bold pt-8 ${
                  theme === "light" ? "text-primary" : "text-secondary"
                }`}
              >
                Account Settings
              </motion.h1>

              {/* Profile Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl bg-card dark:bg-card-dark border-2 border-accent"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FiUser /> Profile Information
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUser />
                      <span>Name:</span>
                      {isEditing.name ? (
                        <input
                          type="text"
                          value={formData.newName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newName: e.target.value,
                            })
                          }
                          className="ml-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="New name"
                        />
                      ) : (
                        <span>{userData.name}</span>
                      )}
                    </div>
                    {isEditing.name ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate("name")}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-full"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() =>
                            setIsEditing({ ...isEditing, name: false })
                          }
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setFormData({ ...formData, newName: userData.name });
                          setIsEditing({ ...isEditing, name: true });
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <FiMail />
                    <span>Email:</span>
                    <span className="opacity-75">{userData.email}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiPhone />
                      <span>Phone:</span>
                      {isEditing.phone ? (
                        <input
                          type="tel"
                          value={formData.newPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPhone: e.target.value,
                            })
                          }
                          className="ml-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="New phone number"
                        />
                      ) : (
                        <span>{userData.phone}</span>
                      )}
                    </div>
                    {isEditing.phone ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate("phone")}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-full"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() =>
                            setIsEditing({ ...isEditing, phone: false })
                          }
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            newPhone: userData.phone,
                          });
                          setIsEditing({ ...isEditing, phone: true });
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Contact Methods */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl bg-card dark:bg-card-dark border-2 border-accent"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FaTelegram /> Contact Methods
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Telegram */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaTelegram />
                      <span>Telegram:</span>
                      {isEditing.contact ? (
                        <input
                          type="text"
                          value={formData.newTelegram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newTelegram: e.target.value,
                            })
                          }
                          className="ml-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="@username"
                        />
                      ) : (
                        <span>{userData.telegram || "Not set"}</span>
                      )}
                    </div>
                    {isEditing.contact ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate("contact")}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-full"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() =>
                            setIsEditing({ ...isEditing, contact: false })
                          }
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                        >
                          <FiX />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            newTelegram: userData.telegram || "",
                            newWhatsapp: userData.whatsapp || "",
                          });
                          setIsEditing({ ...isEditing, contact: true });
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaWhatsapp />
                      <span>WhatsApp:</span>
                      {isEditing.contact ? (
                        <input
                          type="tel"
                          value={formData.newWhatsapp}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newWhatsapp: e.target.value,
                            })
                          }
                          className="ml-2 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Phone number"
                        />
                      ) : (
                        <span>{userData.whatsapp || "Not set"}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-xl bg-card dark:bg-card-dark border-2 border-accent"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FiLock /> Security
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="space-y-4">
                    {isEditing.password ? (
                      <>
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={formData.newPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdate("password")}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                          >
                            Save
                          </button>
                          <button
                            onClick={() =>
                              setIsEditing({ ...isEditing, password: false })
                            }
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setIsEditing({ ...isEditing, password: true })
                        }
                        className="w-full py-2 px-4 bg-secondary text-white rounded hover:bg-secondary-dark"
                      >
                        Change Password
                      </button>
                    )}
                  </div>
                </div>
                {/* Dangerous Zone */}
                <div className="pt-6 mt-6 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    Dangerous Zone
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <FiLogOut /> Log Out
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <FiTrash2 /> Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsPage;
