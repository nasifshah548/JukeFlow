import { JSX } from "react";
import { motion } from "framer-motion";
import fakeSongs from "../../data/fakeSongs";
import NeonCard from "../../components/ui/NeonCard";
import GlowButton from "../../components/ui/GlowButton";
import { useQueueStore, Song } from "../../store/useQueueStore";

export default function CustomerHome(): JSX.Element {
  const { queue, addSong } = useQueueStore();

  return (
    <div className="min-h-screen p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-6"
      >
        🎶 Drop a Song Into the Vibe
      </motion.h1>

      <div className="grid grid-cols-1 gap-4">
        {fakeSongs.map((song: Song) => (
          <motion.div key={song.id} whileHover={{ scale: 1.03 }}>
            <NeonCard>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{song.title}</p>
                  <p className="text-sm opacity-70">{song.artist}</p>
                </div>
                <GlowButton onClick={() => addSong(song)}>+ Add</GlowButton>
              </div>
            </NeonCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 bg-black/80 p-4 rounded-xl border border-white/20"
      >
        <p className="font-bold mb-2">Queue</p>

        {queue.length === 0 && <p className="opacity-50">No songs yet...</p>}

        {queue.map((song, i) => (
          <p key={`${song.id}-${i}`} className="text-sm">
            {i + 1}. {song.title}
          </p>
        ))}
      </motion.div>
    </div>
  );
}
