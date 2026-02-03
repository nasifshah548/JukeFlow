import QRCode from "react-qr-code";

type Props = {
  roomId: string;
};

export default function RoomQR({ roomId }: Props) {
  const url = `${window.location.origin}/room/${roomId}`;

  return (
    <div className="bg-black/60 p-4 rounded-xl text-center">
      <p className="text-sm mb-2 text-cyan-300">Scan to Join Room</p>
      <div className="bg-white p-2 inline-block rounded-lg">
        <QRCode value={url} size={160} />
      </div>
      <p className="text-xs mt-2 opacity-60 break-all">{url}</p>
    </div>
  );
}
