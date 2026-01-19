import { motion } from "framer-motion";
import { JSX } from "react";
import { useQueueStore } from "../../store/useQueueStore";

function PlayerScreen(): JSX.Element {
  const { queue } = useQueueStore();

  const currentSong = queue[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-64 h-64 rounded-full bg-neon flex items-center justify-center shadow-glow"
      >
        <p className="text-black font-bold text-xl">
          {currentSong ? "NOW PLAYING" : "QUEUE EMPTY"}
        </p>
      </motion.div>

      {currentSong ? (
        <>
          <h2 className="mt-6 text-2xl font-bold">{currentSong.title}</h2>
          <p className="opacity-70">{currentSong.artist}</p>
        </>
      ) : (
        <p className="mt-6 opacity-50">Waiting for customers to add songs...</p>
      )}
    </div>
  );
}

export default PlayerScreen;
