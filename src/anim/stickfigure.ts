// 火柴人 SVG 动画：9 种演示（PRD §F1/附录 C），SVG + CSS keyframes 实现
// 动画周期 = 动作节奏。次数类动作的「一个完整循环」由带 id="repAnim" 的元素承担。
import type { DemoType } from '../core/types';

const GROUND = `<line x1="14" y1="140" x2="186" y2="140" stroke="#E4D8CB" stroke-width="6" stroke-linecap="round"/>`;

// 手臂（从肩部往下），围绕肩部摆动
const ARM_L = (x1: number, y1: number, x2: number, y2: number, anim: string) =>
  `<line class="limb" style="transform-origin:${x1}px ${y1}px;animation:${anim}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

const DEMOS: Record<DemoType, string> = {
  // 原地踏步：全身轻微弹跳 + 手脚交替摆动
  march: `${GROUND}
<g class="fig" style="animation:bob 1s ease-in-out infinite">
  <circle class="fig-head" cx="100" cy="26" r="13"/>
  <line x1="100" y1="42" x2="100" y2="92"/>
  ${ARM_L(92, 54, 92, 86, 'swingB 1s ease-in-out infinite')}
  ${ARM_L(108, 54, 108, 86, 'swingA 1s ease-in-out infinite')}
  ${ARM_L(94, 92, 94, 134, 'swingA 1s ease-in-out infinite')}
  ${ARM_L(106, 92, 106, 134, 'swingB 1s ease-in-out infinite')}
</g>`,

  // 靠墙静蹲：静态保持，轻微颤抖（不抢注意力）
  squat: `<rect x="16" y="18" width="10" height="122" rx="5" fill="#E4D8CB"/>
<g class="fig" style="animation:tremble .3s linear infinite">
  <circle class="fig-head" cx="58" cy="40" r="13"/>
  <line x1="58" y1="56" x2="72" y2="90"/>
  <line x1="72" y1="90" x2="110" y2="90"/>
  <line x1="110" y1="90" x2="110" y2="134"/>
  <line x1="70" y1="64" x2="46" y2="86"/>
</g>
${GROUND}`,

  // 臀桥：身体上抬下落（一个循环 = 一次）
  bridge: `${GROUND}
<g id="repAnim" style="transform-box:view-box;transform-origin:58px 122px;animation:lift 2.2s ease-in-out infinite">
  <circle class="fig-head" cx="40" cy="112" r="12"/>
  <line class="fig" x1="52" y1="120" x2="112" y2="112"/>
  <line class="fig" x1="112" y1="112" x2="142" y2="126"/>
  <line class="fig" x1="142" y1="126" x2="158" y2="132"/>
</g>`,

  // 俯卧撑：身体绕支点俯卧
  pushup: `${GROUND}
<line class="fig" x1="88" y1="132" x2="64" y2="136"/>
<g id="repAnim" style="transform-box:view-box;transform-origin:88px 132px;animation:pivot 2.4s ease-in-out infinite">
  <circle class="fig-head" cx="148" cy="94" r="12"/>
  <line class="fig" x1="138" y1="102" x2="92" y2="128"/>
  <line class="fig" x1="126" y1="110" x2="118" y2="134"/>
</g>`,

  // 推举：双臂交替上推
  press: `<g class="fig">
  <circle class="fig-head" cx="100" cy="26" r="13"/>
  <line x1="100" y1="42" x2="100" y2="96"/>
  <line x1="100" y1="96" x2="100" y2="136"/>
  <g id="repAnim" class="limb" style="transform-origin:88px 54px;animation:pressL 2s ease-in-out infinite">
    <line x1="88" y1="54" x2="88" y2="92"/>
    <circle cx="88" cy="97" r="6.5" fill="#FFB627" stroke="#3B3330" stroke-width="4"/>
  </g>
  <g class="limb" style="transform-origin:112px 54px;animation:pressR 2s ease-in-out infinite">
    <line x1="112" y1="54" x2="112" y2="92"/>
    <circle cx="112" cy="97" r="6.5" fill="#FFB627" stroke="#3B3330" stroke-width="4"/>
  </g>
</g>
${GROUND}`,

  // 平板支撑：静态保持，呼吸起伏
  plank: `${GROUND}
<g class="fig" style="animation:breatheBody 4s ease-in-out infinite">
  <circle class="fig-head" cx="152" cy="94" r="12"/>
  <line x1="142" y1="102" x2="96" y2="124"/>
  <line x1="118" y1="112" x2="112" y2="136"/>
  <line x1="96" y1="124" x2="72" y2="136"/>
</g>`,

  // 拉伸：身体左右轻摆，双臂上举
  stretch: `${GROUND}
<g class="fig" style="transform-box:view-box;transform-origin:100px 140px;animation:sway 4.5s ease-in-out infinite">
  <circle class="fig-head" cx="100" cy="26" r="13"/>
  <line x1="100" y1="42" x2="100" y2="96"/>
  <line x1="100" y1="96" x2="100" y2="138"/>
  <line x1="100" y1="54" x2="74" y2="16"/>
  <line x1="100" y1="54" x2="126" y2="16"/>
</g>`,

  // 卷腹：上背卷起
  crunch: `${GROUND}
<line class="fig" x1="100" y1="122" x2="140" y2="122"/>
<line class="fig" x1="140" y1="122" x2="140" y2="92"/>
<g id="repAnim" style="transform-box:view-box;transform-origin:100px 122px;animation:crunchUp 2.2s ease-in-out infinite">
  <circle class="fig-head" cx="72" cy="106" r="12"/>
  <line class="fig" x1="82" y1="114" x2="104" y2="120"/>
</g>`,

  // 死虫式：对侧手脚交替伸
  deadbug: `${GROUND}
<g class="fig">
  <circle class="fig-head" cx="42" cy="120" r="12"/>
  <line x1="54" y1="124" x2="110" y2="124"/>
  <line id="repAnim" class="limb" style="transform-origin:128px 118px;animation:swingA 2.4s ease-in-out infinite" x1="128" y1="76" x2="128" y2="118"/>
  <line class="limb" style="transform-origin:156px 120px;animation:swingB 2.4s ease-in-out infinite" x1="156" y1="82" x2="156" y2="120"/>
</g>`,
};

export function demoSvg(type: DemoType): string {
  return DEMOS[type] ?? '';
}
