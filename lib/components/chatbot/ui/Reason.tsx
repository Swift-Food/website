interface ReasonProps {
  children: string;
}

/** Italic Fraunces "picked because" tag — used under restaurant + item names. */
export function Reason({ children }: ReasonProps) {
  return <span className="reason">— {children}</span>;
}
