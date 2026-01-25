type Props = {
  volume: number;
  onChange: (value: number) => void;
};

function VolumeSlider({ volume, onChange }: Props) {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-24 h-2 rounded-lg appearance-none cursor-pointer
      bg-cyan-500/20 accent-cyan-400"
    />
  );
}

export default VolumeSlider;
