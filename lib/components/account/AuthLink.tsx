import Link from "next/link";
import { ReactNode } from "react";

interface AuthLinkProps {
  href: string;
  children: ReactNode;
}

export const AuthLink = ({ href, children }: AuthLinkProps) => (
  <Link
    href={href}
    className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase border-b border-primary text-primary pb-0.5 hover:text-black hover:border-black transition-colors"
  >
    {children}
  </Link>
);
