// 静态页面骨架（动态内容由各模块渲染）
import { BRAND, BRAND_TAGLINE, LIB, PLAYER, OB } from '../content/copy';

const RING_WORK = `
<svg width="190" height="190" viewBox="0 0 190 190">
  <defs>
    <linearGradient id="gradRing" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF7E67"/>
      <stop offset="1" stop-color="#EF5F45"/>
    </linearGradient>
  </defs>
  <circle class="ring-bg" cx="95" cy="95" r="82"/>
  <circle class="ring-fg" id="ringFg" cx="95" cy="95" r="82"/>
</svg>`;

const RING_REST = `
<svg width="190" height="190" viewBox="0 0 190 190">
  <circle class="ring-bg" cx="95" cy="95" r="82"/>
  <circle class="ring-fg" id="ringFg2" cx="95" cy="95" r="82" style="stroke:#7FB069"/>
</svg>`;

export function shellHtml(): string {
  return `
<div class="phone">
  <!-- 开屏问卷 -->
  <section id="screen-onboard">
    <div class="ob-logo">🍑</div>
    <div class="ob-brand">${BRAND}</div>
    <p class="ob-tag">${BRAND_TAGLINE}</p>
    <div class="ob-steps"><i class="on"></i><i></i><i></i></div>
    <div class="ob-panels"></div>
    <div class="ob-nav">
      <button class="btn btn-primary" id="obNext">${OB.next}</button>
      <button class="link" id="obSkip">${OB.skip}</button>
    </div>
  </section>

  <!-- 主应用 -->
  <div id="app" hidden>
    <main>
      <section class="tab on" id="tab-home"><div class="wrap"></div></section>
      <section class="tab" id="tab-lib"><div class="wrap"></div></section>
      <section class="tab" id="tab-video"><div class="wrap"></div></section>
      <section class="tab" id="tab-data"><div class="wrap"></div></section>
    </main>
    <nav class="tabbar">
      <button class="on" data-tab="tab-home"><span class="ti">🏠</span>首页</button>
      <button data-tab="tab-lib"><span class="ti">💪</span>动作库</button>
      <button data-tab="tab-video"><span class="ti">🎬</span>视频</button>
      <button data-tab="tab-data"><span class="ti">📊</span>数据</button>
    </nav>
  </div>

  <!-- 跟练播放器 -->
  <div id="player" hidden>
    <div class="sheet">
      <div class="pl-head"><span id="plStep"></span><button class="pl-close" id="plClose">✕</button></div>
      <div class="pl-body">
        <div id="workView">
          <div class="demo-stage" id="demoStage"><svg id="demoSvg" viewBox="0 0 200 160"></svg><p class="demo-hint">${PLAYER.demoHint}</p></div>
          <p class="pl-name" id="plName"></p>
          <p class="pl-set" id="plSetInfo"></p>
          <ul class="pl-cues" id="plCues"></ul>
          <video id="plVideo" hidden playsinline style="width:100%;border-radius:16px;background:#000;max-height:230px"></video>
          <div id="vProgWrap" hidden style="margin-top:10px">
            <div class="progress coral"><i id="vProg" style="width:0%"></i></div>
            <p class="row-between" style="margin-top:6px"><span class="small" id="vTime">0:00</span><span class="small" id="vDur">0:00</span></p>
          </div>
          <div class="ring-wrap" id="ringWrap">
            ${RING_WORK}
            <div class="ring-num"><b id="plTime">60</b><span>秒</span></div>
          </div>
          <div id="repsWrap" hidden>
            <p class="reps-big"><span id="plRepsDone">0</span><span style="font-size:22px;color:var(--muted)"> / <span id="plRepsTarget">15</span></span> <small>次</small></p>
            <p class="sub" style="text-align:center">${PLAYER.repsHint}</p>
          </div>
          <div class="pl-controls">
            <button class="btn btn-ghost" id="plPause">${PLAYER.pause}</button>
            <button class="btn btn-ghost" id="plSkip">${PLAYER.skip}</button>
          </div>
          <div class="voice-row"><span>${PLAYER.voiceRow}</span><button class="switch on" id="voiceToggle" aria-label="语音开关"></button></div>
          <div class="voice-row" id="musicRow"><span>${PLAYER.musicRow}</span><button class="switch on" id="musicToggle" aria-label="音乐开关"></button></div>
          <div class="voice-row" id="speedRow" hidden><span>${PLAYER.slowRow}</span><button class="mini-btn" id="speedBtn">1x</button></div>
        </div>

        <div id="restView" hidden>
          <div class="rest-emoji">💧</div>
          <p class="pl-name">${PLAYER.restTitle}</p>
          <div class="ring-wrap">
            ${RING_REST}
            <div class="ring-num"><b id="restTime">30</b><span>${PLAYER.restUnit}</span></div>
          </div>
          <div class="rest-next" id="restNext"></div>
          <div class="pl-controls"><button class="btn btn-primary" id="restSkip">${PLAYER.restSkip}</button></div>
        </div>

        <div id="rpeView" hidden>
          <div class="rest-emoji">🎉</div>
          <p class="pl-name">${PLAYER.rpeTitle}</p>
          <p class="sub" style="text-align:center;margin:10px 0 4px">${PLAYER.rpeSub}</p>
          <p class="ob-q" style="text-align:center">${PLAYER.rpeQ}</p>
          <div class="rpe-btns" id="rpeBtns"></div>
        </div>

        <div id="summaryView" hidden>
          <div class="rest-emoji">🌟</div>
          <p class="pl-name">${PLAYER.summaryTitle}</p>
          <div class="sum-grid">
            <div class="stat"><b id="sumTime">20<small style="font-size:11px;color:var(--muted)">分</small></b><span>${PLAYER.sumTime}</span></div>
            <div class="stat"><b id="sumCount">7<small style="font-size:11px;color:var(--muted)">个</small></b><span>${PLAYER.sumCount}</span></div>
            <div class="stat"><b id="sumKcal">70<small style="font-size:11px;color:var(--muted)">kcal</small></b><span>${PLAYER.sumKcal}</span></div>
          </div>
          <div class="adapt-card" id="adaptCard">📈 <b>下次建议：</b><span id="adaptText"></span></div>
          <div class="enc-card" id="encCard"></div>
          <button class="btn btn-primary" id="sumBtn" style="margin-top:14px">${PLAYER.backHome}</button>
        </div>
      </div>
      <div class="pl-foot" id="plFoot">
        <p class="safety-foot" id="plFootText"></p>
      </div>
    </div>
  </div>

  <!-- 动作详情弹窗 -->
  <div class="modal-mask" id="libModal" hidden>
    <div class="modal" style="max-height:92dvh;overflow-y:auto"><div id="libModalBody"></div></div>
  </div>

  <!-- 自建跟练浮动栏 -->
  <div class="build-bar" id="buildBar" hidden>
    <b id="buildCount">${LIB.buildCount(0)}</b>
    <button class="btn btn-primary" id="buildGo">${LIB.buildGo}</button>
  </div>

  <audio id="userAudio" hidden></audio>
  <div class="toast" id="toast"></div>
</div>`;
}
