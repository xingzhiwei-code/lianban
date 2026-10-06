// 数据页（PRD §F8/F9/F12）：体重曲线 / 围度 / 营养打卡 / 训练历史 / 导出删除
import {
  addMeasure,
  deleteAllData,
  exportAllData,
  getNutrition,
  listMeasures,
  listWorkouts,
  saveNutrition,
} from '../core/db';
import { scenario } from '../core/state';
import { DATA, RPE_LABEL } from '../content/copy';
import { $, confirmDialog, dateLabel, downloadText, escapeHtml, promptNumber, toast, todayStr } from './util';
import type { Measure, Nutrition, Workout } from '../core/types';

interface DataCtx {
  onCleared: () => void;
}

let ctx: DataCtx = { onCleared: () => {} };

async function latest(kind: Measure['kind']): Promise<Measure[]> {
  return listMeasures(kind);
}

function trendOf(list: Measure[]): { value: number | null; trend: 'down' | 'up' | 'flat' | 'none' } {
  if (!list.length) return { value: null, trend: 'none' };
  const last = list[list.length - 1].value;
  if (list.length < 2) return { value: last, trend: 'none' };
  const prev = list[list.length - 2].value;
  return { value: last, trend: last < prev ? 'down' : last > prev ? 'up' : 'flat' };
}

function drawWeightChart(weights: Measure[]): void {
  const cv = $('weightChart') as HTMLCanvasElement;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 300;
  const h = cv.clientHeight || 170;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const ctx2 = cv.getContext('2d');
  if (!ctx2) return;
  ctx2.scale(dpr, dpr);

  if (weights.length === 0) {
    ctx2.fillStyle = '#A2938A';
    ctx2.font = '12px sans-serif';
    ctx2.textAlign = 'center';
    ctx2.fillText('还没有体重记录，点「+ 记录」开始', w / 2, h / 2);
    return;
  }

  const values = weights.map((x) => x.value);
  const labels = weights.map((x) => dateLabel(x.date));
  const min = Math.min(...values) - 0.3;
  const max = Math.max(...values) + 0.3;
  const px = (i: number) => (values.length === 1 ? w / 2 : 30 + (i * (w - 60)) / (values.length - 1));
  const py = (v: number) => h - 24 - ((v - min) / (max - min)) * (h - 56);

  ctx2.strokeStyle = '#F1E7DD';
  ctx2.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const y = 16 + (g * (h - 56)) / 3;
    ctx2.beginPath();
    ctx2.moveTo(24, y);
    ctx2.lineTo(w - 8, y);
    ctx2.stroke();
  }
  const grad = ctx2.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#FF7E67');
  grad.addColorStop(1, '#EF5F45');
  ctx2.strokeStyle = grad;
  ctx2.lineWidth = 3;
  ctx2.lineJoin = 'round';
  ctx2.beginPath();
  values.forEach((v, i) => (i ? ctx2.lineTo(px(i), py(v)) : ctx2.moveTo(px(i), py(v))));
  ctx2.stroke();
  values.forEach((v, i) => {
    ctx2.fillStyle = '#FF7E67';
    ctx2.beginPath();
    ctx2.arc(px(i), py(v), 5, 0, 7);
    ctx2.fill();
    ctx2.fillStyle = '#fff';
    ctx2.beginPath();
    ctx2.arc(px(i), py(v), 2.2, 0, 7);
    ctx2.fill();
  });
  ctx2.fillStyle = '#A2938A';
  ctx2.font = '11px sans-serif';
  ctx2.textAlign = 'center';
  labels.forEach((l, i) => ctx2.fillText(l, px(i), h - 6));
}

async function renderNutrition(): Promise<void> {
  const n = (await getNutrition(todayStr())) ?? {
    date: todayStr(),
    waterMl: 0,
    proteinG: 0,
    calcium: false,
  };
  paintNutrition(n);
}

function paintNutrition(n: Nutrition): void {
  $('waterBar').style.width = Math.min(100, (n.waterMl / 2000) * 100) + '%';
  $('waterText').textContent = `${n.waterMl} / 2000 ml`;
  $('proteinBar').style.width = Math.min(100, (n.proteinG / 90) * 100) + '%';
  $('proteinText').textContent = `${n.proteinG} / 90 g`;
  ($('calciumCheck') as HTMLInputElement).checked = n.calcium;
}

async function mutateNutrition(fn: (n: Nutrition) => void): Promise<void> {
  const n = (await getNutrition(todayStr())) ?? {
    date: todayStr(),
    waterMl: 0,
    proteinG: 0,
    calcium: false,
  };
  fn(n);
  await saveNutrition(n);
  paintNutrition(n);
}

async function renderHistory(): Promise<void> {
  const hist = await listWorkouts(20);
  const box = $('histList');
  if (!hist.length) {
    box.innerHTML = `<p class="sub" style="text-align:center;padding:16px">${DATA.histEmpty}</p>`;
    return;
  }
  box.innerHTML = hist
    .map((h) => {
      const rpe = h.rpe ? RPE_LABEL[h.rpe] : (h.partial ? '⏹ 未完成' : '');
      return `<div class="hist-row">
        <div class="hist-emoji">🏋️</div>
        <div style="flex:1"><b>${escapeHtml(h.title)}</b><span class="small">${dateLabel(
        h.date
      )} · 约${h.minutes}分钟 · ${h.count}${h.countUnit}</span></div>
        <span class="small">${rpe}</span>
      </div>`;
    })
    .join('');
}

function sanitizeExport(data: Record<string, unknown>): Record<string, unknown> {
  const videos = (data.videos as { name: string; size: number; duration: number; segments: unknown[] }[]).map(
    (v) => ({ name: v.name, size: v.size, duration: v.duration, segments: v.segments })
  );
  const audioBinds = (data.audioBinds as { style: string; name: string }[]).map((b) => ({
    style: b.style,
    name: b.name,
  }));
  return { ...data, videos, audioBinds };
}

export function initDataPage(c: DataCtx): void {
  ctx = c;
  const wrap = document.querySelector('#tab-data .wrap')!;
  const isPP = scenario() === 'postpartum';
  wrap.innerHTML = `
    <h1 class="hello" style="font-size:22px">${DATA.title}</h1>
    <p class="date-line">${DATA.sub}</p>

    <div class="card">
      <div class="row-between"><p class="title" style="font-size:16px">${DATA.weightTitle}</p><button class="mini-btn" id="addWeightBtn">${DATA.addRecord}</button></div>
      <p style="font-size:26px;font-weight:800;margin:6px 0"><span id="weightNow">--</span><small style="font-size:13px;color:var(--muted)"> ${DATA.weightUnit} · ${DATA.weightRecent} <span id="weightDelta" class="trend flat"></span></small></p>
      <canvas class="chart" id="weightChart"></canvas>
      <p class="sub" style="margin-top:8px">${DATA.weightTip}</p>
    </div>

    <div class="card">
      <div class="row-between"><p class="title" style="font-size:16px">${DATA.measTitle}</p><button class="mini-btn" id="addMeasBtn">${DATA.addRecord}</button></div>
      <div class="meas-grid" style="margin-top:12px">
        <div class="meas"><b id="measWaist">--</b><span>${DATA.measKind.waist}</span><div class="trend" id="trendWaist"></div></div>
        <div class="meas"><b id="measHip">--</b><span>${DATA.measKind.hip}</span><div class="trend" id="trendHip"></div></div>
        <div class="meas"><b id="measThigh">--</b><span>${DATA.measKind.thigh}</span><div class="trend" id="trendThigh"></div></div>
      </div>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px;margin-bottom:12px">${isPP ? DATA.nutriTitlePostpartum : DATA.nutriTitle}</p>
      <div class="nutri-row">
        <div class="nutri-emoji">💧</div>
        <div class="nutri-info"><b>${DATA.water}</b><div class="progress" style="margin-top:6px"><i id="waterBar" style="width:0%"></i></div><span class="small" id="waterText"></span></div>
        <button class="mini-btn" id="waterAdd">${DATA.waterAdd}</button>
      </div>
      <div class="nutri-row">
        <div class="nutri-emoji">🍗</div>
        <div class="nutri-info"><b>${DATA.protein}</b><div class="progress leaf" style="margin-top:6px"><i id="proteinBar" style="width:0%"></i></div><span class="small" id="proteinText"></span></div>
        <button class="mini-btn" id="proteinAdd">${DATA.proteinAdd}</button>
      </div>
      <div class="nutri-row">
        <div class="nutri-emoji">🦴</div>
        <div class="nutri-info"><b>${DATA.calcium}</b><br><span class="small">${isPP ? DATA.calciumPostpartumNote : DATA.calciumNote}</span></div>
        <label class="checkbox-row"><input type="checkbox" id="calciumCheck"> ${DATA.calciumNote}</label>
      </div>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px;margin-bottom:6px">${DATA.histTitle}</p>
      <div id="histList"></div>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px">${DATA.settingsTitle}</p>
      <p class="sub" style="margin:6px 0 12px">${DATA.settingsSub}</p>
      <button class="btn btn-ghost" id="exportBtn">${DATA.exportBtn}</button>
      <button class="btn btn-ghost" id="deleteBtn" style="margin-top:10px;color:#C2502F">${DATA.deleteBtn}</button>
    </div>
  `;

  // 体重
  $('addWeightBtn').onclick = async () => {
    const v = promptNumber(DATA.weightPrompt, '51.0', 30, 150);
    if (v === null) return;
    if (isNaN(v)) {
      toast(DATA.weightInvalid);
      return;
    }
    await addMeasure('weight', todayStr(), v);
    toast(DATA.weightSaved);
    await refreshCharts();
  };

  // 围度
  $('addMeasBtn').onclick = async () => {
    const kindRaw = window.prompt('记录哪一项？输入：腰 / 臀 / 大腿', '腰');
    if (!kindRaw) return;
    const map: Record<string, Exclude<Measure['kind'], 'weight'>> = {
      腰: 'waist',
      臀: 'hip',
      大腿: 'thigh',
      大腿围: 'thigh',
    };
    const kind = map[kindRaw.trim()];
    if (!kind) {
      toast(DATA.measInvalid);
      return;
    }
    const v = promptNumber(DATA.measPromptKind(DATA.measKind[kind]), '68', 20, 200);
    if (v === null) return;
    if (isNaN(v)) {
      toast(DATA.measInvalid);
      return;
    }
    await addMeasure(kind, todayStr(), v);
    toast(DATA.measSaved);
    await refreshMeasures();
  };

  // 营养
  $('waterAdd').onclick = async () => {
    await mutateNutrition((n) => {
      n.waterMl += 250;
    });
    const n = await getNutrition(todayStr());
    if (n && n.waterMl >= 2000) toast(DATA.waterDone);
  };
  $('proteinAdd').onclick = () => {
    void mutateNutrition((n) => {
      n.proteinG += 10;
    });
  };
  $('calciumCheck').onchange = async (e) => {
    const checked = (e.target as HTMLInputElement).checked;
    await mutateNutrition((n) => {
      n.calcium = checked;
    });
    toast(checked ? DATA.calciumOn : DATA.calciumOff);
  };

  // 导出 / 删除
  $('exportBtn').onclick = async () => {
    const data = await exportAllData();
    const clean = sanitizeExport(data);
    downloadText(`lianban-data-${todayStr()}.json`, JSON.stringify(clean, null, 2));
    toast(DATA.exportToast);
  };
  $('deleteBtn').onclick = async () => {
    if (!confirmDialog(DATA.deleteConfirm)) return;
    await deleteAllData();
    toast(DATA.deletedToast);
    ctx.onCleared();
  };

  void refreshCharts();
  void refreshMeasures();
  void renderNutrition();
  void renderHistory();
}

let tabRefreshBound = false;
/** 切到数据 tab 时重绘（canvas 在隐藏状态下 clientWidth 为 0，需在可见后重绘） */
export function bindDataTabRefresh(): void {
  if (tabRefreshBound) return;
  tabRefreshBound = true;
  window.addEventListener('tabchange', ((e: CustomEvent<{ id: string }>) => {
    if (e.detail?.id === 'tab-data') {
      void refreshDataPage();
    }
  }) as EventListener);
}

async function refreshCharts(): Promise<void> {
  const weights = await latest('weight');
  drawWeightChart(weights);
  const last = weights.length ? weights[weights.length - 1].value : null;
  $('weightNow').textContent = last != null ? last.toFixed(1) : '--';
  const deltaEl = $('weightDelta');
  if (weights.length >= 2) {
    const d = weights[weights.length - 1].value - weights[0].value;
    deltaEl.textContent = (d <= 0 ? '' : '＋') + d.toFixed(1);
    deltaEl.className = 'trend ' + (d < 0 ? 'down' : 'flat');
  } else {
    deltaEl.textContent = DATA.weightFlat;
    deltaEl.className = 'trend flat';
  }
}

async function refreshMeasures(): Promise<void> {
  const kinds: Measure['kind'][] = ['waist', 'hip', 'thigh'];
  const ids = ['measWaist', 'measHip', 'measThigh'];
  const tids = ['trendWaist', 'trendHip', 'trendThigh'];
  for (let i = 0; i < kinds.length; i++) {
    const list = await latest(kinds[i]);
    const t = trendOf(list);
    $(ids[i]).innerHTML = t.value != null ? t.value.toFixed(1) + '<small style="font-size:11px">cm</small>' : '--';
    const te = $(tids[i]);
    if (t.trend === 'down') {
      te.textContent = DATA.trendDown(Math.abs(t.value! - list[list.length - 2].value).toFixed(1));
      te.className = 'trend down';
    } else if (t.trend === 'up') {
      te.textContent = `▲${Math.abs(t.value! - list[list.length - 2].value).toFixed(1)}`;
      te.className = 'trend flat';
    } else if (t.trend === 'flat') {
      te.textContent = DATA.trendFlat;
      te.className = 'trend flat';
    } else {
      te.textContent = '';
      te.className = 'trend';
    }
  }
}

export async function refreshDataPage(): Promise<void> {
  await refreshCharts();
  await refreshMeasures();
  await renderNutrition();
  await renderHistory();
}
