import { motion } from "framer-motion";
import { JSX } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useQueueStore } from "../../store/useQueueStore";
import ControlButton from "../../components/ui/ControlButton";

function PlayerScreen(): JSX.Element {
  const { queue, nextSong, clearQueue, roomId, setRoom } = useQueueStore();

  const currentSong = queue[0];

  // Generate room once
  if (!roomId || roomId === "default-room") {
    const newRoom = crypto.randomUUID().slice(0, 8);
    setRoom(newRoom);
  }

  const roomUrl = `${window.location.origin}/room/${roomId}`;

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
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-4 rounded-xl shadow-lg"
      >
        <QRCodeCanvas value={roomUrl} size={180} />
        <p className="text-center mt-2 text-sm font-bold">
          Scan to Join Jukebox
        </p>
      </motion.div>

      {currentSong && (
        <div className="text-center">
          <h2 className="text-3xl font-bold">{currentSong.title}</h2>
          <p className="opacity-70">{currentSong.artist}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-6 justify-center">
        <ControlButton label="⏭ Next Song" onClick={nextSong} />
        <ControlButton label="🧹 Clear Queue" onClick={clearQueue} />
        <ControlButton label="🖥 Fullscreen" onClick={enterFullscreen} />
      </div>

      <p className="opacity-50">
        Room ID: {roomId} | Songs in Queue: {queue.length}
      </p>
    </div>
  );
}

export default PlayerScreen;
