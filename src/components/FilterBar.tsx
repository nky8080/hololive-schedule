'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ALL_GROUPS_LIST, GROUP_LABELS } from '@/lib/groups';

export function FilterBar() {
    const { selectedGroups, toggleGroup, reset } = useStore();

    const isAllSelected = selectedGroups.length === 0;

    return (
        <div className="p-4 space-y-4 glass sticky top-0 z-50 border-b-0 shadow-xl shadow-black/20">
            <div className="flex flex-wrap gap-2 items-center justify-center max-w-6xl mx-auto">
                {/* All Button */}
                <button
                    onClick={reset}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border uppercase tracking-wider",
                        isAllSelected
                            ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] scale-105"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                >
                    All
                </button>

                {/* Group Buttons */}
                {ALL_GROUPS_LIST.map((groupId) => {
                    const isSelected = selectedGroups.includes(groupId);
                    return (
                        <button
                            key={groupId}
                            onClick={() => toggleGroup(groupId)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border flex items-center gap-2",
                                isSelected
                                    ? "bg-white/10 border-primary text-white shadow-[0_0_10px_rgba(225,29,72,0.2)]"
                                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                isSelected ? "bg-primary shadow-[0_0_8px_rgba(225,29,72,1)]" : "bg-white/20"
                            )} />
                            {GROUP_LABELS[groupId]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
