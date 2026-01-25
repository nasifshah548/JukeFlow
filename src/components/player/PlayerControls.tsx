import { motion } from "framer-motion";

type Props = {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
};

function PlayerControls({ isPlaying, onPlayPause, onNext, onPrev }: Props) {
  const buttonClass =
    "px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 transition-all";

  return (
    <div className="flex justify-center gap-4 mt-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={buttonClass}
        onClick={onPrev}
      >
        ⏮
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className="px-6 py-2 rounded-xl bg-cyan-500 text-black font-bold"
        onClick={onPlayPause}
      >
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.9 }}
        className={buttonClass}
        onClick={onNext}
      >
        ⏭
      </motion.button>
    </div>
  );
}

export default PlayerControls;
