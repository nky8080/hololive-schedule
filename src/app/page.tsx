'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Clock, Play, Calendar } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Group, ScheduleData, Stream } from '@/types';
import { GROUP_ID_TO_TOP_LEVEL } from '@/lib/groups';
import talentsData from '@/../data/talents.json';

// Helper for formatting time
function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export default function Home() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);

  const { selectedGroups } = useStore();
  const activeStreamRef = useRef<HTMLAnchorElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/schedule.json');
        if (!res.ok) throw new Error('Failed to fetch filtered schedule');
        const data = await res.json();
        setSchedule(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter Logic
  const filteredStreams = React.useMemo(() => {
    if (!schedule) return [];

    // If no groups selected, show All
    if (selectedGroups.length === 0) {
      return schedule.streams;
    }

    return schedule.streams.filter(stream => {
      // Map the stream's specific group ID (e.g. 'en_myth') to the top-level group (e.g. 'hololive_english')
      const topLevelGroup = GROUP_ID_TO_TOP_LEVEL[stream.groupId];
      // Check if this top-level group is currently selected
      return topLevelGroup && selectedGroups.includes(topLevelGroup);
    });
  }, [schedule, selectedGroups]);

  // Group by Date for timeline view
  const timeline = React.useMemo(() => {
    const grouped: Record<string, Stream[]> = {};
    for (const stream of filteredStreams) {
      const dateKey = stream.startTime.split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(stream);
    }
    const sortedEntries = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));

    sortedEntries.forEach(([_, streams]) => {
      streams.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return sortedEntries;
  }, [filteredStreams]);

  // Identification Logic for Active Stream
  const activeStreamUrl = useMemo(() => {
    if (!filteredStreams.length) return null;
    const now = new Date();
    // 1. Find the first live stream
    const live = filteredStreams.find(s => s.isLive);
    if (live) return live.url;
    // 2. Find the first upcoming stream (or recently finished within 30m)
    const upcoming = filteredStreams.find(s => {
      const startTime = new Date(s.startTime);
      // If it's starting soon or just started
      return startTime.getTime() > now.getTime() - 15 * 60 * 1000;
    });
    return upcoming ? upcoming.url : filteredStreams[0].url;
  }, [filteredStreams]);

  // Autoscroll Effect
  useEffect(() => {
    if (schedule && !loading && activeStreamUrl && !hasScrolled) {
      const timer = setTimeout(() => {
        activeStreamRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        setHasScrolled(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [schedule, loading, activeStreamUrl, hasScrolled]);

  const scrollToNow = () => {
    activeStreamRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium animate-pulse">Synchronizing Schedule...</p>
    </div>
  );

  return (
    <main className="min-h-screen pb-24">
      <FilterBar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white via-white to-primary/50 bg-clip-text text-transparent tracking-tight">
              HOLOLIVE SCHEDULE
            </h1>
            <p className="text-slate-500 font-medium tracking-widest uppercase text-xs">
              Production Member Streams & Events
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 glass rounded-full text-xs font-bold text-slate-300">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LAST SYNC: {schedule ? new Date(schedule.updatedAt).toLocaleTimeString() : '-'}
          </div>
        </header>

        <div className="space-y-16">
          {timeline.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border-dashed border-2 border-white/5 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium">No streams found for this selection.</p>
              <p className="text-sm mt-2 opacity-60">Try selecting different groups or branches above.</p>
            </div>
          ) : (
            timeline.map(([dateKey, streams]) => {
              const dateObj = new Date(dateKey);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });

              return (
                <section key={dateKey} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Date Header */}
                  <div className="flex items-center gap-4 sticky top-24 z-10 py-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10 hidden md:block"></div>
                    <div className="px-6 py-2 glass rounded-full">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                        {dateStr}
                      </h2>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                  </div>

                  {/* Grid of Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {streams.map((stream) => {
                      // Find icon: prefer stream.icon, fallback to talent data
                      let icon = stream.icon;
                      if (!icon) {
                        for (const g of (talentsData as Group[])) {
                          const m = g.members.find(mem => mem.id === stream.talentId);
                          if (m && m.icon) {
                            icon = m.icon;
                            break;
                          }
                        }
                      }

                      const timeStr = formatTime(stream.startTime);

                      return (
                        <a
                          key={stream.url}
                          href={stream.url}
                          target="_blank"
                          rel="noreferrer"
                          ref={stream.url === activeStreamUrl ? activeStreamRef : null}
                          className={cn(
                            "glass-card group relative flex flex-col rounded-2xl overflow-hidden scroll-mt-40",
                            stream.isLive && "ring-2 ring-primary ring-offset-4 ring-offset-background"
                          )}
                        >
                          {/* Thumbnail Area */}
                          <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            {stream.thumbnail ? (
                              <img
                                src={stream.thumbnail.includes('%{width}') ? stream.thumbnail.replace('%{width}', '400').replace('%{height}', '225') : stream.thumbnail}
                                alt={stream.talentName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-800">
                                <Play className="w-12 h-12 opacity-10" />
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                            {/* Live Badge */}
                            {stream.isLive && (
                              <div className="absolute top-3 left-3 bg-primary text-[10px] font-black text-white px-2 py-1 rounded shadow-lg z-10 uppercase tracking-widest animate-pulse">
                                LIVE
                              </div>
                            )}

                            {/* Talent Icon (Bottom Left Overlap) */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                              <div className="relative">
                                {icon ? (
                                  <img
                                    src={icon}
                                    alt={stream.talentName}
                                    className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-900 object-cover shadow-xl"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-xs">?</div>
                                )}
                              </div>
                              <span className="text-xs font-bold text-white drop-shadow-md truncate max-w-[120px]">
                                {stream.talentName}
                              </span>
                            </div>

                            {/* Start Time (Top Right) */}
                            <div className="absolute top-3 right-3 px-2 py-1 glass rounded text-xs font-black text-white z-10">
                              {timeStr}
                            </div>
                          </div>

                          {/* Content / Info */}
                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
                              {stream.title || `${stream.talentName} Stream`}
                            </h3>
                            <div className="pt-2 flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {stream.groupId.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </div>

      {/* Floating Jump to Now Button */}
      {activeStreamUrl && (
        <button
          onClick={scrollToNow}
          className="fixed bottom-8 right-8 z-50 p-4 bg-primary text-white rounded-full shadow-[0_8px_30px_rgba(225,29,72,0.4)] hover:shadow-[0_8px_40px_rgba(225,29,72,0.6)] transition-all hover:scale-110 active:scale-95 group flex items-center gap-3 overflow-hidden"
          aria-label="Jump to current time"
        >
          <Clock className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-black tracking-widest uppercase text-sm">
            NOW
          </span>
        </button>
      )}
    </main>
  );
}
