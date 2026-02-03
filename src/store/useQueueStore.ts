import { create } from "zustand";
import { getSocket } from "../lib/socket";

export type Song = {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
};

type QueueState = {
  roomId: string;
  queue: Song[];
  isPlaying: boolean;
  setRoom: (id: string) => void;
  addSong: (song: Song) => void;
  syncQueue: (queue: Song[]) => void;
  play: () => void;
  pause: () => void;
};

const socket = getSocket();

export const useQueueStore = create<QueueState>((set, get) => ({
  roomId: "default-room",
  queue: [],
  isPlaying: false,

  setRoom: (id) => {
    socket.emit("join-room", id);
    set({ roomId: id });
  },

  addSong: (song) => {
    const roomId = get().roomId;
    socket.emit("add-song", { roomId, song });
  },

  syncQueue: (queue) => {
    set({ queue });
  },

  play: () => {
    const roomId = get().roomId;
    socket.emit("play", roomId);
    set({ isPlaying: true });
  },

  pause: () => {
    const roomId = get().roomId;
    socket.emit("pause", roomId);
    set({ isPlaying: false });
  },
}));

// Global listeners
socket.on("queue-updated", (queue) => {
  useQueueStore.getState().syncQueue(queue);
});

socket.on("play", () => {
  useQueueStore.setState({ isPlaying: true });
});

socket.on("pause", () => {
  useQueueStore.setState({ isPlaying: false });
});

socket.on("room-state", (state) => {
  useQueueStore.setState({
    queue: state.queue,
    isPlaying: state.isPlaying,
  });
});
