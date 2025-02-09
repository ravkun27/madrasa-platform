import { useAuth } from "../../context/AuthContext";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.role || "Teacher"}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default TeacherDashboard;
