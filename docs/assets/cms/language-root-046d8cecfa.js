// The root of a site in several languages: go to the visitor's language, or to the main one.
(() => {
  const links = [...document.querySelectorAll('.language-root__list a[hreflang]')];
  const wanted = (navigator.languages || [navigator.language || '']).map((tag) => String(tag).toLowerCase());
  const exact = (tag) => links.find((a) => a.hreflang.toLowerCase() === tag);
  const base = (tag) => links.find((a) => a.hreflang.toLowerCase().split('-')[0] === tag.split('-')[0]);
  const pick = wanted.map(exact).find(Boolean) || wanted.map(base).find(Boolean) || links.find((a) => a.hasAttribute('data-main')) || links[0];
  if (pick) location.replace(pick.href);
})();
