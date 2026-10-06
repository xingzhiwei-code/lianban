// 动作库（PRD §F2/F3）：搜索 / 筛选 / 安全过滤开关 / 详情弹窗 / 自建跟练
import { EXERCISES, LV_NAME, findExercise, isDraUnsafe } from '../core/exercises';
import { scenario } from '../core/state';
import { SCENARIOS } from '../core/scenarios';
import { demoSvg } from '../anim/stickfigure';
import { startAnimWorkout } from './player';
import { $, escapeHtml, toast } from './util';
import { LIB } from '../content/copy';
import type { Exercise } from '../core/types';

const LF = { q: '', part: '全部', lv: '全部', safeOnly: true };
let selectMode = false;
const selected = new Set<string>();

function scenExercises(): Exercise[] {
  const sc = scenario();
  return LF.safeOnly ? EXERCISES.filter((e) => e.scen.includes(sc)) : EXERCISES.slice();
}

function safePillHtml(ex: Exercise): string {
  return (ex.safe || [])
    .map((s) => {
      const warn = s.indexOf('不安全') >= 0;
      return `<span class="safe-pill${warn ? ' warn' : ''}">${escapeHtml(s)}</span>`;
    })
    .join('');
}

function renderList(): void {
  const box = $('libList');
  const sc = scenario();
  const S = SCENARIOS[sc];
  $('safeNote').textContent = LF.safeOnly ? LIB.safeOn(S.name) : LIB.safeOff;
  $('libSub').textContent = LIB.count(EXERCISES.length);

  let list = scenExercises();
  if (LF.part !== '全部') list = list.filter((e) => e.tag === LF.part);
  if (LF.lv !== '全部') list = list.filter((e) => e.lv === Number(LF.lv));
  if (LF.q) list = list.filter((e) => e.name.indexOf(LF.q) >= 0);

  if (!list.length) {
    box.innerHTML = `<p class="sub" style="text-align:center;padding:20px">${LIB.noResult}</p>`;
    box.classList.toggle('selecting', selectMode);
    return;
  }

  box.innerHTML = list
    .map((ex) => {
      const isSel = selected.has(ex.name);
      const safe = safePillHtml(ex);
      return `<div class="lib-row${isSel ? ' sel' : ''}" data-name="${escapeHtml(ex.name)}">
        <div class="lib-top">
          <div class="sel-dot"></div>
          <div class="lib-emoji">${ex.emoji}</div>
          <div style="flex:1">
            <div class="lib-name">${escapeHtml(ex.name)}</div>
            <div class="lib-tags"><span class="pill">${ex.tag}</span><span class="pill blue">${
        LV_NAME[ex.lv]
      }</span><span class="pill green">${ex.impact}冲击</span></div>
            ${safe ? `<div class="lib-tags">${safe}</div>` : ''}
          </div>
          <div class="stars">${'★'.repeat(ex.lv)}${'☆'.repeat(3 - ex.lv)}</div>
        </div>
      </div>`;
    })
    .join('');
  box.classList.toggle('selecting', selectMode);

  box.querySelectorAll<HTMLElement>('.lib-row').forEach((row) => {
    row.onclick = () => {
      const name = row.dataset.name!;
      if (selectMode) {
        if (selected.has(name)) {
          selected.delete(name);
          row.classList.remove('sel');
        } else {
          selected.add(name);
          row.classList.add('sel');
        }
        paintBuildBar();
      } else {
        const ex = findExercise(name);
        if (ex) openDetail(ex);
      }
    };
  });
  paintBuildBar();
}

function paintBuildBar(): void {
  const n = selected.size;
  $('buildBar').hidden = !(selectMode && n > 0);
  $('buildCount').textContent = LIB.buildCount(n);
}

function openDetail(ex: Exercise): void {
  const unit =
    ex.kind === 'time' ? `${ex.work}秒 × ${ex.sets}组` : `${ex.reps}次 × ${ex.sets}组`;
  const safe = safePillHtml(ex);
  const hasWarn = isDraUnsafe(ex);
  $('libModalBody').innerHTML = `
    <div class="row-between"><p class="title">${escapeHtml(ex.name)}</p><button class="pl-close" id="libModalX">✕</button></div>
    <div class="meta"><span class="pill">${ex.tag}</span><span class="pill blue">${
    LV_NAME[ex.lv]
  }</span><span class="pill green">${ex.impact}冲击</span><span class="pill">${unit}</span><span class="pill">${ex.equip}</span></div>
    ${safe ? `<div class="meta">${safe}</div>` : ''}
    <div class="modal-demo"><svg id="modalDemo" viewBox="0 0 200 160"></svg></div>
    <p class="eyebrow">${LIB.cuesTitle}</p>
    <ul class="pl-cues">${ex.cues.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    ${ex.reg ? `<div class="adapt-card">⬇️ <b>${LIB.regTitle}：</b>${escapeHtml(ex.reg)}</div>` : ''}
    ${ex.prog ? `<div class="enc-card">⬆️ <b>${LIB.progTitle}：</b>${escapeHtml(ex.prog)}</div>` : ''}
    ${hasWarn ? `<p class="small" style="color:#C2502F;margin-bottom:12px">${LIB.draWarn}</p>` : ''}
    <div class="btn-row"><button class="btn btn-ghost" id="mAdd">${LIB.addToList}</button><button class="btn btn-primary" id="mGo">${LIB.startSingle}</button></div>`;

  $('modalDemo').innerHTML = demoSvg(ex.demo);

  const modal = $('libModal');
  const close = () => {
    modal.hidden = true;
    $('modalDemo').innerHTML = '';
  };
  modal.hidden = false;
  $('libModalX').onclick = close;
  $('mAdd').onclick = () => {
    selected.add(ex.name);
    close();
    toast(LIB.addedToast);
    paintBuildBar();
  };
  $('mGo').onclick = () => {
    close();
    startAnimWorkout([ex], LIB.singleTitle(ex.name));
  };
}

export function refreshLibrary(): void {
  renderList();
}

export function initLibrary(): void {
  // 进入动作库时重置筛选与多选状态
  LF.q = '';
  LF.part = '全部';
  LF.lv = '全部';
  LF.safeOnly = true;
  selectMode = false;
  selected.clear();

  const wrap = document.querySelector('#tab-lib .wrap')!;
  wrap.innerHTML = `
    <div class="row-between">
      <h1 class="hello" style="font-size:22px">${LIB.title}</h1>
      <button class="mini-btn" id="selModeBtn">${LIB.selfBuild}</button>
    </div>
    <p class="date-line" id="libSub"></p>
    <input class="field search" id="libSearch" placeholder="${LIB.searchPlaceholder}">
    <p class="frow-label">${LIB.partLabel}</p>
    <div class="chips" id="fPart" style="margin-top:6px">
      <button class="chip on" data-v="全部">全部</button>
      <button class="chip" data-v="全身">全身</button>
      <button class="chip" data-v="臀腿">臀腿</button>
      <button class="chip" data-v="上肢">上肢</button>
      <button class="chip" data-v="核心">核心</button>
      <button class="chip" data-v="放松">放松</button>
    </div>
    <p class="frow-label">${LIB.lvLabel}</p>
    <div class="chips" id="fLv" style="margin-top:6px">
      <button class="chip on" data-v="全部">全部</button>
      <button class="chip" data-v="1">新手友好</button>
      <button class="chip" data-v="2">进阶</button>
      <button class="chip" data-v="3">挑战</button>
    </div>
    <div class="row-between" style="margin:12px 0 4px">
      <span class="small" id="safeNote"></span>
      <button class="switch on" id="safeToggle" aria-label="安全过滤开关" style="transform:scale(.85)"></button>
    </div>
    <div id="libList" style="margin-top:8px"></div>
    <p class="safety-foot">${LIB.safetyFoot}</p>
  `;

  bindFilter('fPart', 'part');
  bindFilter('fLv', 'lv');

  $('libSearch').addEventListener('input', (e) => {
    LF.q = (e.target as HTMLInputElement).value.trim();
    renderList();
  });

  $('safeToggle').onclick = (e) => {
    LF.safeOnly = !LF.safeOnly;
    (e.currentTarget as HTMLElement).classList.toggle('on', LF.safeOnly);
    renderList();
  };

  $('selModeBtn').onclick = (e) => {
    selectMode = !selectMode;
    (e.currentTarget as HTMLElement).textContent = selectMode ? LIB.selfBuildDone : LIB.selfBuild;
    if (!selectMode) selected.clear();
    renderList();
  };

  $('buildGo').onclick = () => {
    const list = [...selected].map((n) => findExercise(n)).filter((e): e is Exercise => !!e);
    if (!list.length) return;
    selectMode = false;
    selected.clear();
    $('selModeBtn').textContent = LIB.selfBuild;
    renderList();
    startAnimWorkout(list, LIB.buildTitle(list.length));
  };

  $('libModal').addEventListener('click', (e) => {
    if (e.target === $('libModal')) {
      $('libModal').hidden = true;
      $('modalDemo').innerHTML = '';
    }
  });

  renderList();
}

function bindFilter(id: string, key: 'part' | 'lv'): void {
  $(id).addEventListener('click', (e) => {
    const c = (e.target as HTMLElement).closest('.chip') as HTMLElement | null;
    if (!c) return;
    $(id)
      .querySelectorAll('.chip')
      .forEach((x) => x.classList.remove('on'));
    c.classList.add('on');
    if (key === 'part') LF.part = c.dataset.v!;
    else LF.lv = c.dataset.v!;
    renderList();
  });
}
