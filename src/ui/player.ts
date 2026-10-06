// 跟练播放器状态机（PRD §F1/F6）：动画演示 + 计数/计时 + 语音 + 配乐 + RPE + 小结
import { speech, cnNum } from '../audio/speech';
import { music } from '../audio/music';
import { demoSvg } from '../anim/stickfigure';
import { styleFor } from '../core/scenarios';
import { addWorkout } from '../core/db';
import { state, scenario } from '../core/state';
import { ENCS_GENERAL, ENCS_POSTPARTUM, PLAYER, RPE_ADVICE, RPE_OPTIONS, TOAST, VIDEO } from '../content/copy';
import type { Exercise, MusicStyle, QueueItem, Rpe, VideoSegment } from '../core/types';
import { $, confirmDialog, fmt, pick, toast, todayStr } from './util';

const CIRC = 2 * Math.PI * 82;

interface PlayerCtx {
  onSaved: () => void;
  onClosed?: () => void;
}

let ctx: PlayerCtx = { onSaved: () => {} };

let queue: QueueItem[] = [];
let idx = 0;
let paused = false;
let mode: 'anim' | 'video' = 'anim';
let voiceOn = true;
let musicOn = true;
let speed = 1;
let timerId: number | undefined;
let remaining = 0;
let total = 0;
let startStamp = 0;
let pausedMs = 0;
let pauseStamp = 0;
let title = '';
let listLen = 0; // 动画模式：动作数；视频模式：分段数
let completedWorks = 0;
let currentStyle: MusicStyle | null = null;
let videoSrc: string | null = null;

/* ---------------- 视图切换 ---------------- */
function showView(id: 'workView' | 'restView' | 'rpeView' | 'summaryView'): void {
  ['workView', 'restView', 'rpeView', 'summaryView'].forEach((v) => {
    $(v).hidden = v !== id;
  });
  $('plFoot').style.display = id === 'summaryView' ? 'none' : '';
}

function setPaused(p: boolean): void {
  if (paused === p) return;
  if (p) {
    pauseStamp = Date.now();
  } else if (pauseStamp) {
    pausedMs += Date.now() - pauseStamp;
    pauseStamp = 0;
  }
  paused = p;
  $('plPause').textContent = p ? PLAYER.resume : PLAYER.pause;
  $('demoStage').classList.toggle('paused', p);
  if (mode === 'video') {
    const v = $('plVideo') as HTMLVideoElement;
    if (p) v.pause();
    else void v.play().catch(() => {});
  }
  const au = $('userAudio') as HTMLAudioElement;
  if (p) {
    music.stop();
    au.pause();
    speech.cancel();
  } else if (currentStyle) {
    setMusic(currentStyle);
  }
}

function setMusic(style: MusicStyle): void {
  currentStyle = style;
  const au = $('userAudio') as HTMLAudioElement;
  if (!musicOn) {
    music.stop();
    au.pause();
    return;
  }
  const custom = state.audioUrls.get(style);
  if (custom) {
    music.stop();
    if (au.dataset.src !== custom.url) {
      au.src = custom.url;
      au.dataset.src = custom.url;
    }
    au.loop = true;
    au.volume = 0.85;
    void au.play().catch(() => {});
  } else {
    au.pause();
    music.play(style);
  }
}

/* ---------------- 队列构建 ---------------- */
function nextNameIn(list: Exercise[], ex: Exercise, s: number): string {
  if (s < ex.sets) return `${ex.name} · 第${s + 1}组`;
  const n = list[list.indexOf(ex) + 1];
  return n ? `${n.name} · ${n.kind === 'time' ? n.work + '秒' : n.reps + '次'} × ${n.sets}组` : PLAYER.allDone;
}

export function buildAnimQueue(list: Exercise[]): void {
  queue = [];
  list.forEach((ex, oi) => {
    for (let s = 1; s <= ex.sets; s++) {
      queue.push({ type: 'work', ex, set: s, order: oi + 1 });
      const isLast = ex === list[list.length - 1] && s === ex.sets;
      if (!isLast) {
        queue.push({ type: 'rest', sec: ex.rest || 30, next: nextNameIn(list, ex, s) });
      }
    }
  });
}

function vnextName(segs: VideoSegment[], sg: VideoSegment, s: number): string {
  if (s < sg.sets) return `${sg.name} · 第${s + 1}组`;
  const n = segs[segs.indexOf(sg) + 1];
  return n ? `${n.name} · ${fmt(n.end - n.start)}` : PLAYER.allDone;
}

export function buildVideoQueue(segs: VideoSegment[]): void {
  queue = [];
  segs.forEach((sg, oi) => {
    for (let s = 1; s <= sg.sets; s++) {
      queue.push({ type: 'vwork', seg: sg, set: s, order: oi + 1 });
      queue.push({ type: 'rest', sec: sg.rest || 30, next: vnextName(segs, sg, s) });
    }
  });
  // 去掉最后一个多余的休息
  while (queue.length && queue[queue.length - 1].type === 'rest') queue.pop();
}

/* ---------------- 启动 ---------------- */
export function launchPlayer(t: string): void {
  title = t;
  idx = 0;
  paused = false;
  pausedMs = 0;
  pauseStamp = 0;
  startStamp = Date.now();
  completedWorks = 0;
  $('player').hidden = false;
  document.body.style.overflow = 'hidden';
  $('plFootText').textContent = scenario() === 'postpartum' ? PLAYER.safetyFoot : PLAYER.safetyFootGeneric;
  step();
}

function step(): void {
  if (idx >= queue.length) {
    finishWorkout();
    return;
  }
  const q = queue[idx];
  if (q.type === 'rest') {
    $('plStep').textContent = '休息';
    doRest(q);
  } else if (q.type === 'vwork') {
    $('plStep').textContent = PLAYER.step(q.order, listLen);
    doVWork(q);
  } else {
    $('plStep').textContent = PLAYER.step(q.order, listLen);
    doWork(q);
  }
}

function advance(): void {
  completedWorks++;
  idx++;
  step();
}

/* ---------------- 动画：动作 ---------------- */
function doWork(q: Extract<QueueItem, { type: 'work' }>): void {
  mode = 'anim';
  showView('workView');
  const ex = q.ex;
  renderDemo(ex.demo);
  $('demoStage').style.display = '';
  const pv = $('plVideo') as HTMLVideoElement;
  pv.hidden = true;
  pv.pause();
  pv.ontimeupdate = null;
  $('vProgWrap').hidden = true;
  $('speedRow').hidden = true;
  $('plName').textContent = ex.name;
  $('plSetInfo').textContent = PLAYER.setInfo(q.set, ex.sets);
  $('plCues').innerHTML = ex.cues.map((c) => `<li>${escapeCue(c)}</li>`).join('');
  const isTime = ex.kind === 'time';
  $('ringWrap').style.display = isTime ? '' : 'none';
  $('repsWrap').hidden = isTime;
  setPaused(false);
  setMusic(styleFor(ex.demo));

  if (isTime) {
    total = ex.work;
    remaining = ex.work;
    speech.speak(`${ex.name}，开始`);
    startTimer('ringFg', 'plTime', advance);
  } else {
    const target = ex.reps;
    let done = 0;
    const paint = () => {
      $('plRepsDone').textContent = String(done);
      $('plRepsTarget').textContent = String(target);
    };
    paint();
    speech.speak(`${ex.name}，跟着我数，开始`);
    const animEl = safeQuery('#demoSvg #repAnim');
    if (animEl) {
      animEl.addEventListener('animationiteration', () => {
        if (paused || $('player').hidden) return;
        done++;
        paint();
        speech.speak(cnNum(done));
        if (done >= target) advance();
      });
    } else {
      // 无循环动画兜底：按周期数拍（理论不会走到，安全兜底）
      fallbackRepCount(ex, target, done, paint);
    }
  }
}

function renderDemo(type: Exercise['demo']): void {
  $('demoSvg').innerHTML = demoSvg(type);
  $('demoStage').classList.remove('paused');
}

function escapeCue(s: string): string {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fallbackRepCount(ex: Exercise, target: number, start: number, paint: () => void): void {
  let done = start;
  const period = ex.demo === 'march' ? 1000 : 2200;
  const id = window.setInterval(() => {
    if (paused || $('player').hidden) return;
    done++;
    paint();
    speech.speak(cnNum(done));
    if (done >= target) {
      window.clearInterval(id);
      advance();
    }
  }, period);
}

function startTimer(ringId: string, numId: string, done: () => void): void {
  if (timerId) window.clearInterval(timerId);
  const fg = $(ringId);
  const num = $(numId);
  const draw = () => {
    num.textContent = String(remaining);
    ringSet(fg, remaining / total);
    if (remaining <= 5 && remaining > 0) speech.speak(String(remaining));
  };
  draw();
  timerId = window.setInterval(() => {
    if (paused) return;
    remaining--;
    if (remaining === Math.floor(total / 2)) speech.speak(PLAYER.halfTime);
    if (remaining <= 0) {
      if (timerId) window.clearInterval(timerId);
      done();
      return;
    }
    draw();
  }, 1000);
}

function ringSet(fg: HTMLElement, frac: number): void {
  fg.style.strokeDasharray = String(CIRC);
  fg.style.strokeDashoffset = String(CIRC * (1 - frac));
}

/* ---------------- 休息 ---------------- */
function doRest(q: Extract<QueueItem, { type: 'rest' }>): void {
  showView('restView');
  $('restNext').textContent = PLAYER.restNext(q.next);
  total = q.sec;
  remaining = q.sec;
  speech.speak('休息');
  setPaused(false);
  startTimer('ringFg2', 'restTime', () => {
    idx++;
    step();
  });
}

/* ---------------- 视频分段动作 ---------------- */
function doVWork(q: Extract<QueueItem, { type: 'vwork' }>): void {
  mode = 'video';
  showView('workView');
  const sg = q.seg;
  $('demoStage').style.display = 'none';
  $('ringWrap').style.display = 'none';
  $('repsWrap').hidden = true;
  const v = $('plVideo') as HTMLVideoElement;
  v.hidden = false;
  $('vProgWrap').hidden = false;
  $('speedRow').hidden = false;
  if (v.dataset.src !== videoSrc && videoSrc) {
    v.src = videoSrc;
    v.dataset.src = videoSrc ?? '';
  }
  $('plName').textContent = sg.name;
  $('plSetInfo').textContent = PLAYER.setInfoVideo(q.set, sg.sets);
  $('plCues').innerHTML = PLAYER.videoCues.map((c) => `<li>${c}</li>`).join('');
  $('vDur').textContent = fmt(sg.end - sg.start);
  $('vProg').style.width = '0%';
  $('vTime').textContent = '0:00';
  setPaused(false);
  setMusic(sg.style);
  v.playbackRate = speed || 1;
  try {
    v.currentTime = sg.start;
  } catch {
    /* ignore */
  }
  void v.play().catch(() => {});
  speech.speak(`${sg.name}，开始`);
  v.ontimeupdate = () => {
    if (paused || $('player').hidden) return;
    const len = sg.end - sg.start;
    const cur = Math.min(v.currentTime, sg.end) - sg.start;
    $('vProg').style.width = Math.max(0, Math.min(100, (cur / len) * 100)) + '%';
    $('vTime').textContent = fmt(Math.max(0, cur));
    if (v.currentTime >= sg.end - 0.15) {
      v.ontimeupdate = null;
      v.pause();
      advance();
    }
  };
}

/* ---------------- 结束 ---------------- */
function finishWorkout(): void {
  if (timerId) window.clearInterval(timerId);
  const mins = Math.max(1, Math.round((Date.now() - startStamp - pausedMs) / 60000));
  stopAllAudio();
  (function () {
    const sumTime = $('sumTime');
    sumTime.innerHTML = mins + '<small style="font-size:11px;color:var(--muted)">' + TOAST.minutesUnit + '</small>';
    const unit = mode === 'video' ? TOAST.countUnitSeg : TOAST.countUnitGe;
    $('sumCount').innerHTML = listLen + '<small style="font-size:11px;color:var(--muted)">' + unit + '</small>';
    $('sumKcal').innerHTML =
      Math.round(mins * 3.5) + '<small style="font-size:11px;color:var(--muted)">' + TOAST.kcalUnit + '</small>';
  })();
  showView('rpeView');
}

function stopAllAudio(): void {
  music.stop();
  ($('userAudio') as HTMLAudioElement).pause();
  speech.cancel();
}

function saveWorkout(rpe: Rpe): void {
  const mins = Math.max(1, Math.round((Date.now() - startStamp - pausedMs) / 60000));
  const unit: '个' | '段' = mode === 'video' ? '段' : '个';
  void addWorkout({
    date: todayStr(),
    title,
    minutes: mins,
    count: listLen,
    countUnit: unit,
    rpe,
  });
}

/* ---------------- RPE 与小结 ---------------- */
function bindRpe(): void {
  const box = $('rpeBtns');
  box.innerHTML = RPE_OPTIONS.map(
    (o) =>
      `<button class="rpe" data-rpe="${o.v}"><span class="e">${o.emoji}</span>${o.label}<br><small style="color:var(--muted)">${o.sub}</small></button>`
  ).join('');
  box.querySelectorAll('.rpe').forEach((b) => {
    (b as HTMLElement).onclick = () => {
      const rpe = (b as HTMLElement).dataset.rpe as Rpe;
      $('adaptText').textContent = RPE_ADVICE[rpe];
      $('encCard').innerHTML = '💛 ' + pick(scenario() === 'postpartum' ? ENCS_POSTPARTUM : ENCS_GENERAL);
      saveWorkout(rpe);
      window.setTimeout(() => {
        showView('summaryView');
        ctx.onSaved();
      }, 450);
    };
  });
}

/* ---------------- 控制 ---------------- */
export function initPlayer(c: PlayerCtx): void {
  ctx = c;
  bindRpe();

  $('plPause').onclick = () => setPaused(!paused);
  $('plSkip').onclick = () => {
    if (timerId) window.clearInterval(timerId);
    idx++;
    step();
  };
  $('restSkip').onclick = () => {
    if (timerId) window.clearInterval(timerId);
    idx++;
    step();
  };
  $('plClose').onclick = () => {
    if (confirmDialog(PLAYER.exitConfirm)) {
      exitWorkout();
    }
  };
  $('sumBtn').onclick = () => {
    closePlayer();
    toast(TOAST.workoutSaved);
  };
  $('voiceToggle').onclick = (e) => {
    voiceOn = !voiceOn;
    (e.currentTarget as HTMLElement).classList.toggle('on', voiceOn);
    speech.setEnabled(voiceOn);
  };
  $('musicToggle').onclick = (e) => {
    musicOn = !musicOn;
    (e.currentTarget as HTMLElement).classList.toggle('on', musicOn);
    if (!musicOn) {
      music.stop();
      ($('userAudio') as HTMLAudioElement).pause();
      toast(TOAST.musicOff);
    } else if (currentStyle) {
      setMusic(currentStyle);
      toast(TOAST.musicOn);
    }
  };
  $('speedBtn').onclick = (e) => {
    speed = speed === 1 ? 0.75 : 1;
    (e.currentTarget as HTMLElement).textContent = speed + 'x';
    ($('plVideo') as HTMLVideoElement).playbackRate = speed;
    toast(speed === 1 ? VIDEO.normalToast : VIDEO.slowToast);
  };
}

function exitWorkout(): void {
  if (timerId) window.clearInterval(timerId);
  // 已完成部分写入历史（PRD §F1：退出/异常中断时已完成部分必须写入）
  const mins = Math.max(1, Math.round((Date.now() - startStamp - pausedMs) / 60000));
  if (completedWorks > 0) {
    const unit: '个' | '段' = mode === 'video' ? '段' : '个';
    void addWorkout({
      date: todayStr(),
      title: title + ' · 未完成',
      minutes: mins,
      count: completedWorks,
      countUnit: unit,
      partial: true,
    });
    ctx.onSaved();
  }
  closePlayer();
}

function closePlayer(): void {
  $('player').hidden = true;
  document.body.style.overflow = '';
  const v = $('plVideo') as HTMLVideoElement;
  v.pause();
  v.ontimeupdate = null;
  v.removeAttribute('src');
  v.load();
  stopAllAudio();
  ctx.onClosed?.();
}

/* ---------------- 入口（供其他模块调用） ---------------- */
export function startAnimWorkout(list: Exercise[], t: string): void {
  mode = 'anim';
  listLen = list.length;
  buildAnimQueue(list);
  music.ensure();
  launchPlayer(t);
}

export function startVideoWorkout(segs: VideoSegment[], src: string): void {
  mode = 'video';
  listLen = segs.length;
  videoSrc = src;
  buildVideoQueue(segs);
  music.ensure();
  speed = 1;
  $('speedBtn').textContent = '1x';
  launchPlayer(VIDEO.segWorkoutTitle);
}

function safeQuery(sel: string): HTMLElement | null {
  return document.querySelector(sel);
}

export function isPlayerOpen(): boolean {
  return !$('player').hidden;
}
