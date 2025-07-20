// lib/store.js
import { create } from "zustand";

export const useGlobalLoading = create((set) => ({
  loading: false,
  setLoading: (val) => set({ loading: val }),
}));
