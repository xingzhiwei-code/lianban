// 15 个动作原子（PRD 附录 A）
import type { Exercise, Level } from './types';

export const EXERCISES: Exercise[] = [
  {
    name: '原地踏步热身', emoji: '🚶‍♀️', demo: 'march', kind: 'time', work: 60, reps: 0, sets: 1, rest: 0,
    tag: '全身', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: ['产后安全'], reg: '放慢摆臂幅度', prog: '换成高抬腿30秒',
    cues: ['手臂自然摆动', '膝盖抬到舒服的高度', '保持呼吸均匀，先把身体叫醒'],
  },
  {
    name: '开合跳', emoji: '🏃', demo: 'jack', kind: 'time', work: 30, reps: 0, sets: 3, rest: 20,
    tag: '全身', lv: 2, impact: '中', equip: '徒手', scen: ['beginner', 'fatloss', 'muscle'],
    safe: [], reg: '改回原地踏步', prog: '加快节奏，连做不停',
    cues: ['落地要轻，膝盖微屈缓冲', '手臂向上击掌', '保持呼吸节奏，别憋气'],
  },
  {
    name: '靠墙静蹲', emoji: '🧱', demo: 'squat', kind: 'time', work: 40, reps: 0, sets: 3, rest: 30,
    tag: '臀腿', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: ['产后安全'], reg: '蹲浅一点，角度小一点', prog: '延长到60秒一组',
    cues: ['后背贴紧墙面', '大腿尽量与地面平行', '膝盖不要超过脚尖', '塌腰就停下来'],
  },
  {
    name: '徒手深蹲', emoji: '🏋️', demo: 'squat', kind: 'reps', work: 0, reps: 12, sets: 3, rest: 30,
    tag: '臀腿', lv: 2, impact: '中', equip: '徒手', scen: ['beginner', 'fatloss', 'muscle', 'postpartum'],
    safe: [], reg: '用靠墙静蹲代替', prog: '手持水瓶负重',
    cues: ['双脚与肩同宽', '臀部向后坐，像坐椅子', '膝盖对准脚尖方向'],
  },
  {
    name: '臀桥', emoji: '🍑', demo: 'bridge', kind: 'reps', work: 0, reps: 15, sets: 3, rest: 30,
    tag: '臀腿', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: ['产后安全', 'DRA安全'], reg: '减小抬起幅度', prog: '试试单腿臀桥',
    cues: ['用臀部发力把身体顶起', '顶峰收紧1秒再下放', '下背不要塌腰借力'],
  },
  {
    name: '跪姿俯卧撑', emoji: '💪', demo: 'pushup', kind: 'reps', work: 0, reps: 10, sets: 3, rest: 30,
    tag: '上肢', lv: 2, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: [], reg: '幅度减半，量力而行', prog: '进阶到标准俯卧撑',
    cues: ['膝盖着地，身体一条直线', '胸口贴近地面再推起', '手肘微微内收'],
  },
  {
    name: '标准俯卧撑', emoji: '💪', demo: 'pushup', kind: 'reps', work: 0, reps: 8, sets: 3, rest: 30,
    tag: '上肢', lv: 3, impact: '中', equip: '徒手', scen: ['fatloss', 'muscle'],
    safe: [], reg: '退回跪姿俯卧撑', prog: '放慢下放速度，3秒下1秒上',
    cues: ['从头到脚一条直线', '胸口贴近地面', '核心全程收紧，塌腰就停'],
  },
  {
    name: '水瓶推举', emoji: '🍼', demo: 'press', kind: 'reps', work: 0, reps: 12, sets: 3, rest: 30,
    tag: '上肢', lv: 1, impact: '低', equip: '小器械', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: [], reg: '空手做同样动作', prog: '换更重的哑铃',
    cues: ['两只矿泉水瓶当哑铃', '推到头顶不用完全锁死', '全程核心收紧'],
  },
  {
    name: '哑铃侧平举', emoji: '🏋️', demo: 'press', kind: 'reps', work: 0, reps: 12, sets: 3, rest: 30,
    tag: '上肢', lv: 2, impact: '低', equip: '小器械', scen: ['beginner', 'fatloss', 'muscle'],
    safe: [], reg: '换水瓶推举', prog: '增加重量或放慢速度',
    cues: ['手臂微屈，抬到肩高即可', '不要耸肩', '下放时控制住别砸下来'],
  },
  {
    name: '跪姿平板支撑', emoji: '🧘', demo: 'plank', kind: 'time', work: 30, reps: 0, sets: 3, rest: 30,
    tag: '核心', lv: 2, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: ['产后安全'], reg: '时间减半，20秒也算', prog: '进阶到标准平板',
    cues: ['膝盖着地降低难度', '肚脐向脊柱内收', '腰一塌就停下休息，不硬撑'],
  },
  {
    name: '标准平板支撑', emoji: '🧘', demo: 'plank', kind: 'time', work: 45, reps: 0, sets: 3, rest: 30,
    tag: '核心', lv: 3, impact: '中', equip: '徒手', scen: ['fatloss', 'muscle'],
    safe: [], reg: '退回跪姿平板', prog: '交替抬腿增加难度',
    cues: ['头到脚一条直线', '肚脐内收，臀部夹紧', '塌腰立刻停，别硬撑'],
  },
  {
    name: '死虫式', emoji: '🐛', demo: 'deadbug', kind: 'reps', work: 0, reps: 10, sets: 3, rest: 30,
    tag: '核心', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: ['产后安全', 'DRA安全'], reg: '只动腿不动手', prog: '放慢速度，每次5秒',
    cues: ['下背紧贴地面，不能离地', '对侧手脚同时伸出', '呼气时发力，吸气还原'],
  },
  {
    name: '卷腹', emoji: '🔥', demo: 'crunch', kind: 'reps', work: 0, reps: 15, sets: 3, rest: 30,
    tag: '核心', lv: 2, impact: '低', equip: '徒手', scen: ['beginner', 'fatloss', 'muscle'],
    safe: ['DRA不安全'], reg: '减小卷起幅度', prog: '放慢节奏，顶峰停2秒',
    cues: ['下巴微收，别拽脖子', '用腹肌卷起上背', '下背不要离开地面太多'],
  },
  {
    name: '全身拉伸放松', emoji: '🌿', demo: 'stretch', kind: 'time', work: 60, reps: 0, sets: 1, rest: 0,
    tag: '放松', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: [], reg: '', prog: '',
    cues: ['哪里紧就在哪里多停留', '配合深呼吸慢慢放松', '好好谢谢今天的自己'],
  },
  {
    name: '肩颈放松', emoji: '💆', demo: 'stretch', kind: 'time', work: 60, reps: 0, sets: 2, rest: 15,
    tag: '放松', lv: 1, impact: '低', equip: '徒手', scen: ['postpartum', 'beginner', 'fatloss', 'muscle', 'office'],
    safe: [], reg: '', prog: '',
    cues: ['缓慢绕肩，向前向后各10圈', '颈部左右轻拉伸，每侧15秒', '配合深呼吸，松开咬紧的牙关'],
  },
];

export const LV_NAME: Record<Level, string> = { 1: '新手友好', 2: '进阶', 3: '挑战' };

export function findExercise(name: string): Exercise | undefined {
  return EXERCISES.find((e) => e.name === name);
}

/** 动作是否为 DRA 不安全 */
export function isDraUnsafe(ex: Exercise): boolean {
  return ex.safe.includes('DRA不安全');
}

/** 演示动画周期（秒），即一次动作的节奏时长，用于把动画周期对准数拍 */
export function demoPeriod(ex: Exercise): number {
  const map: Record<string, number> = {
    march: 1.0,
    jack: 1.0,
    squat: 2.0,
    bridge: 2.2,
    pushup: 2.4,
    press: 2.0,
    plank: 4.0,
    stretch: 4.5,
    crunch: 2.2,
    deadbug: 2.4,
  };
  return map[ex.demo] ?? 2.0;
}
