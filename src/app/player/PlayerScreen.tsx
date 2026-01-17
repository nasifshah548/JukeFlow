import { motion } from "framer-motion";
import { JSX } from "react";

export default function PlayerScreen(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-64 h-64 rounded-full bg-neon flex items-center justify-center shadow-glow"
      >
        <p className="text-black font-bold text-xl">NOW PLAYING</p>
      </motion.div>

      <h2 className="mt-6 text-2xl font-bold">Blinding Lights</h2>
      <p className="opacity-70">The Weeknd</p>
    </div>
  );
}
