type Props = {
  progress: number;
  onSeek: (value: number) => void;
};

function ProgressBar({ progress, onSeek }: Props) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={progress}
      onChange={(e) => onSeek(Number(e.target.value))}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer
      bg-cyan-500/20 accent-cyan-400"
    />
  );
}

export default ProgressBar;
