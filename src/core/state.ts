// 应用级内存状态：画像镜像 + 用户音频对象 URL 缓存
import type { MusicStyle, Profile, ScenarioKey } from './types';

export const state = {
  profile: undefined as Profile | undefined,
  /** 绑定的用户音频对象 URL 缓存（由 video.ts 加载与维护） */
  audioUrls: new Map<MusicStyle, { name: string; url: string }>(),
};

export function scenario(): ScenarioKey {
  return state.profile?.scenario ?? 'postpartum';
}

export function isPostpartum(): boolean {
  return scenario() === 'postpartum';
}

/** 产后 + 医生未许可 → 温和模式 */
export function gentleMode(): boolean {
  const p = state.profile;
  if (!p || p.scenario !== 'postpartum') return false;
  return p.cleared === 'no' || p.cleared === 'notyet';
}
