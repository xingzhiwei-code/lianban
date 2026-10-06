// 应用入口：组装骨架、初始化各模块、编排生命周期
import './style.css';
import { shellHtml } from './ui/shell';
import { initToast, $, toast } from './ui/util';
import { initOnboard, resetOnboard } from './ui/onboard';
import { initTabs } from './ui/tabs';
import { renderHome } from './ui/home';
import { initLibrary } from './ui/library';
import { initVideo, loadAudioBinds, revokeWorkoutUrl } from './ui/video';
import { initDataPage, refreshDataPage, bindDataTabRefresh } from './ui/dataPage';
import { initPlayer } from './ui/player';
import { state } from './core/state';
import { clearProfile, getProfile, saveProfile } from './core/db';
import { TOAST } from './content/copy';
import type { Profile } from './core/types';

async function refreshAfterWorkout(): Promise<void> {
  await renderHome(onScenarioSwitch);
  await refreshDataPage();
}

function showOnboard(): void {
  $('app').hidden = true;
  $('screen-onboard').hidden = false;
  resetOnboard();
  window.scrollTo(0, 0);
}

async function enterApp(): Promise<void> {
  $('screen-onboard').hidden = true;
  $('app').hidden = false;
  await renderHome(onScenarioSwitch);
  initLibrary();
  initVideo();
  initDataPage({ onCleared });
  window.scrollTo(0, 0);
}

async function onScenarioSwitch(): Promise<void> {
  await clearProfile();
  state.profile = undefined;
  showOnboard();
}

async function onCleared(): Promise<void> {
  state.profile = undefined;
  showOnboard();
}

async function onOnboardComplete(p: Profile): Promise<void> {
  state.profile = p;
  await saveProfile(p);
  toast(TOAST.onboardDone);
  await enterApp();
}

async function bootstrap(): Promise<void> {
  document.getElementById('app-root')!.innerHTML = shellHtml();
  initToast();

  initPlayer({ onSaved: () => void refreshAfterWorkout(), onClosed: revokeWorkoutUrl });
  initTabs();
  bindDataTabRefresh();
  initOnboard((p) => void onOnboardComplete(p));

  await loadAudioBinds();
  const p = await getProfile();
  if (p) {
    state.profile = p;
    await enterApp();
  } else {
    showOnboard();
  }
}

void bootstrap();
