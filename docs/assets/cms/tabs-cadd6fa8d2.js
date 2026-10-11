// Browser script for the tabs component, published as its own hashed file.
// Builds the WAI-ARIA tab list from the panel headings: arrows, Home and End
// move between tabs; without it every panel shows under its heading.
(function (enhance) {
  if (typeof module === 'object' && module.exports) module.exports = enhance;
  else document.querySelectorAll('[data-tabs]').forEach(function (root) { enhance(root, document); });
})(function enhance(root, doc) {
  var labels = root.querySelectorAll('.tabs__label');
  var panels = root.querySelectorAll('.tabs__panel');
  if (labels.length < 2) return;

  var list = doc.createElement('div');
  list.setAttribute('class', 'tabs__list');
  list.setAttribute('role', 'tablist');
  var tabs = Array.prototype.map.call(labels, makeTab);

  function makeTab(label, i) {
    var tab = doc.createElement('button');
    tab.setAttribute('class', 'tabs__tab');
    tab.setAttribute('type', 'button');
    tab.setAttribute('role', 'tab');
    tab.id = label.id + '-tab';
    tab.setAttribute('aria-controls', panels[i].id);
    tab.textContent = label.textContent;
    label.hidden = true;
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].setAttribute('tabindex', '0');
    tab.addEventListener('click', function () { select(i, true); });
    tab.addEventListener('keydown', function (event) {
      var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: labels.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select((next + labels.length) % labels.length, true);
    });
    list.appendChild(tab);
    return tab;
  }

  function select(i, focus) {
    tabs.forEach(function (tab, j) {
      tab.setAttribute('aria-selected', String(j === i));
      tab.setAttribute('tabindex', j === i ? '0' : '-1');
      panels[j].hidden = j !== i;
    });
    if (focus) tabs[i].focus();
  }

  root.insertBefore(list, root.children[0]);
  root.classList.add('tabs--enhanced');
  select(0, false);
});
