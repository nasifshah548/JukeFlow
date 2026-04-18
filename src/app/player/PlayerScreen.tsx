import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQueueStore } from "../../store/useQueueStore";
import ControlButton from "../../components/ui/ControlButton";
import RoomQR from "../../components/room/RoomQR";
import NeonPlayer from "../../components/player/NeonPlayer";

function PlayerScreen() {
  const { queue, roomId, setRoom, totalUsers } = useQueueStore();

  const [copied, setCopied] = useState(false);

  const currentSong = queue[0];

  // ✅ Generate room ONCE safely
  useEffect(() => {
    if (!roomId || roomId === "default-room") {
      const newRoom = crypto.randomUUID().slice(0, 8);
      setRoom(newRoom);
    }
  }, []); // 🔥 only once (prevents re-trigger bugs)

  // 🖥 Fullscreen
  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // 📋 Copy Room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 p-6">
      {/* 🔵 Animated Orb */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-72 h-72 rounded-full bg-neon flex items-center justify-center shadow-glow"
      >
        <p className="text-black font-bold text-xl text-center px-4">
          {currentSong ? "NOW PLAYING" : "SCAN TO ADD SONGS"}
        </p>
      </motion.div>

      {/* 📱 QR Code */}
      {roomId && <RoomQR roomId={roomId} />}

      {/* 🎵 Song Info / Empty State */}
      {currentSong ? (
        <motion.div
          key={currentSong.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold">{currentSong.title}</h2>
          <p className="opacity-70">{currentSong.artist}</p>
        </motion.div>
      ) : (
        <div className="text-center opacity-60">
          <p className="text-lg">🎧 No songs in queue</p>
          <p className="text-sm mt-1">Scan the QR code to add songs</p>
        </div>
      )}

      {/* 🎛 Controls */}
      <div className="flex flex-wrap gap-6 justify-center">
        <ControlButton label="🖥 Fullscreen" onClick={enterFullscreen} />

        <ControlButton
          label={copied ? "✅ Copied" : "📋 Copy Room"}
          onClick={copyRoomId}
        />
      </div>

      {/* 📊 Room Stats */}
      <p className="opacity-50 text-center">
        Room ID: <span className="font-bold">{roomId}</span> | Users:{" "}
        {totalUsers} | Songs: {queue.length}
      </p>

      {/* 🎵 Global Player */}
      <NeonPlayer />
    </div>
  );
}

export default PlayerScreen;
