export const TOP_LEVEL_GROUPS = {
    HOLOLIVE_JP: 'hololive',
    HOLOLIVE_EN: 'hololive_english',
    HOLOLIVE_ID: 'hololive_indonesia',
    HOLOSTARS_JP: 'holostars',
    HOLOSTARS_EN: 'holostars_english',
    DEV_IS: 'dev_is',
    OFFICIAL: 'official',
} as const;

export type TopLevelGroup = typeof TOP_LEVEL_GROUPS[keyof typeof TOP_LEVEL_GROUPS];

export const GROUP_LABELS: Record<TopLevelGroup, string> = {
    [TOP_LEVEL_GROUPS.HOLOLIVE_JP]: 'Hololive',
    [TOP_LEVEL_GROUPS.HOLOLIVE_EN]: 'Hololive English',
    [TOP_LEVEL_GROUPS.HOLOLIVE_ID]: 'Hololive Indonesia',
    [TOP_LEVEL_GROUPS.HOLOSTARS_JP]: 'Holostars',
    [TOP_LEVEL_GROUPS.HOLOSTARS_EN]: 'Holostars English',
    [TOP_LEVEL_GROUPS.DEV_IS]: 'DEV_IS',
    [TOP_LEVEL_GROUPS.OFFICIAL]: 'Official',
};

// Map specific sub-group IDs or branch IDs to TopLevelGroup
export const GROUP_ID_TO_TOP_LEVEL: Record<string, TopLevelGroup> = {
    // Branch IDs from crawler
    'hololive_jp': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'hololive_en': TOP_LEVEL_GROUPS.HOLOLIVE_EN,
    'hololive_id': TOP_LEVEL_GROUPS.HOLOLIVE_ID,
    'holostars_jp': TOP_LEVEL_GROUPS.HOLOSTARS_JP,
    'holostars_en': TOP_LEVEL_GROUPS.HOLOSTARS_EN,
    'dev_is': TOP_LEVEL_GROUPS.DEV_IS,
    'official': TOP_LEVEL_GROUPS.OFFICIAL,
    'other': TOP_LEVEL_GROUPS.HOLOLIVE_JP,

    // Sub-groups from talents.json
    'gen0': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gen1': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gen2': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gamers': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gen3': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gen4': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'gen5': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'holoX': TOP_LEVEL_GROUPS.HOLOLIVE_JP,
    'en_myth': TOP_LEVEL_GROUPS.HOLOLIVE_EN,
    'en_promise': TOP_LEVEL_GROUPS.HOLOLIVE_EN,
    'en_advent': TOP_LEVEL_GROUPS.HOLOLIVE_EN,
    'en_justice': TOP_LEVEL_GROUPS.HOLOLIVE_EN,
    'id_gen1': TOP_LEVEL_GROUPS.HOLOLIVE_ID,
    'id_gen2': TOP_LEVEL_GROUPS.HOLOLIVE_ID,
    'id_gen3': TOP_LEVEL_GROUPS.HOLOLIVE_ID,
    'regloss': TOP_LEVEL_GROUPS.DEV_IS,
    'flow_glow': TOP_LEVEL_GROUPS.DEV_IS,
};

export const ALL_GROUPS_LIST = Object.values(TOP_LEVEL_GROUPS);
