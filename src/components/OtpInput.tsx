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
  isSending: boolean;
  isVerifying: boolean;
  countdown: number;
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <div className="relative flex-1">
      <input
        type="number"
        placeholder="Enter 4-digit OTP"
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 4))
        }
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {isVerified && (
        <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
      )}
    </div>
    <button
      type="button"
      onClick={onVerify}
      disabled={isVerifying || isVerified}
      className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
        isVerifying || isVerified
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-primary hover:bg-primary/90 text-white"
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
