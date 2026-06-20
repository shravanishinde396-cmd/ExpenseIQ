import { create } from 'zustand';

export const useUiStore = create((set) => ({
  theme: localStorage.getItem('expenseiq-theme') || 'light',
  isSidebarOpen: true,
  isLoading: false,

  setTheme: (theme) => {
    localStorage.setItem('expenseiq-theme', theme);
    set({ theme });
  },
  
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('expenseiq-theme', nextTheme);
    return { theme: nextTheme };
  }),

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setLoading: (isLoading) => set({ isLoading }),
}));
