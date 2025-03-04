import { useState, useEffect } from "react";
// import { useTheme } from "../../context/ThemeContext";
import { getFetch, deleteFetch } from "../../utils/apiCall";
import { toast } from "react-hot-toast";
import {
  FiEdit,
  FiLock,
  FiMail,
  // FiPhone,
  FiTrash2,
  FiUser,
  FiLogOut,
  FiCheck,
  FiX,
} from "react-icons/fi";
// import { FaTelegram, FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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
  // const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
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

  // Animation variants
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result: any = await getFetch("/user");
        // console.log(result.data.phoneNumber);
        if (result.success) {
          setUserData({
            name: `${result.data.firstName || ""} ${result.data.lastName || ""}`.trim(),
            email: result.data.email,
            phone: result.data.phoneNumber,
            telegram: result.data.telegram,
            whatsapp: result.data.whatsapp,
          });
        }
      } catch (error) {
        toast.error("Failed to load user data");
      }
    };

    if (isOpen) fetchUserData();
  }, [isOpen]);

  // const handleUpdate = async (type: keyof typeof isEditing) => {
    // setIsLoading(true);
    // try {
    //   let payload = {};
    //   let endpoint = "";

    //   switch (type) {
    //     case "name":
    //       endpoint = "/user/update-name";
    //       payload = { name: formData.newName };
    //       break;
    //     case "phone":
    //       endpoint = "/user/phone_or_email";
    //       payload = { phone: formData.newPhone };
    //       break;
    //     case "contact":
    //       endpoint = "/user/update-contact";
    //       payload = {
    //         telegram: formData.newTelegram,
    //         whatsapp: formData.newWhatsapp,
    //       };
    //       break;
    //     case "password":
    //       endpoint = "/user/password";
    //       payload = {
    //         currentPassword: formData.currentPassword,
    //         newPassword: formData.newPassword,
    //       };
    //       break;
    //   }

    //   const result: any = await postFetch(endpoint, payload);
    //   if (result.success) {
    //     toast.success("Update successful");
    //     setUserData((prev) => ({ ...prev, ...payload }));
    //     setIsEditing((prev) => ({ ...prev, [type]: false }));
    //   }
    // } catch (error: any) {
    //   toast.error(error.message || "Update failed");
    // } finally {
    //   setIsLoading(false);
    // }
  // };

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account?"
      )
    ) {
      try {
        await deleteFetch("/user/delete");
        logout();
        toast.success("Account deleted");
        navigate("/");
      } catch (error) {
        toast.error("Deletion failed");
      }
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
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={mobileMenuVariants}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header Section */}
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
                {user && (
                  <Link
                    to={`/${user.role}-dashboard`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              {/* Mobile Navigation (Only for non-authenticated users on mobile) */}
              {!user && (
                <motion.div className="space-y-4">
                  {["Courses", "About", "Contact"].map((item) => (
                    <Link
                      key={item}
                      to={`/${item.toLowerCase()}`}
                      className="block md:hidden text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {item}
                    </Link>
                  ))}
                </motion.div>
              )}

              {/* User Profile Section */}
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-semibold flex items-center gap-3 mb-4">
                    <FiUser className="w-6 h-6" />
                    Profile Information
                  </h2>

                  <div className="space-y-4">
                    {/* Name Field */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Name:</span>
                        {!isEditing.name ? (
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                newName: userData.name,
                              });
                              setIsEditing({ ...isEditing, name: true });
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              // onClick={() => handleUpdate("name")}
                              className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                setIsEditing({ ...isEditing, name: false })
                              }
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing.name ? (
                        <input
                          value={formData.newName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newName: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border dark:bg-gray-700"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 capitalize">
                          {userData.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <FiMail />
                        <span className="font-medium">Email:</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {userData.email}
                      </p>
                    </div>

                    {/* Phone Field */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Phone:</span>
                        {!isEditing.phone ? (
                          <button
                            onClick={() => {
                              setFormData({
                                ...formData,
                                newPhone: userData.phone,
                              });
                              setIsEditing({ ...isEditing, phone: true });
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                          >
                            <FiEdit className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              // onClick={() => handleUpdate("phone")}
                              className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                setIsEditing({ ...isEditing, phone: false })
                              }
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing.phone ? (
                        <input
                          value={formData.newPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              newPhone: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-lg border dark:bg-gray-700"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">
                          {userData.phone || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* <div className="space-y-6"> */}
                {/* Telegram */}
                {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> */}
                {/* <div className="flex items-center gap-3">
                      <FaTelegram className="w-6 h-6 text-blue-500" />
                      <span className="font-medium">Telegram:</span>
                    </div>
                    <div className="flex-1">
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
                          className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          placeholder="@username"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {userData.telegram || "Not set"}
                        </span>
                      )}
                    </div> */}

                {/* Edit / Save Buttons */}
                {/* <div className="flex gap-2">
                      {isEditing.contact ? (
                        <>
                          <button
                            onClick={() => handleUpdate("contact")}
                            className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-800 rounded-full transition"
                          >
                            <FiCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              setIsEditing({ ...isEditing, contact: false })
                            }
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 rounded-full transition"
                          >
                            <FiX className="w-5 h-5" />
                          </button>
                        </>
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
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                      )}
                    </div> */}
                {/* </div> */}

                {/* WhatsApp */}
                {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FaWhatsapp className="w-6 h-6 text-green-500" />
                      <span className="font-medium">WhatsApp:</span>
                    </div>
                    <div className="flex-1">
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
                          className="w-full sm:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          placeholder="Phone number"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {userData.whatsapp || "Not set"}
                        </span>
                      )}
                    </div>
                  </div> */}
                {/* </div> */}

                {/* Security Section */}
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-semibold flex items-center gap-3 mb-4">
                    <FiLock className="w-6 h-6" />
                    Security
                  </h2>

                  {isEditing.password ? (
                    <div className="space-y-4">
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
                        className="w-full p-2 rounded-lg border dark:bg-gray-700"
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
                        className="w-full p-2 rounded-lg border dark:bg-gray-700"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          // onClick={() => handleUpdate("password")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {/* {isLoading ? "Saving..." : "Save"} */}
                        </button>
                        <button
                          onClick={() =>
                            setIsEditing({ ...isEditing, password: false })
                          }
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setIsEditing({ ...isEditing, password: true })
                      }
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {/* Dangerous Zone */}
                <div className="p-6 rounded-xl border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                    Dangerous Zone
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      <FiLogOut /> Log Out
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 /> Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Auth Section for Guests */}
              {!user && (
                <div className="text-center space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Sign in to access all features
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to="/login"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsPage;
