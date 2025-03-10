// Example statistics component
const AdminDashboardStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-gray-500">Total Users</h3>
      <p className="text-3xl font-bold">1,234</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-gray-500">Active Courses</h3>
      <p className="text-3xl font-bold">89</p>
    </div>
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-gray-500">Pending Approvals</h3>
      <p className="text-3xl font-bold">5</p>
    </div>
  </div>
);

export default AdminDashboardStats;
