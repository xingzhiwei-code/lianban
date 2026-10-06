// 首页（PRD §F4/F5/F10）：问候、推荐课、当天自适应、温和模式、小贴士、本周打卡
import { COURSES, SCENARIOS } from '../core/scenarios';
import { EXERCISES, findExercise } from '../core/exercises';
import { scenario, isPostpartum, gentleMode } from '../core/state';
import { listMeasures, listWorkouts } from '../core/db';
import { dateLineStr, pick, todayStr, confirmDialog } from './util';
import { startAnimWorkout } from './player';
import { goTab } from './tabs';
import {
  DATE_LINE_SUFFIX,
  GREET_SUFFIX,
  HOME,
  TOAST,
  TIPS,
  greetingByHour,
} from '../content/copy';
import type { Exercise } from '../core/types';

function exSec(ex: Exercise): number {
  if (ex.kind === 'time') return ex.work * ex.sets + (ex.rest || 0) * ex.sets;
  return ex.reps * 3 * ex.sets + (ex.rest || 0) * ex.sets;
}

function courseList(): Exercise[] {
  const c = COURSES[scenario()];
  return c.list.map((n) => findExercise(n)).filter((e): e is Exercise => !!e);
}

/* 本周打卡 */
function weekDates(): { day: string; label: string; isToday: boolean }[] {
  const d = new Date();
  const names = ['一', '二', '三', '四', '五', '六', '日'];
  const res: { day: string; label: string; isToday: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - i);
    res.push({
      day: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
        dt.getDate()
      ).padStart(2, '0')}`,
      label: names[(dt.getDay() + 6) % 7],
      isToday: i === 0,
    });
  }
  return res;
}

export async function renderHome(onScenarioSwitch: () => void): Promise<void> {
  const wrap = document.querySelector('#tab-home .wrap')!;
  const sc = scenario();
  const S = SCENARIOS[sc];
  const c = COURSES[sc];
  const list = courseList();
  const mins = Math.max(5, Math.round(list.reduce((a, e) => a + exSec(e), 0) / 60));
  const kcal = Math.round(mins * 3.5);

  const [workouts, weights] = await Promise.all([
    listWorkouts(200),
    listMeasures('weight'),
  ]);

  const doneSet = new Set(workouts.map((w) => w.date));
  const week = weekDates();
  const weekCount = week.filter((w) => doneSet.has(w.day)).length;

  // 连续打卡天数
  let streak = 0;
  const cur = new Date();
  const d0 = new Date(cur);
  d0.setDate(cur.getDate() - 0);
  const todayKey = todayStr();
  let cursor = new Date(cur);
  if (!doneSet.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  while (true) {
    const k = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate()
    ).padStart(2, '0')}`;
    if (doneSet.has(k)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  const weekMinutes = workouts
    .filter((w) => week.some((x) => x.day === w.date))
    .reduce((a, w) => a + w.minutes, 0);
  const lastWeight = weights.length ? weights[weights.length - 1].value : null;
  const weightDelta =
    weights.length >= 2
      ? weights[weights.length - 1].value - weights[0].value
      : 0;

  const greetSuffix = GREET_SUFFIX[sc] ?? '';
  const tip = pick(TIPS[sc]);
  const tipEyebrow = isPostpartum() ? HOME.tipEyebrowPostpartum : HOME.tipEyebrow;
  const quietTitle = isPostpartum() ? HOME.adapt.quietTitlePostpartum : HOME.adapt.quietTitle;

  wrap.innerHTML = `
    <div class="row-between" style="margin-bottom:2px">
      <h1 class="hello"><span class="wave">👋</span> <span id="greetTime">${greetingByHour(
        new Date().getHours()
      )}${greetSuffix}</span></h1>
      <button class="scen-pill" id="scenSwitch">${S.emoji} ${S.name} <small>· 切换</small></button>
    </div>
    <p class="date-line">${dateLineStr()}${DATE_LINE_SUFFIX}</p>

    <div class="safety" id="safetyBanner" ${gentleMode() ? '' : 'hidden'}>${HOME.safeBanner}</div>

    <div class="card tint-coral">
      <div class="row-between">
        <div class="hero-emoji">${c.emoji}</div>
        <div style="text-align:right">${c.pills
          .map((t) => `<span class="pill">${t}</span>`)
          .join(' ')}</div>
      </div>
      <p class="title" style="margin-top:10px">${c.title}</p>
      <p class="sub">${S.desc}</p>
      <div class="meta">
        <span class="pill">⏱ 约${mins}分钟</span>
        <span class="pill">🏋️ ${list.length}个动作</span>
        <span class="pill">🔥 约${kcal}kcal（估算）</span>
      </div>
      <button class="btn btn-primary" id="startBtn">开始跟练 ▶</button>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px">${HOME.stateTitle}</p>
      <p class="sub">${HOME.stateSub}</p>
      <div class="chips" id="adaptChips">
        <button class="chip" data-ad="fast">${HOME.adapt.fast}</button>
        <button class="chip" data-ad="quiet">${HOME.adapt.quiet}</button>
        <button class="chip" data-ad="easy">${HOME.adapt.easy}</button>
      </div>
    </div>

    <div class="card tip-card" id="goVideoCard" style="cursor:pointer">
      <div class="t-emoji">🎬</div>
      <div><p class="eyebrow">${HOME.videoCardEyebrow}</p><p>${HOME.videoCardText}</p></div>
    </div>

    <div class="card tip-card">
      <div class="t-emoji">💧</div>
      <div><p class="eyebrow">${tipEyebrow}</p><p>${tip}</p></div>
    </div>

    <div class="card">
      <div class="row-between"><p class="title" style="font-size:16px">${HOME.weekCard}</p><span class="small">${HOME.weekCount(
        weekCount
      )}</span></div>
      <div class="dots">${week
        .map(
          (w) =>
            `<div class="dot${doneSet.has(w.day) ? ' done' : ''}${w.isToday ? ' today' : ''}">${
              w.label
            }</div>`
        )
        .join('')}</div>
      <p class="sub" style="margin-top:10px">${HOME.streakText(streak)}</p>
    </div>

    <div class="stat3" style="margin-bottom:14px">
      <div class="stat"><b>${lastWeight != null ? lastWeight.toFixed(1) : '--'}<small style="font-size:11px;color:var(--muted)">kg</small></b><span>${HOME.stats.weight} · ${
        weightDelta < 0 ? '↓' : weightDelta > 0 ? '↑' : '持平→'
      }</span></div>
      <div class="stat"><b>${weekMinutes}<small style="font-size:11px;color:var(--muted)">分</small></b><span>${HOME.stats.minutes}</span></div>
      <div class="stat"><b>${streak}<small style="font-size:11px;color:var(--muted)">天</small></b><span>${HOME.stats.streak}</span></div>
    </div>
  `;

  // 交互绑定
  document.getElementById('startBtn')!.onclick = async () => {
    if (gentleMode() && !(await confirmDialog(TOAST.startConfirm))) return;
    startAnimWorkout(courseList(), c.title);
  };

  document.getElementById('scenSwitch')!.onclick = async () => {
    if (!(await confirmDialog(TOAST.switchConfirm))) return;
    onScenarioSwitch();
  };

  document.getElementById('goVideoCard')!.onclick = () => goTab('tab-video');

  document.getElementById('adaptChips')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('.chip') as HTMLElement | null;
    if (!b) return;
    const pool = EXERCISES.filter((x) => x.scen.includes(sc));
    let pick: Exercise[] = [];
    let t = '';
    const ad = b.dataset.ad;
    if (ad === 'fast') {
      pick = pool.slice(0, 4);
      t = HOME.adapt.fastTitle;
    } else if (ad === 'quiet') {
      pick = pool.filter((x) => x.impact === '低').slice(0, 5);
      t = quietTitle;
    } else if (ad === 'easy') {
      pick = pool.filter((x) => x.lv === 1).slice(0, 5);
      t = HOME.adapt.easyTitle;
    }
    if (!pick.length) pick = pool.slice(0, 4);
    const list1 = pick.map((x) => ({ ...x, sets: 1 }));
    startAnimWorkout(list1, t);
  });
}
