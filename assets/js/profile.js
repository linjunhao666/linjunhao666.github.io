const languageToggle = document.getElementById('language-toggle');
const nav = document.querySelector('.profile-nav');
const content = document.getElementById('page-content');
const englishText = new WeakMap();
const canFetchPages = location.protocol === 'https:' || location.protocol === 'http:';

function isChinese(url) {
  return url.searchParams.get('lang') === 'zh';
}

function setUrlLanguage(url, showChinese) {
  if (showChinese) url.searchParams.set('lang', 'zh');
  else url.searchParams.delete('lang');
}

function showLanguage(showChinese) {
  for (const element of document.querySelectorAll('[data-zh]')) {
    if (!englishText.has(element)) englishText.set(element, element.textContent);
    element.textContent = showChinese ? element.dataset.zh : englishText.get(element);
  }
  document.documentElement.lang = showChinese ? 'zh-CN' : 'en-US';
  languageToggle.lang = showChinese ? 'en' : 'zh-CN';
  languageToggle.textContent = showChinese ? 'English' : '中文';

  for (const link of document.querySelectorAll('a[data-page]')) {
    const url = new URL(link.href);
    setUrlLanguage(url, showChinese);
    link.href = url.href;
  }
}

showLanguage(isChinese(new URL(location.href)));
languageToggle.addEventListener('click', () => {
  const showChinese = document.documentElement.lang !== 'zh-CN';
  showLanguage(showChinese);
  if (canFetchPages) {
    const url = new URL(location.href);
    setUrlLanguage(url, showChinese);
    history.replaceState(history.state, '', url);
  }
});
languageToggle.hidden = false;

const wechatToggle = document.getElementById('wechat-toggle');
const wechatId = document.getElementById('wechat-id');
wechatToggle.addEventListener('click', () => {
  wechatId.hidden = !wechatId.hidden;
  wechatToggle.setAttribute('aria-expanded', String(!wechatId.hidden));
});
wechatToggle.hidden = false;

// On HTTP, keep the sidebar mounted and replace only the page content.
if (canFetchPages) {
  let pendingNavigation;

  async function loadPage(url, addHistory) {
    pendingNavigation?.abort();
    const request = new AbortController();
    pendingNavigation = request;
    content.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error('Page unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (request.signal.aborted) return;

      const nextContent = page.getElementById('page-content');
      const nextTitle = page.querySelector('title[data-zh]');
      const activePage = page.querySelector('.profile-nav [aria-current="page"]')?.dataset.page;
      if (!nextContent || !nextTitle || !activePage) throw new Error('Page incomplete');

      // A language switch while the fetch is in flight applies to the destination too.
      if (addHistory) setUrlLanguage(url, document.documentElement.lang === 'zh-CN');

      content.replaceChildren(...nextContent.childNodes);
      document.querySelector('title').replaceWith(nextTitle);
      nav.querySelector('[aria-current="page"]')?.removeAttribute('aria-current');
      for (const link of nav.querySelectorAll('a[data-page]')) {
        if (link.dataset.page === activePage) link.setAttribute('aria-current', 'page');
      }
      showLanguage(isChinese(url));
      if (addHistory && url.href !== location.href) history.pushState(null, '', url);
    } catch (error) {
      if (request.signal.aborted) return;
      if (addHistory) location.assign(url);
      else location.reload();
    } finally {
      if (pendingNavigation === request) {
        pendingNavigation = null;
        content.removeAttribute('aria-busy');
      }
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-page]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    loadPage(new URL(link.href), true);
  });
  addEventListener('popstate', () => loadPage(new URL(location.href), false));
}
