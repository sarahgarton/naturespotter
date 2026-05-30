/* Nature Spotter Guide — App Logic */

(function() {
  'use strict';

  /* ============================================================
     STATE
  ============================================================ */
  const ADMIN_PASSWORD = 'olddown';

  let allSpecies = [];
  let filteredSpecies = [];
  let previousScreen = 'browse';

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const TYPE_LABELS = {
    'wildflower': 'Wildflower',
    'tree-shrub': 'Tree & Shrub',
    'butterfly': 'Butterfly',
    'beetle': 'Beetle',
    'bird': 'Bird',
    'amphibian': 'Amphibian',
    'moth': 'Moth',
    'mammal': 'Mammal',
    'other-invertebrate': 'Invertebrate',
    'reptile': 'Reptile',
    'grass': 'Grass',
    'tracks-signs': 'Tracks & Signs'
  };

  const LOC_LABELS = {
    'old-down': 'Old Down',
    'sholing-valley': 'Sholing Valley',
    'south-uk': 'South UK'
  };

  const SPECIES_PLACEHOLDERS = {
    'wildflower': '🌿',
    'tree-shrub': '🌳',
    'butterfly': '🦋',
    'beetle': '🐞',
    'bird': '🦅',
    'amphibian': '🐸',
    'moth': '🦋',
    'mammal': '🦊',
    'other-invertebrate': '🐛',
    'default': '🌿'
  };

  /* ============================================================
     STORAGE HELPERS
  ============================================================ */
  function getSpotted() {
    try { return JSON.parse(localStorage.getItem('ns_spotted') || '{}'); } catch { return {}; }
  }
  function setSpotted(obj) { localStorage.setItem('ns_spotted', JSON.stringify(obj)); }

  function getSpottedCounts() {
    try { return JSON.parse(localStorage.getItem('ns_spotted_counts') || '{}'); } catch { return {}; }
  }
  function setSpottedCounts(obj) { localStorage.setItem('ns_spotted_counts', JSON.stringify(obj)); }

  function getSpottedDates() {
    try { return JSON.parse(localStorage.getItem('ns_spotted_dates') || '{}'); } catch { return {}; }
  }
  function setSpottedDates(obj) { localStorage.setItem('ns_spotted_dates', JSON.stringify(obj)); }

  function getSubmissions() {
    try { return JSON.parse(localStorage.getItem('ns_submissions') || '[]'); } catch { return []; }
  }
  function saveSubmissions(arr) { localStorage.setItem('ns_submissions', JSON.stringify(arr)); }

  function getFilters() {
    try { return JSON.parse(sessionStorage.getItem('ns_filters') || 'null'); } catch { return null; }
  }
  function saveFilters(obj) { sessionStorage.setItem('ns_filters', JSON.stringify(obj)); }

  function getDisclaimerAccepted() { return localStorage.getItem('ns_disclaimer') === 'yes'; }
  function setDisclaimerAccepted() { localStorage.setItem('ns_disclaimer', 'yes'); }

  /* ============================================================
     SCREEN NAVIGATION
  ============================================================ */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const el = document.getElementById('screen-' + id);
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
      window.scrollTo(0, 0);
    }
  }

  /* ============================================================
     CONFIG
  ============================================================ */
  function applyConfig() {
    const cfg = window.LOCATION_CONFIG || {};

    // Browser title
    if (cfg.metaTitle) document.title = cfg.metaTitle;

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && cfg.metaDescription) metaDesc.setAttribute('content', cfg.metaDescription);

    // Disclaimer screen
    const dTitle = document.getElementById('disclaimer-title');
    const dTagline = document.getElementById('disclaimer-tagline');
    if (dTitle && cfg.name) dTitle.textContent = cfg.name;
    if (dTagline && cfg.tagline) dTagline.textContent = cfg.tagline;

    // Header tagline
    const headerTagline = document.getElementById('header-tagline');
    if (headerTagline) headerTagline.textContent = cfg.tagline || '';

    // Location filter visibility
    const locGroup = document.getElementById('filter-location-group');
    if (locGroup) locGroup.style.display = cfg.showLocationFilter === false ? 'none' : '';

    // Hide location cards on the Locations screen that don't belong to this config
    if (cfg.showLocationFilter === false && cfg.defaultLocationFilter) {
      document.querySelectorAll('.location-card[data-location]').forEach(card => {
        if (card.dataset.location !== cfg.defaultLocationFilter) card.style.display = 'none';
      });
    }

    // Default location filter — pre-tick the checkbox silently
    if (cfg.defaultLocationFilter) {
      const cb = document.querySelector(`#filter-location input[value="${cfg.defaultLocationFilter}"]`);
      if (cb) cb.checked = true;
    }

    // About page
    const aboutTitle = document.getElementById('about-title');
    const aboutTagline = document.getElementById('about-tagline');
    if (aboutTitle && cfg.aboutTitle) aboutTitle.textContent = cfg.aboutTitle;
    if (aboutTagline && cfg.tagline) aboutTagline.textContent = cfg.tagline;

    // Locations intro text
    const locIntro = document.getElementById('locations-intro-text');
    if (locIntro && cfg.locationsIntroText) locIntro.textContent = cfg.locationsIntroText;

    // Footer
    const footerText = document.getElementById('footer-text');
    if (footerText && cfg.footerText) footerText.textContent = cfg.footerText;
    const footerContact = document.getElementById('footer-contact');
    if (footerContact && cfg.contactEmail) {
      footerContact.innerHTML = `<a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>`;
    }
  }

  /* ============================================================
     INIT
  ============================================================ */
  async function init() {
    // Apply config first so all UI is correct from the start
    applyConfig();

    // Load species data
    try {
      const resp = await fetch('data/species.json');
      allSpecies = await resp.json();
      allSpecies.sort((a, b) => a.common_names[0].localeCompare(b.common_names[0]));
    } catch (e) {
      console.error('Failed to load species data:', e);
      allSpecies = [];
    }

    // Disclaimer
    setupDisclaimer();

    if (getDisclaimerAccepted()) {
      showScreen('browse');
      setupBrowse();
    } else {
      showScreen('disclaimer');
    }

    setupSubmitForm();
    setupAdmin();
    setupLightbox();
    setupLocations();
    setupAbout();
    setupFooter();
  }

  /* ============================================================
     DISCLAIMER
  ============================================================ */
  function setupDisclaimer() {
    const checkbox = document.getElementById('disclaimer-checkbox');
    const acceptBtn = document.getElementById('btn-accept');
    const keyDangersBtn = document.getElementById('btn-key-dangers');
    const closeBtn = document.getElementById('btn-close-dangers');
    const panel = document.getElementById('key-dangers-panel');

    function toggleChecked() {
      const checked = checkbox.classList.toggle('checked');
      checkbox.setAttribute('aria-checked', String(checked));
      acceptBtn.disabled = !checked;
    }

    checkbox.addEventListener('click', toggleChecked);
    checkbox.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleChecked(); } });

    acceptBtn.addEventListener('click', () => {
      setDisclaimerAccepted();
      showScreen('browse');
      setupBrowse();
    });

    keyDangersBtn.addEventListener('click', e => {
      e.preventDefault();
      panel.classList.toggle('hidden');
    });
    if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
  }

  /* ============================================================
     BROWSE
  ============================================================ */
  function setupBrowse() {
    renderGrid(allSpecies);
    restoreFilters();
    applyFilters();

    // Open/close filters drawer (mobile)
    document.getElementById('btn-open-filters').addEventListener('click', openFilters);
    document.getElementById('btn-close-filters').addEventListener('click', (e) => { e.stopPropagation(); closeFilters(); });
    document.getElementById('filters-overlay').addEventListener('click', closeFilters);

    // Filter inputs
    document.getElementById('filter-search').addEventListener('input', onFilterChange);
    document.getElementById('filter-month').addEventListener('change', onFilterChange);

    document.querySelectorAll('#filter-type input').forEach(cb => cb.addEventListener('change', onFilterChange));
    document.querySelectorAll('#filter-location input').forEach(cb => cb.addEventListener('change', onFilterChange));
    document.querySelectorAll('#filter-native input').forEach(cb => cb.addEventListener('change', onFilterChange));
    document.querySelectorAll('#filter-colour input').forEach(cb => cb.addEventListener('change', onFilterChange));
    document.querySelectorAll('#filter-confidence input').forEach(cb => cb.addEventListener('change', onFilterChange));

    // Right Now — label shows current month on load
    const rightNowBtn = document.getElementById('btn-right-now');
    rightNowBtn.textContent = `Right Now (${MONTH_NAMES[new Date().getMonth()]})`;
    rightNowBtn.addEventListener('click', () => {
      const m = new Date().getMonth() + 1;
      document.getElementById('filter-month').value = String(m);
      onFilterChange();
    });

    // Reset buttons
    document.getElementById('btn-reset-filters').addEventListener('click', resetFilters);
    const resetEmpty = document.getElementById('btn-reset-empty');
    if (resetEmpty) resetEmpty.addEventListener('click', resetFilters);

    // Submit button in header
    document.getElementById('btn-open-submit').addEventListener('click', () => {
      previousScreen = 'browse';
      showScreen('submit');
    });
  }

  function openFilters() {
    document.getElementById('filters-panel').classList.add('open');
    document.getElementById('filters-overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeFilters() {
    document.getElementById('filters-panel').classList.remove('open');
    document.getElementById('filters-overlay').classList.remove('visible');
    document.body.style.overflow = '';
  }

  function getCheckedValues(groupId) {
    return Array.from(document.querySelectorAll('#' + groupId + ' input:checked')).map(cb => cb.value);
  }

  function readFilters() {
    return {
      search: document.getElementById('filter-search').value.trim().toLowerCase(),
      month: document.getElementById('filter-month').value,
      types: getCheckedValues('filter-type'),
      locations: getCheckedValues('filter-location'),
      natives: getCheckedValues('filter-native'),
      colours: getCheckedValues('filter-colour'),
      confidences: getCheckedValues('filter-confidence')
    };
  }

  function restoreFilters() {
    const saved = getFilters();
    const cfg = window.LOCATION_CONFIG || {};
    if (!saved) {
      // No saved state — apply default location filter from config
      if (cfg.defaultLocationFilter) {
        const cb = document.querySelector(`#filter-location input[value="${cfg.defaultLocationFilter}"]`);
        if (cb) cb.checked = true;
      }
      return;
    }
    if (saved.search) document.getElementById('filter-search').value = saved.search;
    if (saved.month) document.getElementById('filter-month').value = saved.month;
    const restore = (groupId, values) => {
      document.querySelectorAll('#' + groupId + ' input').forEach(cb => {
        cb.checked = values.includes(cb.value);
      });
    };
    restore('filter-type', saved.types || []);
    // If config hides location filter, always enforce the default regardless of session state
    if (cfg.showLocationFilter === false && cfg.defaultLocationFilter) {
      const cb = document.querySelector(`#filter-location input[value="${cfg.defaultLocationFilter}"]`);
      document.querySelectorAll('#filter-location input').forEach(c => c.checked = false);
      if (cb) cb.checked = true;
    } else {
      restore('filter-location', saved.locations || []);
    }
    restore('filter-native', saved.natives || []);
    restore('filter-colour', saved.colours || []);
    restore('filter-confidence', saved.confidences || []);
  }

  function onFilterChange() {
    const filters = readFilters();

    // Admin mode trigger — EXACTLY "admin"
    if (filters.search === 'admin') {
      const pw = prompt('Admin password:');
      if (pw !== ADMIN_PASSWORD) {
        document.getElementById('filter-search').value = '';
        return;
      }
      setupAdmin();
      showScreen('admin');
      return;
    }

    saveFilters(filters);
    applyFilters(filters);
    updateFilterBadge(filters);
    updateActiveFilterChips(filters);
  }

  function applyFilters(filters) {
    if (!filters) filters = readFilters();

    let results = allSpecies.filter(s => {
      // Search
      if (filters.search) {
        const q = filters.search;
        const searchText = [
          ...s.common_names,
          s.latin_name,
          s.full_description || '',
          s.summary || ''
        ].join(' ').toLowerCase();
        if (!searchText.includes(q)) return false;
      }
      // Type
      if (filters.types.length > 0 && !filters.types.includes(s.type)) return false;
      // Month
      if (filters.month) {
        const m = parseInt(filters.month);
        if (!s.months_visible.includes(m)) return false;
      }
      // Location
      if (filters.locations.length > 0) {
        const hasLoc = filters.locations.some(l => s.locations.includes(l));
        if (!hasLoc) return false;
      }
      // Native
      if (filters.natives.length > 0 && !filters.natives.includes(s.native_status)) return false;
      // Colour (ANY logic)
      if (filters.colours.length > 0) {
        const allColours = [
          ...(s.colour_flower || []),
          ...(s.colour_leaf || []),
          ...(s.colour_berry_fruit || []),
          ...(s.colour_bark_stem || []),
          ...(s.colour_body || [])
        ];
        const hasColour = filters.colours.some(c => allColours.includes(c));
        if (!hasColour) return false;
      }
      // Confidence
      if (filters.confidences.length > 0 && !filters.confidences.includes(s.confidence_to_id)) return false;
      return true;
    });

    filteredSpecies = results;
    renderGrid(results);

    const count = document.getElementById('results-count');
    if (count) count.textContent = results.length === allSpecies.length
      ? `Showing all ${allSpecies.length} species`
      : `${results.length} of ${allSpecies.length} species`;

    const emptyState = document.getElementById('empty-state');
    const grid = document.getElementById('species-grid');
    if (emptyState && grid) {
      if (results.length === 0) {
        emptyState.classList.remove('hidden');
        grid.classList.add('hidden');
      } else {
        emptyState.classList.add('hidden');
        grid.classList.remove('hidden');
      }
    }
  }

  function countActiveFilters(filters) {
    return (filters.search ? 1 : 0) +
      (filters.month ? 1 : 0) +
      filters.types.length +
      filters.locations.length +
      filters.natives.length +
      filters.colours.length +
      filters.confidences.length;
  }

  function updateFilterBadge(filters) {
    const n = countActiveFilters(filters);
    const badge = document.getElementById('filter-badge');
    if (!badge) return;
    if (n > 0) {
      badge.textContent = n;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function updateActiveFilterChips(filters) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = '';
    const add = (label, clearFn) => {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.innerHTML = label + ' <span class="chip-remove">×</span>';
      chip.addEventListener('click', clearFn);
      container.appendChild(chip);
    };
    if (filters.search) add(`"${filters.search}"`, () => { document.getElementById('filter-search').value = ''; onFilterChange(); });
    if (filters.month) add(MONTH_FULL[parseInt(filters.month)-1], () => { document.getElementById('filter-month').value = ''; onFilterChange(); });
    filters.types.forEach(t => add(TYPE_LABELS[t] || t, () => {
      document.querySelector(`#filter-type input[value="${t}"]`).checked = false; onFilterChange();
    }));
    filters.locations.forEach(l => add(LOC_LABELS[l] || l, () => {
      document.querySelector(`#filter-location input[value="${l}"]`).checked = false; onFilterChange();
    }));
    filters.natives.forEach(n => add(n.charAt(0).toUpperCase()+n.slice(1), () => {
      document.querySelector(`#filter-native input[value="${n}"]`).checked = false; onFilterChange();
    }));
    filters.colours.forEach(c => add(c.charAt(0).toUpperCase()+c.slice(1), () => {
      document.querySelector(`#filter-colour input[value="${c}"]`).checked = false; onFilterChange();
    }));
    filters.confidences.forEach(c => add(c.charAt(0).toUpperCase()+c.slice(1), () => {
      document.querySelector(`#filter-confidence input[value="${c}"]`).checked = false; onFilterChange();
    }));
  }

  function resetFilters() {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-month').value = '';
    document.querySelectorAll('#filter-type input, #filter-location input, #filter-native input, #filter-colour input, #filter-confidence input')
      .forEach(cb => cb.checked = false);
    sessionStorage.removeItem('ns_filters');
    onFilterChange();
  }

  /* ============================================================
     RENDER SPECIES GRID
  ============================================================ */
  function renderGrid(species) {
    const grid = document.getElementById('species-grid');
    if (!grid) return;
    const spotted = getSpotted();
    grid.innerHTML = '';
    species.forEach(s => {
      grid.appendChild(makeCard(s, spotted));
    });
  }

  function makeCard(s, spotted) {
    const card = document.createElement('div');
    card.className = 'species-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', s.common_names[0]);

    const primaryPhoto = s.photos && s.photos[0];
    const placeholder = SPECIES_PLACEHOLDERS[s.type] || SPECIES_PLACEHOLDERS.default;

    const dangerBadge = s.danger_level && s.danger_level !== 'none'
      ? `<span class="badge badge-danger-${s.danger_level}">${(s.danger_level === 'high' || s.danger_level === 'dangerous') ? '⚠ Dangerous' : '⚠ Caution'}</span>`
      : '';

    const cfg = window.LOCATION_CONFIG || {};
    const featuredBadge = s.featured
      ? `<span class="badge badge-featured">⭐ ${cfg.shortName || 'Old Down'} speciality</span>`
      : '';

    const isSpotted = spotted[s.id];
    const counts = getSpottedCounts();
    const spottedCount = counts[s.id] || 0;
    const countText = spottedCount > 0
      ? `You've spotted this ${spottedCount} time${spottedCount === 1 ? '' : 's'}`
      : '';

    card.innerHTML = `
      <div class="card-img-wrap">
        ${primaryPhoto
          ? `<img src="${primaryPhoto.url}" alt="${s.common_names[0]}" loading="lazy" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ``
        }
        <div class="card-img-placeholder" style="${primaryPhoto ? 'display:none' : ''}">${placeholder}</div>
      </div>
      <div class="card-body">
        <div class="card-name">${s.common_names[0]}</div>
        <div class="card-latin">${s.latin_name}</div>
        <div class="card-badges">
          <span class="badge badge-type">${TYPE_LABELS[s.type] || s.type}</span>
          <span class="badge badge-${s.native_status}">${s.native_status.charAt(0).toUpperCase()+s.native_status.slice(1)}</span>
          ${dangerBadge}
          ${featuredBadge}
        </div>
      </div>
      <div class="card-footer">
        <button class="spotted-btn ${isSpotted ? 'spotted' : ''}" data-id="${s.id}" aria-label="${isSpotted ? 'Spotted' : 'Mark as spotted'}">
          <span class="custom-checkbox ${isSpotted ? 'checked' : ''}"></span>
          <span>${isSpotted ? 'Spotted ✓' : 'Spotted?'}</span>
        </button>
        <span class="spotted-count-text" data-count-id="${s.id}">${countText}</span>
      </div>
    `;

    // Click to open detail (not on the spotted button)
    card.addEventListener('click', e => {
      if (e.target.closest('.spotted-btn')) return;
      openDetail(s.id);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.target.closest('.spotted-btn')) openDetail(s.id);
    });

    // Spotted toggle
    card.querySelector('.spotted-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleSpotted(s.id, card.querySelector('.spotted-btn'));
    });

    return card;
  }

  function toggleSpotted(id, btn) {
    const spotted = getSpotted();
    const dates = getSpottedDates();
    const wasSpotted = spotted[id];

    if (wasSpotted) {
      delete spotted[id];
      delete dates[id];
    } else {
      spotted[id] = true;
      dates[id] = new Date().toISOString().split('T')[0];
      const counts = getSpottedCounts();
      counts[id] = (counts[id] || 0) + 1;
      setSpottedCounts(counts);
    }
    setSpotted(spotted);
    setSpottedDates(dates);

    // Update spotted button
    const checkbox = btn.querySelector('.custom-checkbox');
    const label = btn.querySelector('span:last-child');
    if (spotted[id]) {
      checkbox.classList.add('checked');
      btn.classList.add('spotted');
      label.textContent = 'Spotted ✓';
    } else {
      checkbox.classList.remove('checked');
      btn.classList.remove('spotted');
      label.textContent = 'Spotted?';
    }

    // Update all count display elements for this species
    const counts = getSpottedCounts();
    const n = counts[id] || 0;
    const countStr = n > 0 ? `You've spotted this ${n} time${n === 1 ? '' : 's'}` : '';
    document.querySelectorAll(`.spotted-count-text[data-count-id="${id}"]`).forEach(el => {
      el.textContent = countStr;
    });

    // Also update detail view count if shown
    const detailCountEl = document.getElementById('detail-spotted-count');
    if (detailCountEl) detailCountEl.textContent = countStr;
  }

  /* ============================================================
     SPECIES DETAIL
  ============================================================ */
  function openDetail(id) {
    const species = allSpecies.find(s => s.id === id);
    if (!species) return;
    renderDetail(species);
    showScreen('detail');
  }

  function renderDetail(s) {
    const container = document.getElementById('detail-content');
    if (!container) return;

    const spotted = getSpotted();
    const isSpotted = spotted[s.id];
    const counts = getSpottedCounts();
    const spottedCount = counts[s.id] || 0;
    const detailCountStr = spottedCount > 0
      ? `You've spotted this ${spottedCount} time${spottedCount === 1 ? '' : 's'}`
      : '';

    // Build danger banner HTML
    let dangerBannerHtml = '';
    if (s.danger_level === 'dangerous') {
      dangerBannerHtml = `<div class="danger-banner">⚠ Danger: ${s.danger_note || 'This species requires caution.'}</div>`;
    } else if (s.danger_level === 'caution') {
      dangerBannerHtml = `<div class="danger-banner level-caution">⚠ Caution: ${s.danger_note || ''}</div>`;
    } else if (s.danger_note) {
      dangerBannerHtml = `<div class="danger-banner level-low">ℹ ${s.danger_note}</div>`;
    }

    // Weather banner
    const weatherHtml = s.weather_flag
      ? `<div class="weather-banner">${s.weather_note || 'Timing may vary with weather conditions.'}</div>`
      : '';

    // Months bar
    const monthsBarHtml = buildFullMonthsBar(s.months_visible, s.peak_months);

    // Locations
    const locsHtml = (s.locations || [])
      .map(l => `<span class="loc-tag">${LOC_LABELS[l] || l}</span>`)
      .join('');

    // Habitats
    const habsHtml = (s.habitat_tags || [])
      .map(h => `<span class="hab-tag">${h.replace(/-/g, ' ')}</span>`)
      .join('');

    // Ecological eco-tags with linking
    const ecoTagsHtml = (items) => items.map(item => {
      const linked = allSpecies.find(sp => sp.id === item);
      return linked
        ? `<span class="eco-tag"><a href="#" data-species="${linked.id}">${linked.common_names[0]}</a></span>`
        : `<span class="eco-tag">${item.replace(/-/g, ' ')}</span>`;
    }).join('');

    // Similar species
    const similarHtml = (s.similar_species || []).map(sim => {
      const exists = allSpecies.find(sp => sp.id === sim.species_slug);
      if (exists) {
        return `<div class="similar-card" role="button" tabindex="0" data-species="${exists.id}">
          <div class="similar-name">${exists.common_names[0]}</div>
          <div class="similar-latin">${exists.latin_name}</div>
          <div class="similar-note">${sim.similarity_note}</div>
          <div class="similar-diff"><strong>Key difference:</strong> ${sim.key_difference}</div>
        </div>`;
      } else {
        return `<div class="similar-card missing">
          <div class="similar-name">${sim.species_slug.replace(/-/g, ' ')}</div>
          <div class="similar-note">${sim.similarity_note}</div>
          <div class="similar-diff"><strong>Key difference:</strong> ${sim.key_difference}</div>
          ${sim.danger_level === 'dangerous' ? `<div class="similar-diff" style="margin-top:6px;background:#f5dddd;color:#8b2020">⚠ Dangerous species</div>` : ''}
          <div class="not-in-guide">Not yet in this guide</div>
        </div>`;
      }
    }).join('');

    // Photos gallery
    const galleryHtml = (s.photos || []).map(p => `
      <div class="gallery-item" data-src="${p.url}" data-caption="${p.caption || ''}" data-credit="${p.credit || ''} · ${p.licence || ''}">
        <img src="${p.url}" alt="${p.caption || s.common_names[0]}" loading="lazy" onerror="this.parentNode.style.display='none'">
        <div class="gallery-attribution">
          <span class="attr-caption">${p.caption || ''}</span>
          <span class="attr-credit">${p.credit || ''} · ${p.licence || ''}</span>
        </div>
      </div>
    `).join('');

    // Life stages tabs
    const stagesTabsHtml = (s.life_stages || []).map((ls, i) =>
      `<button class="stage-tab ${i===0?'active':''}" data-stage="${i}">${ls.stage_name}</button>`
    ).join('');

    const stagesPanelsHtml = (s.life_stages || []).map((ls, i) => {
      const stagePhotosHtml = ls.photos && ls.photos.length > 0
        ? ls.photos.map(p => `
          <div class="stage-photo-item" data-src="${p.url}" data-caption="${p.caption||''}" data-credit="${p.credit||''} · ${p.licence||''}">
            <img src="${p.url}" alt="${p.caption||ls.stage_name}" loading="lazy" onerror="this.style.display='none'">
            <div class="photo-overlay">
              <span class="photo-credit">${p.credit||''} · ${p.licence||''}</span>
            </div>
          </div>
        `).join('')
        : `<p class="no-photo-note">No photos available for this life stage.</p>`;

      const stageMonthsBar = ls.months_typical && ls.months_typical.length > 0
        ? buildMiniMonthsBar(ls.months_typical)
        : '';

      return `<div class="stage-panel ${i===0?'active':''}" data-panel="${i}">
        ${stageMonthsBar}
        <div class="stage-description">${ls.description}</div>
        <div class="stage-photos">${stagePhotosHtml}</div>
      </div>`;
    }).join('');

    const heroPhoto = s.photos && s.photos[0];
    const heroPlaceholder = SPECIES_PLACEHOLDERS[s.type] || SPECIES_PLACEHOLDERS.default;
    const heroImgHtml = heroPhoto
      ? `<img src="${heroPhoto.url}" alt="${s.common_names[0]}" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="detail-hero-placeholder" style="display:none">${heroPlaceholder}</div>
         <div class="hero-attribution">${heroPhoto.credit || ''} · ${heroPhoto.licence || ''}</div>`
      : `<div class="detail-hero-placeholder">${heroPlaceholder}</div>`;

    container.innerHTML = `
      <div class="detail-hero-img">${heroImgHtml}</div>
      <div class="detail-content-inner">
      <div class="detail-hero">
        ${dangerBannerHtml}
        ${weatherHtml}
        <h1>${s.common_names[0]}</h1>
        ${s.common_names.length > 1 ? `<div class="card-latin">Also known as: ${s.common_names.slice(1).join(', ')}</div>` : ''}
        <div class="detail-latin">${s.latin_name}</div>
        <div class="detail-badges">
          <span class="badge badge-type">${TYPE_LABELS[s.type] || s.type}</span>
          <span class="badge badge-${s.native_status}">${s.native_status.charAt(0).toUpperCase()+s.native_status.slice(1)}</span>
          <span class="badge badge-type" style="background:var(--mist)">${s.confidence_to_id.charAt(0).toUpperCase()+s.confidence_to_id.slice(1)} to ID</span>
        </div>
        <button class="spotted-btn ${isSpotted ? 'spotted' : ''}" data-id="${s.id}" style="margin-top:8px">
          <span class="custom-checkbox ${isSpotted ? 'checked' : ''}"></span>
          <span>${isSpotted ? 'Spotted ✓' : 'Mark as spotted'}</span>
        </button>
        <div id="detail-spotted-count" class="spotted-count-text" data-count-id="${s.id}" style="margin-top:4px">${detailCountStr}</div>
      </div>

      <div class="detail-section">
        <h2>Quick ID</h2>
        <div class="quick-id">${s.summary}</div>
      </div>

      <div class="detail-section">
        <h2>Identification</h2>
        <div style="line-height:1.75">${s.full_description}</div>
        ${s.confidence_note ? `<p style="margin-top:12px;font-size:14px;color:var(--text-light);font-style:italic">⚠ ${s.confidence_note}</p>` : ''}
        <p class="inline-disclaimer">Always cross-reference before handling or consuming anything found in the wild.</p>
      </div>

      ${s.life_stages && s.life_stages.length > 0 ? `
      <div class="detail-section">
        <h2>Life Stages</h2>
        <div class="stages-tabs">${stagesTabsHtml}</div>
        ${stagesPanelsHtml}
      </div>` : ''}

      <div class="detail-section">
        <h2>When &amp; Where</h2>
        <div class="when-where-grid">
          <div class="when-where-block">
            <h4>Months visible</h4>
            ${monthsBarHtml}
          </div>
          <div class="when-where-block">
            <h4>Locations</h4>
            <div class="location-tags" style="margin-bottom:14px">${locsHtml || '<span style="color:var(--text-light);font-style:italic">Not specified</span>'}</div>
            <h4>Habitat</h4>
            <div class="habitat-tags">${habsHtml || '<span style="color:var(--text-light);font-style:italic">Not specified</span>'}</div>
          </div>
        </div>
        ${s.native_info ? `<p style="margin-top:16px;font-size:14px;color:var(--text-light);line-height:1.6">${s.native_info}</p>` : ''}
      </div>

      <div class="detail-section">
        <h2>Ecological Value</h2>
        <p style="margin-bottom:16px;line-height:1.75">${s.wildlife_value || ''}</p>
        <div class="eco-grid">
          ${s.pollinators_supported && s.pollinators_supported.length > 0 ? `
          <div class="eco-block">
            <h4>Pollinators supported</h4>
            <div class="eco-tags">${ecoTagsHtml(s.pollinators_supported)}</div>
          </div>` : ''}
          ${s.food_source_for && s.food_source_for.length > 0 ? `
          <div class="eco-block">
            <h4>Food source for</h4>
            <div class="eco-tags">${ecoTagsHtml(s.food_source_for)}</div>
          </div>` : ''}
          ${s.depends_on && s.depends_on.length > 0 ? `
          <div class="eco-block">
            <h4>Depends on</h4>
            <div class="eco-tags">${ecoTagsHtml(s.depends_on)}</div>
          </div>` : ''}
        </div>
      </div>

      ${s.similar_species && s.similar_species.length > 0 ? `
      <div class="detail-section">
        <h2>Similar Species</h2>
        <div class="similar-grid">${similarHtml}</div>
      </div>` : ''}

      ${s.photos && s.photos.length > 0 ? `
      <div class="detail-section">
        <h2>Photos</h2>
        <div class="photos-gallery">${galleryHtml}</div>
      </div>` : ''}

      <div class="detail-section" style="border-top:1px solid var(--border);padding-top:20px">
        <p style="font-size:14px;color:var(--text-light)">
          Something missing or wrong? <a href="#" id="detail-suggest-link">Suggest a correction, photo, or addition</a>
        </p>
      </div>
      </div>
    `;

    // Back button
    const backBtn = document.getElementById('btn-back');
    if (backBtn) {
      backBtn.onclick = () => {
        showScreen('browse');
        // Restore filter state
        const saved = getFilters();
        if (saved) {
          restoreFilters();
          applyFilters(saved);
          updateFilterBadge(saved);
          updateActiveFilterChips(saved);
        }
      };
    }

    // Submit button in detail header
    const detailSubmitBtn = document.getElementById('btn-detail-submit');
    if (detailSubmitBtn) {
      detailSubmitBtn.onclick = () => {
        previousScreen = 'detail-' + s.id;
        document.getElementById('sub-species').value = s.common_names[0];
        showScreen('submit');
      };
    }

    // Suggest link at bottom
    const suggestLink = container.querySelector('#detail-suggest-link');
    if (suggestLink) {
      suggestLink.addEventListener('click', e => {
        e.preventDefault();
        previousScreen = 'detail-' + s.id;
        document.getElementById('sub-species').value = s.common_names[0];
        showScreen('submit');
      });
    }

    // Life stage tabs
    container.querySelectorAll('.stage-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const idx = tab.dataset.stage;
        container.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.stage-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector(`.stage-panel[data-panel="${idx}"]`).classList.add('active');
      });
    });

    // Similar species click
    container.querySelectorAll('.similar-card:not(.missing)').forEach(card => {
      card.addEventListener('click', () => openDetail(card.dataset.species));
      card.addEventListener('keydown', e => { if (e.key === 'Enter') openDetail(card.dataset.species); });
    });

    // Eco-tag links
    container.querySelectorAll('.eco-tag a').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        openDetail(a.dataset.species);
      });
    });

    // Gallery lightbox
    container.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(item.dataset.src, item.dataset.caption + ' — ' + item.dataset.credit));
    });

    // Stage photo lightbox
    container.querySelectorAll('.stage-photo-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(item.dataset.src, (item.dataset.caption || '') + ' — ' + (item.dataset.credit || '')));
    });

    // Spotted toggle in detail
    const spottedBtn = container.querySelector('.spotted-btn');
    if (spottedBtn) {
      spottedBtn.addEventListener('click', () => toggleSpotted(s.id, spottedBtn));
    }
  }

  function buildFullMonthsBar(visible, peak) {
    const labels = MONTH_NAMES.map(m => `<span class="month-name">${m}</span>`).join('');
    const pips = MONTH_NAMES.map((m, i) => {
      const month = i + 1;
      const isPeak = (peak || []).includes(month);
      const isVis = (visible || []).includes(month);
      let cls = 'month-pip';
      if (isPeak) cls += ' peak';
      else if (isVis) cls += ' visible';
      return `<span class="${cls}" title="${MONTH_FULL[i]}"></span>`;
    }).join('');
    return `<div class="months-full-bar">
      <div class="month-names">${labels}</div>
      <div class="month-bar">${pips}</div>
    </div>`;
  }

  function buildMiniMonthsBar(months) {
    const pips = MONTH_NAMES.map((m, i) => {
      const month = i + 1;
      const isVis = months.includes(month);
      return `<span class="month-pip ${isVis ? 'visible' : ''}" title="${MONTH_FULL[i]}"></span>`;
    }).join('');
    return `<div class="stage-months">
      <div class="months-label">Typical months</div>
      <div class="month-bar">${pips}</div>
    </div>`;
  }

  /* ============================================================
     LIGHTBOX
  ============================================================ */
  function setupLightbox() {
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('lightbox').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').textContent = caption || '';
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ============================================================
     ABOUT PAGE
  ============================================================ */
  function setupAbout() {
    // Header 'About' button
    const openBtn = document.getElementById('btn-open-about');
    if (openBtn) {
      openBtn.addEventListener('click', () => showScreen('about'));
    }
    // Back button
    const backBtn = document.getElementById('btn-back-about');
    if (backBtn) {
      backBtn.addEventListener('click', () => showScreen('browse'));
    }
    // Disclaimer link at bottom of about page
    const disclaimerLink = document.getElementById('about-disclaimer-link');
    if (disclaimerLink) {
      disclaimerLink.addEventListener('click', e => {
        e.preventDefault();
        showScreen('disclaimer');
      });
    }
  }

  /* ============================================================
     FOOTER
  ============================================================ */
  function setupFooter() {
    // Footer nav links
    const footerBrowse = document.getElementById('footer-browse');
    if (footerBrowse) footerBrowse.addEventListener('click', e => { e.preventDefault(); showScreen('browse'); });
    const footerAbout = document.getElementById('footer-about');
    if (footerAbout) footerAbout.addEventListener('click', e => { e.preventDefault(); showScreen('about'); });
    const footerSafety = document.getElementById('footer-safety');
    if (footerSafety) footerSafety.addEventListener('click', e => { e.preventDefault(); showScreen('disclaimer'); });
    const footerSubmit = document.getElementById('footer-submit');
    if (footerSubmit) footerSubmit.addEventListener('click', e => { e.preventDefault(); previousScreen = 'browse'; showScreen('submit'); });
    const footerDisclaimer = document.getElementById('footer-disclaimer-link');
    if (footerDisclaimer) footerDisclaimer.addEventListener('click', e => { e.preventDefault(); showScreen('disclaimer'); });
  }

  /* ============================================================
     LOCATIONS
  ============================================================ */
  function setupLocations() {
    document.getElementById('btn-open-locations').addEventListener('click', () => showScreen('locations'));
    document.getElementById('btn-back-locations').addEventListener('click', () => {
      showScreen('browse');
    });
    document.getElementById('btn-locations-submit').addEventListener('click', () => {
      previousScreen = 'locations';
      showScreen('submit');
    });
  }

  /* ============================================================
     SUBMISSION FORM
  ============================================================ */
  function setupSubmitForm() {
    document.getElementById('btn-back-submit').addEventListener('click', handleBackFromSubmit);
    document.getElementById('btn-back-after-submit').addEventListener('click', handleBackFromSubmit);

    // File upload size check
    document.getElementById('sub-photo-file').addEventListener('change', e => {
      const file = e.target.files[0];
      if (file && file.size > 2 * 1024 * 1024) {
        alert('File is larger than 2MB. Please choose a smaller image or use a URL instead.');
        e.target.value = '';
      }
    });

    document.getElementById('submit-form').addEventListener('submit', handleSubmitForm);
  }

  function handleBackFromSubmit() {
    document.getElementById('submit-form').classList.remove('hidden');
    document.getElementById('submit-thankyou').classList.add('hidden');
    if (previousScreen.startsWith('detail-')) {
      const id = previousScreen.replace('detail-', '');
      openDetail(id);
    } else {
      showScreen('browse');
    }
  }

  async function handleSubmitForm(e) {
    e.preventDefault();

    const suggestion = document.getElementById('sub-suggestion').value.trim();
    if (!suggestion) {
      document.getElementById('sub-suggestion').focus();
      return;
    }

    // Handle file upload (base64)
    let photoUpload = null;
    const fileInput = document.getElementById('sub-photo-file');
    if (fileInput.files[0]) {
      try {
        photoUpload = await fileToBase64(fileInput.files[0]);
      } catch { photoUpload = null; }
    }

    const submission = {
      id: 'sub-' + Date.now(),
      type: document.getElementById('sub-type').value || 'new-species',
      species_name: document.getElementById('sub-species').value.trim(),
      suggestion,
      photo_url: document.getElementById('sub-photo-url').value.trim(),
      photo_upload: photoUpload,
      location: document.getElementById('sub-location').value,
      email: document.getElementById('sub-email').value.trim(),
      status: 'pending',
      submitted_date: new Date().toISOString().split('T')[0],
      reviewed_date: null
    };

    const subs = getSubmissions();
    subs.push(submission);
    saveSubmissions(subs);

    // Reset form
    document.getElementById('submit-form').reset();

    // Show thank you
    document.getElementById('submit-form').classList.add('hidden');
    document.getElementById('submit-thankyou').classList.remove('hidden');
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     ADMIN PANEL
  ============================================================ */
  function setupAdmin() {
    document.getElementById('btn-back-admin').addEventListener('click', () => {
      showScreen('browse');
    });

    // Tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => { c.classList.remove('active'); c.classList.add('hidden'); });
        tab.classList.add('active');
        const panel = document.getElementById('tab-' + tab.dataset.tab);
        if (panel) { panel.classList.add('active'); panel.classList.remove('hidden'); }
      });
    });

    renderAdmin();
  }

  function renderAdmin() {
    const subs = getSubmissions();
    const pending = subs.filter(s => s.status === 'pending');
    const reviewed = subs.filter(s => s.status !== 'pending');

    document.getElementById('pending-count').textContent = pending.length;
    document.getElementById('reviewed-count').textContent = reviewed.length;

    renderSubmissions('pending-list', pending, true);
    renderSubmissions('reviewed-list', reviewed, false);
    renderSpottedAdmin();
  }

  function renderSubmissions(containerId, subs, showActions) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (subs.length === 0) {
      container.innerHTML = '<p class="admin-empty">No submissions here.</p>';
      return;
    }
    container.innerHTML = '';
    subs.forEach(sub => {
      const card = document.createElement('div');
      card.className = 'sub-card';
      const typeLabel = { 'new-species': 'New Species', 'edit-existing': 'Edit', 'new-photo': 'Photo', 'report-error': 'Error Report' };
      const statusHtml = !showActions && sub.status !== 'pending'
        ? `<span class="status-badge status-${sub.status}">${sub.status.charAt(0).toUpperCase()+sub.status.slice(1)}</span>`
        : '';

      card.innerHTML = `
        <div class="sub-card-header">
          <div>
            <span class="sub-type-badge">${typeLabel[sub.type] || sub.type}</span>
            ${statusHtml}
          </div>
          <span class="sub-date">${sub.submitted_date}${sub.reviewed_date ? ' · reviewed '+sub.reviewed_date : ''}</span>
        </div>
        ${sub.species_name ? `<div class="sub-species">${sub.species_name}</div>` : ''}
        <div class="sub-suggestion">${sub.suggestion}</div>
        <div class="sub-meta">
          ${sub.location ? `<span>📍 ${sub.location}</span>` : ''}
          ${sub.email ? `<span>✉ ${sub.email}</span>` : ''}
          ${sub.photo_url ? `<span><a href="${sub.photo_url}" target="_blank">📷 Photo URL</a></span>` : ''}
          ${sub.photo_upload ? `<span>📷 Photo uploaded</span>` : ''}
        </div>
        ${showActions ? `
        <div class="sub-actions">
          <button class="btn-approve" data-id="${sub.id}">Approve</button>
          <button class="btn-reject" data-id="${sub.id}">Reject</button>
          <button class="btn-claude-review" data-id="${sub.id}" title="Generate a research prompt for this species">Research species</button>
        </div>` : `
        <div class="sub-actions">
          <button class="btn-ghost" style="font-size:13px;padding:5px 12px" data-id="${sub.id}" data-action="reopen">Reopen</button>
        </div>`}
      `;

      if (showActions) {
        card.querySelector('.btn-approve').addEventListener('click', () => updateSubmissionStatus(sub.id, 'approved'));
        card.querySelector('.btn-reject').addEventListener('click', () => updateSubmissionStatus(sub.id, 'rejected'));
        card.querySelector('.btn-claude-review').addEventListener('click', () => generateClaudePrompt(sub));
      } else {
        card.querySelector('[data-action="reopen"]').addEventListener('click', () => updateSubmissionStatus(sub.id, 'pending'));
      }

      container.appendChild(card);
    });
  }

  function updateSubmissionStatus(id, status) {
    const subs = getSubmissions();
    const sub = subs.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      sub.reviewed_date = new Date().toISOString().split('T')[0];
    }
    saveSubmissions(subs);
    renderAdmin();
  }

  function generateClaudePrompt(sub) {
    const prompt = `You are helping maintain the Nature Spotter Guide, a premium field guide for home education families in southern England (Old Down/Basingstoke and Sholing Valley/Southampton).

A user has submitted the following suggestion for review:

Type: ${sub.type}
Species: ${sub.species_name || 'not specified'}
Suggestion: ${sub.suggestion}
Location: ${sub.location || 'not specified'}
Submitted: ${sub.submitted_date}

Please research this species thoroughly and provide a complete species entry in the following JSON format, ready to add to the guide's data/species.json file. Include:
- All standard fields (id, common_names, latin_name, type, native_status, confidence_to_id, months_visible, peak_months, locations, habitat_tags, summary, full_description, danger_level, danger_note, native_info, wildlife_value, pollinators_supported, food_source_for, colour_flower/leaf/body as appropriate, life_stages with descriptions and typical_months, similar_species with species_slug/similarity_note/key_difference, similar_species should NOT include species already in the guide)
- Find 4–6 real, verified Wikimedia Commons image URLs for the photos array (use https://commons.wikimedia.org/w/api.php?action=query&titles=File:FILENAME&prop=imageinfo&iiprop=url to verify each URL exists before including it)
- Focus on UK populations, local relevance to Hampshire/Southampton
- Write for a home education audience (ages 8–14): accurate but accessible language
- Include a weather_flag: true if timing/visibility varies significantly with weather, with a brief weather_note
- Confidence to ID: easy / moderate / tricky

Respond with the complete JSON object only, starting with { and ending with }`;

    // Try to copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt).then(() => {
        showClaudePromptModal(prompt, true);
      }).catch(() => {
        showClaudePromptModal(prompt, false);
      });
    } else {
      showClaudePromptModal(prompt, false);
    }
  }

  function showClaudePromptModal(prompt, copied) {
    const existing = document.getElementById('claude-prompt-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'claude-prompt-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `
      <div style="background:var(--cream);border-radius:12px;padding:28px;max-width:600px;width:100%;max-height:80vh;display:flex;flex-direction:column;gap:16px;box-shadow:var(--shadow-lg)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h3 style="font-family:var(--font-heading);color:var(--moss);margin:0">Research Prompt</h3>
          <button id="close-claude-modal" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-light)">&times;</button>
        </div>
        ${copied ? '<p style="color:var(--fern);font-size:14px;font-weight:600">✓ Copied to clipboard</p>' : '<p style="color:var(--text-light);font-size:13px">Copy this prompt to research the species:</p>'}
        <textarea readonly style="flex:1;min-height:240px;font-family:monospace;font-size:12px;padding:12px;border:1px solid var(--border);border-radius:8px;resize:vertical;color:var(--text-dark);background:var(--chalk);line-height:1.5">${prompt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button id="copy-claude-prompt" class="btn-ghost" style="font-size:14px">Copy prompt</button>
          <button class="btn-primary" style="font-size:14px" id="open-claude-ai" onclick="window.open('https://claude.ai','_blank','noopener')">Open AI assistant ↗</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
    document.getElementById('close-claude-modal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.getElementById('copy-claude-prompt').addEventListener('click', () => {
      const ta = modal.querySelector('textarea');
      ta.select();
      navigator.clipboard.writeText(prompt).catch(() => document.execCommand('copy'));
      document.getElementById('copy-claude-prompt').textContent = '✓ Copied';
    });
  }

  function renderSpottedAdmin() {
    const container = document.getElementById('spotted-list');
    if (!container) return;
    const spotted = getSpotted();
    const dates = getSpottedDates();
    const spottedIds = Object.keys(spotted).filter(id => spotted[id]);

    if (spottedIds.length === 0) {
      container.innerHTML = '<p class="admin-empty">No species marked as spotted yet.</p>';
      return;
    }

    container.innerHTML = '';
    spottedIds.forEach(id => {
      const species = allSpecies.find(s => s.id === id);
      const row = document.createElement('div');
      row.className = 'spotted-row';
      row.innerHTML = `
        <span class="spotted-row-name">${species ? species.common_names[0] : id}</span>
        <span style="color:var(--fern);font-size:18px">✓</span>
        <span class="spotted-row-date">${dates[id] || ''}</span>
      `;
      container.appendChild(row);
    });
  }

  /* ============================================================
     BOOT
  ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
