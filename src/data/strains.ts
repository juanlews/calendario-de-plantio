// Source: https://huggingface.co/datasets/JonusNattapong/cannabis-strains (JonusNattapong)
// strains_db.json format: { d: [[name,breeder,type,thc[min,max],fd,h,y,effects[],flavors[]],...], total: number }
// type in DB: 'indica' | 'sativa' | 'hybrid' | 'autoflower'
// autoflower in DB is a combined type — we separate genetics from flowering type
// thc: [min, max] | null
// fd: flowering days | null

interface StrainDB {
  d: [string, string, string, [number, number] | null, number | null, string, string, string[], string[]][];
  total: number;
}

let _db: StrainDB | null = null;
let _cache: Map<string, StrainInfo> | null = null;

function loadDB(): StrainDB {
  if (_db) return _db;
  _db = require('./strains_db.json') as StrainDB;
  return _db;
}

export type CannabisGenetics = 'indica' | 'sativa' | 'hybrid';
export type FloweringType = 'autoflower' | 'photoperiodic';

export interface StrainInfo {
  name: string;
  breeder: string;
  genetics: CannabisGenetics;
  floweringType: FloweringType;
  thcMin: number;
  thcMax: number;
  floweringDays: number;
  autoflowerDays?: number;
  height: string;
  yield: string;
  difficulty: 'fácil' | 'média' | 'difícil';
  effects: string[];
  flavors: string[];
  description: string;
}

interface DBEntry {
  0: string;
  1: string;
  2: string;
  3: [number, number] | null;
  4: number | null;
  5: string;
  6: string;
  7: string[];
  8: string[];
}

function parseEntry(entry: DBEntry): StrainInfo {
  const dbType = entry[2];
  const isAuto = dbType === 'autoflower';
  const fd = entry[4];

  // When DB says 'autoflower', we set genetics to 'hybrid' as default
  // (most autos are ruderalis crosses, typically hybrid-dominant)
  const genetics: CannabisGenetics = isAuto ? 'hybrid' : (dbType as CannabisGenetics);
  const floweringType: FloweringType = isAuto ? 'autoflower' : 'photoperiodic';

  return {
    name: entry[0],
    breeder: entry[1],
    genetics,
    floweringType,
    thcMin: entry[3]?.[0] ?? 0,
    thcMax: entry[3]?.[1] ?? 0,
    floweringDays: fd ?? 60,
    autoflowerDays: isAuto && fd ? fd : undefined,
    height: entry[5],
    yield: entry[6],
    difficulty: fd ? (fd <= 55 ? 'fácil' : fd > 80 ? 'difícil' : 'média') : 'média',
    effects: entry[7].length ? entry[7] : ['relaxante'],
    flavors: entry[8].length ? entry[8] : ['terroso'],
    description: '',
  };
}

function buildCache(): Map<string, StrainInfo> {
  if (_cache) return _cache;
  const db = loadDB();
  _cache = new Map();
  for (let i = 0; i < db.d.length; i++) {
    _cache.set(`${db.d[i][0].toLowerCase()}|${i}`, parseEntry(db.d[i]));
  }
  return _cache;
}

/** Get strain info by name (case-insensitive, returns first match) */
export const getStrainInfo = (name: string): StrainInfo | undefined => {
  const cache = buildCache();
  const q = name.toLowerCase().trim();
  for (const [key, info] of cache) {
    if (key.startsWith(q + '|')) return info;
  }
  return undefined;
};

/** Search: prefix match first, then contains. Returns up to 50 results + total count. */
export const searchStrains = (
  query: string,
): { results: StrainInfo[]; total: number } => {
  const db = loadDB();
  const q = query.trim().toLowerCase();
  if (!q) return { results: [], total: 0 };

  const prefixMatches: typeof db.d = [];
  const containsMatches: typeof db.d = [];

  for (const entry of db.d) {
    const nameLower = entry[0].toLowerCase();
    if (nameLower.startsWith(q)) {
      prefixMatches.push(entry);
    } else if (nameLower.includes(q)) {
      containsMatches.push(entry);
    }
  }

  const totalCount = prefixMatches.length + containsMatches.length;

  // Sort each group alphabetically
  prefixMatches.sort((a, b) => a[0].localeCompare(b[0]));
  containsMatches.sort((a, b) => a[0].localeCompare(b[0]));

  // Combine: prefix first, then contains
  const combined = prefixMatches.concat(containsMatches);

  const results: StrainInfo[] = [];
  for (const entry of combined) {
    results.push(parseEntry(entry));
  }

  return { results, total: totalCount };
};

/** Get total strain count */
export const getStrainCount = (): number => {
  return loadDB().total;
};
