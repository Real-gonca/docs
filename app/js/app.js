/**
 * Línguas de Angola - Aplicação principal (protótipo)
 * Dados demonstrativos. Traduções reais requerem validação linguística.
 */

const STORAGE_KEYS = {
  theme: 'la-theme',
  contrast: 'la-contrast',
  history: 'la-history',
  favorites: 'la-favorites',
  suggestions: 'la-suggestions',
  ratings: 'la-ratings',
  user: 'la-user',
  users: 'la-users',
  adminItems: 'la-admin-items'
};

function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() { return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function formatDate(iso) {
  try { return new Date(iso).toLocaleString('pt-AO', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}

function getLangName(id) { return (LANGUAGES.find(l => l.id === id) || {}).name || id; }
function getTargetName(id) { return (TARGET_LANGUAGES.find(l => l.id === id) || {}).name || id; }
function getCategoryName(id) { return (CATEGORIES.find(c => c.id === id) || {}).name || id; }
function getPhraseCategoryName(id) { return (PHRASE_CATEGORIES.find(c => c.id === id) || {}).name || id; }

/* ---- Theme / Accessibility ---- */
function initTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  const contrast = localStorage.getItem(STORAGE_KEYS.contrast) || 'normal';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-contrast', contrast);
  syncThemeControls();
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  syncThemeControls();
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}
function toggleContrast() {
  const current = document.documentElement.getAttribute('data-contrast') || 'normal';
  const next = current === 'high' ? 'normal' : 'high';
  document.documentElement.setAttribute('data-contrast', next);
  localStorage.setItem(STORAGE_KEYS.contrast, next);
  syncThemeControls();
}
function syncThemeControls() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const contrast = document.documentElement.getAttribute('data-contrast') || 'normal';
  $$('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    const label = btn.querySelector('.theme-toggle-label');
    if (label) label.textContent = theme === 'dark' ? 'Tema claro' : 'Tema escuro';
    btn.title = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  });
  $$('.contrast-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', contrast === 'high' ? 'true' : 'false');
    btn.title = contrast === 'high' ? 'Desativar alto contraste' : 'Ativar alto contraste';
  });
}

/* ---- Navigation ---- */
function initNav() {
  const toggle = $('.nav-toggle');
  const nav = $('#nav-main');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.target.closest('.nav-wrap')) return;
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        toggle.focus();
      }
    });
  }

  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  $$('.theme-toggle').forEach(btn => btn.addEventListener('click', toggleTheme));
  $$('.contrast-toggle').forEach(btn => btn.addEventListener('click', toggleContrast));
}

/* ---- Toast / Status ---- */
function announce(message, type = 'info') {
  let region = $('#status-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'status-region';
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  region.textContent = '';
  setTimeout(() => { region.textContent = message; }, 40);

  let container = $('#toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('is-visible'); }, 10);
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

async function copyText(text, label = 'Texto copiado') {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    announce(label, 'success');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); announce(label, 'success'); }
    catch { announce('Não foi possível copiar.', 'error'); }
    ta.remove();
  }
}

/* ---- Translation (demo) ---- */
const MAX_CHARS = 500;

function normalizeText(s) { return String(s || '').trim().replace(/\s+/g, ' '); }
function normalizeLookup(s) { return normalizeText(s).toLowerCase(); }

function findDemoTranslation(text, sourceLang, targetLang) {
  const q = normalizeLookup(text);
  if (!q) return null;

  // Search phrases
  for (const p of PHRASES) {
    if (p.sourceLang === sourceLang && normalizeLookup(p.original) === q) {
      return {
        text: targetLang === 'pt' ? p.pt : p.en,
        validated: p.validated,
        confidence: p.validated ? 'high' : 'low',
        source: 'phrase',
        alternatives: [],
        note: p.validated ? null : 'Tradução ainda não validada. Ajude-nos a melhorar este conteúdo.'
      };
    }
  }
  // Search dictionary
  for (const d of DICTIONARY) {
    if (d.sourceLang === sourceLang && normalizeLookup(d.word) === q) {
      return {
        text: targetLang === 'pt' ? d.pt : d.en,
        validated: d.validated,
        confidence: d.confidence || 'low',
        source: 'dictionary',
        alternatives: [],
        note: d.validated ? null : 'Tradução ainda não validada. Ajude-nos a melhorar este conteúdo.'
      };
    }
  }
  // Partial phrase contains (simple demo)
  for (const p of PHRASES) {
    if (p.sourceLang === sourceLang && normalizeLookup(p.original).includes(q)) {
      return {
        text: targetLang === 'pt' ? p.pt : p.en,
        validated: false,
        confidence: 'low',
        source: 'phrase-partial',
        alternatives: [],
        note: 'Correspondência parcial demonstrativa. Tradução ainda não validada. Ajude-nos a melhorar este conteúdo.'
      };
    }
  }
  return null;
}

function performTranslation(text, sourceLang, targetLang) {
  const clean = normalizeText(text);
  if (!clean) return { error: 'empty', message: 'Introduza uma palavra, frase ou texto para traduzir.' };
  if (clean.length > MAX_CHARS) return { error: 'too_long', message: `O texto excede o limite de ${MAX_CHARS} caracteres.` };
  if (!LANGUAGES.some(l => l.id === sourceLang)) return { error: 'invalid_source', message: 'Selecione uma língua nacional de origem válida.' };
  if (!TARGET_LANGUAGES.some(l => l.id === targetLang)) return { error: 'invalid_target', message: 'Selecione Português ou Inglês como idioma de destino.' };

  const found = findDemoTranslation(clean, sourceLang, targetLang);
  if (found) {
    return { ok: true, input: clean, sourceLang, targetLang, ...found };
  }
  return {
    ok: true,
    input: clean,
    sourceLang,
    targetLang,
    text: `[Tradução demonstrativa indisponível] O texto inserido em ${getLangName(sourceLang)} ainda não está na base de dados do protótipo. Em produção, este pedido seria encaminhado para o motor de tradução e para validação linguística.`,
    validated: false,
    confidence: 'none',
    source: 'none',
    alternatives: [],
    note: 'Tradução ainda não validada. Ajude-nos a melhorar este conteúdo. Não foi gerada uma tradução real automática neste protótipo.'
  };
}

/* ---- History ---- */
function getHistory() { return loadJSON(STORAGE_KEYS.history, []); }
function addHistory(entry) {
  const history = getHistory();
  history.unshift({ ...entry, id: uid(), createdAt: new Date().toISOString() });
  saveJSON(STORAGE_KEYS.history, history.slice(0, 30));
}
function clearHistory() { saveJSON(STORAGE_KEYS.history, []); }

function renderHistory(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const history = getHistory();
  if (history.length === 0) {
    el.innerHTML = '<p class="empty-state">Ainda não existem traduções no histórico.</p>';
    return;
  }
  el.innerHTML = history.map(h => `
    <article class="history-item">
      <div class="history-meta">
        <span class="badge">${escapeHTML(getLangName(h.sourceLang))} → ${escapeHTML(getTargetName(h.targetLang))}</span>
        <span class="history-date">${escapeHTML(formatDate(h.createdAt))}</span>
      </div>
      <p class="history-source"><strong>Original:</strong> ${escapeHTML(h.input)}</p>
      <p class="history-target"><strong>Tradução:</strong> ${escapeHTML(h.text)}</p>
      <div class="history-actions">
        <button class="btn btn-ghost btn-sm" data-copy="${escapeHTML(h.text)}">Copiar</button>
        <button class="btn btn-ghost btn-sm" data-reuse-history="${escapeHTML(h.id)}">Reutilizar</button>
      </div>
    </article>
  `).join('');
  bindCopyButtons(el);
  el.querySelectorAll('[data-reuse-history]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = getHistory().find(x => x.id === btn.getAttribute('data-reuse-history'));
      if (item) reuseHistoryItem(item);
    });
  });
}

function reuseHistoryItem(item) {
  const src = $('#source-lang');
  const tgt = $('#target-lang');
  const input = $('#source-text');
  if (src) src.value = item.sourceLang;
  if (tgt) tgt.value = item.targetLang;
  if (input) { input.value = item.input; input.dispatchEvent(new Event('input')); }
  announce('Texto carregado do histórico.', 'info');
  $('#source-text')?.focus();
}

function bindCopyButtons(ctx = document) {
  ctx.querySelectorAll('[data-copy]').forEach(btn => {
    if (btn.dataset.copyBound) return;
    btn.dataset.copyBound = '1';
    btn.addEventListener('click', () => copyText(btn.getAttribute('data-copy'), 'Conteúdo copiado.'));
  });
}

/* ---- Download ---- */
function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  announce('Ficheiro descarregado.', 'success');
}

/* ---- Speech ---- */
function canSpeak() { return 'speechSynthesis' in window; }
function speakText(text, langHint) {
  if (!canSpeak()) { announce('A síntese de voz não está disponível neste navegador.', 'error'); return; }
  if (!text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langHint === 'en' ? 'en-US' : 'pt-PT';
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function initVoiceInput() {
  const btn = $('#voice-input-btn');
  const status = $('#voice-status');
  if (!btn) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  btn.addEventListener('click', () => {
    const sourceLang = $('#source-lang')?.value;
    const lang = LANGUAGES.find(l => l.id === sourceLang);
    // Recognition for Angolan national languages is generally not available in browsers.
    // We provide an honest, informative message and only attempt if user explicitly tries;
    // for these languages, we show the unavailability notice.
    if (!SpeechRecognition) {
      const msg = 'O reconhecimento de voz não está disponível neste navegador. Tente utilizar um navegador compatível ou escreva o texto manualmente.';
      if (status) { status.textContent = msg; status.className = 'notice notice-warning'; }
      announce(msg, 'warning');
      return;
    }
    // Even with SpeechRecognition, Angolan language models are typically unavailable.
    // We attempt with a best-effort fallback but clearly inform the user.
    const msg = `O reconhecimento de voz para ${lang ? lang.name : 'esta língua'} pode não estar disponível neste navegador/dispositivo. Se não funcionar, escreva o texto manualmente.`;
    if (status) { status.textContent = msg; status.className = 'notice notice-info'; }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT'; // best-effort fallback; Angolan langs not typically supported
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (status) status.textContent = 'A ouvir... fale agora. Se o reconhecimento não estiver disponível para a língua selecionada, escreva o texto manualmente.';
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const input = $('#source-text');
        if (input) { input.value = transcript; input.dispatchEvent(new Event('input')); }
        if (status) { status.textContent = 'Áudio convertido em texto (resultado demonstrativo/dependente do navegador). Verifique o texto antes de traduzir.'; status.className = 'notice notice-warning'; }
      };
      recognition.onerror = () => {
        if (status) { status.textContent = `Não foi possível reconhecer o áudio para ${lang ? lang.name : 'a língua selecionada'}. O reconhecimento de voz pode ainda não estar disponível para esta língua.`; status.className = 'notice notice-warning'; }
      };
      recognition.onend = () => { btn.disabled = false; btn.removeAttribute('aria-busy'); };
      recognition.start();
    } catch {
      if (status) { status.textContent = `Reconhecimento de voz indisponível para ${lang ? lang.name : 'esta língua'}. Escreva o texto manualmente.`; status.className = 'notice notice-warning'; }
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
    }
  });
}

/* ---- Suggestions / Ratings ---- */
function getSuggestions() { return loadJSON(STORAGE_KEYS.suggestions, []); }
function addSuggestion(s) {
  const items = getSuggestions();
  items.unshift({ ...s, id: uid(), createdAt: new Date().toISOString(), status: 'Pendente' });
  saveJSON(STORAGE_KEYS.suggestions, items);
}
function getRatings() { return loadJSON(STORAGE_KEYS.ratings, []); }
function addRating(r) {
  const items = getRatings();
  items.unshift({ ...r, id: uid(), createdAt: new Date().toISOString() });
  saveJSON(STORAGE_KEYS.ratings, items);
}

/* ---- Translation Page ---- */
function initTranslationPage() {
  const form = $('#translation-form');
  if (!form) return;

  const sourceLang = $('#source-lang');
  const targetLang = $('#target-lang');
  const sourceText = $('#source-text');
  const charCount = $('#char-count');
  const resultEl = $('#translation-result');
  const metaEl = $('#translation-meta');
  const validationEl = $('#translation-validation');
  const copyBtn = $('#copy-result');
  const listenBtn = $('#listen-result');
  const downloadBtn = $('#download-result');
  const clearBtn = $('#clear-form');
  const feedbackForm = $('#feedback-form');

  let lastResult = null;

  function updateCount() {
    const len = (sourceText.value || '').length;
    charCount.textContent = `${len} / ${MAX_CHARS} caracteres`;
    charCount.classList.toggle('is-limit', len > MAX_CHARS);
  }
  sourceText.addEventListener('input', updateCount);
  updateCount();

  function renderResult(res) {
    lastResult = res;
    if (!res.ok) {
      resultEl.innerHTML = `<p class="result-error">${escapeHTML(res.message)}</p>`;
      metaEl.innerHTML = '';
      validationEl.innerHTML = '';
      return;
    }
    resultEl.textContent = res.text;
    const confLabels = { high: 'Alta', medium: 'Média', low: 'Baixa', none: 'Sem correspondência' };
    const conf = confLabels[res.confidence] || 'Desconhecida';
    metaEl.innerHTML = `
      <span class="badge">${escapeHTML(getLangName(res.sourceLang))} → ${escapeHTML(getTargetName(res.targetLang))}</span>
      <span class="badge ${res.validated ? 'badge-success' : 'badge-warning'}">${res.validated ? 'Validada' : 'Ainda não validada'}</span>
      <span class="badge badge-muted">Confiança: ${escapeHTML(conf)}</span>
    `;
    validationEl.innerHTML = res.validated
      ? `<div class="notice notice-success" role="status">Tradução validada por linguista (demonstração).</div>`
      : `<div class="notice notice-warning" role="status">${escapeHTML(res.note || 'Tradução ainda não validada. Ajude-nos a melhorar este conteúdo.')}</div>`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = performTranslation(sourceText.value, sourceLang.value, targetLang.value);
    renderResult(res);
    if (res.ok) {
      addHistory({ input: res.input, text: res.text, sourceLang: res.sourceLang, targetLang: res.targetLang, validated: res.validated });
      renderHistory('history-list');
      announce('Tradução concluída (protótipo).', 'success');
    } else {
      announce(res.message, 'error');
    }
  });

  clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    updateCount();
    resultEl.innerHTML = '<p class="result-placeholder">A tradução aparecerá aqui.</p>';
    metaEl.innerHTML = '';
    validationEl.innerHTML = '';
    lastResult = null;
    sourceText.focus();
  });

  copyBtn.addEventListener('click', () => {
    if (!lastResult?.ok) { announce('Não há tradução para copiar.', 'warning'); return; }
    copyText(lastResult.text, 'Tradução copiada.');
  });
  listenBtn.addEventListener('click', () => {
    if (!lastResult?.ok) { announce('Não há tradução para ouvir.', 'warning'); return; }
    speakText(lastResult.text, lastResult.targetLang);
  });
  downloadBtn.addEventListener('click', () => {
    if (!lastResult?.ok) { announce('Não há tradução para descarregar.', 'warning'); return; }
    const content = `Línguas de Angola - Tradução (Protótipo)\n` +
      `Data: ${new Date().toLocaleString('pt-AO')}\n` +
      `Origem: ${getLangName(lastResult.sourceLang)}\n` +
      `Destino: ${getTargetName(lastResult.targetLang)}\n` +
      `Estado: ${lastResult.validated ? 'Validada' : 'Ainda não validada'}\n\n` +
      `TEXTO ORIGINAL:\n${lastResult.input}\n\n` +
      `TRADUÇÃO:\n${lastResult.text}\n\n` +
      `AVISO: Conteúdo demonstrativo do protótipo. Traduções devem ser validadas por linguistas.\n`;
    downloadText('traducao-linguas-de-angola.txt', content);
  });

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#feedback-name').value.trim();
      const email = $('#feedback-email').value.trim();
      const suggestion = $('#feedback-suggestion').value.trim();
      const rating = $('input[name="rating"]:checked')?.value || '';
      if (!suggestion && !rating) { announce('Indique uma avaliação ou sugestão.', 'warning'); return; }
      if (suggestion) addSuggestion({ name, email, suggestion, sourceLang: sourceLang.value, targetLang: targetLang.value, original: sourceText.value.trim(), translated: lastResult?.text || '' });
      if (rating) addRating({ rating, sourceLang: sourceLang.value, targetLang: targetLang.value, original: sourceText.value.trim() });
      feedbackForm.reset();
      announce('Obrigado pelo seu contributo. A sugestão foi registada para revisão.', 'success');
    });
  }

  renderHistory('history-list');
  $('#clear-history')?.addEventListener('click', () => {
    clearHistory();
    renderHistory('history-list');
    announce('Histórico limpo.', 'info');
  });
  initVoiceInput();
}

/* ---- Dictionary ---- */
function initDictionaryPage() {
  const list = $('#dictionary-list');
  if (!list) return;
  const search = $('#dict-search');
  const langFilter = $('#dict-lang');
  const catFilter = $('#dict-category');
  const statusFilter = $('#dict-status');

  function render() {
    const q = normalizeLookup(search.value);
    const lang = langFilter.value;
    const cat = catFilter.value;
    const status = statusFilter.value;
    const items = DICTIONARY.filter(d => {
      if (lang && d.sourceLang !== lang) return false;
      if (cat && d.category !== cat) return false;
      if (status === 'validated' && !d.validated) return false;
      if (status === 'pending' && d.validated) return false;
      if (q) {
        const hay = [d.word, d.pt, d.en, d.example, d.region, getLangName(d.sourceLang), getCategoryName(d.category)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    $('#dict-count').textContent = `${items.length} entrada(s) encontrada(s)`;
    if (items.length === 0) {
      list.innerHTML = '<p class="empty-state">Nenhuma entrada encontrada. Experimente ajustar os filtros.</p>';
      return;
    }
    list.innerHTML = items.map(d => `
      <article class="dict-card card card-static">
        <div class="dict-card-header">
          <div>
            <span class="badge">${escapeHTML(getLangName(d.sourceLang))}</span>
            <span class="badge badge-muted">${escapeHTML(getCategoryName(d.category))}</span>
          </div>
          <span class="badge ${d.validated ? 'badge-success' : 'badge-warning'}">${d.validated ? 'Validada' : 'Ainda não validada'}</span>
        </div>
        <h3 class="dict-word">${escapeHTML(d.word)}</h3>
        <dl class="dict-def">
          <div><dt>Português</dt><dd>${escapeHTML(d.pt)}</dd></div>
          <div><dt>English</dt><dd>${escapeHTML(d.en)}</dd></div>
          <div><dt>Exemplo</dt><dd>${escapeHTML(d.example)}</dd></div>
          <div><dt>Região/variante</dt><dd>${escapeHTML(d.region || '—')}</dd></div>
          <div><dt>Pronúncia</dt><dd>${d.pronunciation ? `<button class="btn btn-ghost btn-sm" data-speak="${escapeHTML(d.word)}" data-speak-lang="pt">Ouvir</button>` : '<span class="text-muted">Áudio não disponível (demonstração)</span>'}</dd></div>
        </dl>
        <div class="dict-actions">
          <button class="btn btn-ghost btn-sm" data-copy="${escapeHTML(d.pt)}">Copiar PT</button>
          <button class="btn btn-ghost btn-sm" data-copy="${escapeHTML(d.en)}">Copiar EN</button>
        </div>
      </article>
    `).join('');
    bindCopyButtons(list);
    list.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speakText(btn.getAttribute('data-speak'), btn.getAttribute('data-speak-lang'))));
  }

  [search, langFilter, catFilter, statusFilter].forEach(el => el.addEventListener('input', render));
  [langFilter, catFilter, statusFilter].forEach(el => el.addEventListener('change', render));
  render();
}

/* ---- Phrases ---- */
function initPhrasesPage() {
  const list = $('#phrases-list');
  if (!list) return;
  const search = $('#phrase-search');
  const langFilter = $('#phrase-lang');
  const catFilter = $('#phrase-category');

  function render() {
    const q = normalizeLookup(search.value);
    const lang = langFilter.value;
    const cat = catFilter.value;
    const items = PHRASES.filter(p => {
      if (lang && p.sourceLang !== lang) return false;
      if (cat && p.category !== cat) return false;
      if (q) {
        const hay = [p.original, p.pt, p.en, getLangName(p.sourceLang), getPhraseCategoryName(p.category)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    $('#phrase-count').textContent = `${items.length} frase(s) encontrada(s)`;
    if (items.length === 0) {
      list.innerHTML = '<p class="empty-state">Nenhuma frase encontrada.</p>';
      return;
    }
    list.innerHTML = items.map(p => `
      <article class="phrase-card card card-static">
        <div class="dict-card-header">
          <div>
            <span class="badge">${escapeHTML(getLangName(p.sourceLang))}</span>
            <span class="badge badge-muted">${escapeHTML(getPhraseCategoryName(p.category))}</span>
          </div>
          <span class="badge ${p.validated ? 'badge-success' : 'badge-warning'}">${p.validated ? 'Validada' : 'Ainda não validada'}</span>
        </div>
        <div class="phrase-original">
          <span class="phrase-label">Frase original</span>
          <p>${escapeHTML(p.original)}</p>
        </div>
        <div class="phrase-translations">
          <div class="phrase-target">
            <span class="phrase-label">Português</span>
            <p>${escapeHTML(p.pt)}</p>
            <div class="phrase-actions">
              <button class="btn btn-ghost btn-sm" data-copy="${escapeHTML(p.pt)}">Copiar</button>
              <button class="btn btn-ghost btn-sm" data-speak="${escapeHTML(p.pt)}" data-speak-lang="pt">Ouvir</button>
            </div>
          </div>
          <div class="phrase-target">
            <span class="phrase-label">English</span>
            <p>${escapeHTML(p.en)}</p>
            <div class="phrase-actions">
              <button class="btn btn-ghost btn-sm" data-copy="${escapeHTML(p.en)}">Copiar</button>
              <button class="btn btn-ghost btn-sm" data-speak="${escapeHTML(p.en)}" data-speak-lang="en">Ouvir</button>
            </div>
          </div>
        </div>
      </article>
    `).join('');
    bindCopyButtons(list);
    list.querySelectorAll('[data-speak]').forEach(btn => btn.addEventListener('click', () => speakText(btn.getAttribute('data-speak'), btn.getAttribute('data-speak-lang'))));
  }
  [search, langFilter, catFilter].forEach(el => el.addEventListener('input', render));
  [langFilter, catFilter].forEach(el => el.addEventListener('change', render));
  render();
}

/* ---- Auth (demo) ---- */
async function hashPassword(password) {
  if (crypto?.subtle?.digest) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'demo-' + btoa(password); // fallback demo only
}
function getUsers() { return loadJSON(STORAGE_KEYS.users, []); }
function saveUsers(users) { saveJSON(STORAGE_KEYS.users, users); }
function getCurrentUser() { return loadJSON(STORAGE_KEYS.user, null); }
function setCurrentUser(user) { saveJSON(STORAGE_KEYS.user, user); updateAuthUI(); }
function logoutUser() { localStorage.removeItem(STORAGE_KEYS.user); updateAuthUI(); announce('Sessão terminada.', 'info'); }
function updateAuthUI() {
  const user = getCurrentUser();
  $$('.auth-user-label').forEach(el => { el.textContent = user ? user.name : 'Conta'; });
  $$('.auth-login-link').forEach(el => { el.style.display = user ? 'none' : ''; });
  $$('.auth-logout-btn').forEach(el => { el.style.display = user ? '' : 'none'; });
  $$('.auth-user-name').forEach(el => { el.textContent = user ? user.name : ''; });
}

function initAuthPage() {
  const loginForm = $('#login-form');
  const registerForm = $('#register-form');
  if (!loginForm && !registerForm) return;

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#reg-name').value.trim();
    const email = $('#reg-email').value.trim().toLowerCase();
    const password = $('#reg-password').value;
    const role = $('#reg-role').value;
    if (password.length < 8) { announce('A palavra-passe deve ter pelo menos 8 caracteres.', 'error'); return; }
    const users = getUsers();
    if (users.some(u => u.email === email)) { announce('Já existe uma conta com este email.', 'error'); return; }
    const passwordHash = await hashPassword(password);
    const user = { id: uid(), name, email, role, passwordHash, createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    announce('Conta criada com sucesso (demonstração).', 'success');
    registerForm.reset();
  });

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#login-email').value.trim().toLowerCase();
    const password = $('#login-password').value;
    const users = getUsers();
    const user = users.find(u => u.email === email);
    const passwordHash = await hashPassword(password);
    if (!user || user.passwordHash !== passwordHash) { announce('Email ou palavra-passe incorretos.', 'error'); return; }
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
    announce('Sessão iniciada (demonstração).', 'success');
    loginForm.reset();
  });

  $$('.auth-logout-btn').forEach(btn => btn.addEventListener('click', logoutUser));
  updateAuthUI();
}

/* ---- Admin (demo) ---- */
function getAdminItems() { return loadJSON(STORAGE_KEYS.adminItems, []); }
function saveAdminItems(items) { saveJSON(STORAGE_KEYS.adminItems, items); }

function initAdminPage() {
  const panel = $('#admin-panel');
  if (!panel) return;

  const user = getCurrentUser();
  const gate = $('#admin-gate');
  const content = $('#admin-content');
  if (!user) {
    gate.innerHTML = '<div class="notice notice-warning">Acesso restrito. Inicie sessão como administrador ou linguista para aceder ao painel. <a href="login.html">Ir para login</a>.</div>';
    content.style.display = 'none';
    return;
  }
  gate.innerHTML = `<div class="notice notice-success">Sessão ativa: <strong>${escapeHTML(user.name)}</strong> (${escapeHTML(user.role)}). Painel demonstrativo.</div>`;
  content.style.display = '';

  renderAdminTables();
  renderAdminSuggestions();
  renderAdminStats();

  $('#admin-word-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = getAdminItems();
    items.unshift({
      id: uid(), type: 'word',
      sourceLang: $('#aw-lang').value,
      word: $('#aw-word').value.trim(),
      pt: $('#aw-pt').value.trim(),
      en: $('#aw-en').value.trim(),
      category: $('#aw-category').value,
      region: $('#aw-region').value.trim(),
      validated: $('#aw-validated').value === 'true',
      createdAt: new Date().toISOString(),
      author: user.name
    });
    saveAdminItems(items);
    e.target.reset();
    renderAdminTables();
    renderAdminStats();
    announce('Entrada registada no painel (demonstração).', 'success');
  });
}

function renderAdminTables() {
  const items = getAdminItems();
  const tbody = $('#admin-words-body');
  if (!tbody) return;
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Sem entradas registadas no protótipo.</td></tr>';
    return;
  }
  tbody.innerHTML = items.slice(0, 20).map(it => `
    <tr>
      <td>${escapeHTML(getLangName(it.sourceLang))}</td>
      <td>${escapeHTML(it.word)}</td>
      <td>${escapeHTML(it.pt)}</td>
      <td>${escapeHTML(it.en)}</td>
      <td>${escapeHTML(getCategoryName(it.category))}</td>
      <td><span class="badge ${it.validated ? 'badge-success' : 'badge-warning'}">${it.validated ? 'Validada' : 'Pendente'}</span></td>
      <td>${escapeHTML(formatDate(it.createdAt))}</td>
    </tr>
  `).join('');
}

function renderAdminSuggestions() {
  const el = $('#admin-suggestions');
  if (!el) return;
  const suggestions = getSuggestions();
  if (suggestions.length === 0) { el.innerHTML = '<p class="empty-state">Sem sugestões de utilizadores.</p>'; return; }
  el.innerHTML = suggestions.slice(0, 10).map(s => `
    <article class="history-item">
      <div class="history-meta">
        <span class="badge badge-warning">${escapeHTML(s.status)}</span>
        <span class="history-date">${escapeHTML(formatDate(s.createdAt))}</span>
      </div>
      <p><strong>Origem:</strong> ${escapeHTML(getLangName(s.sourceLang))} → ${escapeHTML(getTargetName(s.targetLang))}</p>
      <p><strong>Sugestão:</strong> ${escapeHTML(s.suggestion)}</p>
    </article>
  `).join('');
}

function renderAdminStats() {
  const history = getHistory();
  const suggestions = getSuggestions();
  const adminItems = getAdminItems();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-words', DICTIONARY.length + adminItems.filter(i => i.type === 'word').length);
  set('stat-phrases', PHRASES.length);
  set('stat-suggestions', suggestions.length);
  set('stat-history', history.length);

  const counts = {};
  history.forEach(h => { const k = normalizeLookup(h.input); counts[k] = (counts[k] || 0) + 1; });
  const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const topEl = $('#admin-top-searches');
  if (topEl) {
    topEl.innerHTML = top.length ? `<ol class="top-list">${top.map(([term, n]) => `<li><span>${escapeHTML(term)}</span><span class="badge badge-muted">${n}</span></li>`).join('')}</ol>` : '<p class="empty-state">Sem dados suficientes.</p>';
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initTranslationPage();
  initDictionaryPage();
  initPhrasesPage();
  initAuthPage();
  initAdminPage();
  updateAuthUI();
  bindCopyButtons(document);
  $$('.auth-logout-btn').forEach(btn => btn.addEventListener('click', logoutUser));
});
