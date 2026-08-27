import { InputHTMLAttributes, ReactNode } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Rendered opposite the label — a "Resend code" action, for example. */
  action?: ReactNode;
}

export const AuthField = ({ label, error, action, className, ...inputProps }: AuthFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </label>
      {action}
    </div>
    <input
      {...inputProps}
      className={`w-full bg-white border-transparent border-b-2 px-0 py-4 outline-none focus:outline-none focus:ring-0 transition-colors text-black font-medium ${
        error
          ? "border-b-red-300 focus:border-b-red-400"
          : "border-b-gray-100 focus:border-b-primary"
      } ${className ?? ""}`}
    />
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);
