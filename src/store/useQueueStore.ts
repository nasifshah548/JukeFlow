import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Song } from "../types/song";

type QueueState = {
  roomId: string;
  queue: Song[];
  setRoom: (id: string) => void;
  addSong: (song: Song) => void;
  nextSong: () => void;
  clearQueue: () => void;
};

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "jukeflow-queue",
    },
  ),
);
