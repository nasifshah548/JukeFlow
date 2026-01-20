import { create } from "zustand";

export type Song = {
  id: number;
  title: string;
  artist: string;
};

type QueueState = {
  roomId: string;
  queue: Song[];
  setRoom: (id: string) => void;
  addSong: (song: Song) => void;
  nextSong: () => void;
  clearQueue: () => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  roomId: "default-room",
  queue: [],

  setRoom: (id) => set({ roomId: id }),

  addSong: (song) =>
    set((state) => ({
      queue: [...state.queue, song],
    })),

  nextSong: () =>
    set((state) => ({
      queue: state.queue.slice(1),
    })),

  clearQueue: () => set({ queue: [] }),
}));
