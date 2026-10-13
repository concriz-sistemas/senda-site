// The search block: filters the local index (/search-index.json) as the
// visitor types, and runs a search sent from another page as ?q=.
(function () {
  var root = document.querySelector('.search');
  if (!root) return;
  var form = root.querySelector('.search__form');
  var input = root.querySelector('input[type=search]');
  var status = root.querySelector('.search__status');
  var list = root.querySelector('.search__results');
  var messages = JSON.parse(root.getAttribute('data-messages') || '{}');
  var lang = document.documentElement.lang || 'en';
  var index = null;

  function fill(text, params) {
    return String(text || '').replace(/\{(\w+)\}/g, function (whole, name) {
      return name in params ? params[name] : whole;
    });
  }

  function countText(n) {
    var m = messages.results;
    var form = typeof m === 'string' ? m : (m && (m[new Intl.PluralRules(lang).select(n)] || m.other));
    return fill(form, { count: new Intl.NumberFormat(lang).format(n) });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); search(); });

  function normalize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async function load() {
    if (index) return index;
    try {
      var r = await fetch(root.getAttribute('data-index'));
      index = (await r.json()).docs || [];
    } catch (err) {
      index = [];
      status.textContent = messages.loadError;
    }
    return index;
  }

  function score(doc, terms) {
    var title = normalize(doc.title);
    var text = normalize(doc.text);
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (title.indexOf(t) === -1 && text.indexOf(t) === -1) return 0;
      total += title.indexOf(t) !== -1 ? 3 : 1;
    }
    return total;
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(search, 150);
  });

  async function search() {
    var q = normalize(input.value).trim();
    list.innerHTML = '';
    if (q.length < 2) { status.textContent = ''; return; }

    var docs = await load();
    var terms = q.split(/\s+/);
    var matches = docs
      .map(function (d) { return { doc: d, score: score(d, terms) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 20);

    status.textContent = matches.length
      ? countText(matches.length)
      : fill(messages.noResults, { query: input.value.trim() });

    matches.forEach(function (x) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = x.doc.path;
      a.textContent = x.doc.title;
      li.appendChild(a);
      if (x.doc.excerpt) {
        var p = document.createElement('p');
        p.className = 'search__summary';
        p.textContent = x.doc.excerpt;
        li.appendChild(p);
      }
      list.appendChild(li);
    });
  }

  // a search submitted from another page (or before the script ran) arrives as ?q=
  var asked = new URLSearchParams(location.search).get('q');
  if (asked) {
    input.value = asked;
    search();
  }
})();
