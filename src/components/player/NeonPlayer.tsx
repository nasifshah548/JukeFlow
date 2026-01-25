import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";
import { useQueueStore } from "../../store/useQueueStore";

function NeonPlayer() {
  const { queue } = useQueueStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const currentSong = queue[currentIndex];

  type PlayMode = "normal" | "loop" | "shuffle";

  const [mode, setMode] = useState<PlayMode>("normal");

  // Load & play song
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
  }, [currentSong]);

  // Progress tracking + auto-next
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleEnded = () => {
      if (mode === "loop") {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      if (mode === "shuffle") {
        if (queue.length <= 1) return;

        let next;
        do {
          next = Math.floor(Math.random() * queue.length);
        } while (next === currentIndex);

        setCurrentIndex(next);
        setIsPlaying(true);
        return;
      }

      // Normal mode
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
  }, [currentIndex, queue.length]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    setMode((m) => (m === "loop" ? "normal" : "loop"));
  };

  const toggleShuffle = () => {
    setMode((m) => (m === "shuffle" ? "normal" : "shuffle"));
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

  const seek = (value: number) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = (value / 100) * audio.duration;
    setProgress(value);
  };

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
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-bold text-cyan-300">{currentSong.title}</p>
          <p className="text-sm opacity-70">{currentSong.artist}</p>
        </div>
        <VolumeSlider volume={volume} onChange={changeVolume} />
      </div>

      <ProgressBar progress={progress} onSeek={seek} />

      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={nextSong}
        onPrev={prevSong}
      />
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
    </motion.div>
  );
}

export default NeonPlayer;
