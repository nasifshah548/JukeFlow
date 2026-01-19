import { JSX, ReactNode } from "react";

type GlowButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

function GlowButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: GlowButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-6 py-3 rounded-xl bg-neon text-black font-bold
        hover:shadow-glow transition-all duration-300 hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default GlowButton;
