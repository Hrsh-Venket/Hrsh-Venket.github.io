// Tiny YAML frontmatter parser. Supports strings and bracket lists like [a, b].
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  m[1].split(/\r?\n/).forEach(line => {
    const i = line.indexOf(':');
    if (i === -1) return;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (!key) return;
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      val = val.replace(/^['"]|['"]$/g, '');
    }
    meta[key] = val;
  });
  return { meta, body: m[2] };
}

function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function renderListing({ manifestUrl, postsBaseUrl, postViewerUrl, listEl, emptyText }) {
  let slugs;
  try {
    const res = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('manifest fetch failed');
    slugs = await res.json();
  } catch (e) {
    listEl.innerHTML = `<li><span class="desc">Could not load posts.</span></li>`;
    return;
  }

  if (!slugs.length) {
    listEl.innerHTML = `<li><span class="desc">${emptyText}</span></li>`;
    return;
  }

  const posts = await Promise.all(slugs.map(async slug => {
    try {
      const r = await fetch(`${postsBaseUrl}${slug}.md`, { cache: 'no-cache' });
      if (!r.ok) return null;
      const md = await r.text();
      const { meta, body } = parseFrontmatter(md);
      return { slug, meta, body };
    } catch { return null; }
  }));

  const valid = posts.filter(Boolean).sort((a, b) => {
    const da = new Date(a.meta.date || 0).getTime();
    const db = new Date(b.meta.date || 0).getTime();
    return db - da;
  });

  if (!valid.length) {
    listEl.innerHTML = `<li><span class="desc">${emptyText}</span></li>`;
    return;
  }

  listEl.innerHTML = valid.map(p => {
    const tags = Array.isArray(p.meta.tags) ? p.meta.tags : [];
    const tagsHtml = tags.length
      ? `<div class="tags">${tags.map(t => `<a>#${escapeHtml(t)}</a>`).join('')}</div>`
      : '';
    return `
      <li>
        <span class="date">${escapeHtml(fmtDate(p.meta.date))}</span>
        <a class="title" href="${postViewerUrl}?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.meta.title || p.slug)}</a>
        <p class="desc">${escapeHtml(p.meta.description || '')}</p>
        ${tagsHtml}
      </li>
    `;
  }).join('');
}

async function renderPost({ postsBaseUrl, indexUrl, articleEl }) {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  if (!slug || !/^[a-zA-Z0-9_\-]+$/.test(slug)) {
    articleEl.innerHTML = `<p>Post not found. <a href="${indexUrl}">Back</a></p>`;
    return;
  }

  let md;
  try {
    const res = await fetch(`${postsBaseUrl}${slug}.md`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('not found');
    md = await res.text();
  } catch {
    articleEl.innerHTML = `<p>Post not found. <a href="${indexUrl}">Back</a></p>`;
    return;
  }

  const { meta, body } = parseFrontmatter(md);
  const title = meta.title || slug;
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const tagsHtml = tags.length
    ? ` &middot; ${tags.map(t => `#${escapeHtml(t)}`).join(' ')}`
    : '';

  document.title = `${title} · Hrsh Venket`;

  const html = marked.parse(body);
  articleEl.innerHTML = `
    <h1>${escapeHtml(title)}</h1>
    <p class="post-meta">${escapeHtml(fmtDate(meta.date))} &middot; ${readingTime(body)} min read${tagsHtml}</p>
    ${html}
  `;
}
