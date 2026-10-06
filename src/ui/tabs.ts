// 底部导航切换
export function initTabs(): void {
  document.querySelectorAll('.tabbar button').forEach((b) => {
    b.addEventListener('click', () => {
      goTab((b as HTMLElement).dataset.tab!);
    });
  });
}

export function goTab(id: string): void {
  document.querySelectorAll('.tabbar button').forEach((x) => {
    x.classList.toggle('on', (x as HTMLElement).dataset.tab === id);
  });
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('on', t.id === id);
  });
  window.scrollTo(0, 0);
  window.dispatchEvent(new CustomEvent('tabchange', { detail: { id } }));
}
