import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ScrapeHistoryItem {
    id: string;
    date: number;
    urls: string[];
    totalComments: number;
    videoCover?: string;
}

interface AppState {
    apiKey: string
    theme: 'dark' | 'light'
    history: ScrapeHistoryItem[]
    setApiKey: (key: string) => void
    setTheme: (theme: 'dark' | 'light') => void
    addToHistory: (item: ScrapeHistoryItem) => void
    clearHistory: () => void
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            apiKey: '',
            theme: 'dark', // Default to dark for premium feel
            history: [],
            setApiKey: (key) => set({ apiKey: key }),
            setTheme: (theme) => set({ theme }),
            addToHistory: (item) => set((state) => ({
                history: [item, ...state.history].slice(0, 50) // Keep last 50
            })),
            clearHistory: () => set({ history: [] })
        }),
        {
            name: 'tikdata-storage',
            partialize: (state) => ({
                apiKey: state.apiKey,
                theme: state.theme,
                history: state.history
            }),
        }
    )
)
