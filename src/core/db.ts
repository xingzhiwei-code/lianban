// 数据层：Dexie (IndexedDB)，schema 见 PRD §F12 / ADR-001
import Dexie, { type Table } from 'dexie';
import type {
  AudioBind,
  BvFav,
  Measure,
  Nutrition,
  Profile,
  VideoRecord,
  Workout,
} from './types';

class LianbanDB extends Dexie {
  profile!: Table<Profile, string>;
  workouts!: Table<Workout, number>;
  measures!: Table<Measure, number>;
  nutrition!: Table<Nutrition, string>;
  videos!: Table<VideoRecord, number>;
  audioBinds!: Table<AudioBind, string>;
  bvFavs!: Table<BvFav, number>;

  constructor() {
    super('lianban');
    this.version(1).stores({
      profile: 'id',
      workouts: '++id, date',
      measures: '++id, date, kind',
      nutrition: 'date',
      videos: '++id, createdAt',
      audioBinds: 'style',
      bvFavs: '++id, createdAt',
    });
  }
}

export const db = new LianbanDB();

/* ---------------- 画像 ---------------- */
export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.get('me');
}

export async function saveProfile(p: Profile): Promise<void> {
  await db.profile.put(p);
}

export async function clearProfile(): Promise<void> {
  await db.profile.delete('me');
}

/* ---------------- 训练历史 ---------------- */
export async function addWorkout(w: Workout): Promise<number> {
  return db.workouts.add(w);
}

export async function listWorkouts(limit = 50): Promise<Workout[]> {
  return db.workouts.orderBy('date').reverse().limit(limit).toArray();
}

/* ---------------- 体重/围度 ---------------- */
export async function addMeasure(kind: Measure['kind'], date: string, value: number): Promise<number> {
  return db.measures.add({ kind, date, value });
}

export async function listMeasures(kind: Measure['kind']): Promise<Measure[]> {
  return db.measures.where('kind').equals(kind).sortBy('date');
}

/* ---------------- 营养（按日） ---------------- */
export async function getNutrition(date: string): Promise<Nutrition | undefined> {
  return db.nutrition.get(date);
}

export async function saveNutrition(n: Nutrition): Promise<void> {
  await db.nutrition.put(n);
}

/* ---------------- 视频 ---------------- */
export async function addVideo(v: Omit<VideoRecord, 'id' | 'createdAt'>): Promise<number> {
  return db.videos.add({ ...v, createdAt: Date.now() });
}

export async function listVideos(): Promise<VideoRecord[]> {
  return db.videos.orderBy('createdAt').reverse().toArray();
}

export async function updateVideo(v: VideoRecord): Promise<void> {
  await db.videos.put(v);
}

export async function deleteVideo(id: number): Promise<void> {
  await db.videos.delete(id);
}

/* ---------------- 用户音频绑定 ---------------- */
export async function getAudioBind(style: string): Promise<AudioBind | undefined> {
  return db.audioBinds.get(style);
}

export async function listAudioBinds(): Promise<AudioBind[]> {
  return db.audioBinds.toArray();
}

export async function saveAudioBind(b: AudioBind): Promise<void> {
  await db.audioBinds.put(b);
}

export async function deleteAudioBind(style: string): Promise<void> {
  await db.audioBinds.delete(style);
}

/* ---------------- B站收藏 ---------------- */
export async function addBvFav(bvid: string, url: string): Promise<number> {
  return db.bvFavs.add({ bvid, url, createdAt: Date.now() });
}

export async function listBvFavs(): Promise<BvFav[]> {
  return db.bvFavs.orderBy('createdAt').reverse().toArray();
}

export async function deleteBvFav(id: number): Promise<void> {
  await db.bvFavs.delete(id);
}

/* ---------------- 导出 / 删除 ---------------- */
export async function exportAllData(): Promise<Record<string, unknown>> {
  const [profile, workouts, measures, nutrition, videos, audioBinds, bvFavs] = await Promise.all([
    db.profile.toArray(),
    db.workouts.toArray(),
    db.measures.toArray(),
    db.nutrition.toArray(),
    db.videos.toArray(),
    db.audioBinds.toArray(),
    db.bvFavs.toArray(),
  ]);
  return { profile, workouts, measures, nutrition, videos, audioBinds, bvFavs };
}

export async function deleteAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.profile, db.workouts, db.measures, db.nutrition, db.videos, db.audioBinds, db.bvFavs],
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.workouts.clear(),
        db.measures.clear(),
        db.nutrition.clear(),
        db.videos.clear(),
        db.audioBinds.clear(),
        db.bvFavs.clear(),
      ]);
    }
  );
}
