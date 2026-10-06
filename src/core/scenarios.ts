// 5 场景 + 推荐课 + 配乐映射（PRD 附录 B / C）
import type { Course, DemoType, MusicStyle, Scenario, ScenarioKey } from './types';

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  postpartum: { name: '产后恢复', emoji: '🍼', desc: '温和重建核心与盆底，奶水优先' },
  beginner: { name: '新手入门', emoji: '🌱', desc: '低冲击起步，先完成再完美' },
  fatloss: { name: '减脂燃脂', emoji: '🔥', desc: '提高心率，动起来就是胜利' },
  muscle: { name: '塑形增肌', emoji: '💪', desc: '渐进超负荷，雕刻线条' },
  office: { name: '办公拉伸', emoji: '🪑', desc: '碎片时间，松松肩颈充充电' },
};

export const SCENARIO_KEYS: ScenarioKey[] = [
  'postpartum',
  'beginner',
  'fatloss',
  'muscle',
  'office',
];

export const COURSES: Record<ScenarioKey, Course> = {
  postpartum: {
    title: '全身唤醒 · 跟练', emoji: '🍑', pills: ['哺乳期友好', '塑形'],
    list: ['原地踏步热身', '靠墙静蹲', '臀桥', '跪姿俯卧撑', '水瓶推举', '跪姿平板支撑', '全身拉伸放松'],
  },
  beginner: {
    title: '新手激活 · 跟练', emoji: '🌱', pills: ['低冲击', '全身'],
    list: ['原地踏步热身', '靠墙静蹲', '臀桥', '水瓶推举', '死虫式', '肩颈放松'],
  },
  fatloss: {
    title: '燃脂循环 · 跟练', emoji: '🔥', pills: ['燃脂', '循环'],
    list: ['开合跳', '徒手深蹲', '标准俯卧撑', '臀桥', '标准平板支撑', '全身拉伸放松'],
  },
  muscle: {
    title: '塑形力量 · 跟练', emoji: '💪', pills: ['增肌', '塑形'],
    list: ['徒手深蹲', '标准俯卧撑', '哑铃侧平举', '臀桥', '标准平板支撑', '死虫式'],
  },
  office: {
    title: '工位松绑 · 跟练', emoji: '🪑', pills: ['拉伸', '碎片'],
    list: ['原地踏步热身', '肩颈放松', '水瓶推举', '靠墙静蹲', '全身拉伸放松'],
  },
};

/** 配乐映射表（PRD 附录 C）：demo 类型 → 氛围 */
const DEMO_STYLE: Record<DemoType, MusicStyle> = {
  march: 'warmup',
  jack: 'warmup',
  squat: 'hold',
  bridge: 'strength',
  pushup: 'strength',
  press: 'strength',
  plank: 'hold',
  stretch: 'stretch',
  crunch: 'strength',
  deadbug: 'hold',
};

export function styleFor(demo: DemoType): MusicStyle {
  return DEMO_STYLE[demo] ?? 'strength';
}

export const MUSIC_STYLE_KEYS: MusicStyle[] = ['warmup', 'strength', 'hold', 'stretch'];
