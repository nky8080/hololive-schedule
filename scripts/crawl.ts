
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

// Define types matching our data structure
interface Talent {
    id: string;
    name: string;
    keywords: string[];
    icon?: string;
}

interface Group {
    id: string;
    name: string;
    members: Talent[];
}

interface Stream {
    talentId: string;
    talentName: string;
    groupId: string;
    startTime: string; // ISO string
    url: string;
    thumbnail?: string;
    icon?: string; // New field for stream-specific icon
    isLive: boolean;
}

interface ScheduleData {
    updatedAt: string;
    streams: Stream[];
}

const BRANCH_CONFIGS = [
    { id: 'hololive_jp', url: 'https://schedule.hololive.tv/lives/hololive' },
    { id: 'hololive_en', url: 'https://schedule.hololive.tv/lives/english' },
    { id: 'hololive_id', url: 'https://schedule.hololive.tv/lives/indonesia' },
    { id: 'holostars_jp', url: 'https://schedule.hololive.tv/lives/holostars' },
    { id: 'holostars_en', url: 'https://schedule.hololive.tv/lives/holostars_english' },
    { id: 'dev_is', url: 'https://schedule.hololive.tv/lives/dev_is' },
    { id: 'official', url: 'https://schedule.hololive.tv/lives/official' },
    { id: 'other', url: 'https://schedule.hololive.tv/lives/all' },
];

async function fetchHtml(url: string) {
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (e) {
        console.error(`Fetch failed for ${url}`, e);
        return '';
    }
}

async function crawl() {
    console.log('Fetching Hololive Schedule (Multi-branch)...');

    // Load Talents Config for basic metadata matching
    const talentsPath = path.join(process.cwd(), 'data', 'talents.json');
    const talentsGroups: Group[] = JSON.parse(fs.readFileSync(talentsPath, 'utf-8'));
    const talentMap = new Map<string, { talent: Talent; groupId: string }>();
    for (const group of talentsGroups) {
        for (const member of group.members) {
            for (const keyword of member.keywords) {
                talentMap.set(keyword.toLowerCase(), { talent: member, groupId: group.id });
            }
        }
    }

    const allStreams: Stream[] = [];

    for (const config of BRANCH_CONFIGS) {
        console.log(`Crawling ${config.id}...`);
        const html = await fetchHtml(config.url);
        if (!html) continue;

        const $ = cheerio.load(html);
        let currentDateStr = '';

        $('#all > .container > .row > div').each((i, block) => {
            const $block = $(block);

            // 1. Check for Date Header
            const dateHeader = $block.find('.holodule.navbar-text');
            if (dateHeader.length > 0) {
                const text = dateHeader.text().trim();
                const match = text.match(/(\d{1,2})\/(\d{1,2})/);
                if (match) {
                    currentDateStr = `${match[1]}/${match[2]}`;
                }
                return;
            }

            // 2. Check for Stream Cards inside this block
            const thumbnails = $block.find('a.thumbnail');
            if (thumbnails.length > 0) {
                if (!currentDateStr) return;

                thumbnails.each((j, card) => {
                    const $card = $(card);
                    const url = $card.attr('href') || '';
                    if (!url) return;

                    const nameText = $card.find('.name').text().trim();
                    const timeText = $card.find('.datetime').text().trim().replace(/\s+/g, '');
                    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);

                    if (!timeMatch || !nameText) return;

                    const [_, hour, minute] = timeMatch;
                    const now = new Date();
                    const currentYear = now.getFullYear();
                    const [month, day] = currentDateStr.split('/').map(Number);
                    let year = currentYear;
                    if (month === 1 && now.getMonth() === 11) year++;
                    if (month === 12 && now.getMonth() === 0) year--;

                    const paddedMonth = month.toString().padStart(2, '0');
                    const paddedDay = day.toString().padStart(2, '0');
                    const isoString = `${year}-${paddedMonth}-${paddedDay}T${hour}:${minute}:00+09:00`;

                    // Talent Detection
                    let matchedTalent: { talent: Talent; groupId: string } | undefined;
                    const cleanName = nameText.replace(/\s+/g, ' ').toLowerCase();
                    for (const [key, value] of talentMap.entries()) {
                        if (cleanName.includes(key)) {
                            matchedTalent = value;
                            break;
                        }
                    }

                    const talentId = matchedTalent ? matchedTalent.talent.id : 'unknown';
                    const talentName = matchedTalent ? matchedTalent.talent.name : nameText;

                    // Prioritize matched group from talents.json, fallback to branch config ID
                    const groupId = matchedTalent ? matchedTalent.groupId : config.id;

                    const imgs = $card.find('img');
                    let thumbnail = '';
                    imgs.each((k, img) => {
                        const src = $(img).attr('src');
                        if (src && (src.includes('mqdefault') || src.includes('hqdefault') || src.includes('sddefault'))) {
                            thumbnail = src;
                        }
                    });
                    if (!thumbnail && imgs.length >= 2) {
                        const candidate = $(imgs[1]).attr('src');
                        if (candidate) thumbnail = candidate;
                    }

                    let icon = '';
                    const avatarImg = $card.find('img[style*="border-radius: 50%"]').first();
                    if (avatarImg.length > 0) {
                        icon = avatarImg.attr('src') || '';
                    }

                    // Live Status Detection:
                    // Official site uses 'border: 3px red solid' on the card for live streams.
                    const style = $card.attr('style') || '';
                    const isLive = style.toLowerCase().includes('red') && style.toLowerCase().includes('solid');

                    allStreams.push({
                        talentId,
                        talentName,
                        groupId,
                        startTime: isoString,
                        url,
                        thumbnail,
                        icon,
                        isLive: isLive,
                    });
                });
            }
        });
    }

    // Deduplication Logic:
    // Prioritize specific branches over 'other'.
    const streamMap = new Map<string, Stream>();
    const sortedStreams = allStreams.sort((a, b) => {
        if (a.groupId === 'other' && b.groupId !== 'other') return 1;
        if (a.groupId !== 'other' && b.groupId === 'other') return -1;
        return 0;
    });

    for (const s of sortedStreams) {
        if (!streamMap.has(s.url)) {
            streamMap.set(s.url, s);
        }
    }

    const uniqueStreams = Array.from(streamMap.values());

    const data: ScheduleData = {
        updatedAt: new Date().toISOString(),
        streams: uniqueStreams
    };

    const outputPath = path.join(process.cwd(), 'public', 'schedule.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved ${uniqueStreams.length} streams to public/schedule.json`);
}

crawl().catch(console.error);
