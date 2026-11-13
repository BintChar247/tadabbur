(function(){
'use strict';
const X = window.IDX, SU = X.surahs, HAD = window.HADITH, D = window.STUDY;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const AR_DIG = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = s => esc(s).replace(/ﷺ/g, '<span class="saw">ﷺ</span>');
const store = {
  get(k, d){ try{ const v = localStorage.getItem('tdb.'+k); return v === null ? d : JSON.parse(v);}catch(e){return d} },
  set(k, v){ try{ localStorage.setItem('tdb.'+k, JSON.stringify(v)); }catch(e){} }
};
const P = Object.assign({theme:'night', lang:'en', tl:false, ar:30, tr:16}, store.get('prefs', null) || (()=>{ try{ return JSON.parse(localStorage.getItem('s26.prefs')) || {}; }catch(e){ return {}; } })());
let marks = store.get('marks', null);
if (!marks){ marks = []; try{ (JSON.parse(localStorage.getItem('s26.marks')) || []).forEach(n => marks.push('26:' + n)); }catch(e){} }
const savePrefs = () => store.set('prefs', P);
const Native = window.Android || null;
const isWide = () => innerWidth >= 700;

/* ---------- data loading ---------- */
const cache = {};
const waiters = {};
window.__S = (n, arr) => { cache[n] = arr.map((a, i) => ({n:i+1, ar:a[0], tl:a[1], en:a[2], id:a[3]})); (waiters[n] || []).forEach(f => f()); delete waiters[n]; };
function load(n){
  if (cache[n]) return Promise.resolve(cache[n]);
  return new Promise(res => {
    const first = !waiters[n];
    (waiters[n] = waiters[n] || []).push(() => res(cache[n]));
    if (first){ const s = document.createElement('script'); s.src = 'data/s' + n + '.js'; document.head.appendChild(s); }
  });
}

/* ---------- hadith index ---------- */
const HV = {}, HS = {};
HAD.forEach(h => h.links.forEach(l => {
  (HS[l.s] = HS[l.s] || []).includes(h) || HS[l.s].push(h);
  if (l.v) l.v.forEach(v => { const k = l.s + ':' + v; (HV[k] = HV[k] || []).push(h); });
}));
const surahLevelH = s => HAD.filter(h => h.links.some(l => l.s === s && !l.v));

/* ---------- icons ---------- */
const I = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 4.5l1.5 1.5L4 7.5 2.5 6zM4 10.5l1.5 1.5L4 13.5 2.5 12zM4 16.5l1.5 1.5L4 19.5 2.5 18z"/></svg>',
  ctx:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 100 18 9 9 0 000-18z"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  path:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><path d="M8 5h6a4 4 0 010 8H10a4 4 0 000 8h0"/></svg>',
  read:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 6c-2-1.5-5-2-9-2v14c4 0 7 .5 9 2 2-1.5 5-2 9-2V4c-4 0-7 .5-9 2z"/><path d="M12 6v14"/></svg>',
  lamp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/></svg>',
  scroll:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3h11a2 2 0 012 2v2h-4"/><path d="M16 7v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-1h10"/><path d="M7 3a2 2 0 00-2 2v13M9 8h4M9 12h4"/></svg>',
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  mark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  markF:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>'
};
const starSVG = '<svg class="star" viewBox="0 0 200 200"><defs><radialGradient id="g1"><stop offset="0" stop-color="#D9B66F" stop-opacity=".22"/><stop offset="1" stop-color="#D9B66F" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="98" fill="url(#g1)"/><g fill="none" stroke="#D9B66F" stroke-width="1.2"><circle cx="100" cy="100" r="94" stroke-opacity=".35"/><circle cx="100" cy="100" r="86" stroke-dasharray="2 5" stroke-opacity=".6"/><rect x="38" y="38" width="124" height="124"/><rect x="38" y="38" width="124" height="124" transform="rotate(45 100 100)"/><rect x="50" y="50" width="100" height="100" stroke-opacity=".5" transform="rotate(22.5 100 100)"/><rect x="50" y="50" width="100" height="100" stroke-opacity=".5" transform="rotate(67.5 100 100)"/><circle cx="100" cy="100" r="56" stroke-opacity=".7"/></g></svg>';
$('#home-gear').innerHTML = I.gear;

/* ---------- navigation ---------- */
const TABS = [
  {id:'home', l:'Home', i:I.home},
  {id:'surahs', l:'Surahs', i:I.list},
  {id:'read', l:'Read', i:I.read},
  {id:'hadith', l:'Hadith', i:I.scroll},
  {id:'saved', l:'Saved', i:I.mark}
];
const TABOF = {surah:'surahs', context:'surahs', journey:'surahs', detail:'surahs', lessons:'surahs'};
$('#bottom').innerHTML = TABS.map(t => `<button data-v="${t.id}">${t.i}<span>${t.l}</span></button>`).join('');
$('#rail').innerHTML = '<div class="logo">تدبر</div>' + TABS.map(t => `<button data-v="${t.id}">${t.i}<span>${t.l}</span></button>`).join('') + `<div class="sp"></div><button onclick="openSheet()">${I.gear}<span>Settings</span></button>`;
$$('nav button[data-v]').forEach(b => b.onclick = () => show(b.dataset.v));

let stack = [], cur = 'home';
const scrollMem = {};
function show(v, push = true, opts = {}){
  if (v === cur && !opts.force){ if (!opts.verse) window.scrollTo({top:0,behavior:'smooth'}); else goVerse(opts.verse); return; }
  scrollMem[cur] = window.scrollY;
  if (push) stack.push(cur);
  cur = v;
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  const tab = TABOF[v] || v;
  $$('nav button[data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === tab));
  if (v === 'read') ensureReader(opts.verse);
  else window.scrollTo(0, push ? 0 : (scrollMem[v] || 0));
  if (v === 'saved') renderSaved();
  if (v === 'hadith' && !$('#hlist').innerHTML) renderHadith();
  if (v === 'journey') renderJourney();
  if (v === 'lessons') renderLessons();
  if (v === 'context') renderContext();
  if (v === 'surahs' && isWide()) showInlineOverview(selS);
  $('#jump').classList.remove('on');
}
window.show = show;
window.goBack = function(){
  if ($('#sheet').classList.contains('on')){ closeSheet(); return true; }
  if (!stack.length){ if (cur !== 'home'){ show('home', false); return true; } return false; }
  show(stack.pop(), false, {force:true}); return true;
};
window.appBack = () => goBack();

/* ---------- prefs ---------- */
function applyPrefs(){
  document.documentElement.classList.toggle('day', P.theme === 'day');
  document.documentElement.style.setProperty('--ar-size', P.ar + 'px');
  document.documentElement.style.setProperty('--tr-size', P.tr + 'px');
  $$('#s-theme button').forEach(b => b.classList.toggle('on', b.dataset.v === P.theme));
  $$('#s-lang button').forEach(b => b.classList.toggle('on', b.dataset.v === P.lang));
  $('#s-tl').classList.toggle('on', P.tl);
  $$('.tl-btn').forEach(b => b.classList.toggle('on', P.tl));
  $('#s-ar').value = P.ar; $('#s-tr').value = P.tr;
  try { Native && Native.setBars(P.theme === 'day'); } catch(e){}
}
$$('#s-theme button').forEach(b => b.onclick = () => { P.theme = b.dataset.v; savePrefs(); applyPrefs(); });
$$('#s-lang button').forEach(b => b.onclick = () => { P.lang = b.dataset.v; savePrefs(); applyPrefs(); refreshText(); });
$('#s-tl').onclick = () => toggleTl();
$('#s-ar').oninput = e => { P.ar = +e.target.value; savePrefs(); applyPrefs(); };
$('#s-tr').oninput = e => { P.tr = +e.target.value; savePrefs(); applyPrefs(); };
window.toggleTl = function(){ P.tl = !P.tl; savePrefs(); applyPrefs(); refreshText(); toast(P.tl ? 'Transliteration on' : 'Transliteration off'); };
window.openSheet = () => { $('#sheet').classList.add('on'); $('#scrim').classList.add('on'); };
window.closeSheet = () => { $('#sheet').classList.remove('on'); $('#scrim').classList.remove('on'); };
function refreshText(){
  if (readerFor) { const y = scrollY; readerFor = 0; if (cur === 'read'){ ensureReader(); setTimeout(() => scrollTo(0, y), 0); } }
  renderVom(); if (isWide() && cur === 'surahs') showInlineOverview(selS);
  if (cur === 'surah') openOverview(selS, false);
  if ($('#hlist').innerHTML) renderHadith();
  if (cur === 'journey') renderJourney();
  if (cur === 'detail') openSection(selSec);
  if (cur === 'lessons') renderLessons();
  if (cur === 'saved') renderSaved();
}
function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 1800); }
const tr = v => P.lang === 'id' ? v.id : v.en;
const qtl = t => String(t).replace(/AA/g, 'ʿ').replace(/\b([Aa])l(sh|th|dh|t|d|r|z|s|n)\2/g, (m, a, c) => a + c + '-' + c);
const tlLine = (v, extra) => P.tl ? `<div class="tl8"${extra ? ' style="' + extra + '"' : ''}>${esc(qtl(v.tl))}</div>` : '';
const trAny = v => P.lang === 'none' ? v.en : tr(v);
const S = n => SU[n-1];

/* ---------- home ---------- */
function renderHome(){
  $('#hero').innerHTML = `<div class="${isWide() ? 'hero-wide' : ''}">
    <div class="medal">${starSVG}<div class="name">القُرْآن</div></div>
    <div>
      <div class="bism">${X.bismillah}</div>
      <h1>Tadabbur</h1>
      <div class="tag">Meaning, history &amp; context of the Quran</div>
      <div class="chips"><span class="chip"><b>114</b>Surahs</span><span class="chip"><b>6,236</b>Verses</span><span class="chip"><b>${HAD.length}</b>Hadith</span><span class="chip"><b>114</b>Deep studies</span><span class="chip"><b>2</b>Translations</span></div>
      <div><button class="cta" onclick="show('surahs')">${I.list}Browse the surahs</button></div>
    </div></div>`;
  const last = store.get('last', null) || (store.get('x', null), (()=>{ try{ const v = JSON.parse(localStorage.getItem('s26.last')); return v ? {s:26, v} : null; }catch(e){ return null; } })());
  const L = last || {s:1, v:1}, ls = S(L.s);
  $('#cont').innerHTML = `<div class="eyebrow" style="margin-bottom:10px">${last ? 'Continue reading' : 'Start here'}</div>
    <button class="cont" onclick="openRead(${L.s},${L.v})"><span class="ci"><b>${esc(ls.tl)}</b><small>${esc(ls.m)} · verse ${L.v} of ${ls.c}</small></span><span class="ca">${ls.ar}</span></button>
    <div class="vmap" style="margin-top:14px"><i style="flex:${L.v};background:var(--gold)"></i><i style="flex:${Math.max(0, ls.c - L.v)};background:var(--line)"></i></div>
    <div class="btnrow"><button class="pill gold" onclick="openRead(${L.s},${L.v})">${I.play} ${last ? 'Continue' : 'Begin with Al-Fatihah'}</button><button class="pill" onclick="openOverview(${L.s})">About this surah</button></div>`;
  const dayS = (Math.floor((Date.now() + 7 * 3.6e6) / 864e5) % 114) + 1, ds = S(dayS), ddp = deepOf(dayS);
  $('#feature').innerHTML = `<div class="home2">
    <button class="deepcard" style="margin:0" onclick="openDeep(${dayS},'context')"><span class="bg-ar">${ds.ar}</span><span class="eyebrow">Today's surah · ${dayS}</span><b>${esc(ds.tl)}: ${esc(ds.m)}</b><small>${fmt(ddp.hist[0].p[0].split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.'))}</small>
      <span class="btnrow" style="margin-top:12px"><span class="pill gold">${I.ctx} History</span></span></button>
    <button class="deepcard" style="margin:0" onclick="openOverview(26)"><span class="bg-ar">الشعراء</span><span class="eyebrow">Featured · Surah 26</span><b>Ash-Shu'ara: The Poets</b><small>Our richest study: seven prophets, one message, with a glossary, du'as and a nine-part journey.</small>
      <span class="btnrow" style="margin-top:12px"><span class="pill gold">${I.path} Explore</span></span></button></div>`;
  const tiles = [
    ['surahs', I.list, 'All 114 Surahs', 'Each with history, journey and lessons', 'سور'],
    ['juz30', I.moon, "Juz 'Amma", 'The short surahs, 78–114', 'عم'],
    ['hadith', I.scroll, 'Hadith', HAD.length + ' authentic narrations linked to verses', 'حديث'],
    ['d-journey', I.path, 'Journey of the day', esc(ds.tl) + ' in ' + ddp.secs.length + ' parts', 'رحلة'],
    ['d-lessons', I.lamp, 'Lessons of the day', 'From ' + esc(ds.tl), 'عبرة'],
    ['saved', I.mark, 'Saved verses', 'Your bookmarks', 'حفظ']
  ];
  $('#tiles').innerHTML = tiles.map(t => `<button class="tile" data-go="${t[0]}"><span class="ic">${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small><span class="bg-ar">${t[4]}</span></button>`).join('');
  $$('#tiles .tile').forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === 'juz30'){ sFilter = 'j30'; renderIndex(); show('surahs'); } else if (g.startsWith('d-')) openDeep(dayS, g.slice(2)); else show(g); });
  $('#credits').innerHTML = `Arabic: Uthmani script, King Fahd Complex (via QuranEnc). English: Saheeh International. Indonesian: Kementerian Agama RI. Hadith: Sunnah.com texts, translations and gradings. Commentary summarised from classical tafsir (Ibn Kathir, al-Tabari, al-Qurtubi).<br><span class="sym" style="font-size:20px;color:var(--gold)">وَٱللَّهُ أَعۡلَمُ</span><br>And Allah knows best.`;
  $('#sources').innerHTML = $('#credits').innerHTML;
  renderVom();
}
const VOM = []; SU.forEach(s => s.key.forEach(k => VOM.push([s.n, k])));
function renderVom(){
  const [s, k] = VOM[Math.floor(Date.now() / 3.6e6) % VOM.length];
  load(s).then(vs => {
    const v = vs[k-1];
    $('#vom').innerHTML = `<div class="glow"></div><div class="eyebrow" style="text-align:center;margin-bottom:8px">Verse for this hour</div>
      <div class="ar">${v.ar}</div>${tlLine(v, 'text-align:center')}<div class="en">“${esc(trAny(v))}”</div>
      <div class="ref">${esc(S(s).tl)} · ${s}:${k}</div>
      <div style="text-align:center;margin-top:12px"><button class="pill" onclick="openRead(${s},${k})">Read in context ${I.arrow}</button></div>`;
  });
}

/* ---------- surah index ---------- */
let sFilter = 'all', selS = 26;
const FILT = [['all','All'],['Makki','Makki'],['Madani','Madani'],['j30',"Juz 'Amma"],['hadith','With hadith']];
$('#sfilt').innerHTML = FILT.map(f => `<button data-f="${f[0]}">${f[1]}</button>`).join('');
$$('#sfilt button').forEach(b => b.onclick = () => { sFilter = b.dataset.f; renderIndex(); });
window.renderIndex = function(){
  $$('#sfilt button').forEach(b => b.classList.toggle('on', b.dataset.f === sFilter));
  const q = ($('#sq').value || '').trim().toLowerCase();
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  let list = SU.filter(s => {
    if (sFilter === 'Makki' || sFilter === 'Madani') { if (s.t !== sFilter) return false; }
    if (sFilter === 'j30' && s.n < 78) return false;
    if (sFilter === 'hadith' && !HS[s.n]) return false;
    if (sFilter === 'deep' && s.n !== 26) return false;
    if (!q) return true;
    return String(s.n) === q || norm(s.tl).includes(norm(q)) || s.m.toLowerCase().includes(q) || s.ar.includes(q);
  });
  let h = '', lastJ = 0;
  list.forEach(s => {
    if (!q && sFilter === 'all' && s.j !== lastJ){ h += `<div class="jhead">Juz ${s.j}</div>`; lastJ = s.j; }
    h += `<button class="srow ${s.n === selS && isWide() ? 'sel' : ''}" data-s="${s.n}"><span class="sn"><b>${s.n}</b></span><span class="si"><b>${esc(s.tl)}${s.n === 26 ? '<span class="deep">FEATURED</span>' : ''}</b><small>${esc(s.m)} · ${s.t} · ${s.c} verses${HS[s.n] ? ' · ' + HS[s.n].length + ' hadith' : ''}</small></span><span class="sa">${s.ar}</span></button>`;
  });
  $('#slist').innerHTML = h || '<div class="empty">No surah matches.</div>';
  $$('#slist .srow').forEach(b => b.onclick = () => openOverview(+b.dataset.s));
};
function showInlineOverview(n){
  $('#ov-inline').innerHTML = overviewHTML(n); bindOverview($('#ov-inline'), n); $('#ov-inline').scrollTop = 0;
  $$('#slist .srow').forEach(b => b.classList.toggle('sel', +b.dataset.s === n));
}
window.openOverview = function(n, push = true){
  selS = n;
  if (isWide() && cur !== 'surah'){ if (cur !== 'surahs') show('surahs'); showInlineOverview(n); return; }
  $('#ov').innerHTML = overviewHTML(n); bindOverview($('#ov'), n);
  $('#ov-title').textContent = S(n).tl;
  if (cur !== 'surah') show('surah', push); else window.scrollTo(0, 0);
};
function hadithCard(h, ctxS){
  const g = h.grade || 'Sahih', cls = /hasan/i.test(g) ? 'h' : '';
  const others = h.links.filter(l => l.s !== ctxS);
  return `<div class="hcard" data-h="${h.id}">
    <div class="hh"><div><div class="ht">${esc(h.title)}</div><div class="href">${esc(h.ref)}</div></div><span class="grade ${cls}">${esc(g.replace(/\s*\(.*\)/, ''))}</span></div>
    ${h.narrator ? `<div class="hn">${fmt(h.narrator)}</div>` : ''}
    <div class="he ${h.en.length > 420 ? 'clip' : ''}">${fmt(h.en)}</div>
    <div class="har">${esc(h.ar)}</div><div class="htl ${P.tl ? 'on' : ''} ${h.en.length > 420 ? 'clip' : ''}"><b>Transliteration</b>${esc(h.tl)}</div>
    <div class="hwhy"><b>Why it's here</b>${fmt(h.note)}${/\(/.test(g) ? `<br><span style="font-size:12px;color:var(--ink3)">Grading: ${esc(g)}</span>` : ''}</div>
    <div class="hact">
      ${h.en.length > 420 ? '<button data-ha="more">Read full</button>' : ''}
      <button data-ha="ar">Arabic</button><button data-ha="tl">Latin</button>
      <button data-ha="copy">Copy</button>
      ${h.links.map(l => (ctxS === l.s && !l.v) ? '' : `<button data-ha="go" data-s="${l.s}" data-v="${l.v ? l.v[0] : 0}">${esc(S(l.s).tl)}${l.v ? ' ' + l.s + ':' + l.v[0] + (l.v.length > 1 ? '–' + l.v[l.v.length-1] : '') : ''}</button>`).join('')}
    </div></div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ha]'); if (!b) return;
  const card = b.closest('.hcard'), h = HAD.find(x => x.id === card.dataset.h);
  if (b.dataset.ha === 'more'){ card.querySelector('.he').classList.toggle('clip'); const ht = card.querySelector('.htl'); if (ht) ht.classList.toggle('clip', card.querySelector('.he').classList.contains('clip')); b.textContent = card.querySelector('.he').classList.contains('clip') ? 'Read full' : 'Show less'; }
  if (b.dataset.ha === 'ar'){ card.querySelector('.har').classList.toggle('on'); }
  if (b.dataset.ha === 'tl'){ card.querySelector('.htl').classList.toggle('on'); }
  if (b.dataset.ha === 'copy'){ copyText(`${h.narrator}\n${h.en}\n— ${h.ref} (${h.grade})`); }
  if (b.dataset.ha === 'go'){ const s = +b.dataset.s, v = +b.dataset.v; if (v) openRead(s, v); else openOverview(s); }
});
function overviewHTML(n){
  const s = S(n), hs = HS[n] || [];
  const dp = deepOf(n), nIns = dp ? Object.keys(dp.notes).length : 0;
  const deep = dp ? `<button class="deepcard" data-deep="journey"><span class="bg-ar">تدبر</span><span class="eyebrow">Deep study</span><b>Understand ${esc(s.tl)} in depth</b><small>The history behind it, ${[8,11,18].includes(dp.secs.length) ? "an" : "a"} ${dp.secs.length}-part journey through the surah${nIns ? ', ' + nIns + ' verse insights' : ''}, lessons and questions for reflection.</small></button>
    <div class="deepgrid"><button data-deep="context">${I.ctx}History</button><button data-deep="journey">${I.path}Journey</button><button data-deep="lessons">${I.lamp}Lessons</button></div>` : '';
  return `<div class="card" style="padding:22px">
    <div class="ov-hero"><div class="medal">${starSVG}<div class="name">${s.ar}</div></div>
      <div class="eyebrow">Surah ${n}</div><h3>${esc(s.tl)}</h3><div class="sub">${esc(s.m)}</div></div>
    <div class="meta"><span class="chip"><b>${s.c}</b>verses</span><span class="chip"><b>${s.t}</b>${s.t === 'Makki' ? 'Makkah' : 'Madinah'}</span><span class="chip"><b>Juz</b>${s.j}${s.j2 !== s.j ? '–' + s.j2 : ''}</span>${hs.length ? `<span class="chip"><b>${hs.length}</b>hadith</span>` : ''}</div>
    <button class="pill gold" style="display:flex;margin:6px auto 0" data-read="1">${I.play} Read Surah ${esc(s.tl)}</button>
    ${deep}
    <div class="orn" style="margin:22px 0 12px"><span>۞</span></div>
    <div class="eyebrow">What it is about</div>
    <div class="prose" style="margin-top:6px"><p>${fmt(s.sum)}</p></div>
    <div class="callout"><span class="eyebrow">History &amp; context</span><p>${fmt(s.ctx)}</p>${dp ? `<button class="lk" style="color:var(--gold);font-size:12px;font-weight:600;letter-spacing:.8px;margin-top:8px" data-deep="context">READ THE FULL HISTORY →</button>` : ''}</div>
    <div class="eyebrow" style="margin-top:16px">Main themes</div>
    <div class="themes">${s.th.map(t => `<span>${fmt(t)}</span>`).join('')}</div>
    <div class="orn" style="margin:22px 0 6px"><span>۞</span></div>
    <div class="eyebrow" style="text-align:center">Key verses</div>
    <div class="kvs" data-kv="${n}"><div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>
    ${hs.length ? `<div class="orn" style="margin:22px 0 6px"><span>۞</span></div><div class="eyebrow" style="text-align:center;margin-bottom:12px">Hadith about this surah</div>${hs.map(h => hadithCard(h, n)).join('')}` : ''}
    <div class="navsur">
      ${n > 1 ? `<button data-ov="${n-1}"><small>← ${n-1}</small><b>${esc(S(n-1).tl)}</b></button>` : '<span style="flex:1"></span>'}
      ${n < 114 ? `<button class="r" data-ov="${n+1}"><small>${n+1} →</small><b>${esc(S(n+1).tl)}</b></button>` : '<span style="flex:1"></span>'}
    </div></div>`;
}
function bindOverview(root, n){
  root.querySelectorAll('[data-read]').forEach(b => b.onclick = () => openRead(n, 1));
  root.querySelectorAll('[data-deep]').forEach(b => b.onclick = () => openDeep(n, b.dataset.deep));
  root.querySelectorAll('[data-ov]').forEach(b => b.onclick = () => { if (root.id === 'ov-inline') { selS = +b.dataset.ov; showInlineOverview(selS); } else openOverview(+b.dataset.ov, false); });
  load(n).then(vs => {
    const box = root.querySelector('[data-kv="' + n + '"]'); if (!box) return;
    box.innerHTML = S(n).key.map(k => `<div class="kv"><div class="n">VERSE ${k}</div><div class="ar">${vs[k-1].ar}</div>${tlLine(vs[k-1])}<div class="en">${esc(trAny(vs[k-1]))}</div><button class="lk" style="color:var(--gold);font-size:12px;font-weight:600;letter-spacing:.8px;margin-top:6px" data-rv="${k}">READ IN CONTEXT →</button></div>`).join('');
    box.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => openRead(n, +b.dataset.rv));
  });
}

/* ---------- reader ---------- */
let curS = store.get('last', {s:1}).s || 1, readerFor = 0;
window.openRead = function(s, v){ curS = s; if (cur === 'read'){ ensureReader(v); } else show('read', true, {verse:v}); };
const REFRAIN = 'إِنَّ فِي ذَٰلِكَ لَأٓيَة';
function verseHTML(s, v, vs){
  const n = v.n, key = s + ':' + n, on = marks.includes(key);
  const ref = s === 26 && (v.ar.includes(REFRAIN) || (n > 1 && vs[n-2].ar.includes(REFRAIN)));
  const dp = deepOf(s), note = dp ? dp.notes[n] : null, hv = HV[key] || [];
  return `<div class="verse ${ref ? 'refrain has-badge' : ''}" id="v${n}" data-n="${n}">
    ${ref ? `<div class="badge">${I.spark}<span>The refrain</span></div>` : ''}
    <div class="ar">${v.ar}<span class="num"><b>${AR_DIG(n)}</b></span></div>
    ${tlLine(v)}
    ${P.lang !== 'none' ? `<div class="tr"><span class="vn">${n}</span>${esc(tr(v))}</div>` : ''}
    <div class="acts">
      ${note ? `<button class="ins" data-a="note">${I.spark}Insight</button>` : ''}
      ${hv.length ? `<button class="ins" data-a="had">${I.scroll}Hadith${hv.length > 1 ? ' · ' + hv.length : ''}</button>` : ''}
      <button data-a="mark" class="${on ? 'on' : ''}" aria-label="Save">${on ? I.markF : I.mark}</button>
      <button data-a="copy" aria-label="Copy">${I.copy}</button>
      <button data-a="share" aria-label="Share">${I.share}</button>
    </div>
    ${note ? `<div class="note"><span class="eyebrow">Insight · verse ${n}</span>${fmt(note)}</div>` : ''}
    ${hv.length ? `<div class="hbox">${hv.map(h => hadithCard(h, -1)).join('')}</div>` : ''}
  </div>`;
}
function ensureReader(verse){
  const s = curS, meta = S(s);
  $('#rd-title').innerHTML = `<h2>${esc(meta.tl)} <span style="font-family:Amiri,serif;color:var(--gold);font-weight:400;font-size:.85em">${meta.ar}</span></h2><small>${esc(meta.m)} · ${meta.c} verses · tap for overview</small>`;
  if (readerFor === s){ if (verse) setTimeout(() => goVerse(verse), 20); else window.scrollTo(0, scrollMem.read || 0); return; }
  $('#reader').innerHTML = '<div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
  $('#search').classList.remove('on'); $('#q').value = '';
  load(s).then(vs => {
    if (curS !== s) return;
    let h = '';
    if (s !== 1 && s !== 9) h += `<div class="rd-head"><div class="bism">${X.bismillah}</div><div class="bism-en">${esc(P.lang === 'id' ? X.bismillahId : X.bismillahEn)}</div></div>`;
    else h += `<div class="rd-head"><div class="eyebrow" style="padding-top:10px">${s === 9 ? 'This surah begins without the Bismillah' : 'The Opening'}</div></div>`;
    const sl = surahLevelH(s);
    if (sl.length) h += `<details class="surah-h"><summary>${I.scroll}<span>${sl.length} hadith about this surah</span></summary>${sl.map(x => hadithCard(x, s)).join('')}</details>`;
    const dpr = deepOf(s);
    if (dpr && dpr.secs.length > 1){
      dpr.secs.forEach((sec, i) => {
        h += `<div class="secbar"><div class="frame">${sec.ar ? `<div class="ar-s">${sec.ar}</div>` : `<div class="ar-s">${AR_DIG(i + 1)}</div>`}<div class="en-s">${esc(sec.title)}</div><div class="r">VERSES ${sec.from}${sec.to > sec.from ? '–' + sec.to : ''}</div></div></div>`;
        for (let n = sec.from; n <= sec.to; n++) h += verseHTML(s, vs[n-1], vs);
      });
    } else vs.forEach(v => h += verseHTML(s, v, vs));
    h += `<div class="orn"><span>۞</span></div><div style="text-align:center;font-family:Amiri,serif;color:var(--gold);font-size:24px">صَدَقَ ٱللَّهُ ٱلۡعَظِيمُ</div><div class="small" style="text-align:center">Allah the Almighty has spoken the truth</div>
      <div class="navsur">
      ${s > 1 ? `<button data-go="${s-1}"><small>← PREVIOUS</small><b>${esc(S(s-1).tl)}</b></button>` : '<span style="flex:1"></span>'}
      ${s < 114 ? `<button class="r" data-go="${s+1}"><small>NEXT →</small><b>${esc(S(s+1).tl)}</b></button>` : '<span style="flex:1"></span>'}
      </div><div style="height:20px"></div>`;
    $('#reader').innerHTML = h;
    $$('#reader .navsur [data-go]').forEach(b => b.onclick = () => { curS = +b.dataset.go; readerFor = 0; ensureReader(); window.scrollTo(0, 0); });
    readerFor = s;
    if (verse && verse > 1) setTimeout(() => goVerse(verse), 30); else window.scrollTo(0, 0);
  });
}
function goVerse(n){
  const el = document.getElementById('v' + n); if (!el) return;
  el.scrollIntoView({block:'start'});
  el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1600);
}
function copyText(t){ try { if (Native) Native.copy(t); else navigator.clipboard.writeText(t); toast('Copied'); } catch(e){ toast('Copy unavailable'); } }
$('#reader').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const el = b.closest('.verse'), n = +el.dataset.n, s = curS, v = cache[s][n-1], key = s + ':' + n;
  const text = `${v.ar}\n\n“${trAny(v)}”\n— Surah ${S(s).tl} (${s}:${n})`;
  if (b.dataset.a === 'note') el.querySelector('.note').classList.toggle('on');
  if (b.dataset.a === 'had') el.querySelector('.hbox').classList.toggle('on');
  if (b.dataset.a === 'mark'){
    marks = marks.includes(key) ? marks.filter(x => x !== key) : [...marks, key];
    store.set('marks', marks);
    const on = marks.includes(key); b.classList.toggle('on', on); b.innerHTML = on ? I.markF : I.mark;
    toast(on ? `Saved ${s}:${n}` : `Removed ${s}:${n}`);
  }
  if (b.dataset.a === 'copy') copyText(text);
  if (b.dataset.a === 'share'){ try { if (Native) Native.share(text); else if (navigator.share) navigator.share({text}); else copyText(text); } catch(err){} }
});
let lastSave = 0;
window.addEventListener('scroll', () => {
  $('#jump').classList.toggle('on', cur === 'read' && scrollY > 900);
  if (cur !== 'read' || !readerFor || Date.now() - lastSave < 500) return;
  lastSave = Date.now();
  for (const el of document.querySelectorAll('#reader .verse')){ if (el.getBoundingClientRect().bottom > 120){ store.set('last', {s:readerFor, v:+el.dataset.n}); break; } }
}, {passive:true});
window.toggleSearch = () => { const s = $('#search'); s.classList.toggle('on'); if (s.classList.contains('on')) $('#q').focus(); else { $('#q').value = ''; runSearch(''); } };
window.runSearch = q => {
  q = q.trim().toLowerCase(); const vs = cache[readerFor]; if (!vs) return;
  $$('#reader .verse').forEach(el => {
    const v = vs[+el.dataset.n - 1], t = trAny(v), hit = !q || t.toLowerCase().includes(q) || String(v.n) === q;
    el.style.display = hit ? '' : 'none';
    const trEl = el.querySelector('.tr');
    if (trEl) trEl.innerHTML = `<span class="vn">${v.n}</span>` + (q && hit ? esc(t).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), m => `<span class="hl">${m}</span>`) : esc(t));
  });
  $$('#reader .secbar,#reader .rd-head,#reader .surah-h').forEach(el => el.style.display = q ? 'none' : '');
};

/* ---------- hadith library ---------- */
let hFilter = 'all';
const HF = [['all','All'],['Bukhari','Bukhari'],['Muslim','Muslim'],['other','Others']];
$('#hfilt').innerHTML = HF.map(f => `<button data-f="${f[0]}">${f[1]}</button>`).join('');
$$('#hfilt button').forEach(b => b.onclick = () => { hFilter = b.dataset.f; renderHadith(); });
window.renderHadith = function(){
  $$('#hfilt button').forEach(b => b.classList.toggle('on', b.dataset.f === hFilter));
  const q = ($('#hq').value || '').trim().toLowerCase();
  const list = HAD.filter(h => {
    if (hFilter === 'Bukhari' && !h.ref.includes('Bukhari')) return false;
    if (hFilter === 'Muslim' && !h.ref.includes('Muslim')) return false;
    if (hFilter === 'other' && /Bukhari|Muslim/.test(h.ref)) return false;
    if (!q) return true;
    return (h.title + h.en + h.note + h.ref + h.links.map(l => S(l.s).tl).join(' ')).toLowerCase().includes(q);
  }).sort((a, b) => a.links[0].s - b.links[0].s);
  $('#hlist').innerHTML = list.map(h => hadithCard(h, -1)).join('') || '<div class="empty">No hadith match.</div>';
};

/* ---------- saved ---------- */
function renderSaved(){
  if (!marks.length){ $('#saved').innerHTML = `<div class="card empty">${I.mark.replace('<svg','<svg style="width:34px;height:34px;color:var(--gold)"')}<p>No saved verses yet.<br>Tap the bookmark under any verse while reading.</p></div>`; return; }
  const sorted = [...marks].sort((a, b) => { const [s1, v1] = a.split(':').map(Number), [s2, v2] = b.split(':').map(Number); return s1 - s2 || v1 - v2; });
  $('#saved').innerHTML = '<div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
  Promise.all([...new Set(sorted.map(k => +k.split(':')[0]))].map(load)).then(() => {
    $('#saved').innerHTML = `<div class="hgrid">${sorted.map(k => { const [s, n] = k.split(':').map(Number), v = cache[s][n-1]; return `<div class="card kv" style="padding:18px"><div class="n">${esc(S(s).tl.toUpperCase())} · ${s}:${n}</div><div class="ar">${v.ar}</div>${tlLine(v)}<div class="en">${esc(trAny(v))}</div><div class="btnrow"><button class="pill" data-s="${s}" data-v="${n}">${I.read} Open</button></div></div>`; }).join('')}</div>`;
    $$('#saved [data-s]').forEach(b => b.onclick = () => openRead(+b.dataset.s, +b.dataset.v));
  });
}

/* ---------- deep study (every surah) ---------- */
const DEEP = window.DEEP || {};
let dS = 26;
const CTX_EYE = ['Setting','The accusations','Culture','Sister surahs','Structure','Seven sicknesses'];
function deepOf(n){
  if (n === 26) return {
    hist: D.context.map((c, i) => ({t:c.t, ar:c.ar, eye:CTX_EYE[i], p:c.p})),
    glossary: D.glossary,
    secs: D.sections.map(x => ({from:x.from, to:x.to, title:x.title, ar:x.ar, sub:x.sub, people:x.people, summary:x.summary, lesson:x.lesson, mirror:x.mirror, key:x.key})),
    notes: D.notes, key: [], lessons: D.lessons, reflect: D.reflect, duas: D.duas
  };
  const d = DEEP[n]; if (!d) return null;
  return {
    hist: [{t:'How it was revealed', ar:'أسباب النزول', eye:'History & context', p:d.h}],
    glossary: [], duas: [],
    secs: d.s.map(x => ({from:x[0], to:x[1], title:x[2], summary:[x[3]]})),
    notes: d.n, key: d.k || [], lessons: d.l.map(l => ({t:l[0], v:l[1], d:l[2]})), reflect: d.r
  };
}
function setDeepHeads(){
  const m = S(dS);
  $$('.deep-ar').forEach(e => e.textContent = m.ar);
  $$('.deep-tl').forEach(e => e.textContent = m.tl + ' · ' + m.m);
}
function renderContext(){
  const dp = deepOf(dS), m = S(dS); setDeepHeads();
  $('#ctx').innerHTML = `<div class="card ctx" style="grid-column:1/-1"><span class="ar-c">${m.ar}</span><div class="eyebrow">Surah ${dS} · ${m.t === 'Makki' ? 'Revealed in Makkah' : 'Revealed in Madinah'}</div><h4>${esc(m.tl)}: ${esc(m.m)}</h4><p>${fmt(m.sum)}</p></div>` +
    dp.hist.map(c => `<div class="card ctx"><span class="ar-c">${c.ar}</span><div class="eyebrow">${esc(c.eye || '')}</div><h4>${esc(c.t)}</h4>${c.p.map(p => `<p>${fmt(p)}</p>`).join('')}</div>`).join('') +
    `<div class="card ctx"><div class="eyebrow">Main themes</div><div class="themes">${m.th.map(t => `<span>${fmt(t)}</span>`).join('')}</div>
     <div class="btnrow"><button class="pill gold" onclick="show('journey')">${I.path} The Journey</button><button class="pill" onclick="openRead(${dS},1)">${I.read} Read</button></div></div>`;
  $('#gloss-wrap').style.display = dp.glossary.length ? '' : 'none';
  $('#gloss').innerHTML = dp.glossary.map(g => `<div class="gl"><div class="g-ar">${g[1]}</div><b>${g[0]}</b><span>${fmt(g[2])}</span></div>`).join('');
}
const SECCOL = ['#D9B66F','#4FA88A','#C9906B','#6E9BC6','#B9A15A','#C47A6A','#8E86C2','#5FB3A6','#E3C88E','#9FB86A','#C98FB0','#7FA7B8','#D2A06A','#8FB59A','#B88E7A','#A3A0D0'];
let selSec = 0, secFor = 0;
function renderJourney(){
  const dp = deepOf(dS), m = S(dS); setDeepHeads();
  if (secFor !== dS){ selSec = dS === 26 ? 1 : 0; secFor = dS; }
  $('#j-intro').textContent = dp.secs.length > 1 ? `${m.tl} moves in ${dp.secs.length} parts. Each bar is sized by its number of verses; tap a part to explore it.` : `${m.tl} is a single, unified passage of ${m.c} verses.`;
  $('#j-end').textContent = 'v. ' + m.c;
  load(dS).then(() => {
    $('#vmap').innerHTML = dp.secs.map((s, i) => `<i title="${esc(s.title)}" style="flex:${s.to - s.from + 1};background:${SECCOL[i % SECCOL.length]}"></i>`).join('');
    $('#tl').innerHTML = dp.secs.map((s, i) => `
      <button class="step ${i === selSec && isWide() ? 'sel' : ''}" data-i="${i}">
        <span class="knot"><span>${AR_DIG(i + 1)}</span></span>
        <span class="card">${s.ar ? `<span class="ar-n">${s.ar}</span>` : ''}
          <div class="rng" style="color:${SECCOL[i % SECCOL.length]}">VERSES ${s.from}${s.to > s.from ? '–' + s.to : ''} · ${s.to - s.from + 1} AYAT</div>
          <h4>${esc(s.title)}</h4><p>${fmt(s.sub || s.summary[0])}</p></span>
      </button>`).join('');
    $$('#tl .step').forEach(b => b.onclick = () => openSection(+b.dataset.i));
    if (isWide()){ $('#jdetail-inline').innerHTML = detailHTML(selSec); bindDetail($('#jdetail-inline')); }
  });
}
function openSection(i){
  selSec = i; const dp = deepOf(dS);
  if (isWide()){ $$('#tl .step').forEach(x => x.classList.toggle('sel', +x.dataset.i === i)); $('#jdetail-inline').innerHTML = detailHTML(i); $('#jdetail-inline').scrollTop = 0; bindDetail($('#jdetail-inline')); }
  else { $('#detail').innerHTML = detailHTML(i); bindDetail($('#detail')); $('#dt-title').textContent = dp.secs[i].title; if (cur === 'detail') window.scrollTo(0, 0); else show('detail'); }
}
function detailHTML(i){
  const dp = deepOf(dS), s = dp.secs[i], V = cache[dS], m = S(dS);
  const hs = []; for (let n = s.from; n <= s.to; n++) (HV[dS + ':' + n] || []).forEach(h => hs.includes(h) || hs.push(h));
  let keys = s.key ? s.key.slice() : [];
  if (!s.key){
    const inR = v => v >= s.from && v <= s.to;
    keys = [...new Set([...Object.keys(dp.notes).map(Number).filter(inR), ...dp.key.filter(inR), ...dp.lessons.map(l => l.v).filter(inR)])].sort((a, b) => a - b);
    if (!keys.length) keys = [s.from];
  }
  const verseBlock = n => `<div class="kv"><div class="n">VERSE ${n}</div><div class="ar">${V[n-1].ar}</div>${tlLine(V[n-1])}<div class="en">${esc(trAny(V[n-1]))}</div>${dp.notes[n] && !s.key ? `<div class="callout" style="margin:10px 0 0"><span class="eyebrow">Insight</span><p>${fmt(dp.notes[n])}</p></div>` : ''}</div>`;
  return `<div class="card" style="padding:22px">
    <div class="det-hero"><div class="big">${s.ar || AR_DIG(i + 1)}</div><div class="eyebrow">${esc(m.tl)} · part ${i + 1} of ${dp.secs.length}</div><h3>${esc(s.title)}</h3>${s.sub ? `<div class="sub">${fmt(s.sub)}</div>` : ''}</div>
    <div class="meta"><span class="chip"><b>${s.from}${s.to > s.from ? '–' + s.to : ''}</b>${s.to > s.from ? 'verses' : 'verse'}</span>${s.people ? `<span class="chip">${fmt(s.people)}</span>` : ''}</div>
    <div class="prose">${s.summary.map(p => `<p>${fmt(p)}</p>`).join('')}</div>
    ${s.lesson ? `<div class="callout"><span class="eyebrow">The lesson</span><p>${fmt(s.lesson)}</p></div>` : ''}
    ${s.mirror ? `<div class="callout" style="border-color:var(--accent)"><span class="eyebrow" style="color:var(--accent)">A mirror for Makkah</span><p>${fmt(s.mirror)}</p></div>` : ''}
    <div class="orn" style="margin:22px 0 6px"><span>۞</span></div>
    <div class="eyebrow" style="text-align:center">Key verses${!s.key ? ' &amp; insights' : ''}</div>
    ${keys.map(verseBlock).join('')}
    ${hs.length ? `<div class="orn" style="margin:22px 0 6px"><span>۞</span></div><div class="eyebrow" style="text-align:center;margin-bottom:12px">From the Hadith</div>${hs.map(h => hadithCard(h, -1)).join('')}` : ''}
    <div class="btnrow" style="justify-content:center">
      <button class="pill gold" data-read="${s.from}">${I.read} Read ${s.to > s.from ? 'verses ' + s.from + '–' + s.to : 'verse ' + s.from}</button>
      ${i < dp.secs.length - 1 ? `<button class="pill" data-next="${i + 1}">Next: ${esc(dp.secs[i+1].title)} ${I.arrow}</button>` : `<button class="pill" data-lessons="1">${I.lamp} Lessons</button>`}
    </div></div>`;
}
function bindDetail(root){
  root.querySelectorAll('[data-read]').forEach(b => b.onclick = () => openRead(dS, +b.dataset.read));
  root.querySelectorAll('[data-next]').forEach(b => b.onclick = () => openSection(+b.dataset.next));
  root.querySelectorAll('[data-lessons]').forEach(b => b.onclick = () => show('lessons'));
}
let lessonTab = 'lessons';
$$('#lseg button').forEach(b => b.onclick = () => { lessonTab = b.dataset.t; renderLessons(); });
function renderLessons(){
  const dp = deepOf(dS); setDeepHeads();
  if (lessonTab === 'duas' && !dp.duas.length) lessonTab = 'lessons';
  $$('#lseg button').forEach(b => { b.classList.toggle('on', b.dataset.t === lessonTab); if (b.dataset.t === 'duas') b.style.display = dp.duas.length ? '' : 'none'; });
  const body = $('#lbody');
  load(dS).then(V => {
    if (lessonTab === 'lessons'){
      body.innerHTML = `<div class="lessons-grid">${dp.lessons.map((l, i) => `<div class="card lesson"><div class="ln">${i+1}</div><div><b>${esc(l.t)}</b><p>${fmt(l.d)}</p><div class="ar" style="font-size:calc(var(--ar-size) - 8px);line-height:2;color:var(--gold2);margin:4px 0;text-align:right">${V[l.v-1].ar}</div>${tlLine(V[l.v-1], 'margin:0 0 6px')}<button class="lk" data-v="${l.v}">VERSE ${l.v} →</button></div></div>`).join('')}</div>`;
    } else if (lessonTab === 'duas'){
      body.innerHTML = `<div class="lessons-grid">${dp.duas.map(d => { const vs = V.slice(d.from - 1, d.to); return `<div class="card dua"><div class="eyebrow t">${esc(d.t)}</div><div class="ar">${vs.map(v => v.ar + ` <span style="color:var(--gold);font-size:.6em">﴿${AR_DIG(v.n)}﴾</span>`).join(' ')}</div>${P.tl ? `<div class="tl8" style="text-align:center">${vs.map(v => esc(qtl(v.tl))).join(' ')}</div>` : ''}<div class="en">${vs.map(v => esc(trAny(v))).join(' ')}</div><div style="text-align:center;margin-top:10px"><button class="lk" style="color:var(--gold);font-size:12px;font-weight:600;letter-spacing:.8px" data-v="${d.from}">VERSES ${d.from}${d.to > d.from ? '–' + d.to : ''}</button></div></div>`; }).join('')}</div>`;
    } else {
      body.innerHTML = `<div class="card"><div class="eyebrow">Tadabbur · تدبر</div><h3 class="sec">Questions for your heart</h3><p class="small" style="margin-top:0">Tadabbur means deep reflection on the Quran. Take one question with you today, perhaps after a prayer, and sit with it.</p>${dp.reflect.map(q => `<div class="q">${esc(q)}</div>`).join('')}</div>`;
    }
    body.querySelectorAll('[data-v]').forEach(b => b.onclick = () => openRead(dS, +b.dataset.v));
  });
}
window.openDeep = function(n, view){ dS = n; show(view, true, {force:true}); };

/* ---------- init ---------- */
applyPrefs(); renderHome(); renderIndex();
let lastW = innerWidth;
window.addEventListener('resize', () => {
  const w = innerWidth; if ((w >= 700) === (lastW >= 700)) { lastW = w; return; }
  lastW = w; renderHome(); renderIndex();
  if (w >= 700){
    if (cur === 'surah') show('surahs', false, {force:true});
    if (cur === 'detail') show('journey', false, {force:true});
    if (cur === 'surahs') showInlineOverview(selS);
    if (cur === 'journey') renderJourney();
  }
});
if (location.hash){
  const [hv, ha, hb] = location.hash.slice(1).split('-');
  if (hv === 'day'){ P.theme = 'day'; applyPrefs(); }
  else if (hv === 'read') openRead(+ha || 1, +hb || 0);
  else if (hv === 'surah') openOverview(+ha || 1);
  else if (hv === 'detail'){ dS = +ha || 26; load(dS).then(() => { show('journey'); openSection(+hb || 0); }); }
  else if (hv === 'deep'){ openDeep(+ha || 26, hb || 'journey'); }
  else if (hv === 'sheet') openSheet();
  else if (document.getElementById('v-' + hv)) show(hv);
  $('#splash').classList.add('out');
}
document.fonts && document.fonts.ready.then(() => setTimeout(() => $('#splash').classList.add('out'), 600));
setTimeout(() => $('#splash').classList.add('out'), 2500);
})();
