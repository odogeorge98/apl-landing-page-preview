import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  hasHydrated: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      hasHydrated: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "nugi-dashboard-sidebar-state",
      partialize: (state) => ({ collapsed: state.collapsed }),
      // MainLayout rehydrates explicitly and waits before showing the layout.
      skipHydration: true,
    },
  ),
);

export default useSidebarStore;
