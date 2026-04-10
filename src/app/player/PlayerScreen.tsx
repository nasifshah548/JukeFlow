import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQueueStore } from "../../store/useQueueStore";
import ControlButton from "../../components/ui/ControlButton";
import RoomQR from "../../components/room/RoomQR";
import NeonPlayer from "../../components/player/NeonPlayer";

function PlayerScreen() {
  const { queue, roomId, setRoom, totalUsers } = useQueueStore();

  const currentSong = queue[0];

  // Generate room ONCE
  useEffect(() => {
    if (!roomId || roomId === "default-room") {
      const newRoom = crypto.randomUUID().slice(0, 8);
      setRoom(newRoom);
    }
  }, [roomId, setRoom]);

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-72 h-72 rounded-full bg-neon flex items-center justify-center shadow-glow"
      >
        <p className="text-black font-bold text-xl">
          {currentSong ? "NOW PLAYING" : "SCAN TO ADD SONGS"}
        </p>
      </motion.div>

      {/* QR Code */}
      <RoomQR roomId={roomId} />

      {currentSong && (
        <div className="text-center">
          <h2 className="text-3xl font-bold">{currentSong.title}</h2>
          <p className="opacity-70">{currentSong.artist}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-6 justify-center">
        <ControlButton label="🖥 Fullscreen" onClick={enterFullscreen} />
      </div>

      <p className="opacity-50">
        Room ID: {roomId} | Users: {totalUsers} | Songs: {queue.length}
      </p>

      {/* Global Player */}
      <NeonPlayer />
    </div>
  );
}

export default PlayerScreen;
