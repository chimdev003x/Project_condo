import './styles.css';
import { supabase, PROPERTY_BUCKET } from './supabase.js';

const app = document.querySelector('#app');
const money = new Intl.NumberFormat('th-TH');

const state = {
  session: null,
  profile: null,
  menus: [],
  packages: [],
  listingSettings: { description_max_length: 10000 },
  amenities: [],
  admin: null,
};

let lastTrackedPage = '';
const POST_IMAGE_MAX_BYTES = 500 * 1024;
const CONTENT_IMAGE_BUCKET = 'site-content';
const CONTENT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const postImageQueues = new WeakMap();
const adminImageObjectUrls = new WeakMap();

function analyticsSessionId() {
  const key = 'condo_finder_analytics_session';
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

async function trackAnalytics(eventType, searchQuery = null) {
  const query = String(searchQuery || '').trim().slice(0, 300) || null;
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    path: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    search_query: query,
    user_id: state.session?.user?.id || null,
    session_id: analyticsSessionId(),
  });
}

const MENU_FALLBACK = [
  { key: 'home', label: 'หน้าแรก', path: '/', icon_class: 'fi fi-br-home', sort_order: 1, is_enabled: true },
  { key: 'buy', label: 'ซื้อคอนโด', path: '/buy', icon_class: 'fi fi-br-building', sort_order: 2, is_enabled: true },
  { key: 'rent', label: 'เช่าคอนโด', path: '/rent', icon_class: 'fi fi-br-key', sort_order: 3, is_enabled: true },
  { key: 'projects', label: 'โครงการใหม่', path: '/projects', icon_class: 'fi fi-br-city', sort_order: 4, is_enabled: true },
  { key: 'packages', label: 'แพ็กเกจ', path: '/packages', icon_class: 'fi fi-br-box-open', sort_order: 5, is_enabled: true },
  { key: 'blog', label: 'บทความ', path: '/blog', icon_class: 'fi fi-br-document', sort_order: 6, is_enabled: true },
  { key: 'contact', label: 'ติดต่อเรา', path: '/contact', icon_class: 'fi fi-br-phone-call', sort_order: 7, is_enabled: true },
];

const AMENITY_FALLBACK = ['สระว่ายน้ำ', 'ฟิตเนส', 'Lobby', 'Co-working space', 'ที่จอดรถ', 'CCTV', 'ระบบรักษาความปลอดภัย', 'สวนส่วนกลาง'];

function path() {
  return window.location.pathname;
}

function isAdmin() {
  return Number(state.profile?.user_level) === 3;
}

function menuByKey(key) {
  return state.menus.find((item) => item.key === key);
}

async function disabledMenuForRoute(current) {
  const directMenu = state.menus.find((item) => item.path === current);
  if (directMenu && !directMenu.is_enabled) return directMenu;

  if (current.startsWith('/properties/')) {
    const propertyId = current.split('/').filter(Boolean).pop();
    const { data } = await supabase
      .from('properties')
      .select('type')
      .eq('id', propertyId)
      .maybeSingle();
    if (!data?.type) return null;
    const parentMenu = menuByKey(data?.type === 'rent' ? 'rent' : 'buy');
    if (parentMenu && !parentMenu.is_enabled) return parentMenu;
  }

  return null;
}

function analyticsPageLabel(rawPath) {
  const pathname = String(rawPath || '/').split('?')[0];
  const menu = state.menus.find((item) => item.path === pathname);
  if (menu) return menu.label;
  if (pathname.startsWith('/properties/')) return 'รายละเอียดประกาศ';

  return ({
    '/login': 'เข้าสู่ระบบ',
    '/register': 'สมัครสมาชิก',
    '/post': 'ลงประกาศ',
    '/my-listings': 'ประกาศของฉัน',
    '/account': 'บัญชีของฉัน',
  })[pathname] || 'หน้าอื่น ๆ';
}

function isLoggedIn() {
  return Boolean(state.session?.user);
}

function navTo(url) {
  window.history.pushState({}, '', url);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function html(strings, ...values) {
  return strings.reduce((acc, item, index) => acc + item + (values[index] ?? ''), '');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeHttpUrl(value = '') {
  try {
    const url = new URL(String(value).trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function lineContactHref(value = '') {
  const contact = String(value).trim();
  if (!contact) return '';
  return safeHttpUrl(contact) || `https://line.me/R/ti/p/${encodeURIComponent(contact)}`;
}

function facebookContactHref(value = '') {
  const url = safeHttpUrl(value);
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.me' || hostname === 'm.me' ? url : '';
  } catch {
    return '';
  }
}

function slugify(value = '') {
  const base = String(value).trim().toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9ก-๙]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `article-${Date.now()}`;
}

function formatAdminFileSize(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

function contentStorageKey(url = '') {
  const marker = `/storage/v1/object/public/${CONTENT_IMAGE_BUCKET}/`;
  const index = String(url).indexOf(marker);
  if (index < 0) return '';
  return decodeURIComponent(String(url).slice(index + marker.length).split('?')[0]);
}

async function uploadAdminContentImage(file, folder) {
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (!allowedTypes.has(file?.type)) throw new Error('รองรับเฉพาะรูป JPG, PNG และ WEBP');
  if (file.size > CONTENT_IMAGE_MAX_BYTES) throw new Error('รูปภาพต้องมีขนาดไม่เกิน 2 MB');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(CONTENT_IMAGE_BUCKET).upload(key, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(CONTENT_IMAGE_BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

async function removeAdminContentImage(url) {
  const key = contentStorageKey(url);
  if (key) await supabase.storage.from(CONTENT_IMAGE_BUCKET).remove([key]);
}

function imageOf(property) {
  const first = Array.isArray(property.property_images)
    ? [...property.property_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]
    : null;
  return first?.image_url || property.image_url || '/images/condo-finder-logo-transparent.png';
}

function locationOf(property) {
  return [property.project_name, property.location].map((value) => String(value || '').trim()).filter(Boolean).join(' · ') || 'ไม่ระบุโครงการและทำเล';
}

async function bootstrap() {
  const [{ data: sessionData }, menusResult, packagesResult, listingSettingsResult, amenitiesResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.from('site_menu_settings').select('*').order('sort_order'),
    supabase.from('packages').select('*, package_features(*)').order('price'),
    supabase.from('listing_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('amenity_catalog').select('*').eq('is_active', true).order('sort_order').order('name'),
  ]);

  state.session = sessionData.session;
  state.menus = menusResult.data?.length ? menusResult.data : MENU_FALLBACK;
  state.packages = packagesResult.data || [];
  state.listingSettings = listingSettingsResult.data || state.listingSettings;
  state.amenities = amenitiesResult.data || [];
  await loadProfile();
  render();

  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.session = session;
    await loadProfile();
    render();
  });
}

async function loadProfile() {
  if (!state.session?.user) {
    state.profile = null;
    return;
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', state.session.user.id)
    .maybeSingle();
  state.profile = data;
}

function layout(content) {
  const menus = [...state.menus].sort((a, b) => a.sort_order - b.sort_order);
  const currentPath = path();

  return html`
    <a class="skip-link" href="#main-content">ข้ามไปยังเนื้อหาหลัก</a>
    <header class="nav">
      <div class="container nav-inner">
        <a class="brand" href="/" data-link aria-label="Condo Finder">
          <span class="logo"><img src="/images/condo-finder-icon.png" alt=""></span>
          <span>Condo Finder <small>ชี้เป้าคอนโดเด็ด</small></span>
        </a>
        <input class="nav-toggle" type="checkbox" id="nav-toggle" aria-label="เปิดเมนู">
        <label class="hamburger" for="nav-toggle" aria-label="เปิดเมนู"><i class="fi fi-br-menu-burger menu-open"></i><i class="fi fi-br-cross-small menu-close"></i></label>
        <div class="nav-panel">
          <nav class="menu" aria-label="เมนูหลัก">
            ${menus.map((menu) => {
              const isActive = menu.path === currentPath;
              const classes = [isActive ? 'is-active' : '', menu.is_enabled ? '' : 'is-menu-disabled'].filter(Boolean).join(' ');
              return html`<a href="${menu.path}" data-link ${isActive ? 'aria-current="page"' : ''} title="${escapeHtml(menu.label)}${menu.is_enabled ? '' : ' - เร็วๆ นี้'}" data-tooltip="${escapeHtml(menu.label)}${menu.is_enabled ? '' : ' - เร็วๆ นี้'}" class="${classes}"><span class="nav-icon"><i class="${menu.icon_class}"></i></span><span class="menu-text">${escapeHtml(menu.label)}</span>${menu.is_enabled ? '' : '<span class="soon-dot">เร็วๆ นี้</span>'}<i class="fi fi-br-angle-small-right menu-arrow"></i></a>`;
            }).join('')}
          </nav>
          <div class="auth">
            ${isLoggedIn() ? html`
              <a href="/post" data-link class="auth-pill auth-post" title="ลงประกาศ" data-tooltip="ลงประกาศ"><span class="nav-icon"><i class="fi fi-br-add-document"></i></span><span>ลงประกาศ</span></a>
              <a href="/my-listings" data-link class="auth-pill auth-listings" title="ประกาศของฉัน" data-tooltip="ประกาศของฉัน"><span class="nav-icon"><i class="fi fi-br-rectangle-list"></i></span><span>ประกาศของฉัน</span></a>
              ${isAdmin() ? '<a href="/admin/settings" data-link class="auth-pill auth-admin" title="ตั้งค่าเว็บ" data-tooltip="ตั้งค่าเว็บ"><span class="nav-icon"><i class="fi fi-br-settings-sliders"></i></span><span>ตั้งค่า</span></a>' : ''}
              <a href="/account" data-link class="auth-pill auth-user" title="${escapeHtml(state.profile?.name || 'บัญชีของฉัน')}" data-tooltip="${escapeHtml(state.profile?.name || 'บัญชีของฉัน')}"><span class="nav-icon"><i class="fi fi-br-circle-user"></i></span><span>${escapeHtml(state.profile?.name || 'บัญชีของฉัน')}</span></a>
              <button class="auth-pill auth-logout" data-action="logout" type="button" title="ออกจากระบบ" data-tooltip="ออกจากระบบ"><span class="nav-icon"><i class="fi fi-br-sign-out-alt"></i></span><span>ออกจากระบบ</span></button>
            ` : '<a href="/login" data-link class="muted">Login</a><a href="/register" data-link class="btn compact">Register</a>'}
          </div>
        </div>
      </div>
    </header>
    <main id="main-content" tabindex="-1">${content}</main>
    <footer class="footer"><div class="container footer-grid"><div><strong>Condo Finder</strong></div><div><a href="/buy" data-link>ซื้อคอนโด</a><a href="/rent" data-link>เช่าคอนโด</a><a href="/packages" data-link>แพ็กเกจ</a></div></div></footer>
  `;
}

async function pageHome() {
  const { data: properties = [] } = await supabase
    .from('properties')
    .select('*, property_images(image_url, sort_order)')
    .eq('is_published', true)
    .order('is_promoted', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6);

  const { data: projects = [] } = await supabase.from('projects').select('*').eq('is_published', true).limit(3);
  const stats = [
    { value: properties.length, label: 'ประกาศที่เผยแพร่' },
    { value: projects.length, label: 'โครงการในระบบ' },
    { value: state.packages.length, label: 'แพ็กเกจ' },
    { value: '99%', label: 'ความพึงพอใจ' },
  ];

  return html`
    <section class="hero">
      <div class="container hero-content">
        <span class="eyebrow">Condo Finder | ชี้เป้าคอนโดเด็ด</span>
        <h1>ค้นหาคอนโดที่ใช่<br>ในทำเลที่คุณต้องการ</h1>
        <p>รวมประกาศขายและให้เช่าคอนโดคุณภาพ ค้นหาง่าย เปรียบเทียบสะดวก พร้อมข้อมูลครบก่อนตัดสินใจ</p>
      </div>
    </section>
    <div class="container hero-stack">${searchPanel('sell', true)}<div class="stats">${stats.map((item) => html`<div class="stat"><strong>${item.value}</strong>${item.label}</div>`).join('')}</div></div>
    <section class="section">
      <div class="container"><div class="section-head"><div><span class="eyebrow">Featured Listings</span><h2>ประกาศคอนโดแนะนำ</h2></div><a href="/buy" data-link class="btn outline">ดูประกาศทั้งหมด</a></div>
      <div class="grid">${properties.map(card).join('')}</div></div>
    </section>
    <section class="section soft-band"><div class="container"><div class="section-head"><div><span class="eyebrow">Popular Locations</span><h2>ทำเลยอดนิยม</h2></div></div><div class="location-grid">
      ${[['สุขุมวิท','https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80'],['อโศก','https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80'],['พระราม 9','https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'],['สาทร','https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=900&q=80']].map(([name,img])=>`<a class="location-card" href="/buy?q=${encodeURIComponent(name)}" data-link><img src="${img}" alt="${name}"><span>${name}</span><small>ดูประกาศในทำเลนี้</small></a>`).join('')}
    </div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">New Projects</span><h2>โครงการคอนโดใหม่</h2></div><a href="/projects" data-link class="btn outline">ดูโครงการทั้งหมด</a></div><div class="grid">${projects.map(projectCard).join('')}</div></div></section>
    <section class="section soft-band"><div class="container"><div class="section-head"><div><span class="eyebrow">Why Condo Finder</span><h2>ช่วยให้ตัดสินใจง่ายขึ้น</h2></div></div><div class="why-grid">
      ${[['search-location','ค้นหาละเอียด','กรองทำเล ราคา ห้องนอน และเรียงผลลัพธ์ได้ทันที'],['document','ข้อมูลครบ','ดูราคา พื้นที่ ชั้น สิ่งอำนวยความสะดวก และสถานที่ใกล้เคียง'],['city','โครงการใหม่','รวมโครงการพร้อมอยู่และกำลังก่อสร้างจาก Developer ชั้นนำ'],['add-document','ลงประกาศง่าย','สมัครสมาชิก แล้วลงประกาศได้ด้วยฟอร์มเดียว']].map(x=>`<div class="feature-box"><span class="feature-icon"><i class="fi fi-br-${x[0]}"></i></span><strong>${x[1]}</strong><p class="muted">${x[2]}</p></div>`).join('')}
    </div></div></section>
  `;
}

function searchPanel(type = 'sell', compact = false) {
  const params = new URLSearchParams(window.location.search);
  const selected = (name, value) => params.get(name) === value ? 'selected' : '';
  return html`
      <form class="search-panel ${compact ? '' : 'inline-search'}" data-form="search" data-type="${type}">
        <div class="tabs">
          <a class="tab ${type === 'sell' ? 'active' : ''}" href="/buy" data-link><i class="fi fi-br-building"></i> ซื้อคอนโด</a>
          <a class="tab ${type === 'rent' ? 'active' : ''}" href="/rent" data-link><i class="fi fi-br-key"></i> เช่าคอนโด</a>
        </div>
        <div class="search-grid ${compact ? 'home-search' : 'listing-search'}">
          <div><label><i class="fi fi-br-search-location"></i> ทำเล / BTS / MRT / ชื่อโครงการ</label><input name="q" value="${escapeHtml(params.get('q') || '')}" placeholder="เช่น สุขุมวิท, อารีย์, พระราม 9"></div>
          <div><label><i class="fi fi-br-tags"></i> ช่วงราคา</label><select name="price"><option value="">ทุกช่วงราคา</option><option value="0-5000000" ${selected('price','0-5000000')}>ไม่เกิน 5 ล้าน</option><option value="5000000-8000000" ${selected('price','5000000-8000000')}>5 - 8 ล้าน</option><option value="8000000+" ${selected('price','8000000+')}>8 ล้านขึ้นไป</option></select></div>
          <div><label><i class="fi fi-br-bed"></i> ห้องนอน</label><select name="bedrooms"><option value="">ทั้งหมด</option><option value="1" ${selected('bedrooms','1')}>1 ห้องนอน</option><option value="2" ${selected('bedrooms','2')}>2 ห้องนอน</option><option value="3" ${selected('bedrooms','3')}>3 ห้องนอนขึ้นไป</option></select></div>
          ${compact ? '' : `<div><label><i class="fi fi-br-sort-alt"></i> เรียงตาม</label><select name="sort"><option value="">แนะนำ</option><option value="price-low" ${selected('sort','price-low')}>ราคาต่ำไปสูง</option><option value="price-high" ${selected('sort','price-high')}>ราคาสูงไปต่ำ</option></select></div>`}
          <button class="btn search-btn" type="submit"><i class="fi fi-br-search"></i> ค้นหา</button>
        </div>
      </form>
  `;
}

async function pageListings(type) {
  const qs = new URLSearchParams(window.location.search);
  let query = supabase.from('properties').select('*, property_images(image_url, sort_order)').eq('type', type).eq('is_published', true);
  if (qs.get('q')) {
    const q = `%${qs.get('q')}%`;
    query = query.or(`title.ilike.${q},project_name.ilike.${q},location.ilike.${q}`);
  }
  if (qs.get('bedrooms')) query = Number(qs.get('bedrooms')) >= 3 ? query.gte('bedrooms', 3) : query.eq('bedrooms', Number(qs.get('bedrooms')));
  if (qs.get('price')) {
    const [min, max] = qs.get('price').replace('+', '').split('-').map(Number);
    query = query.gte('price', min || 0);
    if (max) query = query.lte('price', max);
  }
  const sort = qs.get('sort');
  if (sort === 'price-low') query = query.order('price', { ascending: true });
  else if (sort === 'price-high') query = query.order('price', { ascending: false });
  else query = query.order('is_promoted', { ascending: false }).order('created_at', { ascending: false });
  const { data = [] } = await query;

  return html`
    <section class="hero-sub"><div class="container"><span class="eyebrow">${type === 'rent' ? 'Rent Condo' : 'Buy Condo'}</span><h1>${type === 'rent' ? 'เช่าคอนโด' : 'ซื้อคอนโด'}</h1><p>ค้นหารายการตามทำเล ราคา และรูปแบบห้องที่ต้องการ</p></div></section>
    <section class="section"><div class="container">${searchPanel(type)}<div class="grid">${data.length ? data.map(card).join('') : empty('ยังไม่พบประกาศที่ตรงกับเงื่อนไข')}</div></div></section>
  `;
}

function card(property) {
  return html`
    <article class="card property-card">
      <a href="/properties/${property.id}" data-link class="card-media"><img src="${imageOf(property)}" alt="${escapeHtml(property.title)}" loading="lazy">${property.badge ? `<span class="badge floating">${escapeHtml(property.badge)}</span>` : ''}</a>
      <div class="card-body">
        <h3>${escapeHtml(property.title)}</h3><div class="price">${money.format(property.price)} ${property.type === 'rent' ? 'บาท/เดือน' : 'บาท'}</div>
        <p class="muted">${escapeHtml(locationOf(property))}</p>
        <div class="meta"><span><span class="mini-icon"><i class="fi fi-br-bed"></i></span>${property.bedrooms} ห้องนอน</span><span><span class="mini-icon"><i class="fi fi-br-bath"></i></span>${property.bathrooms} ห้องน้ำ</span><span><span class="mini-icon"><i class="fi fi-br-expand"></i></span>${Number(property.area)} ตร.ม.</span></div>
        <p class="card-action"><a class="btn outline" href="/properties/${property.id}" data-link>ดูรายละเอียดรายการ</a></p>
      </div>
    </article>
  `;
}

function projectCard(project) {
  return html`
    <article class="card">
      <a class="card-media" href="/projects" data-link><img src="${project.image_url || '/images/condo-finder-logo-transparent.png'}" alt="${escapeHtml(project.name)}" loading="lazy"></a>
      <div class="card-body">
        <span class="badge">${escapeHtml(project.status)}</span><h3>${escapeHtml(project.name)}</h3>
        <p class="muted">${escapeHtml(project.developer)} · ${escapeHtml(project.location)}</p><div class="price">เริ่ม ${money.format(project.starting_price)} บาท</div>
      </div>
    </article>
  `;
}

async function pageProperty(id) {
  const [{ data: property }, { data: images = [] }, { data: amenities = [] }, { data: nearby = [] }] = await Promise.all([
    supabase.from('properties').select('*, profiles(name, phone)').eq('id', id).single(),
    supabase.from('property_images').select('*').eq('property_id', id).order('sort_order'),
    supabase.from('property_amenities').select('*').eq('property_id', id),
    supabase.from('property_nearby_places').select('*').eq('property_id', id),
  ]);
  if (!property) return empty('ไม่พบประกาศนี้');
  const gallery = images.length ? images : [{ image_url: '/images/condo-finder-logo-transparent.png', alt_text: property.title }];
  const lineHref = lineContactHref(property.contact_line);
  const facebookHref = facebookContactHref(property.contact_facebook);
  const latitude = Number(property.latitude);
  const longitude = Number(property.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  const mapBbox = hasCoordinates
    ? [longitude - 0.005, latitude - 0.003, longitude + 0.005, latitude + 0.003].join(',')
    : '';
  const mapEmbedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(mapBbox)}&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`
    : '';
  const mapDetailUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
    : '';

  return html`
    <section class="property-hero"><div class="container">
      <div class="property-header">
        <div><div class="eyebrow" style="color:var(--brand);margin-bottom:8px">${property.type === 'rent' ? 'เช่าคอนโด' : 'ซื้อคอนโด'}</div><h1>${escapeHtml(property.title)}</h1><p class="muted" style="margin-top:8px"><i class="fi fi-br-marker" style="color:var(--brand);margin-right:4px"></i> ${escapeHtml(locationOf(property))}</p></div>
        <div class="property-price-area"><div class="price">${money.format(property.price)}</div><div class="muted">${property.type === 'rent' ? 'บาท / เดือน' : 'บาท'}</div></div>
      </div>
      <div class="spec-summary">${[
        ['fi fi-br-tags', property.type === 'rent' ? 'ให้เช่า' : 'ขาย', 'ประเภท'],
        ['fi fi-br-bed', property.bedrooms, 'ห้องนอน'],
        ['fi fi-br-bath', property.bathrooms, 'ห้องน้ำ'],
        ['fi fi-br-layers', property.floor || '-', 'ชั้น'],
        ['fi fi-br-expand', Number(property.area), 'ตร.ม.'],
      ].map(([icon, value, label]) => `<div class="spec-item"><i class="${icon}"></i><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
      <div class="detail-grid">
        <div class="main-content">
          <section class="property-gallery" aria-label="รูปภาพประกาศ">
            <button class="gallery-main" type="button" data-gallery-open aria-label="ดูรูปภาพขนาดใหญ่"><img id="gallery-main-image" src="${gallery[0].image_url}" alt="${escapeHtml(gallery[0].alt_text || property.title)}"><span class="gallery-count"><i class="fi fi-br-picture"></i><span id="gallery-current-index">1</span> / ${gallery.length}</span></button>
            ${gallery.length > 1 ? `<div class="gallery-strip-wrap"><button class="gallery-scroll-btn" type="button" data-gallery-scroll="-1" aria-label="เลื่อนรูปก่อนหน้า"><i class="fi fi-br-angle-small-left"></i></button><div class="gallery-strip" data-gallery-strip>${gallery.map((img, index) => `<button class="gallery-thumb ${index === 0 ? 'is-active' : ''}" type="button" data-gallery-thumb data-index="${index + 1}" data-src="${img.image_url}" data-alt="${escapeHtml(img.alt_text || property.title)}" aria-label="ดูรูปที่ ${index + 1}"><img src="${img.image_url}" alt=""></button>`).join('')}</div><button class="gallery-scroll-btn" type="button" data-gallery-scroll="1" aria-label="เลื่อนรูปถัดไป"><i class="fi fi-br-angle-small-right"></i></button></div>` : ''}
          </section>
          <div class="detail-section"><h2>รายละเอียดประกาศ</h2><div class="description-box">${escapeHtml(property.description || 'ยังไม่มีรายละเอียดประกาศ')}</div></div>
          <div class="detail-section"><h2>สิ่งอำนวยความสะดวก</h2><div class="amenities-grid">${amenities.length ? amenities.map((a) => `<div class="amenity-item"><i class="fi fi-br-check-circle"></i>${escapeHtml(a.amenity)}</div>`).join('') : '<p class="muted">ยังไม่มีข้อมูลสิ่งอำนวยความสะดวก</p>'}</div></div>
          <div class="detail-section"><h2>สถานที่ใกล้เคียง</h2><div class="nearby-list">${nearby.length ? nearby.map((n) => `<div class="nearby-item"><span><i class="fi fi-br-marker" style="color:var(--brand);margin-right:8px"></i>${escapeHtml(n.place_name)}</span><span class="distance">ระบุข้อมูลพื้นที่</span></div>`).join('') : '<p class="muted">ยังไม่มีข้อมูลสถานที่ใกล้เคียง</p>'}</div></div>
          ${hasCoordinates ? `<div class="detail-section property-map-section"><div class="property-map-heading"><div><h2>ตำแหน่งบนแผนที่</h2><p class="muted">ตำแหน่งโดยประมาณตามข้อมูลที่ผู้ลงประกาศระบุ</p></div><a class="btn outline compact" href="${escapeHtml(mapDetailUrl)}" target="_blank" rel="noopener"><i class="fi fi-br-marker"></i> เปิดแผนที่</a></div><div class="property-map"><iframe src="${escapeHtml(mapEmbedUrl)}" title="แผนที่ตำแหน่ง ${escapeHtml(property.title)}" loading="lazy" referrerpolicy="no-referrer"></iframe></div></div>` : ''}
        </div>
        <aside><div class="contact-card">
          <div class="agent-info"><div class="agent-avatar">${escapeHtml((property.contact_name || 'A').slice(0, 1))}</div><div class="agent-details"><span class="badge" style="margin-bottom:4px">ผู้ลงประกาศ</span><strong>${escapeHtml(property.contact_name || property.profiles?.name || '-')}</strong><span class="muted" style="font-size:14px">ผู้ประกาศรายการนี้</span></div></div>
          <div class="contact-actions">
            <a href="tel:${escapeHtml(property.contact_phone || '')}" class="btn"><i class="fi fi-br-phone-call"></i> โทร ${escapeHtml(property.contact_phone || '-')}</a>
            ${lineHref ? `<a href="${escapeHtml(lineHref)}" target="_blank" rel="noopener" class="btn outline contact-channel contact-line"><i class="fi fi-brands-line"></i> ติดต่อทาง LINE</a>` : '<button type="button" class="btn outline contact-channel is-unavailable" disabled title="ผู้ลงประกาศไม่ได้ระบุข้อมูล LINE"><i class="fi fi-brands-line"></i><span>ไม่มีข้อมูลติดต่อ LINE</span></button>'}
            ${facebookHref ? `<a href="${escapeHtml(facebookHref)}" target="_blank" rel="noopener" class="btn outline contact-channel contact-facebook"><i class="fi fi-brands-facebook"></i> ติดต่อทาง Facebook</a>` : '<button type="button" class="btn outline contact-channel is-unavailable" disabled title="ผู้ลงประกาศไม่ได้ระบุข้อมูล Facebook"><i class="fi fi-brands-facebook"></i><span>ไม่มีข้อมูลติดต่อ Facebook</span></button>'}
            <a href="/contact" data-link class="btn outline"><i class="fi fi-br-envelope"></i> ส่งข้อความส่วนตัว</a>
          </div>
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--line);text-align:center"><p class="muted" style="font-size:13px">รหัสประกาศ: ${escapeHtml(property.id)}</p></div>
        </div></aside>
      </div>
    </div></section>
    <dialog class="gallery-dialog" data-gallery-dialog aria-label="ดูรูปภาพประกาศ"><button class="gallery-dialog-close" type="button" data-gallery-close aria-label="ปิดตัวอย่างรูปภาพ"><i class="fi fi-br-cross-small"></i></button><img data-gallery-dialog-image src="${gallery[0].image_url}" alt="${escapeHtml(gallery[0].alt_text || property.title)}"></dialog>
  `;
}

async function pagePackages() {
  const { data = [] } = await supabase.from('packages').select('*, package_features(*)').eq('is_active', true).order('price');
  return html`<section class="hero-sub package-hero"><div class="container"><span class="eyebrow">Packages</span><h1>เลือกแพ็กเกจลงประกาศ</h1><p>จัดการประกาศตามจำนวนรายการและระยะเวลาที่ต้องการ</p></div></section><section class="section"><div class="container"><div class="grid package-grid">${data.map((pkg) => html`<article class="card package-card ${pkg.is_premium ? 'featured' : ''}">${pkg.is_premium ? '<span class="popular-pill"><i class="fi fi-br-crown"></i> คุ้มที่สุด</span>' : ''}<div class="card-body"><h2>${escapeHtml(pkg.name)}</h2><div class="price">${money.format(pkg.price)} บาท</div><p class="muted">ลงได้ ${pkg.listings_limit} รายการ · ${pkg.duration_days} วัน · รูป ${pkg.image_limit} รูป</p><div class="feature-list">${(pkg.package_features || []).sort((a,b)=>a.sort_order-b.sort_order).map((f)=>`<span><i class="fi fi-br-check-circle"></i>${escapeHtml(f.feature)}</span>`).join('')}</div><p class="card-action"><a class="btn ${pkg.is_premium ? '' : 'outline'}" href="${isLoggedIn() ? '/post' : '/register'}" data-link>เลือกแพ็กเกจนี้</a></p></div></article>`).join('')}</div></div></section>`;
}

async function pageProjects() {
  const { data = [] } = await supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false });
  return html`<section class="hero-sub projects-hero"><div class="container"><span class="eyebrow">New Projects</span><h1>โครงการคอนโดใหม่</h1><p>รวมโครงการใหม่และโครงการพร้อมอยู่จาก Developer ชั้นนำ</p></div></section><section class="section"><div class="container"><div class="grid">${data.map(projectCard).join('')}</div></div></section>`;
}

async function pageBlog() {
  const { data = [] } = await supabase.from('blogs').select('*').eq('is_published', true).order('published_date', { ascending: false });
  return html`<section class="hero-sub blog-hero"><div class="container"><span class="eyebrow">Blog</span><h1>บทความ</h1><p>ไอเดียและความรู้ก่อนซื้อ ขาย เช่า หรือลงประกาศคอนโด</p></div></section><section class="section"><div class="container"><div class="grid">${data.map((post) => `<article class="card"><a class="card-media" href="/blog" data-link><img src="${post.image_url || '/images/condo-finder-logo-transparent.png'}" alt="${escapeHtml(post.title)}"></a><div class="card-body"><span class="badge">${escapeHtml(post.category)}</span><h3>${escapeHtml(post.title)}</h3><p class="muted">${escapeHtml(post.excerpt)}</p></div></article>`).join('')}</div></div></section>`;
}

async function pageContact() {
  const { data: settings } = await supabase.from('contact_settings').select('*').eq('id', 1).maybeSingle();
  const contact = settings || {};
  const socials = [
    ['facebook', 'Facebook', contact.facebook_url, 'ติดตามประกาศและข่าวสาร'],
    ['line', 'LINE', lineContactHref(contact.line_url), 'พูดคุยกับทีมงานได้สะดวก'],
    ['instagram', 'Instagram', contact.instagram_url, 'ดูคอนโดและไอเดียแต่งห้อง'],
    ['tiktok', 'TikTok', contact.tiktok_url, 'รับชมวิดีโอคอนโดสั้น ๆ'],
  ].filter((item) => safeHttpUrl(item[2]));
  return html`<section class="contact-hero"><div class="container contact-hero-grid"><div class="contact-copy"><div class="eyebrow">Contact Condo Finder</div><h1>คุยกับทีมงาน<br>Condo Finder</h1><p>ฝากข้อมูลประกาศ สอบถามแพ็กเกจ หรือคุยเรื่องคอนโดที่คุณสนใจ ทีมงานพร้อมช่วยดูแลและติดต่อกลับอย่างเป็นกันเอง</p><div class="contact-quick">${socials.map(([key, label, url, note]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener"><span class="social-icon ${key}"><i class="fi-brands-${key}"></i></span><span><strong>${label}</strong><small>${note}</small></span></a>`).join('') || '<p class="muted">ทีมงานกำลังอัปเดตช่องทางออนไลน์</p>'}</div></div><div class="contact-brand-card"><img src="/images/condo-finder-logo-transparent.png" alt="Condo Finder"><div><strong>ช่องทางหลัก</strong><p class="muted">${escapeHtml(contact.phone || 'ติดต่อทีมงานผ่านแบบฟอร์ม')} ${contact.email ? `· ${escapeHtml(contact.email)}` : ''}</p><p class="muted">${escapeHtml(contact.address || '')}</p></div></div></div></section>
  <section class="section contact-section"><div class="container contact-layout"><aside class="contact-info-card">${[['envelope','ส่งข้อความถึงทีมงาน','กรอกข้อมูลให้ครบ ทีมงานจะติดต่อกลับตามช่องทางที่สะดวก'],['clock-three','เวลาตอบกลับ','โดยทั่วไปภายใน 1 วันทำการ'],['shield-check','ข้อมูลปลอดภัย','ใช้เพื่อประสานงานเกี่ยวกับประกาศและบริการเท่านั้น']].map(x=>`<div class="contact-info-item"><span><i class="fi fi-br-${x[0]}"></i></span><div><strong>${x[1]}</strong><p class="muted">${x[2]}</p></div></div>`).join('')}</aside><form data-form="contact" class="contact-form-card"><div class="field-grid"><div><label for="contact-name"><i class="fi fi-br-user"></i> ชื่อ</label><input id="contact-name" name="full_name" autocomplete="name" required></div><div><label for="contact-phone"><i class="fi fi-br-phone-call"></i> เบอร์โทร</label><input id="contact-phone" name="phone" type="tel" autocomplete="tel" required></div></div><label for="contact-email"><i class="fi fi-br-envelope"></i> อีเมล</label><input id="contact-email" name="email" type="email" autocomplete="email"><label for="contact-message"><i class="fi fi-br-comment-alt"></i> ข้อความ</label><textarea id="contact-message" name="message" placeholder="พิมพ์รายละเอียดที่ต้องการให้ทีมงานช่วยดูแล"></textarea><button class="btn contact-submit" type="submit"><i class="fi fi-br-paper-plane"></i> ส่งข้อความ</button></form></div></section>`;
}

function pageAuth(mode = 'login') {
  return html`<section class="section auth-section"><div class="container narrow"><form data-form="${mode}" class="card form-card"><div class="card-body"><div class="eyebrow">${mode === 'register' ? 'Create Account' : 'Member'}</div><h1 class="form-title">${mode === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1><p class="muted">${mode === 'register' ? 'สร้างบัญชีเพื่อเลือกแพ็กเกจ ลงประกาศ และดูรายการของคุณ' : 'ใช้บัญชีสำหรับลงประกาศและจัดการรายการของคุณ'}</p>${mode === 'register' ? '<label for="register-name">ชื่อผู้ใช้</label><input id="register-name" name="name" autocomplete="name" required><label for="register-phone">เบอร์โทร</label><input id="register-phone" name="phone" type="tel" autocomplete="tel" required>' : ''}<label for="auth-email">อีเมล</label><input id="auth-email" name="email" type="email" autocomplete="email" required><label for="auth-password">รหัสผ่าน</label><input id="auth-password" name="password" type="password" autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" minlength="8" required>${mode === 'register' ? '<label for="register-password-confirmation">ยืนยันรหัสผ่าน</label><input id="register-password-confirmation" name="password_confirm" type="password" autocomplete="new-password" minlength="8" required><label class="check-row" for="register-terms"><input id="register-terms" name="terms" type="checkbox" required><span>ยอมรับเงื่อนไขการใช้งาน</span></label>' : ''}<p class="card-action"><button class="btn" type="submit">${mode === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button></p><p class="muted">${mode === 'register' ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'} <a class="text-link" href="${mode === 'register' ? '/login' : '/register'}" data-link>${mode === 'register' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</a></p></div></form></div></section>`;
}

async function pageMyListings() {
  if (!isLoggedIn()) return pageAuth('login');
  const { data = [] } = await supabase.from('properties').select('*, property_images(image_url, sort_order)').eq('owner_id', state.session.user.id).order('created_at', { ascending: false });
  return html`<section class="hero-sub"><div class="container"><div class="eyebrow">My Listings</div><h1>ประกาศของฉัน</h1><p>ตรวจสอบรายการที่คุณลงประกาศไว้ใน Condo Finder</p></div></section><section class="section"><div class="container"><div class="section-head"><div><h2>รายการประกาศ</h2><p class="muted">ดูสถานะและจัดการประกาศทั้งหมดของคุณจากหน้านี้</p></div><a class="btn" href="/post" data-link><i class="fi fi-br-plus"></i> ลงประกาศใหม่</a></div><div class="grid">${data.map((p) => `<div class="listing-management-card">${card(p)}<div class="listing-management-actions"><span class="badge">${p.is_published ? 'เผยแพร่อยู่' : 'พักประกาศ'}</span><button class="btn outline compact" data-action="toggle-post" data-id="${p.id}" data-current="${p.is_published}">${p.is_published ? 'พักประกาศ' : 'เผยแพร่'}</button></div></div>`).join('') || empty('ยังไม่มีประกาศ')}</div></div></section>`;
}

function pageAccount() {
  if (!isLoggedIn()) return pageAuth('login');
  const packageInfo = state.packages.find((item) => item.id === state.profile?.package_id);
  const labels = ['เริ่มต้น', 'มาตรฐาน', 'พรีเมียม', 'แอดมิน'];
  return html`<section class="hero-sub"><div class="container"><div class="eyebrow">Account</div><h1>บัญชีของฉัน</h1><p>จัดการข้อมูลสมาชิกและแพ็กเกจที่เลือกใช้งาน</p></div></section><section class="section"><div class="container account-grid"><div class="card"><div class="card-body"><h2>ข้อมูลสมาชิก</h2><p class="muted">ชื่อ: ${escapeHtml(state.profile?.name || '-')}</p><p class="muted">อีเมล: ${escapeHtml(state.session.user.email || '-')}</p><p class="muted">เบอร์โทร: ${escapeHtml(state.profile?.phone || '-')}</p><p class="muted">ระดับสมาชิก: ${labels[Number(state.profile?.user_level || 0)]}</p></div></div><div class="card"><div class="card-body"><h2>แพ็กเกจปัจจุบัน</h2>${packageInfo ? `<div class="price">${escapeHtml(packageInfo.name)}</div><p class="muted">ลงได้ ${packageInfo.listings_limit} รายการ · ${packageInfo.duration_days} วัน · รูป ${packageInfo.image_limit} รูป</p>` : '<p class="muted">ยังไม่ได้เลือกแพ็กเกจ</p><a class="btn" href="/packages" data-link>เลือกแพ็กเกจ</a>'}</div></div>${isAdmin() ? '<div class="card admin-tool-card"><div class="card-body"><span class="admin-tool-icon"><i class="fi fi-br-database"></i></span><div><div class="eyebrow">Admin Tool</div><h2>ฐานข้อมูลเว็บไซต์</h2><p class="muted">เปิด Supabase Table Editor เพื่อจัดการข้อมูลของเว็บไซต์</p></div><a class="btn" href="https://supabase.com/dashboard/project/cbtnjdrlechkucltapjk/editor" target="_blank" rel="noopener"><i class="fi fi-br-database"></i> เปิดฐานข้อมูล</a></div></div>' : ''}</div></section>`;
}

function pagePost() {
  if (!isLoggedIn()) return pageAuth('login');
  const pkg = state.packages.find((item) => item.id === state.profile?.package_id) || state.packages[0] || { image_limit: 5 };
  const accountName = state.profile?.name || state.session?.user?.user_metadata?.name || '';
  const accountPhone = state.profile?.phone || state.session?.user?.user_metadata?.phone || '';
  const descriptionMaxLength = Math.min(Math.max(Number(state.listingSettings?.description_max_length) || 10000, 100), 50000);
  const amenities = state.amenities.length ? state.amenities.map((item) => item.name) : AMENITY_FALLBACK;
  return html`<section class="post-hero"><div class="container"><div class="post-hero-copy"><div class="eyebrow">Post Property</div><h1><span>ลงประกาศคอนโด<wbr>ให้พร้อม</span><span>เหมือนหน้า<wbr>รายละเอียด</span></h1><p>กรอกข้อมูลสำคัญ อัปโหลดรูปภาพ และตรวจภาพรวมประกาศก่อนเผยแพร่ ให้ผู้ซื้อหรือผู้เช่าตัดสินใจได้ง่ายขึ้น</p></div></div></section>
  <section class="section post-section"><div class="container"><form data-form="post" data-new-property-form data-image-limit="${pkg.image_limit}" class="post-layout" autocomplete="off" novalidate><div class="post-main">
    <div class="post-form-card"><div class="post-form-head"><span class="post-step">1</span><div><h2>ข้อมูลประกาศ</h2><p class="muted">รายละเอียดส่วนนี้จะแสดงในส่วนหัวของหน้ารายละเอียดประกาศ</p></div></div>
      <div class="field-grid"><div><label for="property-type"><i class="fi fi-br-tags"></i> ประเภทประกาศ</label><select id="property-type" name="type" data-enhanced-select="true" required><option value="sell">ขาย</option><option value="rent">เช่า</option></select></div><div><label for="property-price"><i class="fi fi-br-coins"></i> ราคา</label><input id="property-price" name="price" type="number" min="1" placeholder="เช่น 4500000" required></div></div>
      <label for="property-title"><i class="fi fi-br-edit"></i> หัวข้อประกาศ</label><input id="property-title" name="title" minlength="10" maxlength="120" required placeholder="เช่น ห้องวิวเมือง แต่งครบ ใกล้ BTS">
      <div class="field-grid"><div><label for="project-name"><i class="fi fi-br-building"></i> ชื่อโครงการ <span class="optional-note">ไม่บังคับ</span></label><input id="project-name" name="project_name" minlength="2" maxlength="120" placeholder="เช่น The Line Sukhumvit 101"></div><div><label for="property-location"><i class="fi fi-br-marker"></i> ทำเล <span class="optional-note">ไม่บังคับ</span></label><input id="property-location" name="location" minlength="2" maxlength="160" placeholder="เช่น สุขุมวิท 101"></div></div>
      <div class="map-coordinate-fields"><div class="map-coordinate-heading"><div><strong><i class="fi fi-br-marker"></i> ตำแหน่งบนแผนที่ <span class="optional-note">ไม่บังคับ</span></strong><small>กรอกละติจูดและลองจิจูดเมื่ออยากให้แสดงแผนที่ในหน้ารายละเอียด</small></div></div><div class="field-grid"><div><label for="property-latitude">ละติจูด</label><input id="property-latitude" name="latitude" type="number" min="-90" max="90" step="any" inputmode="decimal" placeholder="เช่น 13.7563"></div><div><label for="property-longitude">ลองจิจูด</label><input id="property-longitude" name="longitude" type="number" min="-180" max="180" step="any" inputmode="decimal" placeholder="เช่น 100.5018"></div></div><p class="field-help"><i class="fi fi-br-info"></i> ต้องกรอกทั้งสองค่า จึงจะแสดงตำแหน่งบนแผนที่</p></div>
    </div>
    <div class="post-form-card"><div class="post-form-head"><span class="post-step">2</span><div><h2>สเปกห้อง</h2><p class="muted">ข้อมูลนี้จะถูกจัดเป็นแถวสรุปเหมือนหน้ารายละเอียด</p></div></div><div class="field-grid three"><div><label for="bedrooms"><i class="fi fi-br-bed"></i> ห้องนอน</label><input id="bedrooms" name="bedrooms" type="number" min="0" placeholder="เช่น 1" required></div><div><label for="bathrooms"><i class="fi fi-br-bath"></i> ห้องน้ำ</label><input id="bathrooms" name="bathrooms" type="number" min="1" placeholder="เช่น 1" required></div><div><label for="area"><i class="fi fi-br-expand"></i> พื้นที่ (ตร.ม.)</label><input id="area" name="area" type="number" min="1" step=".01" placeholder="เช่น 30" required></div></div><label for="floor"><i class="fi fi-br-layers"></i> ชั้น</label><input id="floor" name="floor" type="number" min="0" placeholder="เช่น 22"></div>
    <div class="post-form-card"><div class="post-form-head"><span class="post-step">3</span><div><h2>รูปภาพและรายละเอียด</h2><p class="muted">แพ็กเกจ ${escapeHtml(pkg.name || '')} อัปโหลดได้สูงสุด ${pkg.image_limit} รูป · ไม่เกิน 500 KB ต่อรูป · รองรับ JPG, PNG และ WEBP</p></div></div><label for="property-images"><i class="fi fi-br-picture"></i> อัปโหลดรูปภาพ <span class="optional-note">ไม่บังคับ</span></label><label class="upload-dropzone" for="property-images"><input id="property-images" name="images" type="file" accept="image/png,image/jpeg,image/webp" multiple><span class="upload-empty"><i class="fi fi-br-cloud-upload"></i><strong>เลือกรูปภาพจากเครื่อง</strong><small>เลือกเพิ่มได้หลายครั้ง รูปแรกจะใช้เป็นภาพหลัก</small></span></label><div class="upload-queue-head"><div><strong>รายการรูปภาพ</strong><span data-image-count>0 / ${pkg.image_limit} รูป</span></div><small>ใช้ปุ่มลูกศรเพื่อจัดลำดับก่อนบันทึกประกาศ</small></div><div class="preview-list upload-queue" data-preview><div class="upload-queue-empty"><i class="fi fi-br-images"></i><span>ยังไม่ได้เลือกรูปภาพ</span></div></div><div class="field-label-row"><label for="description"><i class="fi fi-br-document"></i> รายละเอียดประกาศ</label><span class="character-counter" data-description-counter>0 / ${descriptionMaxLength.toLocaleString('th-TH')}</span></div><textarea id="description" name="description" rows="8" minlength="20" maxlength="${descriptionMaxLength}" data-description-input required placeholder="บอกจุดเด่น เฟอร์นิเจอร์ การเดินทาง และเงื่อนไขสำคัญ"></textarea><p class="field-help">ผู้ดูแลระบบกำหนดความยาวสูงสุดไว้ที่ ${descriptionMaxLength.toLocaleString('th-TH')} ตัวอักษร</p></div>
    <div class="post-form-card"><details class="amenities-disclosure" open><summary><span><i class="fi fi-br-apps"></i> สิ่งอำนวยความสะดวก</span><i class="fi fi-br-angle-small-down"></i></summary><div class="check-grid">${amenities.map((a) => `<label><input type="checkbox" name="amenities" value="${escapeHtml(a)}"><span><i class="fi fi-br-check"></i>${escapeHtml(a)}</span></label>`).join('')}</div></details></div>
    <div class="post-form-card"><div class="post-form-head"><span class="post-step">4</span><div><h2>สถานที่ใกล้เคียงและผู้ติดต่อ</h2><p class="muted">ข้อมูลส่วนนี้จะแสดงเป็นช่องทางติดต่อในหน้ารายละเอียดประกาศ</p></div></div><label for="nearby-input"><i class="fi fi-br-marker"></i> สถานที่ใกล้เคียง</label><div class="nearby-editor"><input id="nearby-input" name="nearby_input" autocomplete="off" placeholder="เช่น BTS ปุณณวิถี"><button type="button" class="btn outline compact" data-action="add-nearby"><i class="fi fi-br-plus"></i> เพิ่มรายการ</button></div><div class="nearby-list-editor" data-nearby-list><div class="nearby-list-empty" data-nearby-empty><i class="fi fi-br-marker"></i><span>ยังไม่มีสถานที่ใกล้เคียง</span></div></div><label class="account-name-choice"><input type="checkbox" name="use_account_contact" data-use-account-contact data-account-name="${escapeHtml(accountName)}" data-account-phone="${escapeHtml(accountPhone)}" checked><span class="account-name-check"><i class="fi fi-br-check"></i></span><span class="account-name-copy"><strong>ใช้ชื่อและเบอร์โทรจากบัญชีผู้ใช้</strong><small>${escapeHtml(accountName || 'ยังไม่ได้ระบุชื่อ')} · ${escapeHtml(accountPhone || 'ยังไม่ได้ระบุเบอร์โทร')}</small></span></label><div class="field-grid"><div><label for="contact-name"><i class="fi fi-br-user"></i> ชื่อผู้ติดต่อ</label><input id="contact-name" name="contact_name" data-contact-name value="${escapeHtml(accountName)}" autocomplete="off" minlength="2" maxlength="100" placeholder="ชื่อเจ้าของหรือผู้ดูแลประกาศ" readonly required></div><div><label for="contact-phone"><i class="fi fi-br-phone-call"></i> เบอร์โทร</label><input id="contact-phone" name="contact_phone" data-contact-phone value="${escapeHtml(accountPhone)}" type="tel" inputmode="tel" autocomplete="off" maxlength="20" placeholder="เช่น 0891234567" readonly required></div><div><label for="contact-line"><i class="fi fi-brands-line"></i> LINE ID หรือ Link <span class="optional-note">ไม่บังคับ</span></label><input id="contact-line" name="contact_line" autocomplete="off" maxlength="200" placeholder="เช่น @condofinder หรือ https://line.me/..."></div><div><label for="contact-facebook"><i class="fi fi-brands-facebook"></i> Facebook <span class="optional-note">ไม่บังคับ</span></label><input id="contact-facebook" name="contact_facebook" type="url" autocomplete="off" maxlength="500" placeholder="https://www.facebook.com/..."></div></div></div>
    <div class="post-validation-summary" data-post-errors hidden role="alert"></div>
    <button class="btn post-submit" type="submit"><i class="fi fi-br-disk"></i> ตรวจสอบและบันทึกประกาศ</button>
  </div><aside class="post-sidebar"><div class="post-progress-card"><div><strong>ความพร้อมของประกาศ</strong><span data-post-progress-value>0%</span></div><div class="post-progress-track"><span data-post-progress style="width:0%"></span></div><p class="muted" data-post-progress-message>กรอกข้อมูลที่จำเป็นให้ครบก่อนลงประกาศ</p></div><div class="post-preview-card"><img src="/images/condo-finder-logo-transparent.png" alt=""><div><span class="eyebrow">Preview</span><h3>ประกาศของคุณ</h3><p class="muted">หลังบันทึก ระบบจะพาไปยังหน้ารายละเอียด โดยใช้รูปที่อัปโหลดหรือโลโก้เว็บไซต์เป็นภาพสำรอง</p></div></div></aside></form></div></section>`;
}

async function pageAdmin() {
  if (!isAdmin()) return empty('หน้านี้สำหรับผู้ดูแลระบบ');
  const sections = new Set(['dashboard', 'navigation', 'posts', 'listing', 'projects', 'packages', 'blogs', 'contact', 'promote']);
  const requestedSection = window.location.hash.replace('#', '');
  const section = sections.has(requestedSection) ? requestedSection : 'dashboard';
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const [postsResult, projectsResult, packagesResult, blogsResult, contactResult, analyticsResult, profilesResult, listingSettingsResult, amenitiesResult] = await Promise.all([
    supabase.from('properties').select('*, property_images(image_url, sort_order), profiles(name)').order('created_at', { ascending: false }),
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('packages').select('*, package_features(*)').order('price'),
    supabase.from('blogs').select('*').order('published_date', { ascending: false }),
    supabase.from('contact_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('analytics_events').select('event_type,path,search_query,user_id,session_id,created_at').gte('created_at', since).order('created_at', { ascending: true }),
    supabase.from('profiles').select('id,name,email,user_level,created_at').order('created_at', { ascending: false }),
    supabase.from('listing_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('amenity_catalog').select('*').order('sort_order').order('name'),
  ]);
  const posts = postsResult.data || [];
  const projects = projectsResult.data || [];
  const packages = packagesResult.data || [];
  const blogs = blogsResult.data || [];
  const contact = contactResult.data || {};
  const analytics = analyticsResult.data || [];
  const profiles = profilesResult.data || [];
  const listingSettings = listingSettingsResult.data || state.listingSettings;
  const amenities = amenitiesResult.data || [];
  state.admin = { posts, projects, packages, blogs, contact, listingSettings, amenities };

  const sectionLabels = {
    dashboard: ['แดชบอร์ดภาพรวม', 'ติดตามผู้ใช้งาน การเข้าชม และคำค้นหา เพื่อนำข้อมูลไปพัฒนาระบบ'],
    navigation: ['จัดการเมนูหลัก', 'เปิดหรือปิดเมนูบนแถบนำทางของเว็บไซต์'],
    posts: ['จัดการโพสต์ประกาศ', 'ควบคุมการแสดงผลของประกาศซื้อ ขาย และเช่าทั้งหมด'],
    listing: ['ตั้งค่ารายละเอียดลงประกาศ', 'กำหนดความยาวรายละเอียดและจัดการสิ่งอำนวยความสะดวกในแบบฟอร์ม'],
    projects: ['จัดการโครงการใหม่', 'เพิ่ม แก้ไข และลบข้อมูลโครงการคอนโด'],
    packages: ['จัดการแพ็กเกจ', 'แก้ไขราคา สิทธิ์ และข้อกำหนดของแพ็กเกจลงประกาศ'],
    blogs: ['จัดการบทความ', 'เพิ่ม แก้ไข ลบ และควบคุมการเผยแพร่บทความ'],
    contact: ['ช่องทางการติดต่อ', 'แก้ไขข้อมูลติดต่อและโซเชียลที่แสดงบนหน้าติดต่อเรา'],
    promote: ['ดันประกาศ', 'กำหนดประกาศแนะนำหรือมาแรงเพื่อเพิ่มการมองเห็น'],
  };
  const navItems = [
    ['dashboard', 'chart-histogram', 'แดชบอร์ด'],
    ['navigation', 'menu-burger', 'เปิด / ปิดเมนูหลัก'],
    ['posts', 'list-check', 'เปิด / ปิดโพสต์'],
    ['listing', 'settings-sliders', 'รายละเอียดลงประกาศ'],
    ['projects', 'city', 'โครงการคอนโดใหม่'],
    ['packages', 'box-open', 'แพ็กเกจลงประกาศ'],
    ['blogs', 'document', 'บทความ'],
    ['contact', 'phone-call', 'ช่องทางการติดต่อ'],
    ['promote', 'flame', 'ดันประกาศ'],
  ];
  const sidebar = `<aside class="settings-nav-card"><span class="settings-nav-icon"><i class="fi fi-br-settings"></i></span><div><strong>ศูนย์จัดการระบบ</strong>${navItems.map(([key, icon, label]) => `<a class="${section === key ? 'is-active' : ''}" href="/admin/settings#${key}" data-link><i class="fi fi-br-${icon}"></i><span>${label}</span></a>`).join('')}<a href="https://supabase.com/dashboard/project/cbtnjdrlechkucltapjk/editor" target="_blank" rel="noopener"><i class="fi fi-br-database"></i><span>ฐานข้อมูล Supabase</span></a></div></aside>`;

  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').toLowerCase();
  const type = params.get('type') || 'all';
  const status = params.get('status') || 'all';
  const perPage = Number(params.get('per_page') || 15);
  const filtered = posts.filter((post) => {
    const owner = post.profiles?.name || post.contact_name || '';
    const matchQ = !q || [post.title, post.project_name, post.location, owner].some((value) => String(value || '').toLowerCase().includes(q));
    const matchType = type === 'all' || post.type === type;
    const matchStatus = status === 'all' || (status === 'published' ? post.is_published : !post.is_published);
    return matchQ && matchType && matchStatus;
  });
  const menuPanel = `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Navigation</div><h2>เปิด / ปิดเมนูบนแถบบาร์</h2><p>เมนูที่ปิดยังแสดงบน navbar พร้อมป้าย “เร็ว ๆ นี้” และพาผู้ใช้ไปหน้ารอเปิดใช้งาน</p></div></div><div class="menu-toggle-list">${[...state.menus].sort((a,b)=>a.sort_order-b.sort_order).map((m) => `<label class="menu-toggle-card"><input type="checkbox" data-menu-key="${m.key}" ${m.is_enabled ? 'checked' : ''}><span class="menu-toggle-icon"><i class="${m.icon_class}"></i></span><span class="menu-toggle-copy"><strong>${escapeHtml(m.label)}</strong><small>${m.path}</small></span><span class="menu-toggle-switch"></span></label>`).join('')}</div></div>`;
  const summary = { total: posts.length, published: posts.filter(p=>p.is_published).length, hidden: posts.filter(p=>!p.is_published).length, sell: posts.filter(p=>p.type==='sell').length, rent: posts.filter(p=>p.type==='rent').length };
  const postPanel = `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Listing Visibility</div><h2>โพสต์ซื้อขายเช่าทั้งหมด</h2><p>โพสต์ที่ปิดจะหายจากหน้าสาธารณะ แต่ข้อมูลยังอยู่ในฐานข้อมูล</p></div><a class="btn outline admin-nowrap-btn" href="/buy" data-link><i class="fi fi-br-eye"></i><span>ดูหน้าเว็บ</span></a></div><div class="admin-post-stats">${[['total','ทั้งหมด'],['published','กำลังแสดง'],['hidden','ปิดอยู่'],['sell','ขาย'],['rent','เช่า']].map(([key,label])=>`<div><strong>${summary[key]}</strong><span>${label}</span></div>`).join('')}</div><form class="admin-post-filter" data-form="admin-filter"><div class="admin-post-search-field"><label>ค้นหาชื่อ / โครงการ / ผู้ลงประกาศ</label><input name="q" type="search" value="${escapeHtml(params.get('q') || '')}" placeholder="เช่น test3, Noble, Admin User"></div><div><label>ประเภทประกาศ</label><select name="type"><option value="all">ทั้งหมด</option><option value="sell" ${type==='sell'?'selected':''}>ขาย</option><option value="rent" ${type==='rent'?'selected':''}>เช่า</option></select></div><div><label>สถานะการแสดงผล</label><select name="status"><option value="all">ทั้งหมด</option><option value="published" ${status==='published'?'selected':''}>กำลังแสดง</option><option value="hidden" ${status==='hidden'?'selected':''}>ปิดอยู่</option></select></div><div><label>แสดงต่อหน้า</label><select name="per_page">${[15,25,50,75,100].map(n=>`<option value="${n}" ${perPage===n?'selected':''}>${n} รายการ</option>`).join('')}</select></div><button class="btn admin-nowrap-btn" type="submit"><i class="fi fi-br-filter"></i><span>กรองรายการ</span></button></form><div class="admin-post-list-summary"><span>แสดง ${Math.min(filtered.length, perPage)} จาก ${filtered.length} รายการ</span></div><div class="admin-post-list">${filtered.slice(0,perPage).map(adminPostRow).join('') || empty('ยังไม่มีประกาศตามเงื่อนไขนี้')}</div></div>`;

  const dashboardPanel = adminDashboardPanel({ analytics, profiles, posts, projects, blogs });
  const listingPanel = adminListingSettingsPanel(listingSettings, amenities);
  const projectPanel = adminProjectsPanel(projects);
  const packagePanel = adminPackagesPanel(packages);
  const blogPanel = adminBlogsPanel(blogs);
  const contactPanel = adminContactPanel(contact);
  const promotePanel = adminPromotePanel(posts);
  const panels = { dashboard: dashboardPanel, navigation: menuPanel, posts: postPanel, listing: listingPanel, projects: projectPanel, packages: packagePanel, blogs: blogPanel, contact: contactPanel, promote: promotePanel };
  const [title, description] = sectionLabels[section];
  return html`<section class="admin-settings-hero"><div class="container admin-settings-hero-grid"><div><div class="eyebrow">Admin Control Center</div><h1>${title}</h1><p>${description}</p></div></div></section><section class="section admin-settings-section"><div class="container admin-settings-layout">${sidebar}${panels[section]}</div></section>`;
}

function adminDashboardPanel({ analytics, profiles, posts, projects, blogs }) {
  const pageViews = analytics.filter((event) => event.event_type === 'page_view');
  const searches = analytics.filter((event) => event.event_type === 'search');
  const uniqueVisitors = new Set(analytics.map((event) => event.session_id)).size;
  const signedInUsers = new Set(analytics.map((event) => event.user_id).filter(Boolean)).size;
  const monthAgo = Date.now() - 30 * 86400000;
  const newMembers = profiles.filter((profile) => new Date(profile.created_at).getTime() >= monthAgo).length;
  const topSearches = aggregateAnalytics(searches.filter((event) => event.search_query), (event) => event.search_query.trim().toLowerCase()).slice(0, 8);
  const topPages = aggregateAnalytics(
    pageViews.filter((event) => !event.path.startsWith('/admin/')),
    (event) => analyticsPageLabel(event.path),
  ).slice(0, 6);
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86400000);
    const key = date.toISOString().slice(0, 10);
    return { key, label: date.toLocaleDateString('th-TH', { weekday: 'short' }), count: pageViews.filter((event) => event.created_at.slice(0, 10) === key).length };
  });
  const maxDaily = Math.max(...daily.map((item) => item.count), 1);
  const kpis = [
    ['users', profiles.length, 'สมาชิกทั้งหมด'],
    ['user-add', newMembers, 'สมาชิกใหม่ 30 วัน'],
    ['eye', uniqueVisitors, 'ผู้เข้าชม 90 วัน'],
    ['user-time', signedInUsers, 'ผู้ใช้ที่เข้าสู่ระบบ'],
    ['chart-line-up', pageViews.length, 'การเปิดหน้าเว็บ'],
    ['search', searches.length, 'การค้นหาทั้งหมด'],
  ];
  return `<div class="settings-panel admin-dashboard"><div class="settings-panel-head"><div><div class="eyebrow">Live Overview</div><h2>ข้อมูลภาพรวมเพื่อพัฒนาระบบ</h2><p>สถิติผู้เข้าชมใช้รหัสเซสชันแบบไม่ระบุตัวตน และเริ่มสะสมหลังเปิดใช้ระบบติดตามนี้</p></div></div><div class="admin-kpi-grid">${kpis.map(([icon, value, label]) => `<div class="admin-kpi"><i class="fi fi-br-${icon}"></i><strong>${money.format(value)}</strong><span>${label}</span></div>`).join('')}</div><div class="admin-analytics-grid"><section class="admin-data-section"><div class="admin-section-title"><div><h3>ผู้เข้าชม 7 วันล่าสุด</h3><p>จำนวนการเปิดหน้าเว็บรายวัน</p></div></div><div class="admin-bar-chart">${daily.map((item) => `<div><span style="height:${Math.max((item.count / maxDaily) * 100, 4)}%" title="${item.count} ครั้ง"></span><small>${item.label}</small><strong>${item.count}</strong></div>`).join('')}</div></section><section class="admin-data-section"><div class="admin-section-title"><div><h3>คำค้นหายอดนิยม</h3><p>ช่วยดูว่าผู้ใช้กำลังสนใจอะไร</p></div></div>${analyticsRanking(topSearches, 'ยังไม่มีข้อมูลคำค้นหา')}</section><section class="admin-data-section"><div class="admin-section-title"><div><h3>หน้าหรือเมนูที่มีผู้เข้าชมสูง</h3><p>แสดงเป็นชื่อหน้าและไม่นับหน้าผู้ดูแลระบบ</p></div></div>${analyticsRanking(topPages, 'ยังไม่มีข้อมูลการเข้าชม')}</section><section class="admin-data-section"><div class="admin-section-title"><div><h3>สถานะเนื้อหา</h3><p>ข้อมูลที่พร้อมให้ผู้ใช้ค้นพบ</p></div></div><div class="admin-content-summary"><span><strong>${posts.filter((item) => item.is_published).length}</strong>ประกาศเผยแพร่</span><span><strong>${posts.filter((item) => item.is_promoted).length}</strong>ประกาศที่ดัน</span><span><strong>${projects.filter((item) => item.is_published).length}</strong>โครงการเผยแพร่</span><span><strong>${blogs.filter((item) => item.is_published).length}</strong>บทความเผยแพร่</span></div></section></div></div>`;
}

function aggregateAnalytics(items, getKey) {
  const result = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (key) result.set(key, (result.get(key) || 0) + 1);
  });
  return [...result.entries()].sort((a, b) => b[1] - a[1]);
}

function analyticsRanking(items, emptyMessage) {
  if (!items.length) return `<div class="admin-data-empty">${emptyMessage}</div>`;
  const max = Math.max(...items.map(([, count]) => count), 1);
  return `<div class="admin-ranking">${items.map(([label, count], index) => `<div><b>${index + 1}</b><span><strong>${escapeHtml(label)}</strong><i style="width:${(count / max) * 100}%"></i></span><em>${count}</em></div>`).join('')}</div>`;
}

function adminImageField(type) {
  return `<div class="admin-editor-span"><label for="admin-${type}-image">รูปภาพ</label><input type="hidden" name="existing_image_url"><label class="admin-image-upload" for="admin-${type}-image"><input id="admin-${type}-image" name="image_file" type="file" accept="image/jpeg,image/png,image/webp" data-admin-image-input><i class="fi fi-br-cloud-upload"></i><span><strong>เลือกรูปภาพจากเครื่อง</strong><small>รองรับ JPG, PNG และ WEBP · ไม่เกิน 2 MB</small></span></label><div class="admin-image-preview" data-admin-image-preview hidden></div></div>`;
}

function adminListingSettingsPanel(settings, amenities) {
  const maximum = Number(settings?.description_max_length) || 10000;
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Listing Details</div><h2>ตั้งค่ารายละเอียดลงประกาศ</h2><p>ค่าที่บันทึกจะใช้กับแบบฟอร์มลงประกาศใหม่และตรวจสอบซ้ำในฐานข้อมูล</p></div></div><div class="admin-listing-settings-stack"><form class="admin-editor admin-setting-form" data-form="admin-listing-settings"><div><label for="description-max-length">จำนวนตัวอักษรรายละเอียดสูงสุด</label><div class="admin-number-setting"><input id="description-max-length" name="description_max_length" type="number" min="100" max="50000" step="100" value="${maximum}" required><span>ตัวอักษร</span></div><p class="muted">กำหนดได้ตั้งแต่ 100 ถึง 50,000 ตัวอักษร ค่าแนะนำคือ 10,000</p></div><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกการตั้งค่า</button></form><section class="admin-amenity-section"><div class="admin-section-title"><div><h3>สิ่งอำนวยความสะดวก</h3><p>เพิ่ม แก้ไข เปิดหรือปิดรายการที่แสดงในหน้าลงประกาศ</p></div><button class="btn outline compact" type="button" data-action="open-admin-form" data-target="admin-amenity"><i class="fi fi-br-plus"></i> เพิ่มรายการ</button></div><div class="admin-manager admin-manager-collapsible" data-admin-manager="amenity"><form class="admin-editor admin-amenity-editor" data-form="admin-amenity" hidden><input type="hidden" name="id"><div class="admin-editor-heading"><div><h3 data-admin-form-title>เพิ่มสิ่งอำนวยความสะดวก</h3><p>ระบุชื่อและลำดับ จากนั้นกดบันทึกหรือยกเลิก</p></div><button class="icon-btn" type="button" data-action="cancel-admin-form" data-target="admin-amenity" aria-label="ยกเลิกและปิดฟอร์ม"><i class="fi fi-br-cross"></i></button></div><div class="admin-editor-grid"><div><label>ชื่อรายการ</label><input name="name" maxlength="100" required></div><div><label>ลำดับการแสดง</label><input name="sort_order" type="number" min="0" value="${amenities.length + 1}" required></div></div><label class="admin-check"><input name="is_active" type="checkbox" checked> เปิดให้เลือกในหน้าลงประกาศ</label><div class="admin-form-actions"><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกรายการ</button><button class="btn outline" type="button" data-action="cancel-admin-form" data-target="admin-amenity">ยกเลิก</button></div></form><div class="admin-records" data-admin-list="amenity"><div class="admin-section-title"><div><h3>รายการที่มีอยู่</h3><p>${amenities.length} รายการในระบบ</p></div><button class="btn outline compact admin-list-toggle" type="button" data-action="toggle-admin-list" data-target="amenity" aria-expanded="true"><i class="fi fi-br-eye-crossed"></i><span>ซ่อนรายการ</span></button></div><div class="admin-record-list-content" data-admin-list-content>${amenities.map((item) => `<article class="admin-record-row"><div><strong>${escapeHtml(item.name)}</strong><span>ลำดับ ${item.sort_order} · ${item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span></div><div><button class="btn outline compact" type="button" data-action="edit-amenity" data-id="${item.id}"><i class="fi fi-br-edit"></i> แก้ไข</button><button class="btn danger compact" type="button" data-action="delete-amenity" data-id="${item.id}"><i class="fi fi-br-trash"></i> ลบ</button></div></article>`).join('') || '<div class="admin-data-empty">ยังไม่มีรายการสิ่งอำนวยความสะดวก</div>'}</div></div></div></section></div></div>`;
}

function adminProjectsPanel(projects) {
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Projects CRUD</div><h2>ข้อมูลโครงการคอนโดใหม่</h2><p>เลือกเพิ่มหรือแก้ไขเมื่อต้องการเปลี่ยนข้อมูล ข้อมูลที่เผยแพร่จะแสดงบนหน้าโครงการใหม่และหน้าแรก</p></div><button class="btn outline compact" type="button" data-action="open-admin-form" data-target="admin-project"><i class="fi fi-br-plus"></i> เพิ่มโครงการใหม่</button></div><div class="admin-manager admin-manager-collapsible" data-admin-manager="project"><form class="admin-editor" data-form="admin-project" hidden><input type="hidden" name="id"><div class="admin-editor-heading"><div><h3 data-admin-form-title>เพิ่มโครงการใหม่</h3><p>กรอกข้อมูลแล้วกดบันทึก หรือยกเลิกเพื่อกลับไปดูรายการ</p></div><button class="icon-btn" type="button" data-action="cancel-admin-form" data-target="admin-project" aria-label="ยกเลิกและปิดฟอร์ม" title="ปิดฟอร์ม"><i class="fi fi-br-cross"></i></button></div><div class="admin-editor-grid"><div><label>ชื่อโครงการ</label><input name="name" required maxlength="160"></div><div><label>Developer</label><input name="developer" required maxlength="160"></div><div><label>ทำเล</label><input name="location" required maxlength="200"></div><div><label>ราคาเริ่มต้น</label><input name="starting_price" type="number" min="0" required></div><div><label>สถานะโครงการ</label><select name="status"><option>พร้อมอยู่</option><option>กำลังก่อสร้าง</option><option>เปิดขายใหม่</option><option>ขายหมดแล้ว</option></select></div>${adminImageField('project')}</div><label>รายละเอียด</label><textarea name="description" rows="4"></textarea><label class="admin-check"><input name="is_published" type="checkbox" checked> แสดงโครงการบนเว็บไซต์</label><div class="admin-form-actions"><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกโครงการ</button><button class="btn outline" type="button" data-action="cancel-admin-form" data-target="admin-project"><i class="fi fi-br-cross-small"></i> ยกเลิก</button></div></form>${adminRecordList(projects, 'project')}</div></div>`;
}

function adminPackagesPanel(packages) {
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Package Editor</div><h2>แพ็กเกจลงประกาศ</h2><p>แก้ไขราคา จำนวนประกาศ ระยะเวลา จำนวนรูป และรายการสิทธิ์</p></div></div><div class="admin-manager"><form class="admin-editor" data-form="admin-package"><input type="hidden" name="id"><div class="admin-editor-grid"><div><label>ชื่อแพ็กเกจ</label><input name="name" required></div><div><label>ราคา (บาท)</label><input name="price" type="number" min="0" required></div><div><label>จำนวนประกาศ</label><input name="listings_limit" type="number" min="1" required></div><div><label>ระยะเวลา (วัน)</label><input name="duration_days" type="number" min="1" required></div><div><label>จำนวนรูปต่อประกาศ</label><input name="image_limit" type="number" min="1" required></div><div class="admin-check-group"><label class="admin-check"><input name="is_premium" type="checkbox"> แพ็กเกจแนะนำ</label><label class="admin-check"><input name="is_active" type="checkbox"> เปิดให้เลือกใช้งาน</label></div></div><label>สิทธิ์ในแพ็กเกจ <span class="muted">หนึ่งรายการต่อหนึ่งบรรทัด</span></label><textarea name="features" rows="5"></textarea><div class="admin-form-actions"><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกแพ็กเกจ</button></div></form>${adminRecordList(packages, 'package')}</div></div>`;
}

function adminBlogsPanel(blogs) {
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Article CRUD</div><h2>บทความและข่าวสาร</h2><p>เลือกเพิ่มหรือแก้ไขเมื่อต้องการเปลี่ยนข้อมูลบทความที่แสดงบนเว็บไซต์</p></div><button class="btn outline compact" type="button" data-action="open-admin-form" data-target="admin-blog"><i class="fi fi-br-plus"></i> เพิ่มบทความใหม่</button></div><div class="admin-manager admin-manager-collapsible" data-admin-manager="blog"><form class="admin-editor" data-form="admin-blog" hidden><input type="hidden" name="id"><div class="admin-editor-heading"><div><h3 data-admin-form-title>เพิ่มบทความใหม่</h3><p>กรอกข้อมูลแล้วกดบันทึก หรือยกเลิกเพื่อกลับไปดูรายการ</p></div><button class="icon-btn" type="button" data-action="cancel-admin-form" data-target="admin-blog" aria-label="ยกเลิกและปิดฟอร์ม" title="ปิดฟอร์ม"><i class="fi fi-br-cross"></i></button></div><div class="admin-editor-grid"><div><label>ชื่อบทความ</label><input name="title" required maxlength="200"></div><div><label>Slug</label><input name="slug" placeholder="เว้นว่างให้ระบบสร้างอัตโนมัติ"></div><div><label>หมวดหมู่</label><input name="category" required></div><div><label>วันที่เผยแพร่</label><input name="published_date" type="date" required></div>${adminImageField('blog')}</div><label>คำโปรย</label><textarea name="excerpt" rows="3" required></textarea><label>เนื้อหาบทความ</label><textarea name="content" rows="8" required></textarea><label class="admin-check"><input name="is_published" type="checkbox" checked> เผยแพร่บทความ</label><div class="admin-form-actions"><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกบทความ</button><button class="btn outline" type="button" data-action="cancel-admin-form" data-target="admin-blog"><i class="fi fi-br-cross-small"></i> ยกเลิก</button></div></form>${adminRecordList(blogs, 'blog')}</div></div>`;
}

function adminContactPanel(contact) {
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Contact Channels</div><h2>ข้อมูลติดต่อหน้าสาธารณะ</h2><p>ช่องทางที่มี URL จะแสดงบนหน้าติดต่อเราโดยอัตโนมัติ</p></div><a class="btn outline compact" href="/contact" data-link><i class="fi fi-br-eye"></i> ดูหน้าติดต่อ</a></div><div class="admin-manager single"><form class="admin-editor" data-form="admin-contact"><div class="admin-editor-grid"><div><label>เบอร์โทร</label><input name="phone" value="${escapeHtml(contact.phone || '')}"></div><div><label>อีเมล</label><input name="email" type="email" value="${escapeHtml(contact.email || '')}"></div><div class="admin-editor-span"><label>ที่อยู่</label><input name="address" value="${escapeHtml(contact.address || '')}"></div><div><label>Facebook URL</label><input name="facebook_url" type="url" value="${escapeHtml(contact.facebook_url || '')}"></div><div><label>LINE ID หรือ URL</label><input name="line_url" value="${escapeHtml(contact.line_url || '')}"></div><div><label>Instagram URL</label><input name="instagram_url" type="url" value="${escapeHtml(contact.instagram_url || '')}"></div><div><label>TikTok URL</label><input name="tiktok_url" type="url" value="${escapeHtml(contact.tiktok_url || '')}"></div></div><div class="admin-form-actions"><button class="btn" type="submit"><i class="fi fi-br-disk"></i> บันทึกช่องทางติดต่อ</button></div></form></div></div>`;
}

function adminPromotePanel(posts) {
  return `<div class="settings-panel"><div class="settings-panel-head"><div><div class="eyebrow">Listing Boost</div><h2>ดันประกาศให้มองเห็นง่ายขึ้น</h2><p>ประกาศที่ตั้งเป็นแนะนำหรือมาแรงจะถูกจัดลำดับขึ้นก่อนบนหน้าหลัก</p></div></div><div class="admin-promote-list">${posts.map((post) => `<article class="admin-promote-row"><img src="${imageOf(post)}" alt=""><div><span class="badge ${post.type === 'rent' ? 'is-rent' : 'is-sell'}">${post.type === 'rent' ? 'เช่า' : 'ขาย'}</span><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.project_name || post.location || 'ไม่ระบุโครงการ')}</p></div><form class="admin-promote-control" data-form="admin-promote"><input type="hidden" name="id" value="${post.id}"><label>ระดับการดัน</label><select name="badge"><option value="" ${!post.is_promoted ? 'selected' : ''}>ปกติ</option><option value="แนะนำ" ${post.badge === 'แนะนำ' ? 'selected' : ''}>แนะนำ</option><option value="มาแรง" ${post.badge === 'มาแรง' || post.badge === 'HOT' ? 'selected' : ''}>มาแรง</option></select><button class="btn compact" type="submit">บันทึก</button></form></article>`).join('') || empty('ยังไม่มีประกาศ')}</div></div>`;
}

function adminRecordList(records, type) {
  const config = {
    project: { title: 'name', note: (item) => `${item.developer || '-'} · ${item.location || '-'}`, label: 'โครงการ' },
    package: { title: 'name', note: (item) => `${money.format(item.price)} บาท · ${item.listings_limit} ประกาศ · ${item.image_limit} รูป`, label: 'แพ็กเกจ' },
    blog: { title: 'title', note: (item) => `${item.category || '-'} · ${item.published_date || '-'}`, label: 'บทความ' },
  }[type];
  return `<div class="admin-records" data-admin-list="${type}"><div class="admin-section-title"><div><h3>รายการ${config.label}</h3><p>${records.length} รายการในระบบ</p></div><button class="btn outline compact admin-list-toggle" type="button" data-action="toggle-admin-list" data-target="${type}" aria-expanded="true"><i class="fi fi-br-eye-crossed"></i><span>ซ่อนรายการ</span></button></div><div class="admin-record-list-content" data-admin-list-content>${records.map((item) => `<article class="admin-record-row"><div><strong>${escapeHtml(item[config.title])}</strong><span>${escapeHtml(config.note(item))}</span></div><div><button class="btn outline compact" type="button" data-action="edit-${type}" data-id="${item.id}"><i class="fi fi-br-edit"></i> แก้ไข</button>${type !== 'package' ? `<button class="btn danger compact" type="button" data-action="delete-${type}" data-id="${item.id}"><i class="fi fi-br-trash"></i> ลบ</button>` : ''}</div></article>`).join('') || `<div class="admin-data-empty">ยังไม่มีข้อมูล${config.label}</div>`}</div></div>`;
}

function adminPostRow(property) {
  return `<article class="admin-post-row"><a class="admin-post-cover" href="/properties/${property.id}" data-link><img src="${imageOf(property)}" alt="${escapeHtml(property.title)}"></a><div class="admin-post-main"><div class="admin-post-title-line"><span class="badge ${property.type === 'rent' ? 'is-rent' : 'is-sell'}">${property.type === 'rent' ? 'เช่า' : 'ขาย'}</span><span class="admin-post-status ${property.is_published ? 'is-live' : 'is-hidden'}"><i class="fi ${property.is_published ? 'fi-br-check-circle' : 'fi-br-eye-crossed'}"></i>${property.is_published ? 'กำลังแสดง' : 'ปิดอยู่'}</span></div><h3>${escapeHtml(property.title)}</h3><p>${escapeHtml(property.project_name)} · ${escapeHtml(property.location)} · ผู้ลงประกาศ ${escapeHtml(property.profiles?.name || property.contact_name || '-')}</p><div class="admin-post-meta"><span><i class="fi fi-br-tags"></i>${money.format(property.price)} บาท</span><span><i class="fi fi-br-bed"></i>${property.bedrooms} ห้องนอน</span><span><i class="fi fi-br-bath"></i>${property.bathrooms} ห้องน้ำ</span><span><i class="fi fi-br-expand"></i>${Number(property.area)} ตร.ม.</span></div></div><div class="admin-post-actions"><a class="btn outline compact admin-nowrap-btn" href="/properties/${property.id}" data-link><i class="fi fi-br-eye"></i><span>ดูประกาศ</span></a><button class="btn compact admin-nowrap-btn ${property.is_published ? 'danger' : ''}" data-action="toggle-post" data-id="${property.id}" data-current="${property.is_published}"><i class="fi ${property.is_published ? 'fi-br-eye-crossed' : 'fi-br-check-circle'}"></i><span>${property.is_published ? 'ปิดการแสดง' : 'เปิดแสดง'}</span></button></div></article>`;
}

function listingRow(property, own) {
  return html`<article class="listing-row"><img src="${imageOf(property)}" alt=""><div><div class="card-meta"><span>${property.type === 'rent' ? 'เช่า' : 'ขาย'}</span><span>${property.is_published ? 'กำลังแสดง' : 'ปิดอยู่'}</span></div><h3>${escapeHtml(property.title)}</h3><p>${escapeHtml(property.project_name)} · ${escapeHtml(property.location)} · ผู้ลงประกาศ ${escapeHtml(property.profiles?.name || property.contact_name || '-')}</p><small>${money.format(property.price)} บาท · ${property.bedrooms} ห้องนอน · ${property.bathrooms} ห้องน้ำ · ${Number(property.area)} ตร.ม.</small></div><div class="row-actions"><a class="outline" href="/properties/${property.id}" data-link><i class="fi fi-br-eye"></i>ดูประกาศ</a>${own || isAdmin() ? `<button class="${property.is_published ? 'danger' : 'btn'}" data-action="toggle-post" data-id="${property.id}" data-current="${property.is_published}">${property.is_published ? 'ปิดการแสดง' : 'เปิดแสดง'}</button>` : ''}</div></article>`;
}

function empty(message) {
  return `<div class="empty"><h2>${message}</h2><p>โปรดตรวจสอบข้อมูลอีกครั้ง</p></div>`;
}

async function render() {
  let content;
  const current = path();
  const disabledMenu = await disabledMenuForRoute(current);
  if (disabledMenu) content = comingSoon(disabledMenu.label);
  else if (current === '/') content = await pageHome();
  else if (current === '/buy') content = await pageListings('sell');
  else if (current === '/rent') content = await pageListings('rent');
  else if (current.startsWith('/properties/')) content = await pageProperty(current.split('/').pop());
  else if (current === '/packages') content = await pagePackages();
  else if (current === '/projects') content = await pageProjects();
  else if (current === '/blog') content = await pageBlog();
  else if (current === '/contact') content = await pageContact();
  else if (current === '/login') content = pageAuth('login');
  else if (current === '/register') content = pageAuth('register');
  else if (current === '/my-listings') content = await pageMyListings();
  else if (current === '/account') content = pageAccount();
  else if (current === '/post') content = pagePost();
  else if (current === '/admin/settings') content = await pageAdmin();
  else content = empty('ไม่พบหน้านี้');
  app.innerHTML = layout(content);
  if (current === '/post') {
    const postForm = app.querySelector('[data-new-property-form]');
    postForm?.reset();
    if (postForm) {
      postImageQueues.set(postForm, []);
      renderImageQueue(postForm);
      renderNearbyList(postForm);
    }
    updatePostProgress(postForm);
  }
  enhanceSelects();
  const trackingKey = `${current}${window.location.search}`;
  if (!current.startsWith('/admin/') && trackingKey !== lastTrackedPage) {
    lastTrackedPage = trackingKey;
    void trackAnalytics('page_view');
  }
}

function enhanceSelects() {
  document.querySelectorAll('.search-panel select, .post-layout select, .admin-post-filter select, .admin-editor select').forEach((select, index) => {
    if (select.dataset.themeSelect === 'ready') return;
    const wrapper = document.createElement('div');
    wrapper.className = 'theme-select';
    select.dataset.themeSelect = 'ready';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    const button = document.createElement('button');
    button.className = 'theme-select-button';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    const value = document.createElement('span');
    value.className = 'theme-select-value';
    const icon = document.createElement('span');
    icon.className = 'theme-select-icon';
    icon.innerHTML = '<i class="fi fi-br-angle-small-down"></i>';
    const list = document.createElement('ul');
    list.className = 'theme-select-list';
    list.id = `theme-select-${index}`;
    list.setAttribute('role', 'listbox');
    button.setAttribute('aria-controls', list.id);
    button.append(value, icon);
    wrapper.append(button, list);
    const update = () => {
      value.textContent = select.options[select.selectedIndex]?.text || '';
      list.querySelectorAll('.theme-select-option').forEach((item) => item.classList.toggle('is-selected', item.dataset.value === select.value));
    };
    [...select.options].forEach((nativeOption) => {
      const option = document.createElement('li');
      option.className = 'theme-select-option';
      option.dataset.value = nativeOption.value;
      option.textContent = nativeOption.text;
      option.tabIndex = 0;
      option.setAttribute('role', 'option');
      option.addEventListener('click', () => {
        select.value = nativeOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        update();
        wrapper.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
      });
      option.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); option.click(); }
      });
      list.append(option);
    });
    button.addEventListener('click', () => {
      document.querySelectorAll('.theme-select.is-open').forEach((item) => item !== wrapper && item.classList.remove('is-open'));
      const open = wrapper.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
    update();
  });
}

function comingSoon(label) {
  return `<section class="coming-soon-section"><div class="container"><div class="coming-soon-card"><div class="coming-soon-icon" aria-hidden="true"><i class="fi fi-br-time-forward"></i></div><span class="eyebrow">${escapeHtml(label)}</span><h1>แล้วพบกันเร็ว ๆ นี้</h1><p>เมนูนี้ถูกปิดไว้ชั่วคราวโดยผู้ดูแลระบบ</p><div class="coming-soon-actions"><a class="btn" href="/" data-link><i class="fi fi-br-home"></i> กลับหน้าแรก</a></div></div></div></section>`;
}

async function handleForm(form) {
  const fd = new FormData(form);
  if (form.dataset.form === 'search') {
    const params = new URLSearchParams();
    ['q', 'price', 'bedrooms', 'sort'].forEach((key) => fd.get(key) && params.set(key, fd.get(key)));
    void trackAnalytics('search', fd.get('q'));
    navTo(`/${form.dataset.type === 'rent' ? 'rent' : 'buy'}?${params}`);
    return;
  }
  if (form.dataset.form === 'admin-filter') {
    const params = new URLSearchParams();
    ['q', 'type', 'status', 'per_page'].forEach((key) => fd.get(key) && params.set(key, fd.get(key)));
    navTo(`/admin/settings?${params}#posts`);
    return;
  }
  if (form.dataset.form === 'admin-listing-settings') {
    const descriptionMaxLength = Number(fd.get('description_max_length'));
    if (!Number.isInteger(descriptionMaxLength) || descriptionMaxLength < 100 || descriptionMaxLength > 50000) {
      return toast('กรุณากำหนดจำนวนตัวอักษรระหว่าง 100 ถึง 50,000');
    }
    const { data, error } = await supabase.from('listing_settings').update({ description_max_length: descriptionMaxLength, updated_at: new Date().toISOString() }).eq('id', 1).select().single();
    if (!error) state.listingSettings = data;
    toast(error ? error.message : 'บันทึกการตั้งค่ารายละเอียดแล้ว');
    if (!error) await render();
    return;
  }
  if (form.dataset.form === 'admin-amenity') {
    const id = String(fd.get('id') || '').trim();
    const payload = {
      name: String(fd.get('name') || '').trim(),
      sort_order: Number(fd.get('sort_order') || 0),
      is_active: fd.get('is_active') === 'on',
      updated_at: new Date().toISOString(),
    };
    if (!payload.name) return toast('กรุณาระบุชื่อสิ่งอำนวยความสะดวก');
    const result = id
      ? await supabase.from('amenity_catalog').update(payload).eq('id', id)
      : await supabase.from('amenity_catalog').insert(payload);
    toast(result.error ? result.error.message : 'บันทึกสิ่งอำนวยความสะดวกแล้ว');
    if (!result.error) {
      const { data = [] } = await supabase.from('amenity_catalog').select('*').eq('is_active', true).order('sort_order').order('name');
      state.amenities = data;
      await render();
    }
    return;
  }
  if (form.dataset.form === 'admin-project') {
    const id = fd.get('id');
    const imageFile = form.elements.namedItem('image_file')?.files[0];
    const previousImage = String(fd.get('existing_image_url') || '').trim();
    let uploadedImage = null;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fi fi-br-spinner"></i> ${imageFile ? 'กำลังอัปโหลดรูป' : 'กำลังบันทึก'}`;
    try {
      if (imageFile) uploadedImage = await uploadAdminContentImage(imageFile, 'projects');
      const payload = {
        name: String(fd.get('name')).trim(), developer: String(fd.get('developer')).trim(), location: String(fd.get('location')).trim(),
        starting_price: Number(fd.get('starting_price')), status: fd.get('status'), image_url: uploadedImage?.url || previousImage || null,
        description: String(fd.get('description') || '').trim() || null, is_published: fd.get('is_published') === 'on', updated_at: new Date().toISOString(),
      };
      const result = id ? await supabase.from('projects').update(payload).eq('id', id) : await supabase.from('projects').insert(payload);
      if (result.error) throw result.error;
      if (uploadedImage && previousImage && previousImage !== uploadedImage.url) await removeAdminContentImage(previousImage);
      toast('บันทึกโครงการเรียบร้อย');
      await render();
    } catch (error) {
      if (uploadedImage?.url) await removeAdminContentImage(uploadedImage.url);
      toast(`บันทึกโครงการไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่'}`);
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fi fi-br-disk"></i> บันทึกโครงการ';
    }
    return;
  }
  if (form.dataset.form === 'admin-package') {
    const id = fd.get('id');
    if (!id) return toast('กรุณาเลือกแพ็กเกจที่ต้องการแก้ไข');
    const payload = {
      name: String(fd.get('name')).trim(), price: Number(fd.get('price')), listings_limit: Number(fd.get('listings_limit')),
      duration_days: Number(fd.get('duration_days')), image_limit: Number(fd.get('image_limit')),
      is_premium: fd.get('is_premium') === 'on', is_active: fd.get('is_active') === 'on', updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('packages').update(payload).eq('id', id);
    if (!error) {
      const features = String(fd.get('features') || '').split('\n').map((item) => item.trim()).filter(Boolean);
      await supabase.from('package_features').delete().eq('package_id', id);
      if (features.length) await supabase.from('package_features').insert(features.map((feature, index) => ({ package_id: id, feature, sort_order: index + 1 })));
      const { data } = await supabase.from('packages').select('*, package_features(*)').order('price');
      state.packages = data || state.packages;
    }
    toast(error ? error.message : 'บันทึกแพ็กเกจเรียบร้อย');
    if (!error) await render();
    return;
  }
  if (form.dataset.form === 'admin-blog') {
    const id = fd.get('id');
    const title = String(fd.get('title')).trim();
    const imageFile = form.elements.namedItem('image_file')?.files[0];
    const previousImage = String(fd.get('existing_image_url') || '').trim();
    let uploadedImage = null;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="fi fi-br-spinner"></i> ${imageFile ? 'กำลังอัปโหลดรูป' : 'กำลังบันทึก'}`;
    try {
      if (imageFile) uploadedImage = await uploadAdminContentImage(imageFile, 'blogs');
      const payload = {
        title, slug: slugify(fd.get('slug') || title), excerpt: String(fd.get('excerpt')).trim(), category: String(fd.get('category')).trim(),
        published_date: fd.get('published_date'), image_url: uploadedImage?.url || previousImage || null,
        content: String(fd.get('content')).trim(), is_published: fd.get('is_published') === 'on', updated_at: new Date().toISOString(),
      };
      const result = id ? await supabase.from('blogs').update(payload).eq('id', id) : await supabase.from('blogs').insert(payload);
      if (result.error) throw result.error;
      if (uploadedImage && previousImage && previousImage !== uploadedImage.url) await removeAdminContentImage(previousImage);
      toast('บันทึกบทความเรียบร้อย');
      await render();
    } catch (error) {
      if (uploadedImage?.url) await removeAdminContentImage(uploadedImage.url);
      toast(`บันทึกบทความไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่'}`);
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fi fi-br-disk"></i> บันทึกบทความ';
    }
    return;
  }
  if (form.dataset.form === 'admin-contact') {
    const payload = Object.fromEntries(['phone', 'email', 'address', 'facebook_url', 'line_url', 'instagram_url', 'tiktok_url'].map((key) => [key, String(fd.get(key) || '').trim() || null]));
    const { error } = await supabase.from('contact_settings').upsert({ id: 1, ...payload, updated_at: new Date().toISOString() });
    toast(error ? error.message : 'บันทึกช่องทางติดต่อเรียบร้อย');
    if (!error) await render();
    return;
  }
  if (form.dataset.form === 'admin-promote') {
    const badge = String(fd.get('badge') || '');
    const { error } = await supabase.from('properties').update({ badge: badge || null, is_promoted: Boolean(badge) }).eq('id', fd.get('id'));
    toast(error ? error.message : 'อัปเดตการดันประกาศแล้ว');
    if (!error) await render();
    return;
  }
  if (form.dataset.form === 'contact') {
    const { error } = await supabase.from('inquiries').insert(Object.fromEntries(fd));
    toast(error ? error.message : 'ส่งข้อความเรียบร้อย');
    if (!error) form.reset();
  }
  if (form.dataset.form === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
    toast(error ? error.message : 'เข้าสู่ระบบสำเร็จ');
    if (!error) navTo('/');
  }
  if (form.dataset.form === 'register') {
    if (fd.get('password') !== fd.get('password_confirm')) {
      return toast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }
    const { data, error } = await supabase.auth.signUp({
      email: fd.get('email'),
      password: fd.get('password'),
      options: {
        data: { name: fd.get('name'), phone: fd.get('phone') },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    toast(error ? error.message : 'สมัครสมาชิกสำเร็จ โปรดตรวจสอบอีเมลถ้าระบบเปิดยืนยันอีเมล');
    if (!error) navTo(data.session ? '/' : '/login');
  }
  if (form.dataset.form === 'post') await submitProperty(form, fd);
}

function updatePostProgress(form) {
  if (!form) return;
  const requiredNames = ['price', 'title', 'bedrooms', 'bathrooms', 'area', 'description', 'contact_name', 'contact_phone'];
  const completeFields = requiredNames.filter((name) => {
    const field = form.elements[name];
    return String(field?.value || '').trim() && field.checkValidity();
  }).length;
  const percentage = Math.round((completeFields / requiredNames.length) * 100);
  const track = form.querySelector('[data-post-progress]');
  const value = form.querySelector('[data-post-progress-value]');
  const message = form.querySelector('[data-post-progress-message]');
  if (track) track.style.width = `${percentage}%`;
  if (value) value.textContent = `${percentage}%`;
  if (message) message.textContent = percentage === 100 ? 'ข้อมูลจำเป็นครบแล้ว พร้อมตรวจสอบและบันทึกประกาศ' : `เหลือข้อมูลจำเป็นอีก ${requiredNames.length - completeFields} รายการ`;
}

function formatFileSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function imageQueue(form) {
  if (!postImageQueues.has(form)) postImageQueues.set(form, []);
  return postImageQueues.get(form);
}

function renderImageQueue(form) {
  const queue = imageQueue(form);
  const container = form.querySelector('[data-preview]');
  const count = form.querySelector('[data-image-count]');
  const limit = Number(form.dataset.imageLimit || 5);
  if (count) count.textContent = `${queue.length} / ${limit} รูป`;
  if (!container) return;
  if (!queue.length) {
    container.innerHTML = '<div class="upload-queue-empty"><i class="fi fi-br-images"></i><span>ยังไม่ได้เลือกรูปภาพ</span></div>';
    return;
  }
  const statusLabels = {
    queued: ['รออัปโหลด', 'fi-br-clock'],
    uploading: ['กำลังอัปโหลด', 'fi-br-spinner'],
    success: ['อัปโหลดสำเร็จ', 'fi-br-check-circle'],
    error: ['อัปโหลดไม่สำเร็จ', 'fi-br-exclamation'],
  };
  container.innerHTML = queue.map((entry, index) => {
    const [label, icon] = statusLabels[entry.status] || statusLabels.queued;
    const locked = entry.status === 'uploading';
    return `<article class="upload-queue-item is-${entry.status}" data-image-id="${entry.id}"><div class="upload-queue-order"><strong>${index + 1}</strong><span>${index === 0 ? 'ภาพหลัก' : 'ลำดับ'}</span></div><img src="${entry.url}" alt="ตัวอย่าง ${escapeHtml(entry.file.name)}"><div class="upload-queue-info"><strong title="${escapeHtml(entry.file.name)}">${escapeHtml(entry.file.name)}</strong><span>${formatFileSize(entry.file.size)} · ${entry.file.type.replace('image/', '').toUpperCase()}</span><small class="upload-status"><i class="fi ${icon}"></i>${label}${entry.error ? `: ${escapeHtml(entry.error)}` : ''}</small></div><div class="upload-queue-actions"><button type="button" data-action="move-image-up" data-image-id="${entry.id}" aria-label="เลื่อนรูปขึ้น" title="เลื่อนขึ้น" ${index === 0 || locked ? 'disabled' : ''}><i class="fi fi-br-angle-small-up"></i></button><button type="button" data-action="move-image-down" data-image-id="${entry.id}" aria-label="เลื่อนรูปลง" title="เลื่อนลง" ${index === queue.length - 1 || locked ? 'disabled' : ''}><i class="fi fi-br-angle-small-down"></i></button><button type="button" class="is-delete" data-action="remove-image" data-image-id="${entry.id}" aria-label="ลบรูป ${escapeHtml(entry.file.name)}" title="ลบรูป" ${locked ? 'disabled' : ''}><i class="fi fi-br-trash"></i></button></div></article>`;
  }).join('');
}

function addImagesToQueue(form, selectedFiles) {
  const queue = imageQueue(form);
  const limit = Number(form.dataset.imageLimit || 5);
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  let rejectedByLimit = 0;
  let duplicates = 0;
  selectedFiles.forEach((file) => {
    if (queue.some((entry) => entry.file.name === file.name && entry.file.size === file.size && entry.file.lastModified === file.lastModified)) {
      duplicates += 1;
      return;
    }
    if (queue.length >= limit) {
      rejectedByLimit += 1;
      return;
    }
    let error = '';
    if (!allowedTypes.has(file.type)) error = 'รองรับเฉพาะ JPG, PNG และ WEBP';
    else if (file.size > POST_IMAGE_MAX_BYTES) error = 'ไฟล์มีขนาดเกิน 500 KB';
    queue.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), status: error ? 'error' : 'queued', error });
  });
  renderImageQueue(form);
  if (rejectedByLimit) toast(`แพ็กเกจนี้เพิ่มได้สูงสุด ${limit} รูป จึงไม่ได้เพิ่มอีก ${rejectedByLimit} รูป`);
  else if (duplicates) toast(`ข้ามรูปที่เลือกซ้ำ ${duplicates} รูป`);
}

function moveImageInQueue(form, id, direction) {
  const queue = imageQueue(form);
  const index = queue.findIndex((entry) => entry.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= queue.length) return;
  [queue[index], queue[target]] = [queue[target], queue[index]];
  renderImageQueue(form);
}

function removeImageFromQueue(form, id) {
  const queue = imageQueue(form);
  const index = queue.findIndex((entry) => entry.id === id);
  if (index < 0 || queue[index].status === 'uploading') return;
  URL.revokeObjectURL(queue[index].url);
  queue.splice(index, 1);
  renderImageQueue(form);
}

function renderNearbyList(form) {
  const list = form.querySelector('[data-nearby-list]');
  if (!list) return;
  const rows = [...list.querySelectorAll('[data-nearby]')];
  list.querySelector('[data-nearby-empty]')?.toggleAttribute('hidden', rows.length > 0);
  rows.forEach((row, index) => {
    const order = row.querySelector('[data-nearby-order]');
    if (order) order.textContent = index + 1;
  });
}

function validatePropertyForm(form, fd, queue, limit) {
  const files = queue.filter((entry) => entry.status !== 'error').map((entry) => entry.file);
  const errors = [];
  const invalidNames = new Set();
  const value = (name) => String(fd.get(name) || '').trim();
  const requireText = (name, label, min = 1) => {
    if (value(name).length < min) {
      errors.push(`${label}${min > 1 ? `ต้องมีอย่างน้อย ${min} ตัวอักษร` : 'เป็นข้อมูลจำเป็น'}`);
      invalidNames.add(name);
    }
  };
  const requireNumber = (name, label, min) => {
    const raw = value(name);
    if (raw === '' || !Number.isFinite(Number(raw)) || Number(raw) < min) {
      errors.push(`${label}ต้องไม่น้อยกว่า ${min}`);
      invalidNames.add(name);
    }
  };

  requireNumber('price', 'ราคา', 1);
  requireText('title', 'หัวข้อประกาศ', 10);
  requireNumber('bedrooms', 'จำนวนห้องนอน', 0);
  requireNumber('bathrooms', 'จำนวนห้องน้ำ', 1);
  requireNumber('area', 'พื้นที่', 1);
  requireText('description', 'รายละเอียดประกาศ', 20);
  requireText('contact_name', 'ชื่อผู้ติดต่อ', 2);

  const descriptionLimit = Number(form.elements.description?.maxLength) || 10000;
  if (value('description').length > descriptionLimit) {
    errors.push(`รายละเอียดประกาศต้องไม่เกิน ${descriptionLimit.toLocaleString('th-TH')} ตัวอักษร`);
    invalidNames.add('description');
  }

  const latitude = value('latitude');
  const longitude = value('longitude');
  if ((latitude && !longitude) || (!latitude && longitude)) {
    errors.push('กรุณากรอกละติจูดและลองจิจูดให้ครบทั้งสองช่อง หรือเว้นว่างทั้งคู่');
    invalidNames.add(latitude ? 'longitude' : 'latitude');
  } else if (latitude && (Number(latitude) < -90 || Number(latitude) > 90 || Number(longitude) < -180 || Number(longitude) > 180)) {
    errors.push('พิกัดแผนที่อยู่นอกช่วงที่กำหนด');
    invalidNames.add('latitude');
    invalidNames.add('longitude');
  }

  if (!/^[0-9+()\-\s]{8,20}$/.test(value('contact_phone'))) {
    errors.push('กรุณากรอกเบอร์โทรที่ติดต่อได้ 8–20 ตัวอักษร');
    invalidNames.add('contact_phone');
  }
  const line = value('contact_line');
  if (line.startsWith('http') && !safeHttpUrl(line)) {
    errors.push('ลิงก์ LINE ไม่ถูกต้อง');
    invalidNames.add('contact_line');
  }
  if (value('contact_facebook') && !facebookContactHref(value('contact_facebook'))) {
    errors.push('กรุณาใช้ลิงก์ Facebook ที่ถูกต้อง');
    invalidNames.add('contact_facebook');
  }
  if (files.length > limit) {
    errors.push(`แพ็กเกจนี้อัปโหลดได้สูงสุด ${limit} รูป`);
    invalidNames.add('images');
  }
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (files.some((file) => !allowedTypes.has(file.type))) {
    errors.push('รองรับเฉพาะไฟล์ JPG, PNG และ WEBP');
    invalidNames.add('images');
  }
  if (files.some((file) => file.size > POST_IMAGE_MAX_BYTES)) {
    errors.push('รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 500 KB');
    invalidNames.add('images');
  }
  const invalidImages = queue.filter((entry) => entry.status === 'error');
  if (invalidImages.length) {
    errors.push(`มีรูปภาพที่ไม่พร้อมอัปโหลด ${invalidImages.length} รูป กรุณาลบหรือเลือกไฟล์ใหม่`);
    invalidNames.add('images');
  }

  form.querySelectorAll('.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  invalidNames.forEach((name) => form.elements[name]?.classList.add('is-invalid'));
  const summary = form.querySelector('[data-post-errors]');
  if (errors.length) {
    summary.hidden = false;
    summary.innerHTML = `<strong><i class="fi fi-br-exclamation"></i> กรุณาตรวจสอบข้อมูลก่อนลงประกาศ</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
    const firstField = form.elements[[...invalidNames][0]];
    firstField?.focus();
    firstField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    toast(`ยังมีข้อมูลที่ต้องตรวจสอบ ${errors.length} รายการ`);
    return false;
  }
  summary.hidden = true;
  summary.innerHTML = '';
  return true;
}

async function submitProperty(form, fd) {
  const queue = imageQueue(form);
  const limit = Number(form.dataset.imageLimit || 5);
  if (!validatePropertyForm(form, fd, queue, limit)) return;

  const submitButton = form.querySelector('[type="submit"]');
  const uploadedKeys = [];
  let property = null;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fi fi-br-spinner"></i> กำลังบันทึกประกาศ';

  try {
    const propertyPayload = {
      owner_id: state.session.user.id,
      type: String(fd.get('type')),
      price: Number(fd.get('price')),
      title: String(fd.get('title')).trim(),
      project_name: String(fd.get('project_name')).trim(),
      location: String(fd.get('location')).trim(),
      bedrooms: Number(fd.get('bedrooms')),
      bathrooms: Number(fd.get('bathrooms')),
      area: Number(fd.get('area')),
      floor: fd.get('floor') ? Number(fd.get('floor')) : null,
      latitude: fd.get('latitude') ? Number(fd.get('latitude')) : null,
      longitude: fd.get('longitude') ? Number(fd.get('longitude')) : null,
      description: String(fd.get('description')).trim(),
      contact_name: String(fd.get('contact_name')).trim(),
      contact_phone: String(fd.get('contact_phone')).trim(),
      contact_line: String(fd.get('contact_line') || '').trim() || null,
      contact_facebook: String(fd.get('contact_facebook') || '').trim() || null,
      badge: fd.get('type') === 'rent' ? 'เช่า' : 'ขาย',
      is_published: true,
    };
    const propertyResult = await supabase.from('properties').insert(propertyPayload).select().single();
    if (propertyResult.error) throw propertyResult.error;
    property = propertyResult.data;

    const images = [];
    for (const [index, entry] of queue.filter((item) => item.status !== 'error').entries()) {
      const file = entry.file;
      entry.status = 'uploading';
      entry.error = '';
      renderImageQueue(form);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const key = `${state.session.user.id}/${property.id}/${Date.now()}-${index}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(PROPERTY_BUCKET).upload(key, file);
      if (uploadError) {
        entry.status = 'error';
        entry.error = uploadError.message || 'Storage ปฏิเสธไฟล์นี้';
        renderImageQueue(form);
        throw new Error(`รูป ${file.name}: ${entry.error}`);
      }
      uploadedKeys.push(key);
      const { data } = supabase.storage.from(PROPERTY_BUCKET).getPublicUrl(key);
      images.push({ property_id: property.id, image_url: data.publicUrl, alt_text: property.title, sort_order: index + 1 });
      entry.status = 'success';
      renderImageQueue(form);
    }
    if (images.length) {
      const imageResult = await supabase.from('property_images').insert(images);
      if (imageResult.error) throw imageResult.error;
    }

    const amenities = fd.getAll('amenities').map((amenity) => ({ property_id: property.id, amenity }));
    if (amenities.length) {
      const amenityResult = await supabase.from('property_amenities').insert(amenities);
      if (amenityResult.error) throw amenityResult.error;
    }
    const nearby = [...form.querySelectorAll('[data-nearby]')]
      .map((item) => String(item.dataset.value || '').trim())
      .filter(Boolean)
      .map((place_name) => ({ property_id: property.id, place_name }));
    if (nearby.length) {
      const nearbyResult = await supabase.from('property_nearby_places').insert(nearby);
      if (nearbyResult.error) throw nearbyResult.error;
    }
    toast('บันทึกประกาศเรียบร้อย');
    if (images.length) await new Promise((resolve) => setTimeout(resolve, 450));
    navTo(`/properties/${property.id}`);
  } catch (error) {
    if (uploadedKeys.length) await supabase.storage.from(PROPERTY_BUCKET).remove(uploadedKeys);
    if (property?.id) {
      await Promise.all([
        supabase.from('property_images').delete().eq('property_id', property.id),
        supabase.from('property_amenities').delete().eq('property_id', property.id),
        supabase.from('property_nearby_places').delete().eq('property_id', property.id),
      ]);
      await supabase.from('properties').delete().eq('id', property.id);
    }
    queue.forEach((entry) => {
      if (entry.status === 'success' || entry.status === 'uploading') {
        entry.status = 'error';
        entry.error = 'ยกเลิกแล้ว เนื่องจากบันทึกประกาศไม่สำเร็จ';
      }
    });
    renderImageQueue(form);
    toast(`บันทึกประกาศไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่อีกครั้ง'}`);
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fi fi-br-disk"></i> ตรวจสอบและบันทึกประกาศ';
  }
}

function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 3200);
}

function fillAdminForm(type, item) {
  const form = document.querySelector(`[data-form="admin-${type}"]`);
  if (!form || !item) return;
  resetAdminForm(`admin-${type}`);
  form.hidden = false;
  form.closest('[data-admin-manager]')?.classList.add('is-editing');
  [...form.elements].forEach((field) => {
    if (!field.name || !(field.name in item)) return;
    if (field.type === 'checkbox') field.checked = Boolean(item[field.name]);
    else field.value = item[field.name] ?? '';
  });
  if (type === 'package') {
    form.elements.features.value = (item.package_features || []).sort((a, b) => a.sort_order - b.sort_order).map((feature) => feature.feature).join('\n');
  }
  if (type === 'project' || type === 'blog') {
    form.elements.namedItem('existing_image_url').value = item.image_url || '';
    form.querySelector('[data-admin-form-title]').textContent = type === 'project' ? 'แก้ไขโครงการ' : 'แก้ไขบทความ';
    renderAdminImagePreview(form, item.image_url || '', item.image_url ? 'รูปภาพปัจจุบัน' : '');
  }
  if (type === 'amenity') form.querySelector('[data-admin-form-title]').textContent = 'แก้ไขสิ่งอำนวยความสะดวก';
  form.querySelectorAll('select').forEach((select) => {
    const value = select.closest('.theme-select')?.querySelector('.theme-select-value');
    if (value) value.textContent = select.options[select.selectedIndex]?.text || '';
  });
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.querySelector('input:not([type="hidden"])')?.focus({ preventScroll: true });
}

function resetAdminForm(target) {
  const form = document.querySelector(`[data-form="${target}"]`);
  const imageInput = form?.querySelector('[data-admin-image-input]');
  if (imageInput && adminImageObjectUrls.has(imageInput)) {
    URL.revokeObjectURL(adminImageObjectUrls.get(imageInput));
    adminImageObjectUrls.delete(imageInput);
  }
  form?.reset();
  if (form?.elements.id) form.elements.id.value = '';
  if (form?.elements.namedItem('existing_image_url')) form.elements.namedItem('existing_image_url').value = '';
  const preview = form?.querySelector('[data-admin-image-preview]');
  if (preview) { preview.hidden = true; preview.innerHTML = ''; }
  if (target === 'admin-project' && form?.elements.is_published) form.elements.is_published.checked = true;
  if (target === 'admin-blog') {
    form.elements.is_published.checked = true;
    form.elements.published_date.value = new Date().toISOString().slice(0, 10);
  }
  if (target === 'admin-amenity') {
    form.elements.is_active.checked = true;
    form.elements.sort_order.value = (state.admin?.amenities?.length || 0) + 1;
  }
}

function openAdminForm(target) {
  resetAdminForm(target);
  const form = document.querySelector(`[data-form="${target}"]`);
  if (!form) return;
  form.hidden = false;
  form.closest('[data-admin-manager]')?.classList.add('is-editing');
  const title = form.querySelector('[data-admin-form-title]');
  if (title) title.textContent = target === 'admin-project' ? 'เพิ่มโครงการใหม่' : target === 'admin-blog' ? 'เพิ่มบทความใหม่' : 'เพิ่มสิ่งอำนวยความสะดวก';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  form.querySelector('input:not([type="hidden"]):not([type="file"])')?.focus({ preventScroll: true });
}

function closeAdminForm(target) {
  resetAdminForm(target);
  const form = document.querySelector(`[data-form="${target}"]`);
  if (!form) return;
  form.hidden = true;
  form.closest('[data-admin-manager]')?.classList.remove('is-editing');
}

function renderAdminImagePreview(form, src, label, detail = '') {
  const preview = form.querySelector('[data-admin-image-preview]');
  if (!preview) return;
  if (!src) { preview.hidden = true; preview.innerHTML = ''; return; }
  preview.hidden = false;
  preview.innerHTML = `<img src="${escapeHtml(src)}" alt="ตัวอย่างรูปภาพ"><span><strong>${escapeHtml(label || 'รูปภาพที่เลือก')}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ''}</span>`;
}

document.addEventListener('click', async (event) => {
  if (!event.target.closest('.theme-select')) {
    document.querySelectorAll('.theme-select.is-open').forEach((item) => {
      item.classList.remove('is-open');
      item.querySelector('.theme-select-button')?.setAttribute('aria-expanded', 'false');
    });
  }
  const link = event.target.closest('[data-link]');
  if (link) {
    event.preventDefault();
    const navToggle = document.querySelector('#nav-toggle');
    if (navToggle) navToggle.checked = false;
    navTo(link.getAttribute('href'));
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'drawer') document.querySelector('.drawer')?.toggleAttribute('hidden');
  if (action === 'logout') {
    await supabase.auth.signOut();
    toast('ออกจากระบบแล้ว');
    navTo('/');
  }
  if (action === 'toggle-post') {
    const button = event.target.closest('[data-id]');
    await supabase.from('properties').update({ is_published: button.dataset.current !== 'true' }).eq('id', button.dataset.id);
    render();
  }
  if (action?.startsWith('edit-')) {
    const type = action.replace('edit-', '');
    const collection = type === 'project' ? state.admin?.projects : type === 'package' ? state.admin?.packages : type === 'amenity' ? state.admin?.amenities : state.admin?.blogs;
    fillAdminForm(type, collection?.find((item) => String(item.id) === event.target.closest('[data-id]').dataset.id));
  }
  if (action === 'open-admin-form') openAdminForm(event.target.closest('[data-target]').dataset.target);
  if (action === 'cancel-admin-form') closeAdminForm(event.target.closest('[data-target]').dataset.target);
  if (action === 'reset-admin-form') resetAdminForm(event.target.closest('[data-target]').dataset.target);
  if (action === 'toggle-admin-list') {
    const button = event.target.closest('[data-action="toggle-admin-list"]');
    const list = document.querySelector(`[data-admin-list="${button.dataset.target}"]`);
    const content = list?.querySelector('[data-admin-list-content]');
    if (content) {
      content.hidden = !content.hidden;
      button.setAttribute('aria-expanded', String(!content.hidden));
      button.querySelector('span').textContent = content.hidden ? 'แสดงรายการ' : 'ซ่อนรายการ';
      button.querySelector('i').className = `fi ${content.hidden ? 'fi-br-eye' : 'fi-br-eye-crossed'}`;
    }
  }
  if (action?.startsWith('delete-')) {
    const type = action.replace('delete-', '');
    const table = type === 'project' ? 'projects' : type === 'blog' ? 'blogs' : type === 'amenity' ? 'amenity_catalog' : null;
    const id = event.target.closest('[data-id]').dataset.id;
    if (table && window.confirm('ยืนยันการลบข้อมูลนี้อย่างถาวร?')) {
      const collection = type === 'project' ? state.admin?.projects : type === 'amenity' ? state.admin?.amenities : state.admin?.blogs;
      const record = collection?.find((item) => String(item.id) === id);
      const { error } = await supabase.from(table).delete().eq('id', id);
      toast(error ? error.message : 'ลบข้อมูลเรียบร้อย');
      if (!error) {
        if (type !== 'amenity') await removeAdminContentImage(record?.image_url);
        if (type === 'amenity') {
          const { data = [] } = await supabase.from('amenity_catalog').select('*').eq('is_active', true).order('sort_order').order('name');
          state.amenities = data;
        }
        render();
      }
    }
  }
  if (action === 'add-nearby') {
    const form = event.target.closest('[data-form="post"]');
    const input = form?.querySelector('[name="nearby_input"]');
    if (input.value.trim()) {
      const place = input.value.trim();
      const duplicate = [...form.querySelectorAll('[data-nearby]')].some((item) => item.dataset.value.toLowerCase() === place.toLowerCase());
      if (duplicate) return toast('สถานที่นี้อยู่ในรายการแล้ว');
      form.querySelector('[data-nearby-list]').insertAdjacentHTML('beforeend', `<article class="nearby-editor-item" data-nearby data-value="${escapeHtml(place)}"><span class="nearby-editor-order" data-nearby-order></span><span class="nearby-editor-icon"><i class="fi fi-br-marker"></i></span><strong>${escapeHtml(place)}</strong><button type="button" data-action="remove-nearby" aria-label="ลบ ${escapeHtml(place)}" title="ลบรายการ"><i class="fi fi-br-trash"></i></button></article>`);
      input.value = '';
      renderNearbyList(form);
    }
  }
  if (action === 'remove-nearby') {
    const form = event.target.closest('[data-form="post"]');
    event.target.closest('[data-nearby]')?.remove();
    renderNearbyList(form);
  }
  if (['move-image-up', 'move-image-down', 'remove-image'].includes(action)) {
    const button = event.target.closest('[data-image-id]');
    const form = button.closest('[data-form="post"]');
    if (action === 'remove-image') removeImageFromQueue(form, button.dataset.imageId);
    else moveImageInQueue(form, button.dataset.imageId, action === 'move-image-up' ? -1 : 1);
  }
  const thumb = event.target.closest('[data-gallery-thumb]');
  if (thumb) {
    const mainImage = document.querySelector('#gallery-main-image');
    const dialogImage = document.querySelector('[data-gallery-dialog-image]');
    if (mainImage) { mainImage.src = thumb.dataset.src; mainImage.alt = thumb.dataset.alt || ''; }
    if (dialogImage) { dialogImage.src = thumb.dataset.src; dialogImage.alt = thumb.dataset.alt || ''; }
    const index = document.querySelector('#gallery-current-index');
    if (index) index.textContent = thumb.dataset.index;
    document.querySelectorAll('[data-gallery-thumb]').forEach((item) => item.classList.toggle('is-active', item === thumb));
  }
  if (event.target.closest('[data-gallery-open]')) document.querySelector('[data-gallery-dialog]')?.showModal();
  if (event.target.closest('[data-gallery-close]')) document.querySelector('[data-gallery-dialog]')?.close();
  const scroll = event.target.closest('[data-gallery-scroll]');
  if (scroll) document.querySelector('[data-gallery-strip]')?.scrollBy({ left: Number(scroll.dataset.galleryScroll) * 260, behavior: 'smooth' });
});

document.addEventListener('change', async (event) => {
  const menuToggle = event.target.closest('[data-menu-key]');
  if (menuToggle && isAdmin()) {
    const nextValue = menuToggle.checked;
    const { error } = await supabase.from('site_menu_settings').update({ is_enabled: nextValue }).eq('key', menuToggle.dataset.menuKey);
    if (error) {
      menuToggle.checked = !nextValue;
      toast(`บันทึกสถานะเมนูไม่สำเร็จ: ${error.message}`);
      return;
    }
    const { data } = await supabase.from('site_menu_settings').select('*').order('sort_order');
    state.menus = data || state.menus;
    toast(nextValue ? 'เปิดเมนูแล้ว' : 'ปิดเมนูแล้ว หน้านี้จะแสดงข้อความแล้วพบกันเร็ว ๆ นี้');
    render();
  }
  if (event.target.matches('[name="images"]')) {
    const form = event.target.closest('[data-form="post"]');
    addImagesToQueue(form, [...event.target.files]);
    event.target.value = '';
  }
  if (event.target.matches('[data-admin-image-input]')) {
    const input = event.target;
    const form = input.closest('.admin-editor');
    const file = input.files[0];
    if (!file) return;
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowedTypes.has(file.type) || file.size > CONTENT_IMAGE_MAX_BYTES) {
      toast(!allowedTypes.has(file.type) ? 'รองรับเฉพาะรูป JPG, PNG และ WEBP' : 'รูปภาพต้องมีขนาดไม่เกิน 2 MB');
      input.value = '';
      return;
    }
    if (adminImageObjectUrls.has(input)) URL.revokeObjectURL(adminImageObjectUrls.get(input));
    const objectUrl = URL.createObjectURL(file);
    adminImageObjectUrls.set(input, objectUrl);
    renderAdminImagePreview(form, objectUrl, file.name, formatAdminFileSize(file.size));
  }
  if (event.target.matches('[data-use-account-contact]')) {
    const form = event.target.closest('[data-form="post"]');
    const contactName = form?.querySelector('[data-contact-name]');
    const contactPhone = form?.querySelector('[data-contact-phone]');
    if (contactName && contactPhone) {
      [contactName, contactPhone].forEach((field) => {
        field.readOnly = event.target.checked;
        field.classList.remove('is-invalid');
      });
      contactName.value = event.target.checked ? event.target.dataset.accountName : '';
      contactPhone.value = event.target.checked ? event.target.dataset.accountPhone : '';
      if (!event.target.checked) contactName.focus();
    }
  }
  const postForm = event.target.closest('[data-form="post"]');
  if (postForm) {
    event.target.classList.remove('is-invalid');
    updatePostProgress(postForm);
  }
});

document.addEventListener('input', (event) => {
  const form = event.target.closest('[data-form="post"]');
  if (!form) return;
  if (event.target.matches('[data-description-input]')) {
    const counter = form.querySelector('[data-description-counter]');
    if (counter) counter.textContent = `${event.target.value.length.toLocaleString('th-TH')} / ${Number(event.target.maxLength).toLocaleString('th-TH')}`;
  }
  event.target.classList.remove('is-invalid');
  updatePostProgress(form);
  const summary = form.querySelector('[data-post-errors]');
  if (summary && !form.querySelector('.is-invalid')) {
    summary.hidden = true;
    summary.innerHTML = '';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || !event.target.matches('[name="nearby_input"]')) return;
  event.preventDefault();
  event.target.closest('[data-form="post"]')?.querySelector('[data-action="add-nearby"]')?.click();
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-form]');
  if (!form) return;
  event.preventDefault();
  handleForm(form);
});

window.addEventListener('popstate', render);
window.addEventListener('hashchange', render);
bootstrap();
