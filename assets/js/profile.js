
const languageToggle = document.getElementById('language-toggle');
const translations = [...document.querySelectorAll('[data-zh]')].map(element => ({
  element,
  english: element.textContent,
  chinese: element.dataset.zh,
}));
const pageLinks = [...document.querySelectorAll('a[data-page]')].map(link => ({
  link,
  path: link.getAttribute('href'),
}));
function showLanguage(showChinese) {
  for (const {element, english, chinese} of translations) {
    element.textContent = showChinese ? chinese : english;
  }
  document.documentElement.lang = showChinese ? 'zh-CN' : 'en-US';
  languageToggle.lang = showChinese ? 'en' : 'zh-CN';
  languageToggle.textContent = showChinese ? 'English' : '中文';
  for (const {link, path} of pageLinks) {
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
