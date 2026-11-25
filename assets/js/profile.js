
const languageToggle = document.getElementById('language-toggle');
const translatedElements = root => [...root.querySelectorAll('[data-zh]')].map(element => ({
  element,
  english: element.textContent,
  chinese: element.dataset.zh,
}));
let translations = translatedElements(document);
function showLanguage(showChinese) {
  for (const {element, english, chinese} of translations) {
    element.textContent = showChinese ? chinese : english;
  }
  document.documentElement.lang = showChinese ? 'zh-CN' : 'en-US';
  languageToggle.lang = showChinese ? 'en' : 'zh-CN';
  languageToggle.textContent = showChinese ? 'English' : '中文';
  for (const link of document.querySelectorAll('a[data-page]')) {
    const path = link.getAttribute('href').split('?')[0];
    link.setAttribute('href', showChinese ? path + '?lang=zh' : path);
  }
}
showLanguage(new URLSearchParams(location.search).get('lang') === 'zh');
languageToggle.addEventListener('click', () => {
  showLanguage(document.documentElement.lang !== 'zh-CN');
});
languageToggle.hidden = false;

const wechatToggle = document.getElementById('wechat-toggle');
const wechatId = document.getElementById('wechat-id');
wechatToggle.addEventListener('click', () => {
  wechatId.hidden = !wechatId.hidden;
  wechatToggle.setAttribute('aria-expanded', String(!wechatId.hidden));
});
wechatToggle.hidden = false;

// Keep the profile and navigation mounted while switching the content panel.
if (location.protocol === 'https:' || location.protocol === 'http:') {
  const nav = document.querySelector('.profile-nav');
  const content = document.querySelector('.wrapper > section');
  let pendingNavigation;

  async function loadPage(url, addHistory) {
    pendingNavigation?.abort();
    const request = new AbortController();
    pendingNavigation = request;
    try {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error('Page unavailable');
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (request.signal.aborted) return;

      const nextContent = page.querySelector('.wrapper > section');
      const nextTitle = page.querySelector('title');
      const activePage = page.querySelector('.profile-nav [aria-current="page"]')?.dataset.page;
      if (!nextContent || !nextTitle || !activePage) throw new Error('Page incomplete');

      content.replaceChildren(...nextContent.childNodes);
      const title = document.querySelector('title');
      title.replaceWith(nextTitle);
      translations = translations.filter(({element}) => element.isConnected);
      translations.push(...translatedElements(content), {
        element: nextTitle,
        english: nextTitle.textContent,
        chinese: nextTitle.dataset.zh,
      });

      for (const link of nav.querySelectorAll('a[data-page]')) {
        if (link.dataset.page === activePage) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }

      showLanguage(url.searchParams.get('lang') === 'zh');
      if (addHistory && url.href !== location.href) history.pushState(null, '', url);
    } catch (error) {
      if (request.signal.aborted) return;
      if (addHistory) location.assign(url);
      else location.reload();
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
