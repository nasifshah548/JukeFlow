import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import { useQueueStore } from "../../store/useQueueStore";

type PlayMode = "normal" | "loop" | "shuffle";

function NeonPlayer() {
  const { queue, votes, totalUsers, voteSkip, roomId } = useQueueStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [mode, setMode] = useState<PlayMode>("normal");

  const currentSong = queue[currentIndex];

  const votesNeeded = Math.max(1, Math.ceil(totalUsers / 2));
  const votePercentage = Math.min((votes / votesNeeded) * 100, 100);

  // 🔑 Consistent vote key
  const voteKey =
    currentSong && roomId ? `jukeflow-${roomId}-${currentSong.id}` : "";

  // ✅ Derived state (NO useEffect needed)
  const hasVoted = voteKey !== "" && localStorage.getItem(voteKey) !== null;

  // 🎵 Load & play song
  useEffect(() => {
    if (!currentSong) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentSong.audioUrl);
    } else {
      audioRef.current.src = currentSong.audioUrl;
    }

    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play();
    }
  }, [currentSong, isPlaying, volume]);

  // ⏱ Progress + Auto Next
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      if (mode === "loop") {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (mode === "shuffle") {
        if (queue.length <= 1) return;

        let nextIndex = currentIndex;
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * queue.length);
        }

        setCurrentIndex(nextIndex);
        setIsPlaying(true);
        return;
      }

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, queue.length, mode]);

  // ▶️ Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((prev) => !prev);
  };

  // 🔁 Loop
  const toggleLoop = () => {
    setMode((m) => (m === "loop" ? "normal" : "loop"));
  };

  // 🎲 Shuffle
  const toggleShuffle = () => {
    setMode((m) => (m === "shuffle" ? "normal" : "shuffle"));
  };

  // ⏭ Next
  const nextSong = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(true);
    }
  };

  // ⏮ Prev
  const prevSong = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPlaying(true);
    }
  };

  // 🎯 Seek
  const seek = (value: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;

    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;

    setProgress(value);
  };

  // 🔊 Volume
  const changeVolume = (value: number) => {
    if (!audioRef.current) return;

    audioRef.current.volume = value;
    setVolume(value);
  };

  if (!currentSong) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4
      bg-black/80 backdrop-blur-xl
      border border-cyan-400/20
      rounded-2xl p-4 shadow-lg shadow-cyan-500/20"
    >
      {/* 🎵 Song Info */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-bold text-cyan-300">{currentSong.title}</p>
          <p className="text-sm opacity-70">{currentSong.artist}</p>
        </div>

        <VolumeSlider volume={volume} onChange={changeVolume} />
      </div>

      {/* 📊 Progress */}
      <ProgressBar progress={progress} onSeek={seek} />

      {/* 🎛 Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={nextSong}
        onPrev={prevSong}
      />

      {/* 🔁 Loop & Shuffle */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={toggleLoop}
          className={`px-4 py-1 rounded-full text-sm transition
          ${
            mode === "loop"
              ? "bg-cyan-400 text-black shadow-glow"
              : "border border-cyan-400/40 text-cyan-300"
          }`}
        >
          🔁 Loop
        </button>

        <button
          onClick={toggleShuffle}
          className={`px-4 py-1 rounded-full text-sm transition
          ${
            mode === "shuffle"
              ? "bg-pink-400 text-black shadow-glow"
              : "border border-pink-400/40 text-pink-300"
          }`}
        >
          🎲 Shuffle
        </button>
      </div>

      {/* 🗳 Vote to Skip */}
      <div className="flex flex-col items-center mt-4">
        <button
          onClick={() => {
            if (hasVoted || !voteKey) return;

            voteSkip();
            localStorage.setItem(voteKey, "true");
          }}
          disabled={hasVoted}
          className={`px-6 py-2 rounded-full font-bold transition shadow-lg
          ${
            hasVoted
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:scale-105"
          }`}
        >
          {hasVoted ? "✅ Voted" : "⏭ Vote to Skip"}
        </button>

        <p className="text-sm mt-2 opacity-70">
          {votes} / {Math.ceil(totalUsers / 2)} votes needed
        </p>
      </div>

      {/* 📊 Vote Progress Bar */}
      <div className="w-full max-w-md mt-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${votePercentage}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-red-400 to-pink-500 shadow-glow"
          />
        </div>

        <p className="text-xs text-center mt-1 opacity-70">
          {votes} / {votesNeeded} votes to skip
        </p>
      </div>
    </motion.div>
  );
}

export default NeonPlayer;
