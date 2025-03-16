// components/AdminDashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: number;
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h3 className="text-gray-500 dark:text-gray-400 text-sm mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value.toLocaleString()}</p>
  </div>
);

export default StatCard;
