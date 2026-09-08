import { Loader } from "lucide-react";

interface AuthSubmitButtonProps {
  label: string;
  pendingLabel: string;
  pending: boolean;
  disabled?: boolean;
}

export const AuthSubmitButton = ({
  label,
  pendingLabel,
  pending,
  disabled,
}: AuthSubmitButtonProps) => (
  <button
    type="submit"
    disabled={pending || disabled}
    className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-3 hover:bg-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
  >
    {pending && <Loader size={14} className="animate-spin" />}
    {pending ? pendingLabel : label}
  </button>
);
