/* 作品索引 —— 单一数据源 data/works.json，本文件只做渲染 */

const state = { data: null, cat: 'all' };

if (new URLSearchParams(location.search).has('still')) {
  document.documentElement.classList.add('still');
}

const $ = (sel) => document.querySelector(sel);

/* 状态文字 → 指示灯颜色：运行中的项目亮，交付完的暖黄，其余中性 */
function tone(status = '') {
  if (/运行|迭代|连载|内测|每日/.test(status)) return 'live';
  if (/交付|完成|定稿|定档|归档|收尾|实验完成/.test(status)) return 'done';
  return 'idle';
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/* ── 卡片 ─────────────────────────────────────────────── */
function card(work, index) {
  const hasLink = work.links && work.links.length > 0;
  const node = hasLink ? el('a', 'card') : el('div', 'card');

  node.dataset.cat = work.cat;
  node.classList.add('reveal');
  node.style.setProperty('--i', String(Math.min(index, 12)));
  if (!hasLink) node.classList.add('card--locked');
  if (hasLink) {
    node.href = work.links[0].url;
    if (!work.links[0].url.startsWith('#')) {
      node.target = '_blank';
      node.rel = 'noopener';
    }
  }

  const inner = hasLink ? el('span', 'card__link') : node;

  /* 封面 */
  const cover = el('div', 'card__cover');
  if (work.cover) {
    const img = el('img');
    img.src = work.cover;
    img.alt = `${work.title} 截图`;
    img.loading = index > 2 ? 'lazy' : 'eager';
    cover.appendChild(img);
  } else {
    cover.classList.add('card__cover--plate');
    const plate = el('span', 'card__plate', String(index + 1).padStart(2, '0'));
    cover.appendChild(plate);
  }
  const catName = state.data.categories.find((c) => c.id === work.cat)?.short || '';
  cover.appendChild(el('span', 'card__cat', catName));

  const badge = el('span', 'card__badge', work.status);
  badge.dataset.tone = tone(work.status);
  cover.appendChild(badge);

  /* 正文 */
  const body = el('div', 'card__body');
  body.appendChild(el('h3', 'card__title', work.title));
  if (work.subtitle) body.appendChild(el('p', 'card__sub', work.subtitle));
  body.appendChild(el('p', 'card__sum', work.summary));

  if (work.stack && work.stack.length) {
    const ul = el('ul', 'chips');
    work.stack.forEach((s) => ul.appendChild(el('li', null, s)));
    body.appendChild(ul);
  }

  if (hasLink) {
    inner.append(cover, body);
    node.appendChild(inner);
  } else {
    node.append(cover, body);
  }
  return node;
}

/* ── 筛选 ─────────────────────────────────────────────── */
function renderFilters() {
  const box = $('#filters');
  box.innerHTML = '';
  const cats = state.data.categories;
  const total = state.data.works.length;

  const make = (id, label, n) => {
    const b = el('button', 'chip');
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.cat === id));
    b.append(el('span', null, label), el('span', 'chip__n', String(n)));
    b.addEventListener('click', () => {
      state.cat = id;
      renderFilters();
      renderGrid();
    });
    return b;
  };

  box.appendChild(make('all', '全部', total));
  cats.forEach((c) => {
    const n = state.data.works.filter((w) => w.cat === c.id).length;
    if (n) box.appendChild(make(c.id, c.name, n));
  });
}

function renderGrid() {
  const grid = $('#grid');
  grid.innerHTML = '';

  const list = state.data.works
    .filter((w) => state.cat === 'all' || w.cat === state.cat)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  list.forEach((w, i) => grid.appendChild(card(w, i)));

  const label = state.cat === 'all'
    ? `全部 ${list.length} 件`
    : `${state.data.categories.find((c) => c.id === state.cat).name} ${list.length} 件`;
  $('#count').textContent = label;
}

function renderClosed() {
  const ul = $('#closedList');
  (state.data.unpublished || []).forEach((item) => {
    const li = el('li', 'closed__item reveal');
    li.style.setProperty('--i', String(ul.children.length));
    li.appendChild(el('div', 'closed__title', item.title));
    li.appendChild(el('p', 'closed__note', item.note));
    ul.appendChild(li);
  });
}

/* ── 数字滚动 ─────────────────────────────────────────── */
function countUp(node, target) {
  if (document.documentElement.classList.contains('still') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    node.textContent = target;
    return;
  }
  const dur = 700;
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ── 启动 ─────────────────────────────────────────────── */
async function boot() {
  let data;
  try {
    const res = await fetch('data/works.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
  } catch (err) {
    $('#grid').innerHTML =
      '<p style="color:#a5a29d">作品数据读取失败。请用本地服务器打开（<code>python3 -m http.server</code>），直接双击 HTML 会被浏览器的跨域策略拦住。</p>';
    console.error(err);
    return;
  }

  state.data = data;

  $('#heroIntro').textContent = data.site.intro;
  document.title = `${data.site.owner} · ${data.site.subtitle}`;

  const openCount = data.works.filter((w) => w.repo).length;
  countUp($('#statWorks'), data.works.length);
  countUp($('#statOpen'), openCount);
  countUp($('#statCat'), data.categories.length);

  renderFilters();
  renderGrid();
  renderClosed();
}

boot();
