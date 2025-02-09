import { Link } from "react-router-dom";
const Unauthorized = () => (
  <div className="w-full flex flex-col items-center mt-16 gap-6">
    <h1 className="text-5xl font-bold text-text dark:text-text-dark">
      Unauthorized page
    </h1>
    <p className="text-3xl text-text dark:text-text-dark">
      You don't have permission to access this page.
    </p>
    <Link to="/login" className="text-primary">
      Go back to login.
    </Link>
  </div>
);
export default Unauthorized;
