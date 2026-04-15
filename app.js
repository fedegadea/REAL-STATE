/* ============================================================
   AURA — app.js  (public site)
============================================================ */

const STORAGE_KEY = 'aura_properties_v2';

function getProperties() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : buildSeedData();
  } catch { return buildSeedData(); }
}

function saveProperties(props) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(props));
}

function buildSeedData() {
  const props = [
    {
      id: 'p1', title: 'Residencia Bosque Alto',
      type: 'casa', operation: 'venta',
      zone: 'Nordelta, Buenos Aires',
      rooms: '5', bathrooms: '4', area: '480', parking: '3',
      price: '950000', currency: 'USD',
      description: 'Excepcional residencia de estilo contemporáneo emplazada en un lote de 1.200m² con salida directa al lago. Amplios espacios de doble altura, cocina integrada, piscina, patio con asador y garage para 3 autos. Materiales de primer nivel, terminaciones de lujo.',
      featured: true,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80',
    },
    {
      id: 'p2', title: 'Penthouse Recoleta',
      type: 'departamento', operation: 'venta',
      zone: 'Recoleta, CABA',
      rooms: '4', bathrooms: '3', area: '210', parking: '2',
      price: '650000', currency: 'USD',
      description: 'Penthouse de diseño en el corazón de Recoleta con terraza privada de 80m² y vistas panorámicas a la ciudad. Pisos de madera, cocina de autor, amenities de primer nivel.',
      featured: true,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80',
    },
    {
      id: 'p3', title: 'Piso Palermo Hollywood',
      type: 'departamento', operation: 'alquiler',
      zone: 'Palermo Hollywood, CABA',
      rooms: '2', bathrooms: '1', area: '70', parking: '1',
      price: '1800', currency: 'USD',
      description: 'Luminoso 2 ambientes en edificio nuevo con amenities. Piso 8, orientación norte. Totalmente amueblado, ideal para profesional o pareja.',
      featured: false,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
    },
    {
      id: 'p4', title: 'Casa Estilo Campo',
      type: 'casa', operation: 'venta',
      zone: 'Pilar, Buenos Aires',
      rooms: '4', bathrooms: '3', area: '320', parking: '2',
      price: '450000', currency: 'USD',
      description: 'Cálida casa de estilo rústico moderno en barrio cerrado de Pilar. Techos altos, vigas de madera, jardín con fogón y piscina natural.',
      featured: false,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80',
    },
    {
      id: 'p5', title: 'Loft Industrial San Telmo',
      type: 'departamento', operation: 'alquiler',
      zone: 'San Telmo, CABA',
      rooms: '1', bathrooms: '1', area: '55', parking: '',
      price: '1200', currency: 'USD',
      description: 'Loft industrial chic con doble altura en edificio reciclado de San Telmo. Ladrillos a la vista, ventanales del piso al techo.',
      featured: false,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    },
    {
      id: 'p6', title: 'Villa La Barra',
      type: 'casa', operation: 'venta',
      zone: 'La Barra, Punta del Este',
      rooms: '6', bathrooms: '5', area: '600', parking: '4',
      price: '2200000', currency: 'USD',
      description: 'Villa de lujo a 200 metros del mar en La Barra. Arquitectura contemporánea, piscina infinity, spa, sauna y cancha de tenis. Completamente equipada.',
      featured: true,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
    },
  ];
  saveProperties(props);
  return props;
}

function typeLabel(t) {
  return { casa:'Casa', departamento:'Departamento', ph:'PH', terreno:'Terreno', local:'Local/Ofic.' }[t] || t;
}

function fmtPrice(p, currency) {
  const n = parseFloat(p);
  if (!n) return '—';
  if (n >= 1000000) return `${currency} ${(n / 1000000).toFixed(n % 1000000 ? 1 : 0)}M`;
  if (n >= 1000)    return `${currency} ${Math.round(n / 1000)}K`;
  return `${currency} ${n.toLocaleString('es-AR')}`;
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function showToast(msg) {
  const el = document.getElementById('toastEl');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

function updateHeroStats() {
  const props = getProperties();
  const el = (id) => document.getElementById(id);
  if (el('statTotal'))    el('statTotal').textContent    = props.length;
  if (el('statVenta'))    el('statVenta').textContent    = props.filter(p => p.operation === 'venta').length;
  if (el('statAlquiler')) el('statAlquiler').textContent = props.filter(p => p.operation === 'alquiler').length;
}

const $op    = document.getElementById('filterOp');
const $type  = document.getElementById('filterType');
const $rooms = document.getElementById('filterRooms');
const $price = document.getElementById('filterPrice');
const $zone  = document.getElementById('filterZone');
const $clear = document.getElementById('clearFilters');

function getFiltered() {
  const props  = getProperties();
  const op     = $op?.value    || '';
  const type   = $type?.value  || '';
  const rooms  = $rooms?.value || '';
  const price  = $price?.value || '';
  const zone   = ($zone?.value || '').trim().toLowerCase();

  return props.filter(p => {
    if (op   && p.operation !== op)   return false;
    if (type && p.type      !== type) return false;
    if (rooms) {
      if (rooms === '4' && parseInt(p.rooms) < 4)  return false;
      if (rooms !== '4' && p.rooms !== rooms)       return false;
    }
    if (price && parseFloat(p.price) > parseFloat(price)) return false;
    if (zone  && !p.zone.toLowerCase().includes(zone))    return false;
    return true;
  });
}

[$op, $type, $rooms, $price].forEach(el => el?.addEventListener('change', renderGrid));
$zone?.addEventListener('input', debounce(renderGrid, 280));
$clear?.addEventListener('click', () => {
  if ($op)    $op.value    = '';
  if ($type)  $type.value  = '';
  if ($rooms) $rooms.value = '';
  if ($price) $price.value = '';
  if ($zone)  $zone.value  = '';
  renderGrid();
});

function renderGrid() {
  const grid  = document.getElementById('propertiesGrid');
  const count = document.getElementById('propsCount');
  if (!grid) return;

  const filtered = getFiltered();
  if (count) count.innerHTML = `<strong>${filtered.length}</strong> resultado${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><p>No hay propiedades con esos criterios.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => {
    const priceStr   = fmtPrice(p.price, p.currency);
    const priceLabel = p.operation === 'alquiler' ? 'Alquiler / mes' : 'Precio de venta';
    const specsHtml  = [
      p.rooms     ? `<div class="card-spec"><span class="spec-val">${p.rooms}</span><span class="spec-lbl">Ambientes</span></div>` : '',
      p.bathrooms ? `<div class="card-spec"><span class="spec-val">${p.bathrooms}</span><span class="spec-lbl">Baños</span></div>` : '',
      p.area      ? `<div class="card-spec"><span class="spec-val">${p.area}m²</span><span class="spec-lbl">Superficie</span></div>` : '',
    ].filter(Boolean).join('');

    return `
    <div class="property-card" data-id="${p.id}" style="animation-delay:${i * 0.055}s" tabindex="0" role="button" aria-label="Ver ${p.title}">
      <div class="card-img-wrap">
        <img class="card-img" src="${p.image || `https://placehold.co/900x600/1b1a17/c8a86b?text=${encodeURIComponent(p.title)}`}" alt="${p.title}" loading="lazy"/>
        <div class="card-badges">
          <span class="badge badge-${p.operation}">${p.operation === 'venta' ? 'En Venta' : 'En Alquiler'}</span>
          ${p.featured ? '<span class="badge badge-featured">Destacada</span>' : ''}
        </div>
        <div class="card-price-overlay">
          <div class="pov">${priceStr}</div>
          <div class="pol">${priceLabel}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-type">${typeLabel(p.type)}</span>
          ${p.rooms ? `<span class="card-rooms-pill">${p.rooms} amb.</span>` : ''}
        </div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-zone">${p.zone}</div>
        ${specsHtml ? `<div class="card-specs">${specsHtml}</div>` : ''}
        <div class="card-footer">
          <div class="card-price-static">
            <div class="cpv">${priceStr}</div>
            <div class="cpl">${priceLabel}</div>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(card.dataset.id); });
  });
}

const modalOverlay  = document.getElementById('modalOverlay');
const modalContent  = document.getElementById('modalContent');
const modalClose    = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

function openModal(id) {
  const p = getProperties().find(x => x.id === id);
  if (!p) return;

  const priceStr   = fmtPrice(p.price, p.currency);
  const priceLabel = p.operation === 'alquiler' ? 'Alquiler mensual' : 'Precio de venta';
  const specsHtml  = [
    p.rooms     ? `<div class="modal-spec"><span class="msv">${p.rooms}</span><span class="msl">Ambientes</span></div>` : '',
    p.bathrooms ? `<div class="modal-spec"><span class="msv">${p.bathrooms}</span><span class="msl">Baños</span></div>` : '',
    p.area      ? `<div class="modal-spec"><span class="msv">${p.area} m²</span><span class="msl">Superficie</span></div>` : '',
    p.parking   ? `<div class="modal-spec"><span class="msv">${p.parking}</span><span class="msl">Cocheras</span></div>` : '',
  ].filter(Boolean).join('');

  const waText = encodeURIComponent(`Hola, me interesa la propiedad: "${p.title}" (${p.zone}). ¿Podrían darme más información?`);

  modalContent.innerHTML = `
    <div class="modal-hero-img">
      <img src="${p.image || `https://placehold.co/940x460/1b1a17/c8a86b?text=${encodeURIComponent(p.title)}`}" alt="${p.title}"/>
      <div class="modal-img-grad"></div>
      <div class="modal-img-badge">
        <span class="badge badge-${p.operation}">${p.operation === 'venta' ? 'En Venta' : 'En Alquiler'}</span>
      </div>
    </div>
    <div class="modal-body">
      <div class="modal-kicker">${typeLabel(p.type)}</div>
      <h2 class="modal-title">${p.title}</h2>
      <div class="modal-zone">${p.zone}</div>
      ${specsHtml ? `<div class="modal-specs">${specsHtml}</div>` : ''}
      <div class="modal-price-row">
        <div>
          <div class="modal-price-lbl">${priceLabel}</div>
          <div class="modal-price">${priceStr}</div>
        </div>
        ${p.featured ? '<span class="badge badge-featured">Propiedad Destacada</span>' : ''}
      </div>
      ${p.description ? `<p class="modal-desc">${p.description}</p>` : ''}
      <div class="modal-actions">
        <a href="https://wa.me/5491112345678?text=${waText}" target="_blank" rel="noopener" class="btn btn-primary">Consultar por WhatsApp</a>
        <a href="#contacto" class="btn btn-outline" id="modalToContact">Formulario de contacto</a>
      </div>
    </div>`;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalToContact')?.addEventListener('click', closeModal);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose?.addEventListener('click', closeModal);
modalBackdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('contactSubmit');
  btn.textContent = 'Mensaje enviado ✓';
  btn.style.background = '#4a7a5c';
  btn.disabled = true;
  showToast('¡Consulta enviada! Te respondemos pronto.');
  setTimeout(() => {
    btn.textContent = 'Enviar consulta';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
});

updateHeroStats();
renderGrid();
