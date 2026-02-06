/**
 * editable-content.js
 *
 * Fetches page content from the Supabase `site_content` table and injects it
 * into elements with `data-content-key` attributes. When the current user is
 * an admin (checked against the `admin_users` table), an "Edit Mode" toggle
 * appears that makes content editable inline and saves changes back to Supabase.
 *
 * Content types supported:
 *   plain_text  – rendered as textContent, edited via contenteditable
 *   rich_text   – rendered as innerHTML, edited via contenteditable
 *   link        – JSONB with url, label, description; edited via a small form
 *   image       – JSONB with src, alt; edited via a small form
 *
 * Auth UI:
 *   If an element with id="ec-sign-in-btn" exists, it's wired up as the
 *   sign-in / sign-out button. Otherwise a button is created in .top-nav.
 *
 * Dependencies: Supabase JS (loaded via CDN), Clerk JS (loaded via CDN).
 * Config: Expects window.SUPABASE_URL / window.SUPABASE_ANON_KEY (set by
 *         /api/supabase-config or supabase-config.js) and
 *         window.CLERK_PUBLISHABLE_KEY (set by /api/supabase-config).
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────
  let supabase = null;   // Supabase client (anon, no auth)
  let clerk = null;      // Clerk instance
  let isAdmin = false;
  let editMode = false;
  let contentMap = {};   // key → row from site_content
  const pageName = document.documentElement.dataset.page || 'home';

  // ── Bootstrap ──────────────────────────────────────────────────────────
  async function init() {
    await waitForConfig();

    const { createClient } = window.supabase; // from CDN global
    supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

    // Fetch content and render immediately (no auth required)
    await fetchAndRender();

    // Attempt Clerk sign-in to determine admin status
    await initClerk();
  }

  /** Wait until Supabase globals are set (config script may load async). */
  function waitForConfig() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) return resolve();
        setTimeout(check, 50);
      };
      check();
    });
  }

  // ── Content Fetching ───────────────────────────────────────────────────
  async function fetchAndRender() {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page', pageName)
      .order('sort_order');

    if (error) {
      console.warn('[editable-content] Failed to fetch content:', error.message);
      return; // Hardcoded fallback text stays visible
    }

    data.forEach((row) => {
      contentMap[row.key] = row;
    });

    renderAll();
  }

  function renderAll() {
    document.querySelectorAll('[data-content-key]').forEach(renderElement);
  }

  function renderElement(el) {
    const key = el.dataset.contentKey;
    const row = contentMap[key];
    if (!row) return; // Keep hardcoded fallback

    switch (row.content_type) {
      case 'plain_text':
        el.textContent = typeof row.content === 'string' ? row.content : JSON.stringify(row.content);
        break;

      case 'rich_text':
        el.innerHTML = typeof row.content === 'string' ? row.content : '';
        break;

      case 'link':
        renderLink(el, row.content);
        break;

      case 'image':
        renderImage(el, row.content);
        break;
    }
  }

  function renderLink(el, data) {
    if (el.tagName === 'A') {
      // Element itself is the anchor (e.g. nav links)
      el.href = data.url || '#';
      el.textContent = data.label || '';
    } else {
      // Element is a container (e.g. <li>) holding an <a> and optional <p>
      const anchor = el.querySelector('a') || document.createElement('a');
      if (!anchor.parentNode) el.prepend(anchor);
      anchor.href = data.url || '#';
      anchor.textContent = data.label || '';

      let desc = el.querySelector('p');
      if (data.description) {
        if (!desc) {
          desc = document.createElement('p');
          el.appendChild(desc);
        }
        desc.textContent = data.description;
      }
    }
  }

  function renderImage(el, data) {
    if (el.tagName === 'IMG') {
      el.src = data.src || '';
      el.alt = data.alt || '';
    }
  }

  // ── Clerk & Admin Check ────────────────────────────────────────────────
  async function initClerk() {
    const clerkPubKey = window.CLERK_PUBLISHABLE_KEY;
    if (!clerkPubKey || !window.Clerk) return;

    clerk = new window.Clerk(clerkPubKey);
    await clerk.load();

    if (clerk.user) {
      await checkAdmin();
    }

    // Wire up sign-in / sign-out UI
    mountAuthUI();
  }

  async function checkAdmin() {
    if (!clerk || !clerk.session) return;

    const token = await clerk.session.getToken({ template: 'supabase' });
    if (!token) return;

    // Create an authenticated Supabase client to check admin status
    const { createClient } = window.supabase;
    const authClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    const { data } = await authClient
      .from('admin_users')
      .select('clerk_user_id')
      .eq('clerk_user_id', clerk.user.id)
      .maybeSingle();

    isAdmin = !!data;
    if (isAdmin) showEditToggle();
  }

  /** Get a fresh authenticated Supabase client for write operations. */
  async function getAuthClient() {
    const token = await clerk.session.getToken({ template: 'supabase' });
    const { createClient } = window.supabase;
    return createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
  }

  // ── Auth UI ────────────────────────────────────────────────────────────
  function mountAuthUI() {
    // Use the dedicated sign-in button if present in the page
    const signInBtn = document.getElementById('ec-sign-in-btn');

    if (signInBtn) {
      wireUpAuthButton(signInBtn);
      return;
    }

    // Fallback: create a button in the top nav
    const nav = document.querySelector('.top-nav');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.className = 'ec-auth-btn';
    btn.id = 'ec-sign-in-btn';
    nav.appendChild(btn);
    wireUpAuthButton(btn);
  }

  function wireUpAuthButton(btn) {
    if (clerk.user) {
      btn.textContent = clerk.user.firstName
        ? 'Sign Out (' + clerk.user.firstName + ')'
        : 'Sign Out';
      btn.addEventListener('click', async () => {
        await clerk.signOut();
        window.location.reload();
      });
    } else {
      btn.textContent = 'Sign Up / Sign In';
      btn.addEventListener('click', () => clerk.openSignIn());
    }
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────
  function showEditToggle() {
    const nav = document.querySelector('.top-nav');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.className = 'ec-edit-toggle';
    btn.textContent = 'Edit Mode';
    btn.addEventListener('click', () => toggleEditMode(btn));
    nav.appendChild(btn);
  }

  function toggleEditMode(btn) {
    editMode = !editMode;
    btn.classList.toggle('ec-edit-active', editMode);
    btn.textContent = editMode ? 'Exit Edit Mode' : 'Edit Mode';
    document.body.classList.toggle('ec-editing', editMode);

    document.querySelectorAll('[data-content-key]').forEach((el) => {
      const key = el.dataset.contentKey;
      const row = contentMap[key];
      if (!row) return;

      if (editMode) {
        enableEditing(el, row);
      } else {
        disableEditing(el, row);
      }
    });
  }

  function enableEditing(el, row) {
    switch (row.content_type) {
      case 'plain_text':
      case 'rich_text':
        el.setAttribute('contenteditable', 'true');
        el.classList.add('ec-editable');
        el.addEventListener('blur', handleBlur);
        el.addEventListener('keydown', handleKeydown);
        break;

      case 'link':
        el.classList.add('ec-editable');
        attachLinkEditor(el, row);
        break;

      case 'image':
        el.classList.add('ec-editable');
        attachImageEditor(el, row);
        break;
    }
  }

  function disableEditing(el, row) {
    el.removeAttribute('contenteditable');
    el.classList.remove('ec-editable');
    el.removeEventListener('blur', handleBlur);
    el.removeEventListener('keydown', handleKeydown);

    // Remove any open editors
    const editor = el.querySelector('.ec-field-editor');
    if (editor) editor.remove();
  }

  // ── Inline Save (plain_text / rich_text) ───────────────────────────────
  function handleKeydown(e) {
    // Ctrl/Cmd+Enter to save and blur
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.target.blur();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      const key = e.target.dataset.contentKey;
      const row = contentMap[key];
      if (row) renderElement(e.target);
      e.target.blur();
    }
  }

  async function handleBlur(e) {
    const el = e.target;
    const key = el.dataset.contentKey;
    const row = contentMap[key];
    if (!row) return;

    let newContent;
    if (row.content_type === 'plain_text') {
      newContent = el.textContent.trim();
    } else {
      newContent = el.innerHTML.trim();
    }

    // Skip save if unchanged
    const oldContent = typeof row.content === 'string' ? row.content : JSON.stringify(row.content);
    if (newContent === oldContent) return;

    await saveContent(key, newContent, el);
  }

  // ── Link Editor ────────────────────────────────────────────────────────
  function attachLinkEditor(el, row) {
    if (el.querySelector('.ec-field-editor')) return;

    const data = row.content || {};
    const editor = document.createElement('div');
    editor.className = 'ec-field-editor';
    editor.innerHTML = `
      <label>Label <input type="text" data-field="label" value="${escapeAttr(data.label || '')}"></label>
      <label>URL <input type="url" data-field="url" value="${escapeAttr(data.url || '')}"></label>
      <label>Description <input type="text" data-field="description" value="${escapeAttr(data.description || '')}"></label>
      <button class="ec-save-btn" type="button">Save</button>
    `;

    editor.querySelector('.ec-save-btn').addEventListener('click', async () => {
      const fields = {};
      editor.querySelectorAll('input').forEach((input) => {
        fields[input.dataset.field] = input.value;
      });
      await saveContent(row.key, fields, el);
    });

    // Prevent clicks inside editor from bubbling to contenteditable
    editor.addEventListener('click', (e) => e.stopPropagation());

    el.appendChild(editor);
  }

  // ── Image Editor ───────────────────────────────────────────────────────
  function attachImageEditor(el, row) {
    if (el.querySelector('.ec-field-editor')) return;

    const data = row.content || {};
    const editor = document.createElement('div');
    editor.className = 'ec-field-editor';
    editor.innerHTML = `
      <label>Image URL <input type="url" data-field="src" value="${escapeAttr(data.src || '')}"></label>
      <label>Alt text <input type="text" data-field="alt" value="${escapeAttr(data.alt || '')}"></label>
      <button class="ec-save-btn" type="button">Save</button>
    `;

    editor.querySelector('.ec-save-btn').addEventListener('click', async () => {
      const fields = {};
      editor.querySelectorAll('input').forEach((input) => {
        fields[input.dataset.field] = input.value;
      });
      await saveContent(row.key, fields, el);
    });

    editor.addEventListener('click', (e) => e.stopPropagation());
    el.appendChild(editor);
  }

  // ── Save to Supabase ───────────────────────────────────────────────────
  async function saveContent(key, newContent, el) {
    const indicator = showSaveIndicator(el, 'saving');

    try {
      const authClient = await getAuthClient();
      const { error } = await authClient
        .from('site_content')
        .update({ content: newContent })
        .eq('key', key);

      if (error) throw error;

      // Update local cache
      contentMap[key].content = newContent;
      showSaveIndicator(el, 'saved', indicator);

      // Re-render element to reflect saved state
      renderElement(el);
      // Re-enable editing if still in edit mode
      if (editMode) enableEditing(el, contentMap[key]);
    } catch (err) {
      console.error('[editable-content] Save failed:', err);
      showSaveIndicator(el, 'error', indicator);
    }
  }

  function showSaveIndicator(el, state, existingEl) {
    const indicator = existingEl || document.createElement('span');
    indicator.className = 'ec-save-indicator';

    if (state === 'saving') {
      indicator.textContent = 'Saving…';
      indicator.classList.add('ec-saving');
    } else if (state === 'saved') {
      indicator.textContent = 'Saved';
      indicator.classList.remove('ec-saving');
      indicator.classList.add('ec-saved');
      setTimeout(() => indicator.remove(), 1500);
    } else {
      indicator.textContent = 'Error saving';
      indicator.classList.remove('ec-saving');
      indicator.classList.add('ec-error');
      setTimeout(() => indicator.remove(), 3000);
    }

    if (!existingEl) el.appendChild(indicator);
    return indicator;
  }

  // ── Utilities ──────────────────────────────────────────────────────────
  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Start ──────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
