import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
    selectedGroups: string[];
    toggleGroup: (groupId: string) => void;
    setGroups: (groups: string[]) => void;
    reset: () => void;
}

export const useStore = create<FilterState>()(
    persist(
        (set) => ({
            selectedGroups: [],
            toggleGroup: (groupId) =>
                set((state) => {
                    const isSelected = state.selectedGroups.includes(groupId);
                    return {
                        selectedGroups: isSelected
                            ? state.selectedGroups.filter((g) => g !== groupId)
                            : [...state.selectedGroups, groupId],
                    };
                }),
            setGroups: (groups) => set({ selectedGroups: groups }),
            reset: () => set({ selectedGroups: [] }),
        }),
        {
            name: 'hololive-filter-storage',
            version: 1,
        }
    )
);
