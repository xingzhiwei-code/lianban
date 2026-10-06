// UI 工具：toast、格式化、DOM 辅助、时间解析等

let toastEl: HTMLElement | null = null;
let toastTimer: number | undefined;

export function initToast(): void {
  toastEl = document.getElementById('toast');
}

export function toast(msg: string): void {
  if (!toastEl) toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl!.classList.remove('show'), 1800);
}

export function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

export function safe$(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 秒 → 'm:ss' */
export function fmt(sec: number): string {
  sec = Math.max(0, Math.round(sec));
  return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
}

/** 解析 'm:ss' 或纯秒数字，非法返回 NaN */
export function parseT(s: string): number {
  const t = String(s).trim();
  if (/^\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  const m = t.match(/^(?:(\d+):)?([0-5]?\d)$/);
  if (!m) return NaN;
  return (m[1] ? +m[1] * 60 : 0) + +m[2];
}

/** 本地日期 'YYYY-MM-DD' */
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** 'YYYY-MM-DD' → 'M月D日' */
export function dateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${m}月${d}日`;
}

/** 中文星期 */
export function weekdayCn(d: Date): string {
  return '日一二三四五六'[d.getDay()];
}

export function dateLineStr(): string {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekdayCn(d)}`;
}

/** 随机取数组一项 */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 原生确认框封装（二次确认文案已集中在 copy.ts） */
export function confirmDialog(msg: string): boolean {
  return window.confirm(msg);
}

/** 数字输入提示框（体重/围度录入），返回合法数值或 null */
export function promptNumber(msg: string, def: string, min: number, max: number): number | null {
  const raw = window.prompt(msg, def);
  if (raw === null) return null;
  const v = parseFloat(raw);
  if (!isFinite(v) || v < min || v > max) return NaN;
  return Math.round(v * 10) / 10;
}

/** 下载文本为文件（数据导出） */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
