// 语音：Web Speech API（zh-CN）。不可用时静默降级（静默跟练）。
export class Speech {
  private enabled = true;

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) this.cancel();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string): void {
    if (!this.enabled) return;
    if (!this.supported()) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 1.05;
      window.speechSynthesis.speak(u);
    } catch {
      /* 静默降级 */
    }
  }

  cancel(): void {
    if (!this.supported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export const speech = new Speech();

/** 中文数字数拍（一、二、三…） */
export const CN_NUM = [
  '零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
];

export function cnNum(n: number): string {
  return CN_NUM[n] ?? String(n);
}
