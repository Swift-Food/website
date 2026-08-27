import Link from "next/link";
import { ReactNode } from "react";
import { Loader, type LucideIcon } from "lucide-react";

interface AccountCardProps {
  title: string;
  icon: LucideIcon;
  loading?: boolean;
  /** Rendered bottom-right, e.g. a "View all" link. */
  action?: { label: string; href: string };
  children: ReactNode;
}

/**
 * One tile in the dashboard grid. Keeps the icon, heading and footer link
 * identical across the row so the three read as one set.
 */
export const AccountCard = ({
  title,
  icon: Icon,
  loading,
  action,
  children,
}: AccountCardProps) => (
  <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.03)] flex flex-col">
    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary mb-6">
      <Icon size={20} />
    </div>
    <h2 className="text-xs font-black uppercase tracking-widest text-black mb-4">
      {title}
    </h2>

    <div className="flex-1">
      {loading ? (
        <div className="py-6 flex justify-center">
          <Loader size={18} className="animate-spin text-gray-300" />
        </div>
      ) : (
        children
      )}
    </div>

    {action && !loading && (
      <Link
        href={action.href}
        className="mt-6 self-start font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
      >
        {action.label}
      </Link>
    )}
  </div>
);
