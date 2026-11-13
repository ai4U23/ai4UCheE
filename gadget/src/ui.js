// Vietnamese two-tab UI for the Quick-Calcs gadget — plain DOM only.
// Tab 1 "Tra cứu tính chất (DIPPR)": COMPOUNDS selector + temperature (K),
//   live results for DIPPR Eq. 101 / 106 / 105 with Perry's citations.
// Tab 2 "NPSHa bơm": suction pressure (+ unit selector matching
//   normalize_pressure_to_pa's unit set), z, h_f, P_vp, rho, NPSH_r — live
//   NPSH_a, margin, ratio and the engine's exact SAFE / CAVITATION_DANGER
//   thresholds (margin < 1.0 or ratio < 1.35).
//
// Sandbox discipline: in-memory state only; every update is a synchronous
// `input` handler; no storage, no fetch, no timers, no frameworks. KaTeX
// equations arrive pre-rendered from the builder via the KATEX_EQS map
// (injected into this script at build time) — this file only assigns
// innerHTML to the <div data-eq="..."> placeholders.
//
// Exposes nothing on window.

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
  }
  if (children) {
    for (const child of children) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }
  return node;
}

// VN display formatting (decimal comma) — compute in IEEE floats, format
// only at the presentation edge. 6 significant digits keeps ~1 ppm detail.
function fmtVI(x) {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('vi-VN', { maximumSignificantDigits: 6 });
}

function fillEquations() {
  const nodes = document.querySelectorAll('[data-eq]');
  for (const node of nodes) {
    const key = node.getAttribute('data-eq');
    const html = typeof KATEX_EQS === 'object' ? KATEX_EQS[key] : null;
    if (html != null) node.innerHTML = html;
    else node.classList.add('eq-missing');
  }
}

// ---------------------------------------------------------------------------
// Tab 1 — DIPPR
// ---------------------------------------------------------------------------

const dipprState = { compound: 'water', tempK: 373.15 };

function dipprCompoundOptions() {
  return Object.keys(COMPOUNDS).map((key) => {
    const entry = COMPOUNDS[key];
    const opt = el('option', { value: key, text: `${entry.name} (${entry.formula})` });
    if (key === dipprState.compound) opt.selected = true;
    return opt;
  });
}

function dipprRender() {
  const warn = document.getElementById('dippr-warn');
  const err = document.getElementById('dippr-err');
  const data = COMPOUNDS[dipprState.compound];
  if (!Number.isFinite(dipprState.tempK) || dipprState.tempK <= 0) {
    for (const id of ['res-vp', 'res-hvap', 'res-hvap-kj', 'res-rhol', 'res-rho']) {
      document.getElementById(id).textContent = '—';
    }
    warn.classList.add('hidden');
    err.classList.remove('hidden');
    err.textContent = 'Nhiệt độ phải là số dương (K > 0) — ln(T) không xác định với T ≤ 0.';
    return;
  }
  err.classList.add('hidden');

  let result;
  try {
    result = dipprEvaluate(dipprState.compound, dipprState.tempK);
  } catch (e) {
    err.classList.remove('hidden');
    err.textContent = 'Lỗi tính toán: ' + e.message;
    return;
  }

  document.getElementById('res-vp').textContent = fmtVI(result.vapor_pressure_pa);
  document.getElementById('res-hvap').textContent = fmtVI(result.hvap_j_kmol);
  document.getElementById('res-hvap-kj').textContent =
    `≈ ${fmtVI(result.hvap_j_kmol / 1000)} kJ/mol`;
  document.getElementById('res-rhol').textContent = fmtVI(result.rhol_kmol_m3);
  document.getElementById('res-rho').textContent = fmtVI(result.rho_kg_m3);

  const [tMin, tMax] = result.range_bounds_k;
  const outOfRange = result.warnings.vp || result.warnings.hvap || result.warnings.rhol;
  if (outOfRange) {
    warn.classList.remove('hidden');
    warn.textContent =
      `Cảnh báo: nhiệt độ ngoài khoảng hệ số (${fmtVI(tMin)} – ${fmtVI(tMax)} K) — ` +
      'kết quả là ngoại suy, không bảo đảm độ chính xác.';
  } else {
    warn.classList.add('hidden');
  }

  const pages = result.sec_pages;
  document.getElementById('dippr-cite').textContent =
    `Nguồn: Perry's 9th Ed. — Bảng 2-8 (Eq. 101, tr. ${pages.vp}) · ` +
    `Bảng 2-69 (Eq. 106, tr. ${pages.hvap}) · Bảng 2-32 (Eq. 105, tr. ${pages.rhol})`;
}

function dipprOnCompound(ev) {
  dipprState.compound = ev.target.value;
  const entry = COMPOUNDS[dipprState.compound];
  const [tMin, tMax] = entry.vp_eq101.slice(5, 7);
  document.getElementById('dippr-range').textContent =
    `Khoảng hệ số Eq. 101: ${fmtVI(tMin)} – ${fmtVI(tMax)} K`;
  dipprRender();
}

function dipprOnTemp(ev) {
  dipprState.tempK = Number(ev.target.value);
  dipprRender();
}

function buildDipprPanel() {
  const data = COMPOUNDS[dipprState.compound];
  const [tMin, tMax] = data.vp_eq101.slice(5, 7);
  return el(
    'section',
    { id: 'panel-dippr', class: 'panel', role: 'tabpanel', 'aria-label': 'Tra cứu tính chất DIPPR' },
    [
      el('div', { class: 'field' }, [
        el('label', { for: 'dippr-compound', text: 'Chất lỏng' }),
        el('select', { id: 'dippr-compound', onchange: dipprOnCompound }, dipprCompoundOptions()),
      ]),
      el('div', { class: 'field' }, [
        el('label', { for: 'dippr-temp', text: 'Nhiệt độ (K)' }),
        el('input', {
          id: 'dippr-temp',
          type: 'number',
          step: '0.01',
          min: '0.01',
          value: String(dipprState.tempK),
          oninput: dipprOnTemp,
        }),
        el('span', {
          id: 'dippr-range',
          class: 'hint',
          text: `Khoảng hệ số Eq. 101: ${fmtVI(tMin)} – ${fmtVI(tMax)} K`,
        }),
      ]),
      el('div', { id: 'dippr-warn', class: 'warn hidden' }),
      el('div', { id: 'dippr-err', class: 'err hidden' }),
      el('div', { class: 'results' }, [
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['Áp suất hơi bão hòa P', el('sub', { text: 'vp' })]),
          el('span', { class: 'v', id: 'res-vp' }),
          el('span', { class: 'u', text: 'Pa' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['Nhiệt hoá hơi ΔH', el('sub', { text: 'vap' })]),
          el('span', { class: 'v', id: 'res-hvap' }),
          el('span', { class: 'u', text: 'J/kmol' }),
          el('span', { class: 'v2', id: 'res-hvap-kj' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['Khối lượng riêng mol ρ', el('sub', { text: 'L' })]),
          el('span', { class: 'v', id: 'res-rhol' }),
          el('span', { class: 'u', text: 'kmol/m³' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k', text: 'Khối lượng riêng ρ' }),
          el('span', { class: 'v', id: 'res-rho' }),
          el('span', { class: 'u', text: 'kg/m³' }),
        ]),
      ]),
      el('div', { id: 'dippr-cite', class: 'cite' }),
      el('div', { 'data-eq': 'eq101', class: 'eq' }),
      el('div', { 'data-eq': 'eq106', class: 'eq' }),
      el('div', { 'data-eq': 'eq105', class: 'eq' }),
    ],
  );
}

// ---------------------------------------------------------------------------
// Tab 2 — NPSHa
// ---------------------------------------------------------------------------

const npshaState = {
  p: '2.0',
  unit: 'psig',
  z: '2.0',
  hf: '0.8',
  pvap: '3169.0',
  rho: '998.2',
  npshr: '3.0',
};

function unitOptions() {
  return UNITS.map((u) => {
    const opt = el('option', { value: u, text: u });
    if (u === npshaState.unit) opt.selected = true;
    return opt;
  });
}

function npshaNum(id) {
  const raw = document.getElementById(id).value.trim();
  return { raw: raw, num: Number(raw.replace(',', '.')) };
}

function npshaRender() {
  const err = document.getElementById('npsha-err');
  const outIds = ['res-pabs', 'res-pabs-psia', 'res-npsha', 'res-margin', 'res-ratio', 'res-datum'];
  const badge = document.getElementById('res-status');

  const fields = [
    ['Áp suất hút', npshaNum('npsha-p')],
    ['Độ cao hút z', npshaNum('npsha-z')],
    ['Tổn thất h_f', npshaNum('npsha-hf')],
    ['Áp suất hơi P_vp', npshaNum('npsha-pvap')],
    ['Khối lượng riêng ρ', npshaNum('npsha-rho')],
    ['NPSH_r', npshaNum('npsha-npshr')],
  ];
  const bad = fields.filter(([, v]) => !Number.isFinite(v.num));
  if (bad.length > 0) {
    for (const id of outIds) document.getElementById(id).textContent = '—';
    badge.className = 'badge hidden';
    err.classList.remove('hidden');
    err.textContent = `Giá trị không hợp lệ ở: ${bad.map(([name]) => name).join(', ')} — hãy nhập số.`;
    return;
  }
  err.classList.add('hidden');

  let result;
  try {
    result = npshaEvaluate({
      p_suction_val: fields[0][1].num,
      p_suction_unit: npshaState.unit,
      z_suction_m: fields[1][1].num,
      hf_suction_m: fields[2][1].num,
      p_vapor_pa: fields[3][1].num,
      rho_kg_m3: fields[4][1].num,
      npshr_m: fields[5][1].num,
    });
  } catch (e) {
    for (const id of outIds) document.getElementById(id).textContent = '—';
    badge.className = 'badge hidden';
    err.classList.remove('hidden');
    err.textContent = 'Lỗi quy đổi đơn vị: ' + e.message;
    return;
  }

  document.getElementById('res-pabs').textContent = fmtVI(result.p_suction_abs_pa);
  document.getElementById('res-pabs-psia').textContent = `${fmtVI(result.p_suction_psia)} psia`;
  document.getElementById('res-npsha').textContent = fmtVI(result.npsha_m);
  document.getElementById('res-margin').textContent = fmtVI(result.margin_m);
  document.getElementById('res-ratio').textContent = fmtVI(result.ratio);
  document.getElementById('res-datum').textContent = result.datum_note;
  badge.className = 'badge ' + (result.cavitation_status === 'SAFE' ? 'safe' : 'danger');
  badge.textContent =
    result.cavitation_status === 'SAFE'
      ? 'AN TOÀN (SAFE)'
      : 'NGUY CƠ CAVITATION (CAVITATION_DANGER)';
}

function npshaOnUnit(ev) {
  npshaState.unit = ev.target.value;
  npshaRender();
}

function npshaField(id, label, hint) {
  return el('div', { class: 'field' }, [
    el('label', { for: id, text: label }),
    el('input', {
      id: id,
      type: 'number',
      step: 'any',
      value: npshaState[id.replace('npsha-', '')] !== undefined ? npshaState[id.replace('npsha-', '')] : '',
      oninput: () => npshaRender(),
    }),
    hint ? el('span', { class: 'hint', text: hint }) : null,
  ]);
}

function buildNpshaPanel() {
  return el(
    'section',
    { id: 'panel-npsha', class: 'panel hidden', role: 'tabpanel', 'aria-label': 'NPSHa bơm' },
    [
      el('div', { class: 'field row' }, [
        el('label', { for: 'npsha-p', text: 'Áp suất hút P_suction' }),
        el('input', { id: 'npsha-p', type: 'number', step: 'any', value: npshaState.p, oninput: () => npshaRender() }),
        el('select', { id: 'npsha-unit', 'aria-label': 'Đơn vị áp suất', onchange: npshaOnUnit }, unitOptions()),
      ]),
      el('div', { id: 'unit-hint', class: 'hint-block' }, [
        el('strong', { text: 'Đổi đơn vị:' }),
        el('span', {
          text:
            ' psig / barg / kpag là áp suất kế (gauge) — hệ thống tự cộng áp suất khí quyển ' +
            '14,6959 psia để ra áp suất tuyệt đối (P_abs = P_gauge + P_atm). ' +
            'psia / Pa / kPa / bar / atm / mmHg / torr là áp suất tuyệt đối. ' +
            "Đơn vị 'psi' trần bị từ chối vì mơ hồ datum (Perry's Sec 6/8).",
        }),
      ]),
      npshaField('npsha-z', 'Độ cao hút z (m)'),
      npshaField('npsha-hf', 'Tổn thất áp suất đường hút h_f (m)'),
      npshaField('npsha-pvap', 'Áp suất hơi P_vp (Pa)'),
      npshaField('npsha-rho', 'Khối lượng riêng ρ (kg/m³)'),
      npshaField('npsha-npshr', 'NPSH_r (m)'),
      el('div', { id: 'npsha-err', class: 'err hidden' }),
      el('div', { class: 'results' }, [
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['P hút tuyệt đối P', el('sub', { text: 'suction,abs' })]),
          el('span', { class: 'v', id: 'res-pabs' }),
          el('span', { class: 'u', text: 'Pa' }),
          el('span', { class: 'v2', id: 'res-pabs-psia' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['NPSH', el('sub', { text: 'A' }), ' khả dụng']),
          el('span', { class: 'v', id: 'res-npsha' }),
          el('span', { class: 'u', text: 'm' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['Dự phòng NPSH', el('sub', { text: 'A' }), ' − NPSH', el('sub', { text: 'R' })]),
          el('span', { class: 'v', id: 'res-margin' }),
          el('span', { class: 'u', text: 'm' }),
        ]),
        el('div', { class: 'res' }, [
          el('span', { class: 'k' }, ['Tỉ lệ NPSH', el('sub', { text: 'A' }), ' / NPSH', el('sub', { text: 'R' })]),
          el('span', { class: 'v', id: 'res-ratio' }),
        ]),
      ]),
      el('div', { id: 'res-status', class: 'badge hidden' }),
      el('div', {
        class: 'cite',
        text:
          "Ngưỡng (đúng theo engine): CAVITATION_DANGER khi margin < 1,0 m hoặc tỉ lệ < 1,35. " +
          "Quy tắc Perry's 9th Ed. tr. 10-25: NPSH_A ≥ max(NPSH_R + 1,5 m; 1,35·NPSH_R).",
      }),
      el('div', { id: 'res-datum', class: 'cite datum' }),
      el('div', { 'data-eq': 'npsha', class: 'eq' }),
      el('div', { 'data-eq': 'gauge', class: 'eq' }),
    ],
  );
}

// ---------------------------------------------------------------------------
// Shell: tabs + init
// ---------------------------------------------------------------------------

function switchTab(active) {
  const tabs = { dippr: ['tab-dippr', 'panel-dippr'], npsha: ['tab-npsha', 'panel-npsha'] };
  for (const key of Object.keys(tabs)) {
    const [tabId, panelId] = tabs[key];
    document.getElementById(tabId).setAttribute('aria-selected', String(key === active));
    document.getElementById(tabId).classList.toggle('active', key === active);
    document.getElementById(panelId).classList.toggle('hidden', key !== active);
  }
}

function init() {
  const root = document.getElementById('app');
  if (!root) return;

  const tabBar = el('div', { class: 'tabs', role: 'tablist' }, [
    el('button', {
      id: 'tab-dippr',
      class: 'tab active',
      role: 'tab',
      'aria-selected': 'true',
      text: 'Tra cứu tính chất (DIPPR)',
      onclick: () => switchTab('dippr'),
    }),
    el('button', {
      id: 'tab-npsha',
      class: 'tab',
      role: 'tab',
      'aria-selected': 'false',
      text: 'NPSHa bơm',
      onclick: () => switchTab('npsha'),
    }),
  ]);

  root.appendChild(el('h1', { text: 'PVU CHE Quick-Calcs' }));
  root.appendChild(
    el('p', {
      class: 'sub',
      text:
        'Hai tính toán nhanh cho sinh viên CNTN — chạy hoàn toàn ngoại tuyến: không mạng, không lưu dữ liệu, mọi thứ nằm trong bộ nhớ của trang.',
    }),
  );
  root.appendChild(tabBar);
  root.appendChild(buildDipprPanel());
  root.appendChild(buildNpshaPanel());
  root.appendChild(
    el('footer', {
      class: 'foot',
      text:
        "Nguồn hệ số: Perry's Chemical Engineers' Handbook, 9th Ed. (Sec. 2, 6, 10) — hệ số và phương trình là dữ liệu kỹ thuật.",
    }),
  );

  fillEquations();
  dipprRender();
  npshaRender();
}

if (typeof document !== 'undefined') {
  init();
}
