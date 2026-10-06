# 练伴 Lianban

Web-first 的跟练产品：火柴人动画演示 + 语音数拍 + 合成配乐，陪用户完成训练。
从产后恢复场景起步，已泛化为全人群，覆盖 5 个场景：产后恢复 / 新手入门 / 减脂燃脂 / 塑形增肌 / 办公拉伸。

当前版本：**V0 跟练闭环**（单机、离线可用、无登录）。

---

## 如何运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173/`（推荐手机浏览器或开发者工具的手机模拟，375–430px 基准）。

## 如何构建

```bash
npm run build      # tsc 类型检查 + vite 打包，产物在 dist/
npm run preview    # 本地预览构建产物
npm run typecheck  # 仅类型检查
```

## 技术栈

- **TypeScript + Vite**，无重型 UI 框架（原生 DOM 实现，轻量快速）
- **Dexie.js（IndexedDB）**：所有数据持久化，刷新/关闭不丢失，零后端、离线可用
- **语音**：Web Speech API（`zh-CN`），不可用时静默降级（静默跟练）
- **配乐**：Web Audio API 现场合成 4 种氛围（热身律动 / 力量节奏 / 保持专注 / 放松舒缓），零资源、无版权
- **动画**：SVG 火柴人 + CSS keyframes，动画周期 = 动作节奏

## 目录结构

```
src/
├── main.ts              # 入口：组装骨架、编排生命周期
├── style.css            # 全局样式 + 火柴人动画关键帧
├── content/
│   └── copy.ts          # 文案库（所有面向用户的文案集中于此）
├── core/
│   ├── types.ts         # 共享类型
│   ├── exercises.ts     # 15 个动作原子（全表）
│   ├── scenarios.ts     # 5 场景 + 推荐课 + 配乐映射
│   ├── db.ts            # Dexie schema + 读写封装
│   └── state.ts         # 应用级内存状态（画像 / 音频 URL 缓存）
├── audio/
│   ├── speech.ts        # 语音（中文数字数拍）
│   └── music.ts         # Web Audio 合成配乐引擎
├── anim/
│   └── stickfigure.ts   # 火柴人 SVG 演示（9 种）
└── ui/
    ├── shell.ts         # 静态页面骨架
    ├── util.ts          # toast / 格式化 / DOM 工具
    ├── onboard.ts       # 开屏问卷（3 步）
    ├── home.ts          # 首页（推荐课 / 当天自适应 / 温和模式 / 小贴士）
    ├── library.ts       # 动作库（搜索 / 筛选 / 安全过滤 / 详情 / 自建跟练）
    ├── player.ts        # 跟练播放器状态机（动画 + 视频）
    ├── video.ts         # 视频导入 / 分段编辑器 / B站收藏 / 用户音频绑定
    ├── dataPage.ts      # 数据页（体重 / 围度 / 营养 / 历史 / 导出删除）
    └── tabs.ts          # 底部导航
```

## 核心设计说明

- **数据层**（见 `docs/decisions/ADR-001.md`）：Dexie v1 schema，Blob（视频/音频）直接存 IndexedDB；
  播放时用 `URL.createObjectURL`，关闭/更换时 `revokeObjectURL`。首屏不被数据层阻塞（库初始化异步）。
- **跟练队列**：`[动作 × 组数] + 组间休息` 交替；次数类动作监听动画 `animationiteration` 自动计数，
  满组自动进入休息；计时类动作圆环倒计时，到一半播报「一半了，坚持住」。
- **文案集中**：全部文案在 `src/content/copy.ts`，组件不硬编码，方便按场景扩展。
- **安全**：DRA 不安全动作（卷腹）在产后场景默认过滤；医生未许可进入「温和模式」。

## 验收对照（PRD §5，共 16 条）

已在开发过程中逐一验证（开屏问卷、推荐课计算、安全过滤、自动数拍、圆环倒计时、暂停/恢复、
RPE 自适应建议、自建跟练、一键降载、视频分段、数据持久化、体重校验、场景切换、构建通过等）。
详见各里程碑提交说明。

## 相关文档

- `docs/constitution.md` —— 项目宪法（最高优先级）
- `docs/roadmap.md` —— 总规划
- `docs/prd/prd-v0.md` —— V0 需求全文
- `docs/decisions/ADR-001.md` —— 数据层决策
- `prototype/练伴-跟练原型-v0.html` —— 参考原型（交互/文案/视觉基准）
