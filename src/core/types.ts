// 共享类型定义：动作、场景、画像、记录等

export type ScenarioKey = 'postpartum' | 'beginner' | 'fatloss' | 'muscle' | 'office';
export type DemoType =
  | 'march'
  | 'jack'
  | 'squat'
  | 'bridge'
  | 'pushup'
  | 'press'
  | 'plank'
  | 'stretch'
  | 'crunch'
  | 'deadbug';
export type ExerciseKind = 'time' | 'reps';
export type PartTag = '全身' | '臀腿' | '上肢' | '核心' | '放松';
export type Level = 1 | 2 | 3;
export type Impact = '低' | '中';
export type Equip = '徒手' | '小器械';
export type MusicStyle = 'warmup' | 'strength' | 'hold' | 'stretch';
export type Rpe = 'easy' | 'ok' | 'hard';
export type MeasureKind = 'weight' | 'waist' | 'hip' | 'thigh';

export interface Exercise {
  name: string;
  emoji: string;
  demo: DemoType;
  kind: ExerciseKind;
  work: number; // 计时类：秒
  reps: number; // 次数类：次
  sets: number;
  rest: number; // 组间休息：秒
  tag: PartTag;
  lv: Level;
  impact: Impact;
  equip: Equip;
  scen: ScenarioKey[];
  safe: string[]; // 安全标签，如 '产后安全' / 'DRA安全' / 'DRA不安全'
  reg: string; // 退阶
  prog: string; // 进阶
  cues: string[]; // 要领
}

export interface Scenario {
  name: string;
  emoji: string;
  desc: string;
}

export interface Course {
  title: string;
  emoji: string;
  pills: string[];
  list: string[]; // 动作名，按序
}

export interface Profile {
  id: 'me';
  scenario: ScenarioKey;
  babyAge?: string; // '0'|'1'|'2'|'3'
  birth?: '顺产' | '剖腹产';
  cleared?: 'yes' | 'notyet' | 'no';
  base?: '0' | '1' | '2';
  minutes?: '15' | '20' | '30';
  equip?: '徒手' | '小器械';
  skipped?: boolean;
}

export interface Workout {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  minutes: number;
  count: number; // 动作数（个）或分段数（段）
  countUnit: '个' | '段';
  rpe?: Rpe; // 中途退出无 RPE
  partial?: boolean;
}

export interface Measure {
  id?: number;
  date: string; // 'YYYY-MM-DD'
  kind: MeasureKind;
  value: number;
}

export interface Nutrition {
  date: string; // 主键 'YYYY-MM-DD'
  waterMl: number;
  proteinG: number;
  calcium: boolean;
}

export interface VideoSegment {
  name: string;
  start: number;
  end: number;
  sets: number;
  rest: number;
  style: MusicStyle;
}

export interface VideoRecord {
  id?: number;
  createdAt: number;
  name: string;
  size: number;
  duration: number;
  blob: Blob;
  segments: VideoSegment[];
}

export interface AudioBind {
  style: MusicStyle;
  name: string;
  blob: Blob;
}

export interface BvFav {
  id?: number;
  createdAt: number;
  bvid: string;
  url: string;
}

/** 跟练队列项 */
export interface WorkItem {
  type: 'work';
  ex: Exercise;
  set: number;
  order: number; // 去重后的动作序号（1-based）
}
export interface VWorkItem {
  type: 'vwork';
  seg: VideoSegment;
  set: number;
  order: number; // 分段序号（1-based）
}
export interface RestItem {
  type: 'rest';
  sec: number;
  next: string;
}
export type QueueItem = WorkItem | VWorkItem | RestItem;
