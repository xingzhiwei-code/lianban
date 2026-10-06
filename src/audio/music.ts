// 配乐：Web Audio API 现场合成（零资源、无版权、离线可用）
// 4 种氛围（PRD §F7）：warmup / strength / hold / stretch
import type { MusicStyle } from '../core/types';

interface StyleDef {
  bpm?: number;
  kick?: number[];
  hat?: number[];
  snare?: number[];
  bass?: number[];
  bt?: OscillatorType;
  pad?: boolean;
  chords?: number[][];
}

const STYLES: Record<MusicStyle, StyleDef> = {
  warmup: {
    bpm: 124,
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2],
    snare: [],
    bass: [45, 0, 0, 0, 0, 0, 45, 0, 43, 0, 0, 0, 0, 0, 41, 0],
    bt: 'square',
  },
  strength: {
    bpm: 100,
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    bass: [40, 0, 40, 40, 0, 40, 0, 40, 40, 0, 40, 40, 0, 38, 0, 40],
    bt: 'sawtooth',
  },
  hold: {
    bpm: 92,
    kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    snare: [],
    bass: [45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 43, 0, 0, 0],
    bt: 'triangle',
  },
  stretch: {
    bpm: 64,
    pad: true,
    chords: [
      [57, 60, 64],
      [53, 57, 60],
      [48, 53, 57],
      [55, 59, 62],
    ],
  },
};

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private style: MusicStyle | null = null;
  private enabled = true;

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) this.stop();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** 必须在用户手势（点击「开始跟练」）中触发 */
  ensure(): void {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private mf(m: number): number {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  private kick(t: number): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + 0.16);
  }

  private hat(t: number, open: boolean): void {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf!;
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7500;
    const g = c.createGain();
    const dur = open ? 0.18 : 0.045;
    g.gain.setValueAtTime(open ? 0.22 : 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(this.master!);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  private snare(t: number): void {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf!;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1900;
    f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    s.connect(f);
    f.connect(g);
    g.connect(this.master!);
    s.start(t);
    s.stop(t + 0.2);
  }

  private bass(t: number, m: number, type: OscillatorType): void {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = type;
    o.frequency.value = this.mf(m);
    f.type = 'lowpass';
    f.frequency.value = 700;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(f);
    f.connect(g);
    g.connect(this.master!);
    o.start(t);
    o.stop(t + 0.25);
  }

  private padChord(t: number, midis: number[], dur: number): void {
    const c = this.ctx!;
    midis.forEach((m) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.value = this.mf(m);
      o.detune.value = Math.random() * 8 - 4;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.11, t + Math.min(1.2, dur * 0.3));
      g.gain.setValueAtTime(0.11, t + dur * 0.7);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.master!);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  play(style: MusicStyle): void {
    this.ensure();
    if (!this.ctx || !this.enabled) return;
    if (this.style === style && this.timer) return;
    this.stop();
    this.style = style;
    const S = STYLES[style];
    if (!S) return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    const self = this;
    if (S.pad) {
      const bar = (60 / (S.bpm ?? 64)) * 4;
      this.timer = window.setInterval(() => {
        while (self.nextTime < self.ctx!.currentTime + 0.6) {
          self.padChord(self.nextTime, S.chords![self.step % S.chords!.length], bar);
          self.nextTime += bar;
          self.step++;
        }
      }, 250);
    } else {
      const spb = 60 / (S.bpm ?? 100) / 4;
      this.timer = window.setInterval(() => {
        while (self.nextTime < self.ctx!.currentTime + 0.15) {
          const s = self.step % 16;
          if (S.kick![s]) self.kick(self.nextTime);
          if (S.hat![s]) self.hat(self.nextTime, S.hat![s] === 2);
          if (S.snare && S.snare[s]) self.snare(self.nextTime);
          if (S.bass![s]) self.bass(self.nextTime, S.bass![s], S.bt ?? 'sawtooth');
          self.nextTime += spb;
          self.step++;
        }
      }, 30);
    }
  }

  stop(): void {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.style = null;
  }
}

export const music = new MusicEngine();
