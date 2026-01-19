import { create } from "zustand";

export type Song = {
  id: number;
  title: string;
  artist: string;
};

type QueueState = {
  queue: Song[];
  addSong: (song: Song) => void;
  removeSong: (id: number) => void;
  clearQueue: () => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  queue: [],

  addSong: (song) =>
    set((state) => ({
      queue: [...state.queue, song],
    })),

  removeSong: (id) =>
    set((state) => ({
      queue: state.queue.filter((song) => song.id !== id),
    })),

  clearQueue: () => set({ queue: [] }),
}));
