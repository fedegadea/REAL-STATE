/* ============================================================
   AURA — admin.js
   Full CRUD · Property Management
============================================================ */

let editingId = null;

const viewList       = document.getElementById('viewList');
const viewForm       = document.getElementById('viewForm');
const topbarTitle    = document.getElementById('topbarTitle');
const formViewTitle  = document.getElementById('formViewTitle');
const submitFormBtn  = document.getElementById('submitFormBtn');
const adminTableBody = document.getElementById('adminTableBody');
const tableEmpty     = document.getElementById('tableEmpty');

function showView(name) {
  viewList.style.display = name === 'list' ? 'block' : 'none';
  viewForm.style.display = name === 'form' ? 'block' : 'none';
  const isList = name === 'list';
  topbarTitle.textContent = isList ? 'Propiedades' : (editingId ? 'Editar propiedad' : 'Nueva propiedad');
  document.getElementById('sidebarList').classList.toggle('active', isList);
  document.getElementById('sidebarNew').classList.toggle('active', !isList);
}

document.getElementById('sidebarList').addEventListener('click', () => showView('list'));
document.getElementById('sidebarNew').addEventListener('click', () => startNew());
document.getElementById('newPropBtn').addEventListener('click', () => startNew());
document.getElementById('cancelFormBtn').addEventListener('click', () => { editingId = null; showView('list'); });

const sidebar   = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebarToggle');
const overlay   = document.getElementById('sidebarOverlay');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
  overlay.classList.toggle('visible');
});
overlay.addEventListener('click', () => {
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('visible');
});

function updateStats() {
  const props = getProperties();
  document.getElementById('st-total').textContent    = props.length;
  document.getElementById('st-venta').textContent    = props.filter(p => p.operation === 'venta').length;
  document.getElementById('st-alquiler').textContent = props.filter(p => p.operation === 'alquiler').length;
  document.getElementById('st-featured').textContent = props.filter(p => p.featured).length;
}

const adminSearch     = document.getElementById('adminSearch');
const adminFilterOp   = document.getElementById('adminFilterOp');
const adminFilterType = document.getElementById('adminFilterType');

function renderTable() {
  const props  = getProperties();
  const search = (adminSearch.value || '').trim().toLowerCase();
  const op     = adminFilterOp.value;
  const type   = adminFilterType.value;

  const filtered = props.filter(p => {
    if (op   && p.operation !== op)   return false;
    if (type && p.type      !== type) return false;
    if (search && !p.title.toLowerCase().includes(search) && !p.zone.toLowerCase().includes(search)) return false;
    return true;
  });

  updateStats();

  if (!filtered.length) {
    adminTableBody.innerHTML = '';
    tableEmpty.style.display = 'block';
    return;
  }
  tableEmpty.style.display = 'none';

  adminTableBody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <div class="td-prop-wrap">
          <img class="td-thumb" src="${p.image || ''}" alt="" onerror="this.style.opacity=0"/>
          <div>
            <div class="td-title">${p.title}</div>
            <div class="td-sub">${[p.area ? p.area+'m²' : '', p.rooms ? p.rooms+' amb.' : ''].filter(Boolean).join(' · ') || '—'}</div>
          </div>
        </div>
      </td>
      <td><span class="tag tag-type">${typeLabel(p.type)}</span></td>
      <td><span class="tag tag-${p.operation}">${p.operation === 'venta' ? 'Venta' : 'Alquiler'}</span></td>
      <td style="color:var(--cream-dim)">${p.zone}</td>
      <td style="font-family:var(--font-display);font-size:17px;color:var(--gold)">${fmtPrice(p.price, p.currency)}</td>
      <td>
        <button class="featured-btn ${p.featured ? 'is-featured' : ''}" data-id="${p.id}" title="${p.featured ? 'Quitar destacada' : 'Marcar destacada'}">
          ${p.featured ? '★' : '☆'}
        </button>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-id="${p.id}">Editar</button>
          <button class="btn-del"  data-id="${p.id}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');

  adminTableBody.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', () => startEdit(b.dataset.id)));
  adminTableBody.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', () => confirmDelete(b.dataset.id)));
  adminTableBody.querySelectorAll('.featured-btn').forEach(b => b.addEventListener('click', () => toggleFeatured(b.dataset.id)));
}

adminSearch.addEventListener('input', debounce(renderTable, 250));
adminFilterOp.addEventListener('change', renderTable);
adminFilterType.addEventListener('change', renderTable);

function startNew() {
  editingId = null;
  formViewTitle.textContent = 'Nueva Propiedad';
  submitFormBtn.textContent = 'Publicar propiedad';
  document.getElementById('propForm').reset();
  document.getElementById('f-id').value = '';
  hideImgPreview();
  showView('form');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startEdit(id) {
  const p = getProperties().find(x => x.id === id);
  if (!p) return;
  editingId = id;
  formViewTitle.textContent = 'Editar Propiedad';
  submitFormBtn.textContent = 'Guardar cambios';
  fv('f-id', p.id); fv('f-title', p.title); fv('f-type', p.type);
  fv('f-operation', p.operation); fv('f-zone', p.zone);
  fv('f-rooms', p.rooms || ''); fv('f-bathrooms', p.bathrooms || '');
  fv('f-area', p.area || ''); fv('f-parking', p.parking || '');
  fv('f-currency', p.currency || 'USD'); fv('f-price', p.price);
  fv('f-desc', p.description || ''); fv('f-image', p.image || '');
  document.getElementById('f-featured').checked = !!p.featured;
  if (p.image) showImgPreview(p.image); else hideImgPreview();
  showView('form');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fv(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

document.getElementById('f-image').addEventListener('input', debounce(e => {
  const url = e.target.value.trim();
  if (url) showImgPreview(url); else hideImgPreview();
}, 600));

function showImgPreview(url) {
  const wrap = document.getElementById('imgPreviewWrap');
  const img  = document.getElementById('imgPreview');
  img.src = url; wrap.classList.add('visible');
}
function hideImgPreview() {
  document.getElementById('imgPreviewWrap').classList.remove('visible');
  document.getElementById('imgPreview').src = '';
}

document.getElementById('propForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!validateForm()) return;
  const props = getProperties();
  const id    = editingId || Date.now().toString();
  const data  = {
    id, title: gv('f-title'), type: gv('f-type'), operation: gv('f-operation'),
    zone: gv('f-zone'), rooms: gv('f-rooms'), bathrooms: gv('f-bathrooms'),
    area: gv('f-area'), parking: gv('f-parking'), currency: gv('f-currency') || 'USD',
    price: gv('f-price'), description: gv('f-desc'), image: gv('f-image'),
    featured: document.getElementById('f-featured').checked,
  };
  if (editingId) {
    const idx = props.findIndex(p => p.id === editingId);
    if (idx > -1) props[idx] = data;
  } else {
    props.unshift(data);
  }
  saveProperties(props);
  showToast(editingId ? 'Propiedad actualizada ✓' : 'Propiedad publicada ✓');
  editingId = null;
  showView('list');
  renderTable();
  updateHeroStats?.();
});

function gv(id) { return (document.getElementById(id)?.value || '').trim(); }

function validateForm() {
  const required = ['f-title', 'f-type', 'f-operation', 'f-zone', 'f-price'];
  let ok = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = !el.value.trim();
    el.classList.toggle('has-error', empty);
    if (empty) ok = false;
  });
  if (!ok) showToast('Completá los campos requeridos (*)', true);
  return ok;
}

function toggleFeatured(id) {
  const props = getProperties();
  const p = props.find(x => x.id === id);
  if (!p) return;
  p.featured = !p.featured;
  saveProperties(props);
  renderTable();
  showToast(p.featured ? '★ Marcada como destacada' : '☆ Quitada de destacadas');
}

let pendingDelete = null;

function confirmDelete(id) {
  const p = getProperties().find(x => x.id === id);
  pendingDelete = id;
  document.getElementById('confirmMsg').textContent = `¿Eliminás "${p?.title || 'esta propiedad'}"? Esta acción no se puede deshacer.`;
  document.getElementById('confirmOverlay').style.display = 'flex';
}

document.getElementById('confirmYes').addEventListener('click', () => {
  if (!pendingDelete) return;
  const props = getProperties().filter(p => p.id !== pendingDelete);
  saveProperties(props);
  pendingDelete = null;
  document.getElementById('confirmOverlay').style.display = 'none';
  renderTable();
  showToast('Propiedad eliminada');
});
document.getElementById('confirmNo').addEventListener('click', () => {
  pendingDelete = null;
  document.getElementById('confirmOverlay').style.display = 'none';
});

function showToast(msg, isError = false) {
  const el = document.getElementById('toastEl');
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('toast-error', isError);
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3000);
}

function typeLabel(t) { return { casa:'Casa', departamento:'Depto.', ph:'PH', terreno:'Terreno', local:'Local' }[t] || t; }
function fmtPrice(p, currency) {
  const n = parseFloat(p);
  if (!n) return '—';
  if (n >= 1000000) return `${currency} ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${currency} ${Math.round(n / 1000)}K`;
  return `${currency} ${n.toLocaleString('es-AR')}`;
}
function debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

showView('list');
renderTable();
