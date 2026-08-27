import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthAlertProps {
  tone: "error" | "success";
  message: string;
}

export const AuthAlert = ({ tone, message }: AuthAlertProps) => {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
        isError
          ? "bg-red-50 border border-red-200 text-red-600"
          : "bg-green-50 border border-green-200 text-green-700"
      }`}
    >
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <span className="font-light leading-relaxed">{message}</span>
    </div>
  );
};
