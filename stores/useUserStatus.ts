// stores/useUserStatus.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStatusState {
  acceptChats: boolean;
  toggleAcceptChats: () => void;
}

export const useUserStatus = create<UserStatusState>()(
  persist(
    (set) => ({
      acceptChats: true,
      toggleAcceptChats: () =>
        set((state) => ({ acceptChats: !state.acceptChats })),
    }),
    {
      name: "acceptChats", // Key in localStorage
      partialize: (state) => ({ acceptChats: state.acceptChats }), // only persist acceptChats
    }
  )
);
