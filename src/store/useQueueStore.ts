import { create } from "zustand";
import { getSocket } from "../lib/socket";

declare global {
  interface Window {
    __jukeflow_startTime?: number;
    __jukeflow_pauseTime?: number;
  }
}

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

  // Voting
  votes: number;
  totalUsers: number;

  // Host system 👑
  isHost: boolean;
  hostId: string | null;
  users: string[];

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
  currentTime?: number;
  isHost?: boolean;
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

  votes: 0,
  totalUsers: 0,

  isHost: false,
  hostId: null,
  users: [],

  setRoom: (id) => {
    socket.emit("join-room", id);
    set({ roomId: id });
  },

  addSong: (song) => {
    const roomId = get().roomId;
    socket.emit("add-song", { roomId, song });
  },

  syncQueue: (queue) => set({ queue }),

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

// Queue
socket.on("queue-updated", (queue: Song[]) => {
  useQueueStore.getState().syncQueue(queue);
});

// Play Sync
socket.on("play-sync", (data: PlaySyncPayload) => {
  useQueueStore.setState({ isPlaying: true });
  window.__jukeflow_startTime = data.startTime;
});

// Pause Sync
socket.on("pause-sync", (data: PauseSyncPayload) => {
  useQueueStore.setState({ isPlaying: false });
  window.__jukeflow_pauseTime = data.currentTime;
});

// Room state
socket.on("room-state", (state: RoomState) => {
  useQueueStore.setState({
    queue: state.queue,
    isPlaying: state.isPlaying,
    isHost: state.isHost ?? false,
  });
});

// Votes
socket.on("vote-update", (data: VoteUpdatePayload) => {
  useQueueStore.setState({
    votes: data.votes,
    totalUsers: data.total,
  });
});

// Users count
socket.on("user-count", (count: number) => {
  useQueueStore.setState({
    totalUsers: count,
  });
});

// 👑 Host updated
socket.on("host-updated", ({ hostId }: { hostId: string }) => {
  useQueueStore.setState(() => ({
    hostId,
    isHost: socket.id === hostId,
  }));
});

// 👥 Users list
socket.on("room-users", (users: string[]) => {
  useQueueStore.setState({ users });
});
