/* Nature Spotter Guide — App Logic */

(function() {
  'use strict';

  /* ============================================================
     STATE
  ============================================================ */
  let allSpecies = [];
  let filteredSpecies = [];
  let previousScreen = 'browse';

  // Record a Sighting — in-memory state for the photo(s) currently attached
  // to the form. Photos are downscaled and EXIF-checked as soon as they are
  // added (see Part 2), never on send, so the send button stays a plain
  // synchronous click handler (needed for navigator.share() on iOS).
  let sightingPhotos = [];       // [{id, file, thumbDataUrl, name, make, model, taken, gps, verdict, reason}]
  let sightingCreditEdited = false;
  const SIGHTING_PERM_IDS = ['sg-perm-club', 'sg-perm-public', 'sg-perm-irecord'];
  let sightingLocation = null;   // {lat, lon, accuracy} once geolocation or a photo supplies it
  let guideBasenames = new Set(); // lowercased final path segment of every photo already in the guide
  const SIGHTING_MAX_PHOTOS = 4;

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

    // Photo-use permissions. Someone giving permission needs to know who they
    // are giving it to, so the group is named rather than left as "us".
    const permIntro = document.getElementById('sg-perm-intro');
    if (permIntro && cfg.orgName) {
      permIntro.textContent = `Your record and photos come to ${cfg.orgName}. Ticking these is entirely optional — your record is just as welcome either way.`;
    }
    if (cfg.shortName) {
      document.querySelectorAll('.sg-perm-org').forEach(el => { el.textContent = cfg.shortName; });
    }

    // Footer
    const footerText = document.getElementById('footer-text');
    if (footerText && cfg.footerText) footerText.textContent = cfg.footerText;
    const footerContact = document.getElementById('footer-contact');
    if (footerContact && cfg.contactEmail) {
      footerContact.innerHTML = `<a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>`;
    }

    // The About page's contact line is static Old Down markup; each site needs
    // its own address there, not the one the guide happened to be built for.
    const aboutContact = document.getElementById('about-contact');
    if (aboutContact && cfg.contactEmail) {
      aboutContact.innerHTML = `Email: <a href="mailto:${cfg.contactEmail}" class="about-email">${cfg.contactEmail}</a>`;
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
    guideBasenames = buildGuideBasenames();

    // Disclaimer
    setupDisclaimer();

    if (getDisclaimerAccepted()) {
      showScreen('browse');
      setupBrowse();
    } else {
      showScreen('disclaimer');
    }

    setupSubmitForm();
    setupSighting();
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
      const adminPassword = (window.LOCATION_CONFIG || {}).adminPassword || 'naturespotter';
      if (pw !== adminPassword) {
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
          ? `<img src="${primaryPhoto.url}" alt="${s.common_names[0]}" loading="lazy"${focalStyle(primaryPhoto)} onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">`
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

  function formatCredit(p) {
    return [p.credit, p.licence].filter(Boolean).join(' · ');
  }

  // Card thumbnails and detail heroes crop photos to a fixed shape with
  // object-fit: cover, which centres the crop and can cut the head off a
  // subject sitting high or off to one side of the frame. An optional
  // "focal" value on a photo (any CSS object-position, e.g. "35% 20%")
  // says which part of the photo to keep.
  function focalStyle(p) {
    return p && p.focal ? ` style="object-position:${p.focal}"` : '';
  }

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
      // A few entries were written with {name, how_to_tell_apart} instead of
      // {species_slug, similarity_note, key_difference} — normalise both here
      // so a single odd entry can't blank out the whole detail page.
      const slug = sim.species_slug || slugify(sim.name || '');
      const note = sim.similarity_note || sim.how_to_tell_apart || '';
      const diff = sim.key_difference || '';
      // allSpecies holds every entry in the data file, including ones not
      // recorded at this site. Only link to a species this guide actually
      // covers — otherwise show it as a look-alike that isn't in the guide.
      const cfgLoc = (window.LOCATION_CONFIG || {}).showLocationFilter === false
        ? (window.LOCATION_CONFIG || {}).defaultLocationFilter
        : null;
      const match = allSpecies.find(sp => sp.id === slug);
      const exists = match && (!cfgLoc || (match.locations || []).includes(cfgLoc))
        ? match : null;
      if (exists) {
        return `<div class="similar-card" role="button" tabindex="0" data-species="${exists.id}">
          <div class="similar-name">${exists.common_names[0]}</div>
          <div class="similar-latin">${exists.latin_name}</div>
          <div class="similar-note">${note}</div>
          ${diff ? `<div class="similar-diff"><strong>Key difference:</strong> ${diff}</div>` : ''}
        </div>`;
      } else {
        return `<div class="similar-card missing">
          <div class="similar-name">${sim.name || (match ? match.common_names[0] : slug.replace(/-/g, ' '))}</div>
          <div class="similar-note">${note}</div>
          ${diff ? `<div class="similar-diff"><strong>Key difference:</strong> ${diff}</div>` : ''}
          ${sim.danger_level === 'dangerous' ? `<div class="similar-diff" style="margin-top:6px;background:#f5dddd;color:#8b2020">⚠ Dangerous species</div>` : ''}
          <div class="not-in-guide">Not yet in this guide</div>
        </div>`;
      }
    }).join('');

    // Photos gallery
    const galleryHtml = (s.photos || []).map(p => `
      <div class="gallery-item" data-src="${p.url}" data-caption="${p.caption || ''}" data-credit="${formatCredit(p)}">
        <img src="${p.url}" alt="${p.caption || s.common_names[0]}" loading="lazy" onerror="this.parentNode.style.display='none'">
        <div class="gallery-attribution">
          <span class="attr-caption">${p.caption || ''}</span>
          <span class="attr-credit">${formatCredit(p)}</span>
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
          <div class="stage-photo-item" data-src="${p.url}" data-caption="${p.caption||''}" data-credit="${formatCredit(p)}">
            <img src="${p.url}" alt="${p.caption||ls.stage_name}" loading="lazy" onerror="this.style.display='none'">
            <div class="photo-overlay">
              <span class="photo-credit">${formatCredit(p)}</span>
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
      ? `<img src="${heroPhoto.url}" alt="${s.common_names[0]}"${focalStyle(heroPhoto)} onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="detail-hero-placeholder" style="display:none">${heroPlaceholder}</div>
         <div class="hero-attribution">${formatCredit(heroPhoto)}</div>`
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

    // "I saw this" button in detail header — opens the sighting flow prefilled
    const detailSightingBtn = document.getElementById('btn-detail-sighting');
    if (detailSightingBtn) {
      detailSightingBtn.onclick = () => {
        previousScreen = 'detail-' + s.id;
        openSighting(`${s.common_names[0]} (${s.latin_name})`);
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
    const footerSafety = document.getElementById('footer-safety');
    if (footerSafety) footerSafety.addEventListener('click', e => { e.preventDefault(); showScreen('disclaimer'); });
    // "Submit a sighting" has always been mislabelled — it opens the sighting
    // flow now, not the guide-correction form (#screen-submit is unaffected).
    const footerSubmit = document.getElementById('footer-submit');
    if (footerSubmit) footerSubmit.addEventListener('click', e => { e.preventDefault(); previousScreen = 'browse'; openSighting(); });
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
     RECORD A SIGHTING
  ============================================================ */

  /* ---------- date/time helpers shared across the sighting flow ---------- */
  function pad2(n) { return String(n).padStart(2, '0'); }
  function isoDateOf(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
  function isoTimeOf(d) { return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
  function todaySightingISO() { return isoDateOf(new Date()); }

  // "YYYY-MM-DD" + "HH:MM" -> "dd/mm/yyyy HH:MM" for the shared text block / UK display
  function formatUKDateTime(dateStr, timeStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}${timeStr ? ' ' + timeStr : ''}`;
  }
  function formatDdMmYyyy(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  // A Date parsed from EXIF, formatted the same way as the record's own date/time.
  function formatExifDateTime(d) {
    if (!d) return '';
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- guide basename set (photo provenance check) ---------- */
  // A Set of every photo filename already used in the guide, lowercased and
  // URL-decoded, so an attached photo can be checked against it in O(1).
  // Covers both a species' top-level photos and every life_stages[].photos.
  function buildGuideBasenames() {
    const set = new Set();
    const add = p => {
      if (!p || !p.url) return;
      try {
        const decoded = decodeURIComponent(p.url);
        const base = decoded.split('/').pop().toLowerCase();
        if (base) set.add(base);
      } catch (e) { /* malformed URL — nothing to add */ }
    };
    allSpecies.forEach(s => {
      (s.photos || []).forEach(add);
      (s.life_stages || []).forEach(ls => (ls.photos || []).forEach(add));
    });
    return set;
  }

  /* ---------- EXIF reader (hand-written, no library — must work offline) ---------- */
  // Reads only the first 256KB of the file (EXIF always lives at the front of
  // a JPEG) and walks the marker structure by hand. Any malformed or missing
  // EXIF must never stop someone filing a record, so this always resolves —
  // it never rejects — and returns all-nulls on any parsing trouble.
  async function readExif(file) {
    const allNull = { make: null, model: null, software: null, dateTimeOriginal: null, gps: null };
    try {
      const buf = await file.slice(0, 262144).arrayBuffer();
      const view = new DataView(buf);
      if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) return allNull;

      // Walk JPEG markers looking for the APP1 segment that starts "Exif\0\0".
      let offset = 2;
      let tiffStart = null;
      while (offset < view.byteLength - 1) {
        if (view.getUint8(offset) !== 0xFF) break;
        const marker = view.getUint8(offset + 1);
        if (marker === 0xDA) break; // start of scan — image data follows, EXIF is always before this
        if (offset + 4 > view.byteLength) break;
        const length = view.getUint16(offset + 2, false);
        if (marker === 0xE1) {
          const p = offset + 4;
          if (p + 6 <= view.byteLength) {
            let sig = '';
            for (let i = 0; i < 6; i++) sig += String.fromCharCode(view.getUint8(p + i));
            if (sig === 'Exif\u0000\u0000') { tiffStart = p + 6; break; }
          }
        }
        offset += 2 + length;
      }
      if (tiffStart === null || tiffStart + 8 > view.byteLength) return allNull;

      const bom = view.getUint16(tiffStart, false);
      let little;
      if (bom === 0x4949) little = true;
      else if (bom === 0x4D4D) little = false;
      else return allNull;

      const typeSize = t => (t === 2 ? 1 : t === 3 ? 2 : t === 4 ? 4 : t === 5 ? 8 : 4);

      function readIFD(ifdOffset) {
        const entries = {};
        const count = view.getUint16(tiffStart + ifdOffset, little);
        for (let i = 0; i < count; i++) {
          const eo = tiffStart + ifdOffset + 2 + i * 12;
          if (eo + 12 > view.byteLength) continue;
          entries[view.getUint16(eo, little)] = {
            type: view.getUint16(eo + 2, little),
            count: view.getUint32(eo + 4, little),
            entryOffset: eo
          };
        }
        return entries;
      }

      function readValue(entry) {
        const { type, count, entryOffset } = entry;
        const size = typeSize(type) * count;
        const valueOffset = size > 4
          ? tiffStart + view.getUint32(entryOffset + 8, little)
          : entryOffset + 8;

        if (type === 2) { // ASCII, NUL-terminated — exclude the terminator
          let str = '';
          for (let i = 0; i < count - 1; i++) str += String.fromCharCode(view.getUint8(valueOffset + i));
          return str;
        }
        if (type === 3) { // SHORT
          if (count === 1) return view.getUint16(valueOffset, little);
          const arr = [];
          for (let i = 0; i < count; i++) arr.push(view.getUint16(valueOffset + i * 2, little));
          return arr;
        }
        if (type === 4) { // LONG
          if (count === 1) return view.getUint32(valueOffset, little);
          const arr = [];
          for (let i = 0; i < count; i++) arr.push(view.getUint32(valueOffset + i * 4, little));
          return arr;
        }
        if (type === 5) { // RATIONAL — numerator, denominator (two LONGs) per component
          const arr = [];
          for (let i = 0; i < count; i++) {
            const num = view.getUint32(valueOffset + i * 8, little);
            const den = view.getUint32(valueOffset + i * 8 + 4, little);
            arr.push(den === 0 ? 0 : num / den);
          }
          return count === 1 ? arr[0] : arr;
        }
        return null;
      }

      const cleanAscii = s => (s || '').replace(/[\u0000 ]+$/, '').trim();

      const ifd0Offset = view.getUint32(tiffStart + 4, little);
      const ifd0 = readIFD(ifd0Offset);

      const result = { make: null, model: null, software: null, dateTimeOriginal: null, gps: null };
      if (ifd0[0x010F]) result.make = cleanAscii(readValue(ifd0[0x010F])) || null;
      if (ifd0[0x0110]) result.model = cleanAscii(readValue(ifd0[0x0110])) || null;
      if (ifd0[0x0131]) result.software = cleanAscii(readValue(ifd0[0x0131])) || null;

      if (ifd0[0x8769]) {
        const exifIfd = readIFD(readValue(ifd0[0x8769]));
        if (exifIfd[0x9003]) {
          // "YYYY:MM:DD HH:MM:SS" — colons in the date part mean this can't go
          // straight into `new Date()`, so parse the fields out by hand.
          const raw = readValue(exifIfd[0x9003]);
          const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/.exec(raw || '');
          if (m) {
            result.dateTimeOriginal = new Date(
              parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10),
              parseInt(m[4], 10), parseInt(m[5], 10), parseInt(m[6], 10)
            );
          }
        }
      }

      if (ifd0[0x8825]) {
        const gpsIfd = readIFD(readValue(ifd0[0x8825]));
        if (gpsIfd[0x0001] && gpsIfd[0x0002] && gpsIfd[0x0003] && gpsIfd[0x0004]) {
          const latRef = cleanAscii(readValue(gpsIfd[0x0001]));
          const latVals = readValue(gpsIfd[0x0002]);
          const lonRef = cleanAscii(readValue(gpsIfd[0x0003]));
          const lonVals = readValue(gpsIfd[0x0004]);
          if (Array.isArray(latVals) && latVals.length === 3 && Array.isArray(lonVals) && lonVals.length === 3) {
            let lat = latVals[0] + latVals[1] / 60 + latVals[2] / 3600;
            let lon = lonVals[0] + lonVals[1] / 60 + lonVals[2] / 3600;
            if (/S/i.test(latRef)) lat = -lat;
            if (/W/i.test(lonRef)) lon = -lon;
            result.gps = { lat, lon };
          }
        }
      }

      return result;
    } catch (e) {
      // Any malformed or truncated EXIF must never stop someone filing a record.
      return allNull;
    }
  }

  /* ---------- verdict: is this plausibly the recorder's own photo? ---------- */
  function classifySightingPhoto(file, exif) {
    const nameLower = file.name.toLowerCase();
    const guideMessage = "That's a photo from the guide. We need one you took yourself.";

    if (guideBasenames.has(nameLower)) {
      return { verdict: 'blocked', reason: guideMessage };
    }
    // Guide-generated filenames look like "species-id-N.jpg" — catches a guide
    // photo that's been renamed/re-saved but still carries the original stem.
    if (/^[a-z0-9-]+-\d+\.(jpe?g|png|webp)$/.test(nameLower)) {
      const stem = nameLower.replace(/-\d+\.(jpe?g|png|webp)$/, '');
      if (allSpecies.some(s => s.id === stem)) {
        return { verdict: 'blocked', reason: guideMessage };
      }
    }
    if (!exif.make && !exif.model && !exif.dateTimeOriginal) {
      return {
        verdict: 'blocked',
        reason: "This doesn't look like a photo from a camera — screenshots and images saved from the web have their camera details removed. Please use a photo you took."
      };
    }
    if (!exif.dateTimeOriginal) {
      return { verdict: 'warn', reason: 'No date stored in this photo — worth double-checking it’s the right one.' };
    }
    const sgDateVal = document.getElementById('sg-date').value;
    if (sgDateVal) {
      const formDate = new Date(sgDateVal + 'T00:00:00');
      const diffDays = Math.abs(exif.dateTimeOriginal - formDate) / 86400000;
      if (diffDays > 7) {
        return {
          verdict: 'warn',
          reason: `This photo was taken on ${formatExifDateTime(exif.dateTimeOriginal)}, but the sighting is dated ${formatDdMmYyyy(sgDateVal)}. Is that right?`
        };
      }
    }
    return { verdict: 'ok', reason: null };
  }

  /* ---------- downscale + thumbnail (done at add-time, not on send) ---------- */
  function downscaleSightingPhoto(file, speciesSlug, index, dateStr) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const MAX_EDGE = 1600;
          let w = img.naturalWidth, h = img.naturalHeight;
          if (w >= h && w > MAX_EDGE) { h = Math.round(h * MAX_EDGE / w); w = MAX_EDGE; }
          else if (h > w && h > MAX_EDGE) { w = Math.round(w * MAX_EDGE / h); h = MAX_EDGE; }

          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          canvas.toBlob(blob => {
            if (!blob) { reject(new Error('toBlob failed')); return; }
            const filename = `${speciesSlug}-${dateStr}-${index}.jpg`;
            const outFile = new File([blob], filename, { type: 'image/jpeg' });

            const THUMB_MAX = 320;
            let tw = w, th = h;
            if (tw >= th) { th = Math.round(th * THUMB_MAX / tw); tw = THUMB_MAX; }
            else { tw = Math.round(tw * THUMB_MAX / th); th = THUMB_MAX; }
            const tcanvas = document.createElement('canvas');
            tcanvas.width = tw; tcanvas.height = th;
            tcanvas.getContext('2d').drawImage(canvas, 0, 0, tw, th);
            const thumbDataUrl = tcanvas.toDataURL('image/jpeg', 0.7);

            resolve({ file: outFile, thumbDataUrl });
          }, 'image/jpeg', 0.85);
        } catch (e) { reject(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
      img.src = url;
    });
  }

  /* ---------- form setup ---------- */
  function buildSightingSpeciesDatalist() {
    const datalist = document.getElementById('sg-species-list');
    if (!datalist) return;
    const cfg = window.LOCATION_CONFIG || {};
    const filterLoc = cfg.defaultLocationFilter;
    datalist.innerHTML = '';
    allSpecies
      .filter(s => !filterLoc || (s.locations || []).includes(filterLoc))
      .forEach(s => {
        const opt = document.createElement('option');
        opt.value = `${s.common_names[0]} (${s.latin_name})`;
        datalist.appendChild(opt);
      });
  }

  function setupSighting() {
    buildSightingSpeciesDatalist();

    document.getElementById('btn-back-sighting').addEventListener('click', handleBackFromSighting);
    document.getElementById('btn-back-after-sighting').addEventListener('click', handleBackFromSighting);

    ['sg-species', 'sg-date', 'sg-recorder'].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('input', updateSightingSendGate);
      el.addEventListener('change', updateSightingSendGate);
    });
    // A photo's "use this date" offer only makes sense while sg-date is still
    // at its default — re-render the photo list whenever the date changes.
    document.getElementById('sg-date').addEventListener('change', renderSightingPhotos);

    document.getElementById('sg-recorder').addEventListener('input', e => {
      localStorage.setItem('ns_recorder_name', e.target.value);
      if (!sightingCreditEdited) document.getElementById('sg-credit').value = e.target.value;
    });
    document.getElementById('sg-email').addEventListener('input', e => localStorage.setItem('ns_recorder_email', e.target.value));

    document.getElementById('sg-locate').addEventListener('click', handleSightingLocate);

    document.getElementById('sg-take').addEventListener('click', () => document.getElementById('sg-file-camera').click());
    document.getElementById('sg-choose').addEventListener('click', () => document.getElementById('sg-file-library').click());
    document.getElementById('sg-file-camera').addEventListener('change', e => handleSightingFilesSelected(e.target));
    document.getElementById('sg-file-library').addEventListener('change', e => handleSightingFilesSelected(e.target));

    const ownCb = document.getElementById('sg-own');
    ownCb.addEventListener('click', toggleSightingOwn);
    ownCb.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Enter') && ownCb.getAttribute('aria-disabled') !== 'true') {
        e.preventDefault();
        toggleSightingOwn();
      }
    });

    // Photo-use permissions. These are optional and deliberately do NOT gate
    // the send button — a record with no permission granted is still welcome.
    SIGHTING_PERM_IDS.forEach(id => {
      const cb = document.getElementById(id);
      cb.addEventListener('click', () => toggleSightingPerm(id));
      cb.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSightingPerm(id); }
      });
    });

    // The credit field shadows the recorder's name until they edit it
    // themselves — after that it is theirs and we stop overwriting it.
    document.getElementById('sg-credit').addEventListener('input', () => { sightingCreditEdited = true; });

    document.getElementById('sg-send').addEventListener('click', handleSendSighting);
  }

  function openSighting(prefillSpecies) {
    resetSightingForm(prefillSpecies);
    showScreen('sighting');
  }

  function resetSightingForm(prefillSpecies) {
    sightingPhotos = [];
    sightingLocation = null;

    document.getElementById('sg-species').value = prefillSpecies || '';
    document.getElementById('sg-certainty').value = 'Likely';
    document.getElementById('sg-count').value = '';
    document.getElementById('sg-date').value = todaySightingISO();
    document.getElementById('sg-time').value = isoTimeOf(new Date());

    const cfg = window.LOCATION_CONFIG || {};
    const siteMap = { 'old-down': 'Old Down', 'sholing-valley': 'Sholing Valley' };
    document.getElementById('sg-site').value = siteMap[cfg.defaultLocationFilter] || 'Old Down';
    document.getElementById('sg-place').value = '';

    const status = document.getElementById('sg-location-status');
    status.textContent = '';
    status.className = 'field-hint';

    document.getElementById('sg-notes').value = '';
    document.getElementById('sg-recorder').value = localStorage.getItem('ns_recorder_name') || '';
    document.getElementById('sg-email').value = localStorage.getItem('ns_recorder_email') || '';

    const ownCb = document.getElementById('sg-own');
    ownCb.classList.remove('checked');
    ownCb.setAttribute('aria-checked', 'false');

    // Photo-use permissions start fresh every time: the two that give the club
    // rights over someone's photo are opt-in, so they must never carry over
    // from a previous record. Only the iRecord one starts ticked.
    setSightingPerm('sg-perm-club', false);
    setSightingPerm('sg-perm-public', false);
    setSightingPerm('sg-perm-irecord', true);
    sightingCreditEdited = false;
    document.getElementById('sg-credit').value = document.getElementById('sg-recorder').value;

    hideSightingBlockedNote();
    renderSightingPhotos();
    updateSightingOwnState();
    updateSightingPermState();
    updateSightingSendGate();

    document.getElementById('sighting-form').classList.remove('hidden');
    document.getElementById('sighting-thankyou').classList.add('hidden');
  }

  function handleBackFromSighting() {
    document.getElementById('sighting-form').classList.remove('hidden');
    document.getElementById('sighting-thankyou').classList.add('hidden');
    if (previousScreen.startsWith('detail-')) {
      const id = previousScreen.replace('detail-', '');
      openDetail(id);
    } else {
      showScreen('browse');
    }
  }

  /* ---------- geolocation (never blocks the form) ---------- */
  function handleSightingLocate() {
    const status = document.getElementById('sg-location-status');
    if (!navigator.geolocation) {
      status.textContent = "Couldn't get a location — you can still describe the spot below";
      status.className = 'field-hint sg-location-error';
      return;
    }
    status.textContent = 'Finding your location…';
    status.className = 'field-hint sg-location-loading';
    navigator.geolocation.getCurrentPosition(
      pos => {
        sightingLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy };
        status.textContent = `${sightingLocation.lat.toFixed(5)}, ${sightingLocation.lon.toFixed(5)} · accurate to ~${Math.round(sightingLocation.accuracy)} m`;
        status.className = 'field-hint sg-location-ok';
        renderSightingPhotos(); // a photo's "use this location" offer only applies while none is set
      },
      () => {
        status.textContent = "Couldn't get a location — you can still describe the spot below";
        status.className = 'field-hint sg-location-error';
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  /* ---------- photo add/remove ---------- */
  function showSightingBlockedNote(msg) {
    const el = document.getElementById('sg-blocked-note');
    el.textContent = msg;
    el.classList.remove('hidden');
  }
  function hideSightingBlockedNote() {
    document.getElementById('sg-blocked-note').classList.add('hidden');
  }

  async function handleSightingFilesSelected(inputEl) {
    const files = Array.from(inputEl.files || []);
    inputEl.value = ''; // allow re-selecting the same file later
    for (const file of files) {
      if (sightingPhotos.length >= SIGHTING_MAX_PHOTOS) {
        alert('You can add up to 4 photos.');
        break;
      }
      await addSightingPhoto(file);
    }
  }

  async function addSightingPhoto(file) {
    const exif = await readExif(file);
    const verdict = classifySightingPhoto(file, exif);

    if (verdict.verdict === 'blocked') {
      showSightingBlockedNote(verdict.reason);
      return;
    }
    hideSightingBlockedNote();

    const speciesRaw = document.getElementById('sg-species').value.trim();
    const speciesSlug = speciesRaw ? slugify(speciesRaw.replace(/\s*\([^)]*\)\s*$/, '')) : 'sighting';
    const dateVal = document.getElementById('sg-date').value || todaySightingISO();
    const dateStamp = dateVal.replace(/-/g, '');
    const index = sightingPhotos.length + 1;

    let downscaled;
    try {
      downscaled = await downscaleSightingPhoto(file, speciesSlug, index, dateStamp);
    } catch (e) {
      // Downscaling must never block a submission — fall back to the original file.
      downscaled = { file, thumbDataUrl: null };
    }

    sightingPhotos.push({
      id: 'p' + Date.now() + Math.random().toString(36).slice(2, 7),
      file: downscaled.file,
      thumbDataUrl: downscaled.thumbDataUrl,
      name: file.name,
      make: exif.make,
      model: exif.model,
      taken: exif.dateTimeOriginal,
      gps: exif.gps,
      verdict: verdict.verdict,
      reason: verdict.reason
    });

    renderSightingPhotos();
    updateSightingSendGate();
  }

  function removeSightingPhoto(id) {
    sightingPhotos = sightingPhotos.filter(p => p.id !== id);
    renderSightingPhotos();
    updateSightingSendGate();
  }

  function useSightingPhotoLocation(p) {
    if (!p.gps) return;
    sightingLocation = { lat: p.gps.lat, lon: p.gps.lon, accuracy: null };
    const status = document.getElementById('sg-location-status');
    status.textContent = `${p.gps.lat.toFixed(5)}, ${p.gps.lon.toFixed(5)} · from photo`;
    status.className = 'field-hint sg-location-ok';
    renderSightingPhotos();
  }

  function useSightingPhotoDateTime(p) {
    if (!p.taken) return;
    document.getElementById('sg-date').value = isoDateOf(p.taken);
    document.getElementById('sg-time').value = isoTimeOf(p.taken);
    renderSightingPhotos();
    updateSightingSendGate();
  }

  /* ---------- render: photo list + the count-based prompt panel (2c/2d) ---------- */
  function renderSightingPhotos() {
    const thumbs = document.getElementById('sg-thumbs');
    thumbs.innerHTML = '';

    sightingPhotos.forEach(p => {
      const item = document.createElement('div');
      item.className = 'sg-photo-item';

      const img = document.createElement('img');
      img.src = p.thumbDataUrl || '';
      img.alt = p.name;
      item.appendChild(img);

      const note = document.createElement('div');
      if (p.verdict === 'ok') {
        note.className = 'sg-note sg-note-ok';
        const dateStr = p.taken ? formatExifDateTime(p.taken) : '';
        const okText = document.createElement('span');
        okText.textContent = `Looks like your own photo — ${[p.make, p.model].filter(Boolean).join(' ')}${dateStr ? ', ' + dateStr : ''}`;
        note.appendChild(okText);

        const fills = document.createElement('div');
        fills.className = 'sg-note-fills';
        if (p.gps && !sightingLocation) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sg-note-fill-btn';
          btn.textContent = "Use this photo's location";
          btn.addEventListener('click', () => useSightingPhotoLocation(p));
          fills.appendChild(btn);
        }
        if (p.taken && document.getElementById('sg-date').value === todaySightingISO()) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'sg-note-fill-btn';
          btn.textContent = "Use this photo's date and time";
          btn.addEventListener('click', () => useSightingPhotoDateTime(p));
          fills.appendChild(btn);
        }
        if (fills.children.length) note.appendChild(fills);
      } else {
        note.className = 'sg-note sg-note-warn';
        const warnText = document.createElement('span');
        warnText.textContent = p.reason;
        note.appendChild(warnText);
      }

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'sg-note-link';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => removeSightingPhoto(p.id));
      note.appendChild(removeBtn);

      item.appendChild(note);
      thumbs.appendChild(item);
    });

    renderSightingPhotoCountPanel();
  }

  function renderSightingPhotoCountPanel() {
    const panel = document.getElementById('sg-photo-panel');
    panel.innerHTML = '';
    const n = sightingPhotos.length;
    const box = document.createElement('div');

    if (n === 0) {
      box.className = 'sg-prompt-panel sg-prompt-amber';
      const span = document.createElement('span');
      span.textContent = 'No photo yet. A photo is what lets someone else confirm the record — please take one if you possibly can.';
      box.appendChild(span);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-primary sg-photo-btn';
      btn.textContent = '📷 Take a photo';
      btn.addEventListener('click', () => document.getElementById('sg-file-camera').click());
      box.appendChild(btn);
    } else if (n === 1) {
      box.className = 'sg-prompt-panel sg-prompt-amber';
      const span = document.createElement('span');
      span.textContent = 'One photo is good. Two or three from different angles — the top, the underside, the whole plant — make a record far easier to confirm.';
      box.appendChild(span);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sg-note-fill-btn';
      btn.textContent = 'Add another';
      btn.addEventListener('click', () => document.getElementById('sg-file-camera').click());
      box.appendChild(btn);
    } else {
      box.className = 'sg-prompt-panel sg-prompt-good';
      const span = document.createElement('span');
      span.textContent = "That's a good set.";
      box.appendChild(span);
    }
    panel.appendChild(box);
    updateSightingOwnState();
    updateSightingPermState();
  }

  /* ---------- declaration checkbox + submit gating ---------- */
  function updateSightingOwnState() {
    const cb = document.getElementById('sg-own');
    const hint = document.getElementById('sg-own-hint');
    const hasPhotos = sightingPhotos.length > 0;
    if (hasPhotos) {
      cb.setAttribute('aria-disabled', 'false');
      cb.setAttribute('tabindex', '0');
      hint.classList.add('hidden');
    } else {
      cb.setAttribute('aria-disabled', 'true');
      cb.setAttribute('tabindex', '-1');
      hint.classList.remove('hidden');
      // Deliberately leave .checked alone here. If the recorder ticked the
      // declaration and then removed their only photo, the box just locks
      // (can't be re-toggled) — it's the send button's own no-photo confirm()
      // that catches a photo-less send, not a silent reset of this tick.
    }
    updateSightingSendGate();
  }

  function toggleSightingOwn() {
    const cb = document.getElementById('sg-own');
    if (cb.getAttribute('aria-disabled') === 'true') return;
    const checked = cb.classList.toggle('checked');
    cb.setAttribute('aria-checked', String(checked));
    updateSightingSendGate();
  }

  /* ---------- photo-use permissions ---------- */
  function setSightingPerm(id, on) {
    const cb = document.getElementById(id);
    cb.classList.toggle('checked', !!on);
    cb.setAttribute('aria-checked', String(!!on));
  }

  function getSightingPerm(id) {
    return document.getElementById(id).classList.contains('checked');
  }

  function toggleSightingPerm(id) {
    const cb = document.getElementById(id);
    if (cb.getAttribute('aria-disabled') === 'true') return;
    setSightingPerm(id, !cb.classList.contains('checked'));
  }

  // The two photo permissions mean nothing without a photo, so they lock (and
  // clear) when there are none. The iRecord one stays live either way — a
  // record is worth sending on with or without a picture.
  function updateSightingPermState() {
    const hasPhotos = sightingPhotos.length > 0;
    ['sg-perm-club', 'sg-perm-public'].forEach(id => {
      const cb = document.getElementById(id);
      cb.setAttribute('aria-disabled', String(!hasPhotos));
      cb.setAttribute('tabindex', hasPhotos ? '0' : '-1');
      cb.classList.toggle('is-disabled', !hasPhotos);
      if (!hasPhotos) setSightingPerm(id, false);
    });
    const credit = document.getElementById('sg-credit');
    credit.disabled = !hasPhotos;
    document.getElementById('sg-perm-nophotos').classList.toggle('hidden', hasPhotos);
  }

  function updateSightingSendGate() {
    const species = document.getElementById('sg-species').value.trim();
    const date = document.getElementById('sg-date').value;
    const recorder = document.getElementById('sg-recorder').value.trim();
    // The declaration is only required when there are photos to declare. A
    // record with no photo — a Skylark heard singing, a fox at dusk — is still
    // worth having, and the send handler's own confirm() covers that case.
    const declared = document.getElementById('sg-own').classList.contains('checked');
    const photosDeclared = sightingPhotos.length === 0 || declared;
    document.getElementById('sg-send').disabled = !(species && date && recorder && photosDeclared);
  }

  /* ---------- record shape, storage, text block (Part 3a/3b) ---------- */
  function getSightings() {
    try { return JSON.parse(localStorage.getItem('ns_sightings') || '[]'); } catch { return []; }
  }
  function saveSightings(arr) { localStorage.setItem('ns_sightings', JSON.stringify(arr)); }

  function buildSightingRecordText(record) {
    const label = (l, v) => `${l.padEnd(12)}${v}`;
    const lines = [];
    const cfg = window.LOCATION_CONFIG || {};
    lines.push('Nature sighting — ' + (cfg.shortName || 'Old Down'));
    lines.push('');
    lines.push(label('Species:', record.species));
    lines.push(label('Certainty:', record.certainty));
    if (record.count) lines.push(label('Count:', record.count));
    lines.push(label('Date:', formatUKDateTime(record.date, record.time)));
    lines.push(label('Location:', `${record.site}${record.place ? ' — ' + record.place : ''}`));
    if (record.lat != null) {
      lines.push(label('Grid ref:', `${record.lat.toFixed(5)}, ${record.lon.toFixed(5)}${record.accuracy ? ` (±${Math.round(record.accuracy)} m)` : ''}`));
    }
    lines.push(label('Recorder:', record.recorder));
    if (record.email) lines.push(label('Email:', record.email));
    if (record.notes) {
      lines.push('');
      lines.push('Notes:');
      lines.push(record.notes);
    }
    lines.push('');
    lines.push(label('Photos:', `${record.photo_count} attached`));

    // Written into the email itself so the club has the recorder's permission
    // on record in its own inbox, not only in this device's localStorage.
    const hasPhotos = record.photo_count > 0;
    const yn = v => (v ? 'Yes' : 'No');
    const photoPerm = v => (hasPhotos ? yn(v) : 'n/a — no photos sent');
    // Wider column than the labels above — these run to ~44 characters.
    const permLine = (l, v) => '  ' + l.padEnd(46) + v;
    lines.push('');
    lines.push('Photo permissions:');
    lines.push(permLine('Club use (newsletter, talks, guide, grants):', photoPerm(record.perm_club)));
    lines.push(permLine('Public use (website, social media, print):', photoPerm(record.perm_public)));
    lines.push(permLine('Credit as:', hasPhotos ? (record.credit_as || 'Anonymous') : 'n/a — no photos sent'));
    lines.push(permLine('Send record to iRecord:', yn(record.perm_irecord)));

    lines.push('');
    lines.push(`Sent from the ${cfg.name || 'Nature Spotter'} guide.`);
    return lines.join('\n');
  }

  function showAttachReminder() {
    alert('Your email app is open — please attach your photos before sending');
  }

  function showSightingThankYou(photoCount) {
    document.getElementById('sighting-form').classList.add('hidden');
    const text = document.getElementById('sighting-thankyou-text');
    text.textContent = photoCount > 0
      ? `Thanks — your sighting has been recorded, with ${photoCount} photo${photoCount === 1 ? '' : 's'}.`
      : 'Thanks — your sighting has been recorded.';
    document.getElementById('sighting-thankyou').classList.remove('hidden');
    renderSightingsAdmin();
  }

  /* ---------- send (Part 3c) ---------- */
  // Deliberately NOT an async function, and nothing before navigator.share()
  // does any awaiting: on iOS, an await ahead of share() breaks the user-
  // gesture context and the share sheet silently fails. All EXIF reading and
  // downscaling already happened back when each photo was added.
  function handleSendSighting() {
    const species = document.getElementById('sg-species').value.trim();
    const certainty = document.getElementById('sg-certainty').value;
    const count = document.getElementById('sg-count').value.trim();
    const date = document.getElementById('sg-date').value;
    const time = document.getElementById('sg-time').value;
    const site = document.getElementById('sg-site').value;
    const place = document.getElementById('sg-place').value.trim();
    const notes = document.getElementById('sg-notes').value.trim();
    const recorder = document.getElementById('sg-recorder').value.trim();
    const email = document.getElementById('sg-email').value.trim();

    const files = sightingPhotos.map(p => p.file);

    if (files.length === 0) {
      const proceed = confirm('Send without a photo? Records with a photo are far more likely to be accepted.');
      if (!proceed) return;
    }

    localStorage.setItem('ns_recorder_name', recorder);
    if (email) localStorage.setItem('ns_recorder_email', email);

    const record = {
      id: 'sig-' + Date.now(),
      species, certainty, count,
      date, time,
      site, place,
      lat: sightingLocation ? sightingLocation.lat : null,
      lon: sightingLocation ? sightingLocation.lon : null,
      accuracy: sightingLocation ? sightingLocation.accuracy : null,
      notes, recorder, email,
      perm_club: getSightingPerm('sg-perm-club'),
      perm_public: getSightingPerm('sg-perm-public'),
      perm_irecord: getSightingPerm('sg-perm-irecord'),
      credit_as: document.getElementById('sg-credit').value.trim(),
      photo_count: files.length,
      thumbnails: sightingPhotos.map(p => p.thumbDataUrl).filter(Boolean),
      photo_meta: sightingPhotos.map(p => ({
        name: p.file.name, make: p.make, model: p.model,
        taken: p.taken ? p.taken.toISOString() : null, verdict: p.verdict
      })),
      created: new Date().toISOString(),
      sent_irecord: false
    };

    // Save before sharing — a cancelled share must still leave the record in the admin panel.
    const all = getSightings();
    all.push(record);
    saveSightings(all);

    const recordText = buildSightingRecordText(record);
    const cfg = window.LOCATION_CONFIG || {};
    const to = cfg.sightingEmail || cfg.contactEmail || '';
    const subject = 'Nature sighting — ' + species;

    if (files.length && navigator.canShare && navigator.canShare({ files })) {
      navigator.share({ title: subject, text: recordText, files }).catch(() => { /* user cancelled — fine, already saved */ });
    } else {
      window.location.href = 'mailto:' + to
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(recordText);
      if (files.length) showAttachReminder();
    }

    showSightingThankYou(files.length);
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

    const csvBtn = document.getElementById('btn-sightings-csv');
    if (csvBtn) csvBtn.addEventListener('click', downloadSightingsCsv);
    const clearBtn = document.getElementById('btn-sightings-clear');
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (confirm('Remove all sightings marked as sent to iRecord?')) clearSentSightings();
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
    renderSightingsAdmin();
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
     ADMIN: SIGHTINGS TAB (Part 3d) + iRecord CSV export (Part 3e)
  ============================================================ */
  function renderSightingsAdmin() {
    const list = document.getElementById('sightings-list');
    const countEl = document.getElementById('sightings-count');
    const sightings = getSightings();
    if (countEl) countEl.textContent = sightings.length;
    if (!list) return;

    updateIrecordExportState(sightings);

    if (sightings.length === 0) {
      list.innerHTML = '<p class="admin-empty">No sightings recorded yet.</p>';
      return;
    }

    list.innerHTML = '';
    sightings.slice().reverse().forEach(sig => {
      const card = document.createElement('div');
      card.className = 'sighting-card';
      const thumbsHtml = (sig.thumbnails || []).map(src => `<img src="${src}" alt="">`).join('');
      const gridRef = sig.lat != null
        ? `${sig.lat.toFixed(5)}, ${sig.lon.toFixed(5)}${sig.accuracy ? ` (±${Math.round(sig.accuracy)}m)` : ''}`
        : '';

      card.innerHTML = `
        <div class="sighting-card-header">
          <div>
            <div class="sighting-species">${escapeHtml(sig.species)}</div>
            <div class="sighting-meta">${escapeHtml(sig.certainty)}${sig.count ? ' · ' + escapeHtml(sig.count) : ''} · ${formatUKDateTime(sig.date, sig.time)}</div>
          </div>
          <span class="sub-date">${sig.created ? sig.created.split('T')[0] : ''}</span>
        </div>
        ${thumbsHtml ? `<div class="sighting-card-thumbs">${thumbsHtml}</div>` : ''}
        <div class="sighting-meta">
          &#128205; ${escapeHtml(sig.site)}${sig.place ? ' — ' + escapeHtml(sig.place) : ''}${gridRef ? ' · ' + gridRef : ''}<br>
          Recorder: ${escapeHtml(sig.recorder)}${sig.email ? ' · ' + escapeHtml(sig.email) : ''}
        </div>
        ${sig.notes ? `<div class="sighting-notes">${escapeHtml(sig.notes)}</div>` : ''}
        <div class="sighting-perms">
          ${permBadge('Club use', sig.perm_club, sig.photo_count)}
          ${permBadge('Public use', sig.perm_public, sig.photo_count)}
          ${permBadge('iRecord', sig.perm_irecord, 1)}
          ${sig.photo_count ? `<span class="perm-credit">Credit: ${escapeHtml(sig.credit_as || 'Anonymous')}</span>` : ''}
        </div>
        <label class="sighting-sent-toggle">
          <input type="checkbox" class="sighting-sent-cb" ${sig.sent_irecord ? 'checked' : ''}>
          <span>Mark as sent to iRecord</span>
        </label>
      `;
      card.querySelector('.sighting-sent-cb').addEventListener('change', e => toggleSightingSent(sig.id, e.target.checked));
      list.appendChild(card);
    });
  }

  function updateIrecordExportState(sightings) {
    const btn = document.getElementById('btn-sightings-csv');
    const note = document.getElementById('sightings-held-back');
    if (!btn || !note) return;
    const eligible = sightings.filter(s => s.perm_irecord !== false).length;
    const held = sightings.length - eligible;
    btn.disabled = eligible === 0;
    if (held > 0) {
      note.textContent = `${held} record${held === 1 ? '' : 's'} held back (no iRecord permission)`;
      note.classList.remove('hidden');
    } else {
      note.classList.add('hidden');
    }
  }

  // Granted permissions read green, withheld ones muted grey, so a glance down
  // the list shows what the club may actually do with each photo.
  function permBadge(label, granted, photoCount) {
    if (!photoCount) return `<span class="perm-badge perm-badge-na">${label} n/a</span>`;
    return granted
      ? `<span class="perm-badge perm-badge-yes">${label} &#10003;</span>`
      : `<span class="perm-badge perm-badge-no">${label} &#10007;</span>`;
  }

  function toggleSightingSent(id, sent) {
    const all = getSightings();
    const rec = all.find(s => s.id === id);
    if (rec) rec.sent_irecord = sent;
    saveSightings(all);
  }

  function clearSentSightings() {
    saveSightings(getSightings().filter(s => !s.sent_irecord));
    renderSightingsAdmin();
  }

  // "Common Blue Butterfly (Polyommatus icarus)" -> "Common Blue Butterfly"
  // iRecord matches the common name alone against the UK Species Inventory.
  function stripLatinSuffix(name) {
    return (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  function csvField(value) {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  }

  // Records whose recorder did not agree to iRecord are never exported. This is
  // the only gate on that — so it lives here, not in the calling code.
  function irecordEligible() {
    return getSightings().filter(s => s.perm_irecord !== false);
  }

  function buildIrecordCsv() {
    const cfg = window.LOCATION_CONFIG || {};
    const headers = ['Species name', 'Date', 'Spatial reference', 'Spatial reference system', 'Location name', 'Recorder name', 'Certainty', 'Quantity', 'Occurrence comment', 'Sample comment'];
    const rows = [headers];
    irecordEligible().forEach(sig => {
      const hasGps = sig.lat != null && sig.lon != null;
      rows.push([
        stripLatinSuffix(sig.species),
        formatDdMmYyyy(sig.date),
        hasGps ? `${sig.lat.toFixed(5)}, ${sig.lon.toFixed(5)}` : '',
        hasGps ? '4326' : '',
        `${sig.site}${sig.place ? ' — ' + sig.place : ''}`,
        sig.recorder,
        sig.certainty,
        sig.count || '',
        sig.notes || '',
        `Recorded via the ${cfg.name || 'Nature Spotter'}. ${sig.photo_count || 0} photo(s) sent by email.`
      ]);
    });
    // UTF-8 BOM so Excel opens accented characters correctly.
    return '﻿' + rows.map(r => r.map(csvField).join(',')).join('\r\n');
  }

  function downloadSightingsCsv() {
    const blob = new Blob([buildIrecordCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(window.LOCATION_CONFIG || {}).id || 'nature'}-sightings-${todaySightingISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
