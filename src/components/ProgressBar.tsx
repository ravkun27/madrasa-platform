export const ProgressBar = ({ progress }: any) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-green-500 rounded-full h-2 transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
);
