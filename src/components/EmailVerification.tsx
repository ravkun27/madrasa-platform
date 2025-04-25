// components/Signup/EmailVerification.tsx
import { FaCheck, FaSpinner } from "react-icons/fa";

export const EmailVerification = ({
  email,
  setEmail,
  isOtpSent,
  isOtpVerified,
  isSendingOtp,
  countdown,
  onSendOtp,
  onVerifyOtp,
  otp,
  setOtp,
  isVerifyingOtp,
}: {
  email: string;
  setEmail: (value: string) => void;
  isOtpSent: boolean;
  isOtpVerified: boolean;
  isSendingOtp: boolean;
  countdown: number;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
  otp: string;
  setOtp: (value: string) => void;
  isVerifyingOtp: boolean;
}) => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isOtpVerified}
          className="w-full p-3 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-75"
        />
        {isOtpVerified && (
          <FaCheck className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
        )}
      </div>
      {!isOtpVerified && (
        <button
          type="button"
          onClick={onSendOtp}
          disabled={countdown > 0 || isOtpVerified}
          className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            countdown > 0 || isSendingOtp || isOtpVerified
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          {isSendingOtp ? (
            <>
              <FaSpinner className="animate-spin" />
              Sending...
            </>
          ) : countdown > 0 ? (
            `${countdown}s`
          ) : (
            "Send OTP"
          )}
        </button>
      )}
    </div>

    {isOtpSent && !isOtpVerified && (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Enter 4-digit OTP"
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="w-full p-3 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={onVerifyOtp}
            disabled={isVerifyingOtp}
            className={`w-full sm:w-32 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isVerifyingOtp
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {isVerifyingOtp ? (
              <>
                <FaSpinner className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Didn’t receive the code? Check your spam or junk folder.
        </p>
      </div>
    )}
  </div>
);
