import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Page chrome shared by every customer account form — the big uppercase
 * heading and soft card the rest of the marketing site uses.
 */
export const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <div className="min-h-below-nav bg-white pt-20 md:pt-28 pb-24 px-6">
    <div className="max-w-md mx-auto">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-black leading-none mb-4">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-400 font-light leading-relaxed mb-10">{subtitle}</p>
      )}

      <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.03)]">
        {children}
      </div>

      {footer && (
        <div className="mt-8 text-center text-sm text-gray-400 font-light">{footer}</div>
      )}
    </div>
  </div>
);
