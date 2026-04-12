declare global {
  interface Window {
    __jukeflow_startTime?: number;
    __jukeflow_pauseTime?: number;
  }
}

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
  totalUsers: number; // 👥 actual users in room

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

type PlaySyncPayload = {
  startTime: number;
};

type PauseSyncPayload = {
  currentTime: number;
};

type VoteUpdatePayload = {
  votes: number;
  total: number;
};

const socket = getSocket();

export const useQueueStore = create<QueueState>((set, get) => ({
  roomId: "default-room",
  queue: [],
  isPlaying: false,

  // ✅ Initialize
  votes: 0,
  totalUsers: 0,

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

// Play Sync
socket.on("play-sync", (data: PlaySyncPayload) => {
  console.log("Sync startTime:", data.startTime);

  useQueueStore.setState({
    isPlaying: true,
  });

  window.__jukeflow_startTime = data.startTime;
});

// ⏸ PAUSE SYNC
socket.on("pause-sync", ({ currentTime }: PauseSyncPayload) => {
  useQueueStore.setState({
    isPlaying: false,
  });

  window.__jukeflow_pauseTime = currentTime;
});

// Initial room state
socket.on("room-state", (state: RoomState) => {
  useQueueStore.setState({
    queue: state.queue,
    isPlaying: state.isPlaying,
  });
});

// Vote updates
socket.on("vote-update", (data: VoteUpdatePayload) => {
  useQueueStore.setState({
    votes: data.votes,
    totalUsers: data.total,
  });
});

// ✅ NEW: User count (THIS is the real user count)
socket.on("user-count", (count: number) => {
  useQueueStore.setState({
    totalUsers: count,
  });
});
