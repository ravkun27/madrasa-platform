import { FaTelegram, FaWhatsapp } from "react-icons/fa";

export const CommunicationPreference = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: "telegram" | "whatsapp") => void;
}) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
      Preferred communication method:
    </p>
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
      <button
        type="button"
        onClick={() => onChange("telegram")}
        className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
          value === "telegram"
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-200 hover:border-blue-500"
        }`}
      >
        <FaTelegram className="text-blue-500 text-xl" />
        <span className="font-medium">Telegram</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("whatsapp")}
        className={`w-full p-3 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${
          value === "whatsapp"
            ? "border-green-500 bg-green-500/10"
            : "border-gray-200 hover:border-green-500"
        }`}
      >
        <FaWhatsapp className="text-green-500 text-xl" />
        <span className="font-medium">WhatsApp</span>
      </button>
    </div>
  </div>
);
