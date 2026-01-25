import { JSX, ReactNode } from "react";

type NeonCardProps = {
  children: ReactNode;
  className?: string;
};

function NeonCard({
  children,
  className = "",
}: NeonCardProps): JSX.Element {
  return (
    <div
      className={`bg-white/10 backdrop-blur-xl p-4 rounded-2xl
        border border-white/20 shadow-lg hover:shadow-glow transition-all
        ${className}`}
    >
      {children}
    </div>
  );
}

export default NeonCard; 