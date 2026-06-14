type Env = {
  DB: any;
  ASSETS: { fetch(request: Request): Promise<Response> };
};

type PropertyRow = Record<string, any>;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {})
    }
  });
}

function notFound() {
  return json({ error: 'Not found' }, { status: 404 });
}

function splitList(value?: string | null) {
  return value ? value.split('||').filter(Boolean) : [];
}

function mapProperty(row: PropertyRow) {
  return {
    id: String(row.id),
    title: row.title,
    projectName: row.project_name,
    location: row.location,
    price: row.price,
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area,
    floor: row.floor ?? undefined,
    images: splitList(row.images),
    description: row.description,
    amenities: splitList(row.amenities),
    nearby: splitList(row.nearby),
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactLine: row.contact_line ?? undefined,
    badge: row.badge ?? undefined,
    isPromoted: Boolean(row.is_promoted)
  };
}

function mapProject(row: Record<string, any>) {
  return {
    id: String(row.id),
    name: row.name,
    developer: row.developer,
    location: row.location,
    startingPrice: row.starting_price,
    status: row.status,
    image: row.image_url,
    description: row.description
  };
}

function mapPackage(row: Record<string, any>) {
  return {
    id: String(row.id),
    name: row.name,
    price: row.price,
    listingsLimit: row.listings_limit,
    durationDays: row.duration_days,
    imageLimit: row.image_limit,
    features: splitList(row.features),
    isPremium: Boolean(row.is_premium)
  };
}

function mapBlog(row: Record<string, any>) {
  return {
    id: String(row.id),
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: row.published_date,
    image: row.image_url,
    content: row.content
  };
}

function propertySelectSql(whereSql: string) {
  return `
    SELECT
      p.*,
      COALESCE((SELECT group_concat(image_url, '||') FROM property_images WHERE property_id = p.id ORDER BY sort_order), '') AS images,
      COALESCE((SELECT group_concat(amenity, '||') FROM property_amenities WHERE property_id = p.id), '') AS amenities,
      COALESCE((SELECT group_concat(place_name, '||') FROM property_nearby_places WHERE property_id = p.id), '') AS nearby
    FROM properties p
    ${whereSql}
  `;
}

function priceFilter(priceRange: string | null, where: string[], params: unknown[]) {
  if (!priceRange) return;
  if (priceRange.endsWith('+')) {
    where.push('p.price >= ?');
    params.push(Number(priceRange.replace('+', '')));
    return;
  }

  const [min, max] = priceRange.split('-').map(Number);
  if (!Number.isNaN(min) && !Number.isNaN(max)) {
    where.push('p.price BETWEEN ? AND ?');
    params.push(min, max);
  }
}

async function listProperties(request: Request, env: Env) {
  const url = new URL(request.url);
  const where = ['p.is_published = 1'];
  const params: unknown[] = [];

  const type = url.searchParams.get('type');
  if (type === 'sell' || type === 'rent') {
    where.push('p.type = ?');
    params.push(type);
  }

  const location = url.searchParams.get('location')?.trim();
  if (location) {
    where.push('(p.location LIKE ? OR p.project_name LIKE ? OR p.title LIKE ?)');
    const keyword = `%${location}%`;
    params.push(keyword, keyword, keyword);
  }

  priceFilter(url.searchParams.get('priceRange'), where, params);

  const bedrooms = url.searchParams.get('bedrooms');
  if (bedrooms) {
    if (Number(bedrooms) >= 3) {
      where.push('p.bedrooms >= 3');
    } else {
      where.push('p.bedrooms = ?');
      params.push(Number(bedrooms));
    }
  }

  const sort = url.searchParams.get('sort');
  const orderBy =
    sort === 'price-low'
      ? 'ORDER BY p.price ASC'
      : sort === 'price-high'
        ? 'ORDER BY p.price DESC'
        : 'ORDER BY p.is_promoted DESC, p.created_at DESC';

  const sql = `${propertySelectSql(`WHERE ${where.join(' AND ')}`)} ${orderBy}`;
  const result = await env.DB.prepare(sql).bind(...params).all();
  return json(result.results.map(mapProperty));
}

async function getProperty(id: string, env: Env) {
  const result = await env.DB.prepare(`${propertySelectSql('WHERE p.id = ?')} LIMIT 1`).bind(id).first();
  return result ? json(mapProperty(result)) : notFound();
}

async function listProjects(env: Env) {
  const result = await env.DB.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  return json(result.results.map(mapProject));
}

async function getProject(id: string, env: Env) {
  const row = await env.DB.prepare('SELECT * FROM projects WHERE id = ? LIMIT 1').bind(id).first();
  return row ? json(mapProject(row)) : notFound();
}

async function listPackages(env: Env) {
  const result = await env.DB.prepare(`
    SELECT
      p.*,
      COALESCE((SELECT group_concat(feature, '||') FROM package_features WHERE package_id = p.id ORDER BY sort_order), '') AS features
    FROM packages p
    WHERE p.is_active = 1
    ORDER BY p.price ASC
  `).all();
  return json(result.results.map(mapPackage));
}

async function listBlogs(env: Env) {
  const result = await env.DB.prepare(`
    SELECT * FROM blogs
    WHERE is_published = 1
    ORDER BY published_date DESC
  `).all();
  return json(result.results.map(mapBlog));
}

async function createInquiry(request: Request, env: Env) {
  const body = await request.json().catch(() => null) as Record<string, any> | null;
  if (!body?.fullName || !body?.phone) {
    return json({ error: 'fullName and phone are required' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO inquiries (id, property_id, project_id, full_name, email, phone, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    body.propertyId || null,
    body.projectId || null,
    body.fullName,
    body.email || null,
    body.phone,
    body.message || null
  ).run();

  return json({ id, ok: true }, { status: 201 });
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api')) {
    return env.ASSETS.fetch(request);
  }

  const path = url.pathname.replace(/^\/api\/?/, '/');

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === 'GET' && path === '/health') return json({ ok: true });
  if (request.method === 'GET' && path === '/properties') return listProperties(request, env);
  if (request.method === 'GET' && path.startsWith('/properties/')) return getProperty(path.split('/')[2], env);
  if (request.method === 'GET' && path === '/projects') return listProjects(env);
  if (request.method === 'GET' && path.startsWith('/projects/')) return getProject(path.split('/')[2], env);
  if (request.method === 'GET' && path === '/packages') return listPackages(env);
  if (request.method === 'GET' && path === '/blogs') return listBlogs(env);
  if (request.method === 'POST' && path === '/inquiries') return createInquiry(request, env);

  return notFound();
}

export default {
  fetch(request: Request, env: Env) {
    return handleApi(request, env).catch((error) => {
      console.error(error);
      return json({ error: 'Internal server error' }, { status: 500 });
    });
  }
};
