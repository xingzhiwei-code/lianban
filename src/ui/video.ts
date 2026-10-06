// 视频跟练（PRD §F6/F7）：本地导入 + 分段编辑器 + 分段跟练 + B站收藏 + 用户音频绑定
import {
  addBvFav,
  addVideo,
  deleteAudioBind,
  deleteBvFav,
  deleteVideo,
  listAudioBinds,
  listBvFavs,
  listVideos,
  saveAudioBind,
  updateVideo,
} from '../core/db';
import { state } from '../core/state';
import { MUSIC_LABEL, TOAST, VIDEO } from '../content/copy';
import { startVideoWorkout } from './player';
import { $, escapeHtml, fmt, parseT, toast } from './util';
import type { AudioBind, MusicStyle, VideoRecord, VideoSegment } from '../core/types';
import { MUSIC_STYLE_KEYS } from '../core/scenarios';

let currentId: number | null = null;
let currentVideo: VideoRecord | null = null;
let previewUrl: string | null = null;
let workoutUrl: string | null = null;

const STYLE_ORDER: MusicStyle[] = MUSIC_STYLE_KEYS;

function revokePreview(): void {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
}

export function revokeWorkoutUrl(): void {
  if (workoutUrl) {
    URL.revokeObjectURL(workoutUrl);
    workoutUrl = null;
  }
}

async function refreshVideos(selectId?: number | null): Promise<void> {
  const vids = await listVideos();
  const listBox = $('videoList');
  if (!vids.length) {
    listBox.innerHTML = `<p class="small">还没有导入视频，选一个自己的训练视频开始吧～</p>`;
    if (currentId != null) {
      currentId = null;
      currentVideo = null;
      revokePreview();
      ($('videoPreview') as HTMLVideoElement).hidden = true;
      $('segCard').hidden = true;
    }
    return;
  }
  listBox.innerHTML = vids
    .map((v) => {
      const active = v.id === selectId;
      return `<div class="lib-row" data-id="${v.id}" style="cursor:pointer">
        <div class="row-between">
          <div><b style="font-size:14px">🎬 ${escapeHtml(v.name)}</b><br>
          <span class="small">时长 ${fmt(v.duration)} · ${(v.size / 1048576).toFixed(1)}MB · ${
        v.segments.length
      } 段</span></div>
          <button class="mini-btn seg-del" data-del="${v.id}">删</button>
        </div>
      </div>`;
    })
    .join('');
  listBox.querySelectorAll<HTMLElement>('.lib-row').forEach((row) => {
    row.onclick = (e) => {
      if ((e.target as HTMLElement).classList.contains('seg-del')) return;
      const id = Number(row.dataset.id);
      void selectVideo(id);
    };
  });
  listBox.querySelectorAll<HTMLElement>('.seg-del').forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = Number((btn as HTMLElement).dataset.del);
      await deleteVideo(id);
      if (id === currentId) {
        currentId = null;
        currentVideo = null;
        revokePreview();
        ($('videoPreview') as HTMLVideoElement).hidden = true;
        $('segCard').hidden = true;
      }
      toast('已删除视频');
      await refreshVideos();
    };
  });
}

async function selectVideo(id: number): Promise<void> {
  const vids = await listVideos();
  const v = vids.find((x) => x.id === id);
  if (!v) return;
  currentId = id;
  currentVideo = v;
  revokePreview();
  previewUrl = URL.createObjectURL(v.blob);
  const pv = $('videoPreview') as HTMLVideoElement;
  pv.src = previewUrl;
  pv.hidden = false;
  $('videoMeta').textContent = `时长 ${fmt(v.duration)} · ${(v.size / 1048576).toFixed(1)}MB`;
  $('segCard').hidden = false;
  renderSegs();
  await refreshVideos(id);
}

function renderSegs(): void {
  if (!currentVideo) return;
  const segs = currentVideo.segments;
  const box = $('segList');
  box.innerHTML = '';
  $('startVideoBtn').hidden = segs.length === 0;
  $('segEmpty').style.display = segs.length ? 'none' : '';
  segs.forEach((sg, i) => {
    const row = document.createElement('div');
    row.className = 'seg-row';
    row.dataset.i = String(i);
    row.innerHTML = `
      <input class="field seg-name" value="${escapeHtml(sg.name)}">
      <div class="seg-times"><input class="field seg-start" value="${fmt(sg.start)}"><span>→</span><input class="field seg-end" value="${fmt(sg.end)}"></div>
      <div class="seg-times">
        <label class="small">组数 <input class="field num seg-sets" type="number" min="1" value="${sg.sets}"></label>
        <label class="small">休息 <input class="field num seg-rest" type="number" min="0" value="${sg.rest}">s</label>
        <label class="small">配乐 <select class="field seg-style" style="width:auto;padding:8px 6px">
          ${STYLE_ORDER.map((k) => `<option value="${k}"${sg.style === k ? ' selected' : ''}>${MUSIC_LABEL[k]}</option>`).join('')}
        </select></label>
        <button class="mini-btn seg-del">删除</button>
      </div>`;
    box.appendChild(row);
  });
}

function persistSegs(): void {
  if (!currentVideo) return;
  void updateVideo(currentVideo);
}

export function initVideo(): void {
  const wrap = document.querySelector('#tab-video .wrap')!;
  wrap.innerHTML = `
    <h1 class="hello" style="font-size:22px">${VIDEO.title}</h1>
    <p class="date-line">${VIDEO.sub}</p>

    <div class="card">
      <p class="title" style="font-size:16px">${VIDEO.importTitle}</p>
      <p class="sub">${VIDEO.importSub}</p>
      <input type="file" id="fileInput" accept="video/*" hidden>
      <button class="btn btn-primary" id="pickVideoBtn" style="margin-top:12px">${VIDEO.pickBtn}</button>
      <video id="videoPreview" hidden playsinline controls style="width:100%;border-radius:14px;margin-top:12px;background:#000"></video>
      <p class="small" id="videoMeta" style="margin-top:8px"></p>
      <div id="videoList" style="margin-top:12px"></div>
    </div>

    <div class="card" id="segCard" hidden>
      <div class="row-between"><p class="title" style="font-size:16px">${VIDEO.segTitle}</p>
        <div style="display:flex;gap:8px;align-items:center">
          <input class="field num" id="splitCount" type="number" value="4" min="2" max="12">
          <button class="mini-btn" id="autoSplitBtn">${VIDEO.autoSplit}</button>
        </div>
      </div>
      <p class="sub" style="margin:8px 0">${VIDEO.segSub}</p>
      <p class="sub" id="segEmpty">${VIDEO.segEmpty}</p>
      <div id="segList" style="margin-top:10px"></div>
      <button class="btn btn-ghost" id="segAddBtn" style="margin-top:6px">${VIDEO.addSeg}</button>
      <button class="btn btn-primary" id="startVideoBtn" hidden style="margin-top:10px">${VIDEO.startSeg}</button>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px">${VIDEO.bvTitle}</p>
      <p class="sub">${VIDEO.bvSub}</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input class="field" id="bvInput" placeholder="${VIDEO.bvPlaceholder}" style="flex:1">
        <button class="mini-btn" id="bvAdd" style="flex:none;padding:10px 18px">${VIDEO.bvAdd}</button>
      </div>
      <div id="bvList" style="margin-top:10px"></div>
    </div>

    <div class="card">
      <p class="title" style="font-size:16px">${VIDEO.musicTitle}</p>
      <p class="sub">${VIDEO.musicSub}</p>
      <div id="audioBindList" style="margin-top:6px"></div>
    </div>

    <p class="safety-foot">${VIDEO.safetyFoot}</p>
  `;

  const fileInput = $('fileInput') as HTMLInputElement;
  $('pickVideoBtn').onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    void handleImport(f);
  };

  // 分段编辑（事件委托）
  $('segList').addEventListener('change', (e) => {
    const t = e.target as HTMLElement;
    const row = t.closest('.seg-row') as HTMLElement | null;
    if (!row || !currentVideo) return;
    const sg = currentVideo.segments[Number(row.dataset.i)];
    if (!sg) return;
    const c = t.classList;
    if (c.contains('seg-name')) sg.name = (t as HTMLInputElement).value.trim() || sg.name;
    if (c.contains('seg-start')) {
      const v = parseT((t as HTMLInputElement).value);
      if (!isNaN(v)) {
        sg.start = Math.min(Math.max(0, v), currentVideo.duration);
        (t as HTMLInputElement).value = fmt(sg.start);
      } else {
        (t as HTMLInputElement).value = fmt(sg.start);
      }
    }
    if (c.contains('seg-end')) {
      const v = parseT((t as HTMLInputElement).value);
      if (!isNaN(v)) {
        sg.end = Math.min(Math.max(0, v), currentVideo.duration);
        (t as HTMLInputElement).value = fmt(sg.end);
      } else {
        (t as HTMLInputElement).value = fmt(sg.end);
      }
    }
    if (sg.end <= sg.start) sg.end = Math.min(currentVideo.duration, sg.start + 30);
    if (c.contains('seg-sets')) sg.sets = Math.max(1, parseInt((t as HTMLInputElement).value) || 1);
    if (c.contains('seg-rest')) sg.rest = Math.max(0, parseInt((t as HTMLInputElement).value) || 0);
    if (c.contains('seg-style')) sg.style = (t as HTMLSelectElement).value as MusicStyle;
    renderSegs();
    persistSegs();
  });

  $('segList').addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (!t.classList.contains('seg-del') || !currentVideo) return;
    const row = t.closest('.seg-row') as HTMLElement;
    currentVideo.segments.splice(Number(row.dataset.i), 1);
    renderSegs();
    persistSegs();
  });

  $('segAddBtn').onclick = () => {
    if (!currentVideo) return;
    currentVideo.segments.push({
      name: VIDEO.segDefaultName(currentVideo.segments.length + 1),
      start: 0,
      end: Math.min(60, currentVideo.duration),
      sets: 1,
      rest: 30,
      style: 'strength',
    });
    renderSegs();
    persistSegs();
  };

  $('autoSplitBtn').onclick = () => {
    if (!currentVideo || !currentVideo.duration) {
      toast(VIDEO.noVideoToast);
      return;
    }
    const n = Math.max(2, Math.min(12, parseInt(($('splitCount') as HTMLInputElement).value) || 4));
    const len = currentVideo.duration / n;
    currentVideo.segments = [];
    for (let i = 0; i < n; i++) {
      currentVideo.segments.push({
        name: VIDEO.segDefaultName(i + 1),
        start: Math.round(len * i),
        end: Math.round(len * (i + 1)),
        sets: 1,
        rest: 30,
        style: 'strength',
      });
    }
    renderSegs();
    persistSegs();
    toast(`已切成 ${n} 段 ✂️`);
  };

  $('startVideoBtn').onclick = () => {
    if (!currentVideo || !currentVideo.segments.length) {
      toast(VIDEO.noSegToast);
      return;
    }
    revokeWorkoutUrl();
    workoutUrl = URL.createObjectURL(currentVideo.blob);
    startVideoWorkout(currentVideo.segments, workoutUrl);
  };

  // B站收藏
  $('bvAdd').onclick = () => {
    const raw = ($('bvInput') as HTMLInputElement).value.trim();
    if (!raw) {
      toast(TOAST.bvNeedLink);
      return;
    }
    const m = raw.match(/BV[0-9A-Za-z]+/);
    const bvid = m ? m[0] : raw;
    const url = m
      ? `https://www.bilibili.com/video/${m[0]}`
      : /^https?:/.test(raw)
      ? raw
      : `https://${raw}`;
    void addBvFav(bvid, url).then(() => {
      ($('bvInput') as HTMLInputElement).value = '';
      toast(TOAST.bvSaved);
      void renderBv();
    });
  };

  void refreshVideos();
  void renderBv();
  void renderAudioBind();
}

async function handleImport(f: File): Promise<void> {
  // 临时读取时长
  const tmpUrl = URL.createObjectURL(f);
  const probe = document.createElement('video');
  probe.preload = 'metadata';
  probe.src = tmpUrl;
  probe.onloadedmetadata = () => {
    const duration = probe.duration || 0;
    URL.revokeObjectURL(tmpUrl);
    void addVideo({ name: f.name, size: f.size, duration, blob: f, segments: [] }).then(
      async (id) => {
        ($('fileInput') as HTMLInputElement).value = '';
        toast('视频已保存 ✨');
        await selectVideo(id);
      }
    );
  };
  probe.onerror = () => {
    URL.revokeObjectURL(tmpUrl);
    toast('这个文件读不出来，换个视频试试～');
  };
}

/* ---------------- B站收藏 ---------------- */
async function renderBv(): Promise<void> {
  const favs = await listBvFavs();
  const box = $('bvList');
  if (!favs.length) {
    box.innerHTML = `<p class="small">${VIDEO.bvEmpty}</p>`;
    return;
  }
  box.innerHTML = favs
    .map(
      (f) => `<div class="hist-row">
        <div class="hist-emoji">📺</div>
        <div style="flex:1"><b>${escapeHtml(f.bvid)}</b><br><span class="small">${VIDEO.bvGo}</span></div>
        <button class="mini-btn" data-go="${f.id}">${VIDEO.bvGo}</button>
        <button class="mini-btn" data-del="${f.id}" style="margin-left:6px">${VIDEO.bvDel}</button>
      </div>`
    )
    .join('');
  box.querySelectorAll<HTMLElement>('[data-go]').forEach((b) => {
    b.onclick = () => {
      const f = favs.find((x) => x.id === Number(b.dataset.go));
      if (f) window.open(f.url, '_blank');
    };
  });
  box.querySelectorAll<HTMLElement>('[data-del]').forEach((b) => {
    b.onclick = () => {
      void deleteBvFav(Number(b.dataset.del)).then(() => renderBv());
    };
  });
}

/* ---------------- 用户音频绑定 ---------------- */
async function renderAudioBind(): Promise<void> {
  const binds = await listAudioBinds();
  const box = $('audioBindList');
  box.innerHTML = '';
  STYLE_ORDER.forEach((style) => {
    const b = binds.find((x) => x.style === style);
    const row = document.createElement('div');
    row.className = 'au-row';
    const info = document.createElement('div');
    info.style.flex = '1';
    info.innerHTML = `<b style="font-size:14px">🎵 ${MUSIC_LABEL[style]}</b><br><span class="small">${
      b ? escapeHtml(b.name) : VIDEO.musicUnbound
    }</span>`;
    const wrap = document.createElement('div');
    const btn = document.createElement('button');
    btn.className = 'mini-btn';
    btn.textContent = b ? VIDEO.musicReplace : VIDEO.musicPick;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'audio/*';
    inp.hidden = true;
    btn.onclick = () => inp.click();
    inp.onchange = () => {
      const f = inp.files?.[0];
      if (!f) return;
      void bindAudio(style, f);
    };
    wrap.appendChild(btn);
    if (b) {
      const clr = document.createElement('button');
      clr.className = 'mini-btn';
      clr.textContent = VIDEO.musicClear;
      clr.style.marginLeft = '6px';
      clr.onclick = () => {
        const cached = state.audioUrls.get(style);
        if (cached) URL.revokeObjectURL(cached.url);
        state.audioUrls.delete(style);
        void deleteAudioBind(style).then(() => renderAudioBind());
      };
      wrap.appendChild(clr);
    }
    row.appendChild(info);
    row.appendChild(wrap);
    box.appendChild(row);
  });
}

async function bindAudio(style: MusicStyle, f: File): Promise<void> {
  const cached = state.audioUrls.get(style);
  if (cached) URL.revokeObjectURL(cached.url);
  const url = URL.createObjectURL(f);
  state.audioUrls.set(style, { name: f.name, url });
  const b: AudioBind = { style, name: f.name, blob: f };
  await saveAudioBind(b);
  toast(`已绑定到「${MUSIC_LABEL[style]}」🎵`);
  await renderAudioBind();
}

/** 应用启动时加载用户音频对象 URL 到内存缓存 */
export async function loadAudioBinds(): Promise<void> {
  const binds = await listAudioBinds();
  binds.forEach((b) => {
    state.audioUrls.set(b.style, { name: b.name, url: URL.createObjectURL(b.blob) });
  });
}
