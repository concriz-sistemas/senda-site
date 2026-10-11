// Browser script for `list-pages (filter)`, published as its own hashed file.
// Builds tag toggle buttons before the list; without it every item shows.
(function (enhance) {
  if (typeof module === 'object' && module.exports) module.exports = enhance;
  else document.querySelectorAll('[data-filter]').forEach(function (list) {
    enhance(list, document, { lang: document.documentElement.lang || 'en' });
  });
})(function enhance(list, doc, env) {
  var labels = JSON.parse(list.getAttribute('data-tag-labels') || '{}');
  var messages = JSON.parse(list.getAttribute('data-messages') || '{}');
  var keys = Object.keys(labels).sort(function (a, b) { return labels[a].localeCompare(labels[b]); });
  if (!keys.length) return;

  var group = doc.createElement('div');
  group.setAttribute('class', 'list-pages__filter');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', messages.label);
  var status = doc.createElement('p');
  status.setAttribute('class', 'list-pages__status');
  status.setAttribute('aria-live', 'polite');

  function countText(n) {
    var m = messages.results;
    var form = typeof m === 'string' ? m : m[new Intl.PluralRules(env.lang).select(n)] || m.other;
    return form.replace('{count}', new Intl.NumberFormat(env.lang).format(n));
  }

  var buttons = [''].concat(keys).map(function (key) {
    var b = doc.createElement('button');
    b.setAttribute('class', 'list-pages__filter-button');
    b.setAttribute('type', 'button');
    b.textContent = key ? labels[key] : messages.all;
    b.addEventListener('click', function () { status.textContent = countText(select(key)); });
    group.appendChild(b);
    return { key: key, el: b };
  });

  function select(key) {
    var visible = 0;
    Array.prototype.forEach.call(list.querySelectorAll('.list-pages__item'), function (item) {
      var tags = (item.getAttribute('data-tags') || '').split(' ');
      item.hidden = Boolean(key) && tags.indexOf(key) === -1;
      if (!item.hidden) visible += 1;
    });
    buttons.forEach(function (b) { b.el.setAttribute('aria-pressed', String(b.key === key)); });
    return visible;
  }

  list.parentNode.insertBefore(group, list);
  list.parentNode.insertBefore(status, list);
  select('');
});
