import { motion } from "framer-motion"

const AdminDashboard = () => {
  return (
    <motion.div
      className="container mx-auto px-6 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600">Manage users, roles, and permissions.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
          <p className="text-gray-600">Monitor and manage all courses on the platform.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p className="text-gray-600">View platform usage and performance metrics.</p>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminDashboard

