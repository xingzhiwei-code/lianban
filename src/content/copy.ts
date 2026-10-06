// 文案库：所有面向用户的文案集中于此，组件不得硬编码
// 宪法第 1 条（用户体验）与 PRD §F10（情绪价值文案体系）要求：
// 温暖、直接、不爹味；禁止身材/掉秤焦虑；庆祝「出现」本身。

import type { MusicStyle, Rpe, ScenarioKey } from '../core/types';

export const BRAND = '练伴';
export const BRAND_TAGLINE = '你的跟练小伙伴 · 塑形 · 记录 · 反馈 · 情绪价值';

/* ---------------- 问候 ---------------- */
export const GREET_SUFFIX: Partial<Record<ScenarioKey, string>> = {
  postpartum: '，妈妈',
};
export const DATE_LINE_SUFFIX = ' · 今天也要温柔地对待自己';

export function greetingByHour(h: number): string {
  if (h < 6) return '夜深了';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

/* ---------------- 开屏问卷 ---------------- */
export const OB = {
  next: '下一步',
  finish: '生成我的计划 ✨',
  skip: '先跳过，直接看看',
  step1: {
    q: '你现在处于哪个场景？',
    small: '练伴为不同人群准备了不同计划，产后恢复是其中之一',
  },
  babyAge: { q: '宝宝现在多大了？', small: '' },
  birth: {
    q: '分娩方式是？',
    small: '剖腹产的妈妈腹肌恢复需要更久，计划会更温和地起步',
  },
  cleared: {
    q: '医生说可以正常运动了吗？',
    small: '这是安全底线，如实选就好，不评判 💛',
  },
  base: { q: '之前有运动基础吗？', small: '' },
  minutes: {
    q: '每次能投入多久？',
    small: '时间碎片也没关系，短而规律比长而偶尔更有效',
  },
  equip: { q: '家里有什么器械？', small: '' },
  options: {
    scenario: [
      { v: 'postpartum', label: '🍼 产后恢复' },
      { v: 'beginner', label: '🌱 新手入门' },
      { v: 'fatloss', label: '🔥 减脂燃脂' },
      { v: 'muscle', label: '💪 塑形增肌' },
      { v: 'office', label: '🪑 办公拉伸' },
    ],
    babyAge: [
      { v: '0', label: '6周以内' },
      { v: '1', label: '6周~6个月' },
      { v: '2', label: '6~12个月' },
      { v: '3', label: '12个月以上' },
    ],
    birth: [
      { v: '顺产', label: '顺产' },
      { v: '剖腹产', label: '剖腹产' },
    ],
    cleared: [
      { v: 'yes', label: '可以了' },
      { v: 'notyet', label: '还没问过' },
      { v: 'no', label: '医生说再等等' },
    ],
    base: [
      { v: '0', label: '纯新手' },
      { v: '1', label: '偶尔动一动' },
      { v: '2', label: '经常练' },
    ],
    minutes: [
      { v: '15', label: '15分钟' },
      { v: '20', label: '20分钟' },
      { v: '30', label: '30分钟' },
    ],
    equip: [
      { v: '徒手', label: '徒手就好' },
      { v: '小器械', label: '有哑铃/弹力带' },
    ],
  },
  notes: {
    postpartum:
      '🍼 哺乳期小提醒：训练不需要节食，奶水和营养是第一位的；练前练后记得喝水，喂完奶再练会更舒服。如有任何不适请停下来，必要时咨询医生。',
    beginner:
      '🌱 新手小提醒：前两周以「完成」为目标，别追求强度；肌肉酸痛 2-3 天很正常，疼就休息。',
    fatloss: '🔥 减脂小提醒：训练只占三成，吃和睡占七成；别靠饿，掉肌肉比掉秤更可惜。',
    muscle: '💪 增肌小提醒：蛋白吃够、动作做标准比上重量重要；同一部位隔天再练，给肌肉恢复时间。',
    office: '🪑 久坐小提醒：每小时起来活动 2 分钟，效果不输一次长训练；肩颈僵硬是身体在报警。',
  },
};

/* ---------------- 首页 ---------------- */
export const HOME = {
  safeBanner:
    '💛 医生还没点头？那先每天散步 20 分钟就很好，力量训练等绿灯亮起再开始。练伴会在这里等你，不着急。',
  stateTitle: '今天状态怎么样？',
  stateSub: '没状态也有练法，一键降载，不纠结',
  adapt: {
    fast: '⚡ 只有10分钟',
    quiet: '🤫 要安静低冲击',
    easy: '😮‍💨 轻松点',
    fastTitle: '⚡ 10分钟快充 · 跟练',
    quietTitle: '🤫 安静跟练 · 不打扰家人',
    quietTitlePostpartum: '🤫 安静跟练 · 不打扰宝宝',
    easyTitle: '😮‍💨 轻松恢复 · 跟练',
  },
  videoCardEyebrow: '视频跟练',
  videoCardText: '导入自己的训练视频，切成小段跟着练 →',
  tipEyebrowPostpartum: '哺乳期小贴士',
  tipEyebrow: '今日小贴士',
  weekCard: '本周打卡',
  weekCount: (n: number) => `本周已练 ${n} 次`,
  streakText: (d: number) => `🔥 已连续打卡 ${d} 天——习惯正在长成，别小看每一次出现。`,
  stats: {
    weight: '体重',
    weightFlat: '持平→',
    minutes: '本周训练',
    streak: '连续打卡',
  },
};

/* ---------------- 分场景小贴士 ---------------- */
export const TIPS: Record<ScenarioKey, string[]> = {
  postpartum: [
    '训练前记得喝一大杯水，哺乳期出汗多，补水比补练更重要。',
    '喂完奶再练会更舒服，记得穿支撑好的运动内衣。',
    '不需要节食！奶水和营养是第一位的，吃够才是对的。',
    '宝宝睡着的碎片时间练 15 分钟，效果远超周末突击 2 小时。',
    '练后 30 分钟内吃点蛋白质和碳水，比如鸡蛋+香蕉，恢复更快。',
    '体重秤没动？别慌，肌肉在悄悄生长，围度会先给你答案。',
  ],
  beginner: [
    '前两周把「完成」当目标，不追求强度，习惯比强度重要。',
    '肌肉酸痛 2-3 天很正常，疼就休息一天，别硬撑。',
    '练前热身 3 分钟，能减少受伤，也让身体更听话。',
    '每周 3 次就很棒，坚持比一次练猛更重要。',
    '体重秤没动？别慌，肌肉在悄悄生长，围度会先给你答案。',
  ],
  fatloss: [
    '别靠饿！掉肌肉比掉秤更可惜，吃够蛋白质才减得久。',
    '心率微微上来、能说话不能唱歌，就是刚刚好的强度。',
    '动起来就是胜利，哪怕今天只做了 10 分钟。',
    '睡够 7 小时，减脂事半功倍。',
  ],
  muscle: [
    '蛋白吃够、动作做标准，比盲目上重量更重要。',
    '同一部位隔天再练，给肌肉恢复的时间。',
    '进步不是天天都能看见，但每次完成都在积累。',
  ],
  office: [
    '每小时起来活动 2 分钟，效果不输一次长训练。',
    '肩颈僵硬是身体在报警，别等到疼才动。',
    '利用碎片时间拉伸，比下班后硬扛一场更实际。',
  ],
};

/* ---------------- 情绪价值：鼓励卡 ---------------- */
export const ENCS_GENERAL = [
  '你把自己照顾好了，才能更好地照顾别人。<b>今天做到了。</b>',
  '不需要和任何人比，比昨天的自己多动一点点就赢了。<b>你很棒。</b>',
  '每一次出现，都在给未来的自己投票。<b>这一票投得漂亮。</b>',
  '完成比完美重要，你完成了。<b>值得庆祝。</b>',
];
export const ENCS_POSTPARTUM = [
  '宝宝午睡的这段时间，你全部留给了自己。<b>这很了不起。</b>',
  '带娃已经是一项极限运动了，你还 extra 练了一场。<b>给自己点个赞吧。</b>',
  '你不需要和任何人比，只需要比昨天的自己多动了一点点。<b>今天做到了。</b>',
  '每一次出现都在给未来的自己投票。<b>今天这一票，投得漂亮。</b>',
];

/* ---------------- RPE 与自适应建议（PRD §F9） ---------------- */
export const RPE_OPTIONS: { v: Rpe; emoji: string; label: string; sub: string }[] = [
  { v: 'easy', emoji: '😌', label: '轻松', sub: '还能再来一组' },
  { v: 'ok', emoji: '🙂', label: '刚好', sub: '微微出汗' },
  { v: 'hard', emoji: '🥵', label: '吃力', sub: '做到力竭了' },
];
export const RPE_LABEL: Record<Rpe, string> = {
  easy: '😌 轻松',
  ok: '🙂 刚好',
  hard: '🥵 吃力',
};
export const RPE_ADVICE: Record<Rpe, string> = {
  easy: '你恢复得比想象中快！下次可以试试每组多做 2 次，或组间休息缩短 5 秒，循序渐进就好。',
  ok: '这个强度刚刚好，保持就是胜利。身体正在稳稳地变强。',
  hard: '没关系，身体正在适应。下次可以把次数减 2 个——先完成，再完美。',
};

/* ---------------- 跟练播放器 ---------------- */
export const PLAYER = {
  demoHint: '跟着动画的节奏，一起做 🎵',
  repsHint: '动画完成一次 = 1次，跟着数拍走',
  setInfo: (set: number, total: number) => `第 ${set} 组 / 共 ${total} 组`,
  setInfoVideo: (set: number, total: number) => `第 ${set} 组 / 共 ${total} 组 · 视频跟练`,
  pause: '⏸ 暂停',
  resume: '▶ 继续',
  skip: '⏭ 跳过',
  voiceRow: '🔊 语音陪练（数拍 & 报时）',
  musicRow: '🎵 动作配乐',
  slowRow: '🐢 慢放跟做',
  restTitle: '休息一下',
  restUnit: '秒 · 喝口水',
  restNext: (next: string) => `接下来：${next}`,
  restSkip: '跳过休息 ⏭',
  rpeTitle: '本轮结束！',
  rpeSub: '诚实一点，这对下次的计划很重要（不会有人评判你 💛）',
  rpeQ: '刚才感觉怎么样？',
  summaryTitle: '训练完成！',
  sumTime: '用时',
  sumCount: '动作',
  sumCountSeg: '分段',
  sumKcal: '预估消耗',
  backHome: '收下鼓励，回到首页 💛',
  safetyFoot:
    '如有头晕、恶心、伤口不适请立刻停止 · 哺乳期训练量力而行',
  safetyFootGeneric: '如有头晕、恶心、伤口不适请立刻停止',
  exitConfirm: '确定要退出本次训练吗？已完成的动作会保留记录。',
  halfTime: '一半了，坚持住',
  allDone: '全部完成 🎉',
  videoCues: ['跟着视频的节奏做', '跟不上就点慢放，不丢人 🐢'],
  step: (i: number, total: number) => `动作 ${i}/${total}`,
};

/* ---------------- 动作库 ---------------- */
export const LIB = {
  title: '动作库 💪',
  selfBuild: '自建跟练',
  selfBuildDone: '完成',
  searchPlaceholder: '🔍 搜索动作，如 臀桥',
  partLabel: '部位',
  lvLabel: '难度',
  safeOn: (scenarioName: string) => `🛡️ 已按【${scenarioName}】过滤安全动作`,
  safeOff: '👁 已显示全部动作（含高阶/非本场景）',
  count: (n: number) => `共 ${n} 个动作 · 点开看演示、要领与进退阶`,
  noResult: '没有符合条件的动作，换个筛选试试～',
  cuesTitle: '动作要领',
  regTitle: '退阶',
  progTitle: '进阶',
  draWarn: '⚠️ 该动作对腹直肌分离未恢复者不友好，已在产后场景中自动过滤。',
  addToList: '＋ 加入清单',
  startSingle: '开始跟练 ▶',
  buildCount: (n: number) => `已选 ${n} 个动作`,
  buildGo: '生成跟练 ▶',
  buildTitle: (n: number) => `自建跟练 · ${n}个动作`,
  singleTitle: (name: string) => `${name} · 单动作跟练`,
  safetyFoot: '有不适立刻停止 · 必要时咨询医生',
  addedToast: '已加入自建清单 💪',
};

/* ---------------- 视频跟练 ---------------- */
export const VIDEO = {
  title: '视频跟练 🎬',
  sub: '导入训练视频，切成小段，跟着练',
  importTitle: '📱 导入本地视频',
  importSub: '手机里的训练视频、自己拍的动作都可以',
  pickBtn: '选择视频文件',
  segTitle: '✂️ 分段',
  segSub: '时间格式如 1:30；切好后点「开始分段跟练」',
  segEmpty: '还没有分段，点「平均切分」或手动添加 👇',
  autoSplit: '平均切分',
  addSeg: '+ 手动添加分段',
  startSeg: '开始分段跟练 ▶',
  segDefaultName: (i: number) => `分段${i}`,
  segWorkoutTitle: '视频分段 · 跟练',
  bvTitle: '📺 Bilibili 收藏',
  bvSub: 'B 站视频先收藏在这里，一键跳转去看（暂不支持站内分段）',
  bvPlaceholder: '粘贴B站链接或BV号',
  bvAdd: '收藏',
  bvGo: '去看',
  bvDel: '删',
  bvEmpty: '还没有收藏，去B站找个喜欢的跟练视频吧～',
  bvCompliance: 'B站视频请去官方观看，练伴不做下载破解',
  musicTitle: '🎵 我的音乐',
  musicSub: '给每种训练氛围绑自己的歌，不绑就用内置节拍（合成、无版权、可离线）',
  musicUnbound: '未绑定 · 用内置节拍',
  musicReplace: '更换',
  musicPick: '选择',
  musicClear: '清除',
  safetyFoot: '只导入自己拍摄或有版权的视频 · B站视频请去官方观看，练伴不做下载破解',
  slowToast: '0.75x 慢放，慢慢来 🐢',
  normalToast: '正常速度',
  noSegToast: '先导入视频并切好分段～',
  noVideoToast: '先导入视频～',
  meta: (dur: string, mb: string) => `时长 ${dur} · ${mb}MB · 已保存，下次打开还在`,
};

/* ---------------- 数据页 ---------------- */
export const DATA = {
  title: '我的数据 📊',
  sub: '体重只是参考，围度和力量会先说话',
  weightTitle: '体重趋势',
  addRecord: '+ 记录',
  weightUnit: 'kg',
  weightRecent: '近4周',
  weightFlat: '持平',
  weightTip: '💛 体重没动也别慌，肌肉在悄悄生长，围度会先给你答案。',
  weightPrompt: '今日体重（kg）：',
  weightInvalid: '这个数字不太对，再确认下～',
  weightSaved: '已记录，坚持就是胜利 💪',
  measTitle: '围度记录',
  measKind: { waist: '腰围', hip: '臀围', thigh: '大腿围' },
  measPrompt: '今日腰围（cm）：',
  measPromptKind: (k: string) => `今日${k}（cm）：`,
  measInvalid: '这个数字不太对，再确认下～',
  measSaved: '已记录 🎉',
  trendDown: (v: string) => `▼${v}`,
  trendFlat: '— 持平',
  nutriTitlePostpartum: '今日营养 🍼',
  nutriTitle: '今日营养',
  water: '喝水',
  waterGoal: 'ml',
  waterAdd: '+250ml',
  waterDone: '今日饮水达标！🎉',
  protein: '蛋白质',
  proteinAdd: '+10g',
  calcium: '钙片',
  calciumPostpartumNote: '哺乳期每天需要约1000mg钙',
  calciumNote: '今日已补',
  calciumOn: '钙片打卡成功 🦴',
  calciumOff: '取消了打卡',
  histTitle: '训练历史',
  histEmpty: '还没有训练记录，从一次跟练开始吧～',
  settingsTitle: '设置与数据',
  settingsSub: '数据只存在你的手机里，不上传、不联网',
  exportBtn: '导出全部数据（JSON 下载）',
  deleteBtn: '删除全部数据',
  deleteConfirm: '确定要删除全部数据吗？此操作不可恢复。',
  deletedToast: '已清空所有数据',
  exportToast: '数据已导出 ✨',
};

/* ---------------- 配乐氛围 ---------------- */
export const MUSIC_LABEL: Record<MusicStyle, string> = {
  warmup: '热身律动',
  strength: '力量节奏',
  hold: '保持专注',
  stretch: '放松舒缓',
};

/* ---------------- 通用 toast / 提示 ---------------- */
export const TOAST = {
  onboardNeed: '选一下再继续吧～',
  onboardDone: '计划生成好啦，去首页看看吧 ✨',
  switchConfirm: '切换场景会重新走一遍问卷，确定吗？',
  startConfirm:
    '医生还没确认可以运动，建议先从每天散步开始。如果你已经获得许可，点「确定」开始体验跟练。',
  workoutSaved: '今日训练已记录 ✨',
  musicOff: '配乐已关 🔇',
  musicOn: '配乐已开 🎵',
  audioBound: (label: string) => `已绑定到「${label}」🎵`,
  bvSaved: '已收藏 📺',
  bvNeedLink: '先粘贴个链接～',
  genericFallbackLink: '收藏链接',
  kcalEstimate: '估算',
  minutesUnit: '分',
  countUnitGe: '个',
  countUnitSeg: '段',
  kcalUnit: 'kcal',
  kgUnit: 'kg',
  cmUnit: 'cm',
};
