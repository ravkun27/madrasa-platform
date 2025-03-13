import { useState, useEffect } from "react"; // Added useEffect
import { FaComment, FaWhatsapp } from "react-icons/fa";
import { OtpInput } from "./OtpInput";

const CountryOptions = [
  { code: "+91", country: "India" },
  { code: "+964", country: "Iraq" },
];

export const PhoneVerification = ({
  phoneNumber,
  setPhoneNumber,
  onVerify,
  onSendOtp,
  isVerified,
}: {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onVerify: (otp: string) => void;
  onSendOtp: (payload: {
    phoneNumber: string;
    method: "whatsapp" | "sms";
    country: string;
  }) => void;
  onCommunicationChange: (method: "telegram" | "whatsapp") => void;
  countdown: number;
  isVerified: boolean;
}) => {
  const [method, setMethod] = useState<"whatsapp" | "sms">("whatsapp");
  const [otp, setOtp] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(CountryOptions[0]);
  const [otpCountdown, setOtpCountdown] = useState(0); // State for countdown
  const [isSending, setIsSending] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

  const handleSendOtp = () => {
    const payload = {
      phoneNumber: phoneNumber,
      method,
      country: selectedCountry.country,
    };
    onSendOtp(payload);
    setOtpCountdown(10); // Start 10-second countdown
    setIsSending(true);
  };

  return (
    <div className="space-y-4">
      {/* Verification Method (WhatsApp or SMS) */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Choose verification method:
        </p>
        <div className="flex justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => setMethod("whatsapp")}
            className={`flex-1 p-2 rounded-lg border-2 transition-colors text-text flex items-center justify-center gap-2 ${
              method === "whatsapp"
                ? "border-green-500 bg-green-500/10"
                : "border-gray-200 hover:border-green-500"
            }`}
          >
            <FaWhatsapp className="text-green-500 text-xl" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setMethod("sms")}
            className={`flex-1 p-2 rounded-lg border-2 transition-colors text-text flex items-center justify-center gap-2 ${
              method === "sms"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-200 hover:border-blue-500"
            }`}
          >
            <FaComment className="text-blue-500 text-xl" />
            SMS
          </button>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        {/* Country Code Dropdown */}
        <div className="relative">
          <select
            value={selectedCountry.code}
            onChange={(e) => {
              const newCountry = CountryOptions.find(
                (c) => c.code === e.target.value
              );
              if (newCountry) setSelectedCountry(newCountry);
            }}
            className="border rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary bg-white"
          >
            {CountryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.country} {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) =>
              setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 15))
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Send OTP Button */}
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={otpCountdown > 0 || isVerified} // Disable button during countdown
          className={`w-full sm:w-32 px-4 py-3 rounded-lg transition-colors ${
            otpCountdown > 0 || isVerified
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          {otpCountdown > 0 ? `${otpCountdown}s` : "Send OTP"}
        </button>
      </div>

      {/* OTP Input */}
      {isSending && !isVerified && (
        <OtpInput
          value={otp}
          onChange={setOtp}
          onVerify={() => {
            console.log("Verifying OTP:", otp);
            onVerify(otp);
          }}
          isVerified={isVerified}
          isSending={false}
          isVerifying={false}
          countdown={otpCountdown}
        />
      )}
    </div>
  );
};
