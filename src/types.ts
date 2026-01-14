export interface Talent {
    id: string;
    name: string;
    keywords: string[];
    icon?: string;
}

export interface Group {
    id: string;
    name: string;
    members: Talent[];
}

export interface Stream {
    talentId: string;
    talentName: string;
    groupId: string;
    startTime: string; // ISO
    url: string;
    title?: string;
    thumbnail?: string;
    icon?: string;
    isLive: boolean;
}

export interface ScheduleData {
    updatedAt: string;
    streams: Stream[];
}
