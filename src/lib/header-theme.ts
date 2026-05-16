import { create } from "zustand";

interface HeaderThemeState {
  color: string;
  setColor: (color: string) => void;
}

export const useHeaderTheme = create<HeaderThemeState>((set) => ({
  color: "#1e1b4b", // Default Deep Purple
  setColor: (color) => set({ color }),
}));
