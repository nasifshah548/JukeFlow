declare global {
  interface Window {
    __jukeflow_startTime?: number;
    __jukeflow_pauseTime?: number;
  }
}

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [mode, setMode] = useState<PlayMode>("normal");

  const currentSong = queue[currentIndex];

  // 🎯 Vote calculations
  const votesNeeded = Math.max(1, Math.ceil(totalUsers / 2));
  const votePercentage = Math.min((votes / votesNeeded) * 100, 100);

  // 🔑 Unique vote key (per room + song)
  const voteKey =
    currentSong && roomId ? `jukeflow-${roomId}-${currentSong.id}` : "";

  const hasVoted = voteKey !== "" && localStorage.getItem(voteKey) !== null;

  // 🎵 Load Song & Reset
  useEffect(() => {
    if (!currentSong) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentSong.audioUrl);
    } else {
      audioRef.current.src = currentSong.audioUrl;
    }

    audioRef.current.currentTime = 0; // ✅ RESET

    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play();
    }
  }, [currentSong, isPlaying, volume]);

  // ⏱ Progress + End handling
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const update = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const ended = () => {
      if (mode === "loop") {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (mode === "shuffle" && queue.length > 1) {
        let next = currentIndex;
        while (next === currentIndex) {
          next = Math.floor(Math.random() * queue.length);
        }
        setCurrentIndex(next);
        setIsPlaying(true);
        return;
      }

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", ended);

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", ended);
    };
  }, [currentIndex, queue.length, mode]);

  // Syncing
  useEffect(() => {
    if (!audioRef.current) return;

    const startTime = window.__jukeflow_startTime;

    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000;

      audioRef.current.currentTime = elapsed;

      if (!isPlaying) return;

      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  // Pause Syncing
  useEffect(() => {
    if (!audioRef.current) return;

    const pausedAt = window.__jukeflow_pauseTime;

    if (pausedAt !== undefined) {
      audioRef.current.currentTime = pausedAt;
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // ▶️ Controls
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();

    setIsPlaying((p) => !p);
  };

  const nextSong = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(true);
    }
  };

  const prevSong = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPlaying(true);
    }
  };

  const seek = (v: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;

    audioRef.current.currentTime = (v / 100) * audioRef.current.duration;

    setProgress(v);
  };

  const changeVolume = (v: number) => {
    if (!audioRef.current) return;

    audioRef.current.volume = v;
    setVolume(v);
  };

  if (!currentSong) return null;

  return (
    <motion.div
      key={currentSong.id} // 🔥 animation trigger on song change
      initial={{ y: 100, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
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

      {/* 🔁 Loop / Shuffle */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={() => setMode(mode === "loop" ? "normal" : "loop")}
          className="text-cyan-300"
        >
          🔁
        </button>

        <button
          onClick={() => setMode(mode === "shuffle" ? "normal" : "shuffle")}
          className="text-pink-300"
        >
          🎲
        </button>
      </div>

      {/* 🗳 Vote */}
      <div className="flex flex-col items-center mt-4">
        <button
          disabled={hasVoted}
          onClick={() => {
            if (!voteKey || hasVoted) return;

            voteSkip();
            localStorage.setItem(voteKey, "true");
          }}
          className={`px-6 py-2 rounded-full font-bold transition
          ${
            hasVoted
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-red-500 text-white hover:scale-105"
          }`}
        >
          {hasVoted ? "✅ Voted" : "⏭ Vote to Skip"}
        </button>

        <p className="text-sm mt-2 opacity-70">
          {votes} / {votesNeeded} votes
        </p>
      </div>

      {/* 📊 Vote Progress */}
      <div className="w-full mt-3">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${votePercentage}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-red-400 to-pink-500"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default NeonPlayer;
