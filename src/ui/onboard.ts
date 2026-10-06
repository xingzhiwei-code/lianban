// 开屏问卷（PRD §F5）：3 步，每步必选，产后追加月龄/分娩/医生许可
import { OB, TOAST } from '../content/copy';
import type { Profile } from '../core/types';
import { $, toast } from './util';

type Answers = Record<string, string>;

const answers: Answers = {};
let step = 1;
let onComplete: (p: Profile) => void = () => {};

function chipsHtml(q: string, opts: { v: string; label: string }[]): string {
  return `<div class="chips" data-q="${q}">${opts
    .map((o) => `<button class="chip" data-v="${o.v}">${o.label}</button>`)
    .join('')}</div>`;
}

function step1Html(): string {
  return `
  <div class="ob-panel" data-panel="1">
    <p class="ob-q">${OB.step1.q}<small>${OB.step1.small}</small></p>
    ${chipsHtml('scenario', OB.options.scenario)}
    <div id="ppExtra" hidden>
      <p class="ob-q">${OB.babyAge.q}</p>
      ${chipsHtml('babyAge', OB.options.babyAge)}
      <p class="ob-q">${OB.birth.q}<small>${OB.birth.small}</small></p>
      ${chipsHtml('birth', OB.options.birth)}
    </div>
  </div>`;
}

function step2Html(): string {
  return `
  <div class="ob-panel" data-panel="2" hidden>
    <div id="ppClear" hidden>
      <p class="ob-q">${OB.cleared.q}<small>${OB.cleared.small}</small></p>
      ${chipsHtml('cleared', OB.options.cleared)}
    </div>
    <p class="ob-q">${OB.base.q}</p>
    ${chipsHtml('base', OB.options.base)}
  </div>`;
}

function step3Html(): string {
  return `
  <div class="ob-panel" data-panel="3" hidden>
    <p class="ob-q">${OB.minutes.q}<small>${OB.minutes.small}</small></p>
    ${chipsHtml('minutes', OB.options.minutes)}
    <p class="ob-q">${OB.equip.q}</p>
    ${chipsHtml('equip', OB.options.equip)}
    <div class="ob-note" id="obNote"></div>
  </div>`;
}

function paintSteps(): void {
  document.querySelectorAll('.ob-steps i').forEach((el, i) => {
    el.classList.toggle('on', i < step);
  });
  document.querySelectorAll('.ob-panel').forEach((p) => {
    (p as HTMLElement).hidden = Number((p as HTMLElement).dataset.panel) !== step;
  });
  const next = $('obNext');
  next.textContent = step === 3 ? OB.finish : OB.next;
  const note = $('obNote');
  const sc = answers.scenario ?? 'beginner';
  note.textContent =
    OB.notes[sc as keyof typeof OB.notes] ?? OB.notes.beginner;
}

function isPostpartum(): boolean {
  return answers.scenario === 'postpartum';
}

function syncPostpartum(): void {
  const pp = isPostpartum();
  $('ppExtra').hidden = !pp;
  $('ppClear').hidden = !pp;
  if (!pp) {
    ['babyAge', 'birth', 'cleared'].forEach((k) => delete answers[k]);
    document.querySelectorAll('#ppExtra .chip, #ppClear .chip').forEach((x) =>
      x.classList.remove('on')
    );
  }
}

function requiredForStep(): string[] {
  const pp = isPostpartum();
  if (step === 1) return pp ? ['scenario', 'babyAge', 'birth'] : ['scenario'];
  if (step === 2) return pp ? ['cleared', 'base'] : ['base'];
  return ['minutes', 'equip'];
}

function finish(): void {
  const pp = isPostpartum();
  const profile: Profile = {
    id: 'me',
    scenario: (answers.scenario as Profile['scenario']) ?? 'postpartum',
  };
  if (pp) {
    profile.babyAge = answers.babyAge;
    profile.birth = answers.birth as Profile['birth'];
    profile.cleared = answers.cleared as Profile['cleared'];
  }
  profile.base = answers.base as Profile['base'];
  profile.minutes = answers.minutes as Profile['minutes'];
  profile.equip = answers.equip as Profile['equip'];
  onComplete(profile);
}

export function initOnboard(complete: (p: Profile) => void): void {
  onComplete = complete;
  const panels = document.querySelector('.ob-panels')!;
  panels.innerHTML = step1Html() + step2Html() + step3Html();

  // 选项选择（事件委托）
  panels.addEventListener('click', (e) => {
    const c = (e.target as HTMLElement).closest('.chip') as HTMLElement | null;
    if (!c) return;
    const group = c.closest('.chips') as HTMLElement;
    group.querySelectorAll('.chip').forEach((x) => x.classList.remove('on'));
    c.classList.add('on');
    answers[group.dataset.q!] = c.dataset.v!;
    if (group.dataset.q === 'scenario') syncPostpartum();
  });

  $('obNext').onclick = () => {
    const need = requiredForStep();
    if (need.some((k) => !(k in answers))) {
      toast(TOAST.onboardNeed);
      return;
    }
    if (step < 3) {
      step++;
      paintSteps();
    } else {
      finish();
    }
  };

  $('obSkip').onclick = () => {
    onComplete({ id: 'me', scenario: 'postpartum', skipped: true });
  };

  paintSteps();
}

export function resetOnboard(): void {
  step = 1;
  Object.keys(answers).forEach((k) => delete answers[k]);
  const panels = document.querySelector('.ob-panels')!;
  panels.innerHTML = step1Html() + step2Html() + step3Html();
  syncPostpartum();
  paintSteps();
}
