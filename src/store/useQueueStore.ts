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

  // ✅ Voting system
  votes: number;
  totalUsers: number;

  setRoom: (id: string) => void;
  addSong: (song: Song) => void;
  syncQueue: (queue: Song[]) => void;
  play: () => void;
  pause: () => void;
  voteSkip: () => void;
};

type RoomState = {
  queue: Song[];
  isPlaying: boolean;
  startTime?: number;
  currentTime?: number;
};

const socket = getSocket();

export const useQueueStore = create<QueueState>((set, get) => ({
  roomId: "default-room",
  queue: [],
  isPlaying: false,

  // ✅ Initialize voting state
  votes: 0,
  totalUsers: 1,

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

  // ✅ IMPLEMENTED (this was missing)
  voteSkip: () => {
    const roomId = get().roomId;
    socket.emit("vote-skip", roomId);
  },
}));

// =======================
// 🔌 SOCKET LISTENERS
// =======================

// Queue sync
socket.on("queue-updated", (queue: Song[]) => {
  useQueueStore.getState().syncQueue(queue);
});

// Play / Pause sync
socket.on("play", () => {
  useQueueStore.setState({ isPlaying: true });
});

socket.on("pause", () => {
  useQueueStore.setState({ isPlaying: false });
});

// Initial room state
socket.on("room-state", (state: RoomState) => {
  useQueueStore.setState({
    queue: state.queue,
    isPlaying: state.isPlaying,
  });
});

// ✅ NEW: Vote updates
socket.on("vote-update", ({ votes, total }) => {
  useQueueStore.setState({
    votes,
    totalUsers: total,
  });
});
