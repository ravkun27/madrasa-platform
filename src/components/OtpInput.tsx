import { FaCheck, FaSpinner } from "react-icons/fa";

export const OtpInput = ({
  value,
  onChange,
  onVerify,
  isVerified,
  isVerifying,
}: {
  value: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  isVerified: boolean;
  isVerifying: boolean;
}) => (
  <div className="flex flex-col sm:flex-row gap-2 items-center">
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Enter 4-digit OTP"
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
        }
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white"
      />
      {isVerified && (
        <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
      )}
    </div>
    <button
      type="button"
      onClick={onVerify}
      disabled={isVerifying || isVerified}
      className={`w-full sm:w-32 px-4 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
        isVerifying || isVerified
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-primary hover:bg-blue-600 text-white"
      }`}
    >
      {isVerifying ? (
        <>
          <FaSpinner className="animate-spin" />
          Verifying...
        </>
      ) : (
        "Verify"
      )}
    </button>
  </div>
);
