import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.role || "Student"}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default StudentDashboard;
