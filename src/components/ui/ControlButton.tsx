import { motion } from "framer-motion";
import { JSX } from "react";

type ControlButtonProps = {
  label: string;
  onClick: () => void;
};

function ControlButton({ label, onClick }: ControlButtonProps): JSX.Element {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="px-6 py-4 rounded-xl bg-neon text-black font-bold
      shadow-glow hover:shadow-[0_0_40px_rgba(0,255,255,0.9)]
      transition-all"
    >
      {label}
    </motion.button>
  );
}

export default ControlButton;
