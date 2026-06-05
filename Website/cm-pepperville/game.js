(() => {
  const data = window.CITY_MANAGER_PEPPERVILLE;

  const els = {
    startGameBtn: document.getElementById('startGameBtn'),
    nextRoundBtn: document.getElementById('nextRoundBtn'),
    revealCardBtn: document.getElementById('revealCardBtn'),
    shuffleDeckBtn: document.getElementById('shuffleDeckBtn'),
    clearLogBtn: document.getElementById('clearLogBtn'),
    playerCount: document.getElementById('playerCount'),
    playerNameInputs: [
      document.getElementById('playerName0'),
      document.getElementById('playerName1'),
      document.getElementById('playerName2'),
      document.getElementById('playerName3'),
    ],
    roundValue: document.getElementById('roundValue'),
    deckValue: document.getElementById('deckValue'),
    turnCardsValue: document.getElementById('turnCardsValue'),
    stageValue: document.getElementById('stageValue'),
    statusLine: document.getElementById('statusLine'),
    currentCard: document.getElementById('currentCard'),
    actionArea: document.getElementById('actionArea'),
    turnQueue: document.getElementById('turnQueue'),
    playerGrid: document.getElementById('playerGrid'),
    pendingPeople: document.getElementById('pendingPeople'),
    discardPile: document.getElementById('discardPile'),
    log: document.getElementById('log'),
    peopleCountPill: document.getElementById('peopleCountPill'),
    businessCountPill: document.getElementById('businessCountPill'),
    rulePill: document.getElementById('rulePill'),
    cardRosterBtn: document.getElementById('cardRosterBtn'),
    rosterOverlay: document.getElementById('rosterOverlay'),
    rosterCloseBtn: document.getElementById('rosterCloseBtn'),
    rosterGrid: document.getElementById('rosterGrid'),
    rosterMeta: document.getElementById('rosterMeta'),
    rosterCount: document.getElementById('rosterCount'),
    rosterTabs: Array.from(document.querySelectorAll('[data-roster-type]')),
    photoViewerOverlay: document.getElementById('photoViewerOverlay'),
    photoViewerCloseBtn: document.getElementById('photoViewerCloseBtn'),
    photoViewerImage: document.getElementById('photoViewerImage'),
    photoViewerTitle: document.getElementById('photoViewerTitle'),
    photoViewerMeta: document.getElementById('photoViewerMeta'),
  };

  const REVENUE_CHART = {
    1: [null, null, 1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6],
    2: [null, null, 2, 4, 5, 6, 7, 7, 8, 8, 9, 10, 12],
    3: [null, null, 3, 6, 8, 9, 10, 11, 11, 12, 14, 15, 18],
    4: [null, null, 4, 8, 10, 12, 13, 14, 15, 16, 18, 20, 24],
    5: [null, null, 5, 10, 13, 15, 16, 18, 19, 20, 23, 25, 30],
    6: [null, null, 6, 12, 15, 18, 20, 21, 23, 24, 27, 30, 36],
    7: [null, null, 7, 14, 18, 21, 23, 25, 26, 28, 32, 35, 42],
    8: [null, null, 8, 16, 20, 24, 26, 28, 30, 32, 36, 40, 48],
    9: [null, null, 9, 18, 23, 27, 28, 28, 30, 32, 36, 41, 49],
    10: [null, null, 10, 20, 25, 30, 31, 32, 34, 36, 41, 45, 51],
    11: [null, null, 11, 22, 28, 33, 34, 35, 37, 40, 45, 50, 53],
    12: [null, null, 12, 24, 29, 34, 37, 38, 41, 43, 49, 50, 55],
    13: [null, null, 13, 25, 29, 35, 40, 40, 42, 44, 50, 50, 55],
    14: [null, null, 14, 27, 32, 36, 41, 41, 45, 48, 51, 54, 55],
    15: [null, null, 15, 29, 34, 38, 42, 43, 46, 48, 52, 54, 59],
    16: [null, null, 16, 30, 36, 41, 45, 45, 49, 51, 55, 57, 63],
    17: [null, null, 17, 32, 38, 44, 48, 48, 52, 55, 59, 61, 67],
    18: [null, null, 18, 34, 41, 46, 51, 51, 55, 58, 62, 65, 71],
    19: [null, null, 19, 36, 43, 49, 53, 54, 58, 61, 66, 68, 75],
    20: [null, null, 20, 38, 45, 51, 56, 57, 61, 64, 69, 72, 79],
    21: [null, null, 21, 40, 47, 54, 59, 60, 64, 68, 73, 75, 83],
    22: [null, null, 22, 42, 50, 56, 62, 63, 67, 71, 76, 79, 87],
    23: [null, null, 23, 44, 52, 59, 65, 65, 70, 74, 80, 83, 91],
    24: [null, null, 24, 46, 54, 62, 67, 68, 73, 77, 83, 86, 94],
    25: [null, null, 25, 48, 56, 64, 70, 71, 76, 80, 87, 90, 98],
    26: [null, null, 26, 49, 59, 67, 73, 74, 79, 84, 90, 93, 102],
    27: [null, null, 27, 51, 61, 69, 76, 77, 82, 87, 93, 97, 106],
    28: [null, null, 28, 53, 63, 72, 79, 80, 85, 90, 97, 101, 110],
    29: [null, null, 29, 55, 65, 74, 82, 82, 88, 93, 100, 104, 114],
    30: [null, null, 30, 57, 68, 77, 84, 85, 91, 96, 104, 108, 118],
  };

  const state = {
    started: false,
    round: 0,
    deck: [],
    discard: [],
    turnQueue: [],
    currentCard: null,
    currentStage: 'setup',
    actionContext: null,
    players: [],
    log: [],
    pendingPeople: [],
    winner: null,
    initialDeckSize: 0,
    auctionAutoplayTimer: null,
    pityFairyAudio: null,
    blindLuckTimer: null,
    blindLuckToken: 0,
    lastAnnouncement: null,
    peopleBattle: null,
    peopleBattleToken: 0,
    peopleBattleTimer: null,
    cardResolution: null,
    cardResolutionToken: 0,
    cardResolutionTimer: null,
    specialSequence: null,
    specialSequenceToken: 0,
    specialSequenceTimer: null,
    giantSpiderSequence: null,
    giantSpiderSequenceToken: 0,
    giantSpiderSequenceTimer: null,
    giantSpiderDecisionResolve: null,
    awaitingNextCard: false,
    endRound: null,
    endRoundToken: 0,
    endRoundTimer: null,
    rosterOpen: false,
    rosterType: 'business',
    photoViewerOpen: false,
  };

  const startingCash = 200;
  const startingMoneyBreakdown = [
    { count: 5, value: 1 },
    { count: 3, value: 5 },
    { count: 2, value: 10 },
    { count: 3, value: 20 },
    { count: 3, value: 50 },
  ];

  function cloneCard(card, type) {
    const specialBidNames = new Set([
      'bumbles the magician',
      'chief timothy o hara',
      'captain dependable',
      'ninja dog',
      'sheriff clay maddox',
    ]);
    const clonedType = card.cardType
      || (type === 'people' && specialBidNames.has(normalize(card.name)) ? 'special' : type);
    return { ...card, type: clonedType };
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function money(amount) {
    const sign = amount < 0 ? '-' : '';
    return `${sign}$${Math.abs(amount)}`;
  }

  function nowStamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function log(message, tone = 'normal') {
    state.log.unshift({ message, tone, time: nowStamp() });
    renderLog();
  }

  function announce(message, tone = 'good') {
    state.lastAnnouncement = { message, tone };
  }

  function cancelCardResolution() {
    state.cardResolutionToken += 1;
    if (state.cardResolutionTimer) {
      clearTimeout(state.cardResolutionTimer.id);
      state.cardResolutionTimer.resolve(false);
      state.cardResolutionTimer = null;
    }
    state.cardResolution = null;
  }

  function cancelSpecialSequence() {
    state.specialSequenceToken += 1;
    if (state.specialSequenceTimer) {
      clearTimeout(state.specialSequenceTimer.id);
      state.specialSequenceTimer.resolve(false);
      state.specialSequenceTimer = null;
    }
    state.specialSequence = null;
  }

  function cancelGiantSpiderSequence() {
    state.giantSpiderSequenceToken += 1;
    if (state.giantSpiderSequenceTimer) {
      clearTimeout(state.giantSpiderSequenceTimer);
      state.giantSpiderSequenceTimer = null;
    }
    if (state.giantSpiderDecisionResolve) {
      state.giantSpiderDecisionResolve(false);
      state.giantSpiderDecisionResolve = null;
    }
    state.giantSpiderSequence = null;
    state.actionContext = null;
  }

  function cancelBlindLuckSequence() {
    state.blindLuckToken += 1;
    if (state.blindLuckTimer) {
      clearTimeout(state.blindLuckTimer.id);
      state.blindLuckTimer.resolve(false);
      state.blindLuckTimer = null;
    }
    if (state.actionContext?.type === 'blind-luck') {
      state.actionContext = null;
    }
  }

  function cancelEndRound() {
    state.endRoundToken += 1;
    if (state.endRoundTimer) {
      clearTimeout(state.endRoundTimer.id);
      state.endRoundTimer.resolve(false);
      state.endRoundTimer = null;
    }
    state.endRound = null;
  }

  function waitForCardResolution(ms, token) {
    return new Promise((resolve) => {
      const timer = {
        id: null,
        resolve,
      };
      timer.id = setTimeout(() => {
        if (state.cardResolutionTimer === timer) {
          state.cardResolutionTimer = null;
        }
        resolve(state.cardResolutionToken === token);
      }, ms);
    state.cardResolutionTimer = timer;
  });
  }

  function waitForSpecialSequence(ms, token) {
    return new Promise((resolve) => {
      const timer = {
        id: null,
        resolve,
      };
      timer.id = setTimeout(() => {
        if (state.specialSequenceTimer === timer) {
          state.specialSequenceTimer = null;
        }
        resolve(state.specialSequenceToken === token);
      }, ms);
      state.specialSequenceTimer = timer;
    });
  }

  function waitForEndRound(ms, token) {
    return new Promise((resolve) => {
      const timer = {
        id: null,
        resolve,
      };
      timer.id = setTimeout(() => {
        if (state.endRoundTimer === timer) {
          state.endRoundTimer = null;
        }
        resolve(state.endRoundToken === token);
      }, ms);
      state.endRoundTimer = timer;
    });
  }

  function waitForBlindLuck(ms, token) {
    return new Promise((resolve) => {
      const timer = {
        id: null,
        resolve,
      };
      timer.id = setTimeout(() => {
        if (state.blindLuckTimer === timer) {
          state.blindLuckTimer = null;
        }
        resolve(state.blindLuckToken === token);
      }, ms);
      state.blindLuckTimer = timer;
    });
  }

  function playPityFairyAudio() {
    const src = 'file:///Users/timcollins/Documents/New%20project%202/City%20Manager%20Original%20Files/Done/Pity%20Fairy_mixdown.wav';
    try {
      if (!state.pityFairyAudio) {
        state.pityFairyAudio = new Audio(src);
        state.pityFairyAudio.preload = 'auto';
      }
      state.pityFairyAudio.currentTime = 0;
      const playResult = state.pityFairyAudio.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {});
      }
    } catch (error) {
      console.warn('Unable to play Pity Fairy audio.', error);
    }
  }

  function cancelPeopleBattle() {
    state.peopleBattleToken += 1;
    if (state.peopleBattleTimer) {
      clearTimeout(state.peopleBattleTimer.id);
      state.peopleBattleTimer.resolve(false);
      state.peopleBattleTimer = null;
    }
    state.peopleBattle = null;
  }

  function waitForPeopleBattle(ms, token) {
    return new Promise((resolve) => {
      const timer = {
        id: null,
        resolve,
      };
      timer.id = setTimeout(() => {
        if (state.peopleBattleTimer === timer) {
          state.peopleBattleTimer = null;
        }
        resolve(state.peopleBattleToken === token);
      }, ms);
      state.peopleBattleTimer = timer;
    });
  }

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slugify(text) {
    return normalize(text).replace(/\s+/g, '-');
  }

  function cardPhotoPath(card) {
    if (!card) return '';
    const folder = card.type === 'special'
      ? 'special'
      : card.type === 'business'
        ? 'business'
        : 'people';
    const slug = slugify(card.name);
    const aliasMap = {
      special: {
        'pity-fairy': 'the-pity-fairy',
      },
    };
    const fileStem = card.photoFile
      ? String(card.photoFile).replace(/\.jpg$/i, '')
      : aliasMap[folder]?.[slug] || slug;
    return `assets/cards/${folder}/${fileStem}.jpg`;
  }

  function cardPhotoMarkup(card, className = 'card-photo') {
    if (!card) return '';
    const imageLabel = `${card.name} card photo`;
    const photoPath = cardPhotoPath(card);
    return `
      <div class="${className}" data-photo-preview="true" data-photo-src="${escapeHtml(photoPath)}" data-photo-title="${escapeHtml(card.name)}" data-photo-meta="${escapeHtml(imageLabel)}">
        <img class="card-photo-image" src="${escapeHtml(photoPath)}" alt="${escapeHtml(imageLabel)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false;">
        <div class="card-photo-placeholder" hidden>
          <div class="card-photo-placeholder-label">Photo slot</div>
          <div class="card-photo-placeholder-note">512 x 512 image</div>
        </div>
      </div>
    `;
  }

  function cardPhotoFileName(card) {
    return cardPhotoPath(card).split('/').pop();
  }

  function renderCardShell(card, badgeHtml, bodyHtml, options = {}) {
    const layoutClass = options.layoutClass ? ` ${options.layoutClass}` : '';
    const photoClass = options.photoClass || 'card-photo';
    return `
      <div class="card-layout${layoutClass}">
        ${cardPhotoMarkup(card, photoClass)}
        <div class="card-copy">
          ${badgeHtml || ''}
          ${bodyHtml}
        </div>
      </div>
    `;
  }

  function rosterSourceCards(type) {
    const businessCards = data.businesses.map((card) => cloneCard(card, 'business'));
    const peopleCards = data.people.map((card) => cloneCard(card, 'people'));
    const all = [...businessCards, ...peopleCards];
    const unique = new Map();

    for (const card of all) {
      if (!card || unique.has(normalize(card.name))) continue;
      unique.set(normalize(card.name), card);
    }

    return [...unique.values()]
      .filter((card) => card.type === type)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function renderRosterCard(card) {
    const badgeLabel = card.type === 'special' ? specialCardBadgeLabel(card) : card.type.toUpperCase();
    const badgeClass = card.type === 'special' ? 'special' : card.type === 'business' ? 'good' : 'bad';
    const tags = cardCategories(card).length ? `<div class="roster-label-row">${cardCategories(card).map((tag) => `<span class="roster-pill">${escapeHtml(tag)}</span>`).join('')}</div>` : '';
    const metaLine = card.type === 'business'
      ? `Revenue: ${formatRevenueRuleHtml(card.revenue)}`
      : escapeHtml(card.occupation || card.revenue || 'No extra text provided');
    const extraLines = [];

    extraLines.push(`<div><strong>Location:</strong> ${escapeHtml(cardLocations(card).length ? cardLocations(card).join('; ') : 'Unassigned')}</div>`);
    if (card.type === 'people' && card.preferences) {
      extraLines.push(`<div><strong>Preferences:</strong> ${escapeHtml(card.preferences)}</div>`);
    }
    if (card.type === 'special' && card.specialSubtype) {
      extraLines.push(`<div><strong>Subtype:</strong> ${escapeHtml(String(card.specialSubtype).toUpperCase())}</div>`);
    }
    if (card.notes) {
      extraLines.push(`<div><strong>Notes:</strong> ${escapeHtml(card.notes)}</div>`);
    } else if (card.type === 'special') {
      extraLines.push(`<div><strong>Notes:</strong> ${escapeHtml(specialCardEffectText(card))}</div>`);
    }

    return `
      <article class="roster-card">
        ${cardPhotoMarkup(card, 'card-photo')}
        <div class="roster-copy">
          <div class="card-badge ${badgeClass}" style="margin-bottom: 2px;">${badgeLabel}</div>
          <div class="card-title" style="margin-bottom: 0;">${escapeHtml(card.name)}</div>
          <div class="card-meta">${metaLine}</div>
          <div class="card-notes" style="margin-top: 4px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
          ${tags}
          ${extraLines.length ? `<div class="roster-info">${extraLines.join('')}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderRoster() {
    if (!els.rosterOverlay || !els.rosterGrid || !els.rosterMeta || !els.rosterCount) return;
    const type = state.rosterType || 'business';
    const cards = rosterSourceCards(type);
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    els.rosterMeta.textContent = `${title} cards are shown without filenames, and location is shown separately from visible categories.`;
    els.rosterCount.textContent = `${cards.length} card${cards.length === 1 ? '' : 's'}`;
    els.rosterGrid.innerHTML = cards.length
      ? cards.map((card) => renderRosterCard(card)).join('')
      : '<div class="roster-empty">No cards found for this category.</div>';
    els.rosterTabs.forEach((button) => {
      button.classList.toggle('active', button.dataset.rosterType === type);
    });
  }

  function openRoster(type = state.rosterType || 'business') {
    state.rosterType = type;
    state.rosterOpen = true;
    renderRoster();
    if (els.rosterOverlay) els.rosterOverlay.hidden = false;
  }

  function closeRoster() {
    state.rosterOpen = false;
    if (els.rosterOverlay) els.rosterOverlay.hidden = true;
  }

  function openPhotoViewer(src, title, meta) {
    if (!els.photoViewerOverlay || !els.photoViewerImage || !src) return;
    state.photoViewerOpen = true;
    els.photoViewerImage.src = src;
    els.photoViewerImage.alt = title || 'Card photo';
    if (els.photoViewerTitle) els.photoViewerTitle.textContent = title || 'Card photo';
    if (els.photoViewerMeta) els.photoViewerMeta.textContent = meta || '';
    els.photoViewerOverlay.hidden = false;
  }

  function closePhotoViewer() {
    state.photoViewerOpen = false;
    if (els.photoViewerOverlay) els.photoViewerOverlay.hidden = true;
    if (els.photoViewerImage) {
      els.photoViewerImage.src = '';
    }
  }

  function hasTag(card, tag) {
    return Boolean(card && (card.tags || []).some((entry) => normalize(entry) === normalize(tag)));
  }

  const HIDDEN_CARD_TAGS = new Set([
    'story',
    'female',
    'pepperville',
    'pepperville historic district',
    'pepperville riverwalk',
    'st hilton',
    'noel',
    'ringwald',
    'wakona',
    'pepper hill',
    'rural',
  ]);

  function cardCategories(card) {
    return (card?.tags || []).filter((tag) => !HIDDEN_CARD_TAGS.has(normalize(tag)));
  }

  function cardCategoriesMarkup(card, className = 'card-notes', label = 'Categories') {
    const categories = cardCategories(card);
    if (!categories.length) return '';
    return `<div class="${className}" style="margin-top: 8px;">${escapeHtml(label)}: ${escapeHtml(categories.join('; '))}</div>`;
  }

  function cardLocations(card) {
    const locationTags = new Set([
      'story',
      'pepperville',
      'pepperville historic district',
      'pepperville riverwalk',
      'st hilton',
      'noel',
      'ringwald',
      'wakona',
      'pepper hill',
      'rural',
    ]);
    return (card?.tags || []).filter((tag) => locationTags.has(normalize(tag)));
  }

  function cardHasLocation(card, location) {
    const target = normalize(location);
    return cardLocations(card).some((entry) => normalize(entry) === target);
  }

  function cityHasRestaurantInLocation(city, location) {
    return (city?.cards || []).some((entry) => hasTag(entry, 'Restaurant') && cardHasLocation(entry, location));
  }

  function cardLocationMarkup(card, className = 'card-notes') {
    const locations = cardLocations(card);
    const value = locations.length ? locations.join('; ') : 'Unassigned';
    return `<div class="${className}" style="margin-top: 8px;">Location: ${escapeHtml(value)}</div>`;
  }

  function formatRevenueRuleHtml(revenue) {
    if (!revenue) return 'No revenue rule provided';
    const text = String(revenue).replace(/\s*=\s*/g, '=').replace(/\s*;\s*/g, '; ');
    return text.split('; ').map((segment) => {
      const [leftRaw, rightRaw] = segment.split('=');
      const left = escapeHtml((leftRaw || '').trim());
      const right = escapeHtml((rightRaw || '').trim());
      const numericMatch = right.match(/^(-?\d+)R(?:\b|$)/i);
      const isPerTurnNegative = /^-R\s*per\s*turn$/i.test(rightRaw || leftRaw || '') || /^-1R\s*per\s*turn$/i.test(rightRaw || leftRaw || '');
      const amount = numericMatch ? Number(numericMatch[1]) : null;
      const color = amount === null
        ? (isPerTurnNegative ? 'var(--bad)' : 'inherit')
        : amount > 0
          ? 'var(--good)'
          : amount < 0
            ? 'var(--bad)'
            : 'inherit';
      const segmentHtml = rightRaw !== undefined
        ? `${left}=${right}`
        : left;
      return `<span style="color: ${color};">${segmentHtml}</span>`;
    }).join('<span style="color: #222;"> • </span>');
  }

  function isNegativePeopleCard(card) {
    return Boolean(card && card.type === 'people' && Number(card.value || 0) < 0);
  }

  function isNegativeAnimalCard(card) {
    return isNegativePeopleCard(card) && hasTag(card, 'Animal');
  }

  function jailCardsFromCity(player, predicate, reason, limit = Infinity) {
    if (!player || typeof predicate !== 'function') return [];

    const removed = [];
    for (let i = player.cards.length - 1; i >= 0 && removed.length < limit; i -= 1) {
      const card = player.cards[i];
      if (!predicate(card)) continue;
      player.cards.splice(i, 1);
      applyPopulationChange(player, -Number(card.value || 0), reason || card.name);
      state.discard.push(card);
      removed.push(card);
    }
    return removed;
  }

  function pluralize(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function rollDie(sides = 6) {
    return 1 + Math.floor(Math.random() * sides);
  }

  function roll2d6() {
    return rollDie(6) + rollDie(6);
  }

  function parseRangeCondition(condition) {
    const text = String(condition || '').trim().toLowerCase();
    if (text.includes('or more businesses')) {
      const match = text.match(/^(\d+)\s*or\s*more\s*businesses$/);
      return match ? { type: 'businessesAtLeast', min: Number(match[1]) } : null;
    }

    const plus = text.match(/^(\d+)\s*\+$/);
    if (plus) {
      return { type: 'populationAtLeast', min: Number(plus[1]) };
    }

    const range = text.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      return {
        type: 'populationRange',
        min: Number(range[1]),
        max: Number(range[2]),
      };
    }

    const spacedRange = text.match(/^(\d+)\s+(\d+)$/);
    if (spacedRange && text.includes(' ')) {
      return {
        type: 'populationRange',
        min: Number(spacedRange[1]),
        max: Number(spacedRange[2]),
      };
    }

    return null;
  }

  function parseRevenueUnits(revenueText, city) {
    const text = String(revenueText || '').trim();
    if (!text || text === 'special') return null;

    if (/^-?\d+R per turn$/i.test(text)) {
      return Number(text.replace(/R per turn/i, '').replace(/\s+/g, ''));
    }

    if (/^-R per turn$/i.test(text)) {
      return -1;
    }

    const segments = text.split(';').map((part) => part.trim()).filter(Boolean);
    if (!segments.length) return null;

    const rules = segments
      .map((segment) => {
        const match = segment.match(/^(.*?)=\s*([+-]?\d+)R$/i);
        if (!match) return null;
        return {
          condition: parseRangeCondition(match[1].trim()),
          units: Number(match[2]),
        };
      })
      .filter(Boolean);

    if (!rules.length) return null;

    const cityPopulation = city.population;
    const businessCount = city.cards.filter((card) => card.type === 'business').length;

    for (const rule of rules) {
      const condition = rule.condition;
      if (!condition) continue;
      if (condition.type === 'populationAtLeast' && cityPopulation >= condition.min) return rule.units;
      if (condition.type === 'populationRange' && cityPopulation >= condition.min && cityPopulation <= condition.max) {
        return rule.units;
      }
      if (condition.type === 'businessesAtLeast' && businessCount >= condition.min) return rule.units;
    }

    return null;
  }

  function getPlayerName(player) {
    return player?.name || 'Unknown';
  }

  function makePlayer(name, seat) {
    return {
      seat,
      name,
      isHuman: seat === 0,
      strategy: auctionStrategyForSeat(seat),
      cash: startingCash,
      population: 0,
      cards: [],
      specials: {
        countyShield: 0,
        spiderProtection: false,
        pressPending: null,
        jailNegativePeople: 0,
        jailNegativeAnimals: false,
      },
      turnIncome: 0,
      incomeBreakdown: [],
    };
  }

  function createDeck() {
    const businesses = data.businesses.map((card) => cloneCard(card, 'business'));
    const people = data.people.map((card) => cloneCard(card, 'people'));
    return shuffle([...businesses, ...people]);
  }

  function resetGame() {
    cancelPeopleBattle();
    cancelCardResolution();
    cancelSpecialSequence();
    cancelGiantSpiderSequence();
    cancelBlindLuckSequence();
    cancelEndRound();
    closeRoster();
    closePhotoViewer();
    state.started = false;
    state.round = 0;
    state.deck = [];
    state.discard = [];
    state.turnQueue = [];
    state.currentCard = null;
    state.currentStage = 'setup';
    state.actionContext = null;
    state.awaitingNextCard = false;
    state.players = [];
    state.pendingPeople = [];
    state.winner = null;
    state.lastAnnouncement = null;
    state.initialDeckSize = 0;
    if (state.auctionAutoplayTimer) {
      clearTimeout(state.auctionAutoplayTimer);
      state.auctionAutoplayTimer = null;
    }
    if (state.pityFairyAudio) {
      state.pityFairyAudio.pause();
      state.pityFairyAudio.currentTime = 0;
      state.pityFairyAudio = null;
    }
    if (state.blindLuckTimer) {
      clearTimeout(state.blindLuckTimer.id);
      state.blindLuckTimer.resolve(false);
      state.blindLuckTimer = null;
    }
    state.log = [];
    log('Pepperville table reset. Ready to start a new game.');
    render();
  }

  function startGame() {
    cancelPeopleBattle();
    cancelCardResolution();
    cancelSpecialSequence();
    cancelGiantSpiderSequence();
    cancelBlindLuckSequence();
    cancelEndRound();
    closeRoster();
    closePhotoViewer();
    const playerCount = 4;
    els.playerCount.value = '4';
    const players = [];
    for (let i = 0; i < playerCount; i += 1) {
      const name = els.playerNameInputs[i].value.trim() || `Player ${i + 1}`;
      players.push(makePlayer(name, i));
    }

    state.started = true;
    state.round = 0;
    state.deck = createDeck();
    state.initialDeckSize = state.deck.length;
    state.discard = [];
    state.turnQueue = [];
    state.currentCard = null;
    state.currentStage = 'idle';
    state.actionContext = null;
    state.awaitingNextCard = false;
    state.players = players;
    state.pendingPeople = [];
    state.winner = null;
    state.lastAnnouncement = null;
    state.log = [];

    log(`Game started with ${pluralize(players.length, 'City Manager')}. Starting cash is ${money(startingCash)} each.`);
    beginRound();
  }

  function beginRound() {
    if (!state.started) return;
    if (state.winner) return;

    cancelEndRound();
    state.round += 1;
    state.turnQueue = state.deck.splice(0, 8);
    state.currentCard = null;
    state.currentStage = 'round-ready';
    state.actionContext = null;
    state.awaitingNextCard = false;
    cancelBlindLuckSequence();

    log(`Round ${state.round} begins. Drew ${state.turnQueue.length} card${state.turnQueue.length === 1 ? '' : 's'} for this turn.`);
    if (!state.turnQueue.length) {
      log('The deck is empty. Proceed to income if you still have cards in play.', 'warn');
    }

    state.currentStage = 'ready-to-reveal';
    render();
  }

  function cityFeatures(city) {
    const features = new Set();
    const cards = city.cards;

    for (const card of cards) {
      const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
      const name = normalize(card.name);
      const notes = normalize(card.notes);

      features.add(name);
      if (name.includes('pepper') || notes.includes('pepper')) features.add('pepper');
      if (name.includes('wakona') || notes.includes('wakona')) features.add('wakona');
      if (name.includes('noel') || notes.includes('noel')) features.add('noel');
      if (name.includes('ringwald') || notes.includes('ringwald')) features.add('ringwald');
      if (name.includes('pepperville') || notes.includes('pepperville')) features.add('pepperville');
      if (name.includes('st. hilton') || notes.includes('st. hilton') || name.includes('st hilton') || notes.includes('st hilton')) features.add('st hilton');
      for (const token of name.split(' ')) {
        if (token) features.add(token);
      }

      if (text.includes('mall') || text.includes('shopping center') || text.includes('shopping') || text.includes('boutique') || text.includes('store') || text.includes('shop') || text.includes('retail')) {
        features.add('retail');
      }
      if (text.includes('mall')) features.add('mall');
      if (text.includes('restaurant') || text.includes('cafe') || text.includes('diner') || text.includes('grill') || text.includes('pizza') || text.includes('tavern') || text.includes('bar') || text.includes('bakery') || text.includes('ice cream')) {
        features.add('restaurant');
      }
      if (text.includes('library') || text.includes('book')) features.add('library');
      if (text.includes('church') || text.includes('cathedral') || text.includes('pastor')) features.add('church');
      if (text.includes('school') || text.includes('academy') || text.includes('college') || text.includes('day care') || text.includes('tutoring') || text.includes('learning')) features.add('education');
      if (text.includes('dental') || text.includes('dentist') || text.includes('smile center')) features.add('dental');
      if (text.includes('beauty') || text.includes('salon') || text.includes('spa') || text.includes('barber') || text.includes('makeup') || text.includes('cosmetic')) features.add('beauty');
      if (text.includes('jewelry') || text.includes('jewelers') || text.includes('jeweler')) features.add('jewelry');
      if (text.includes('media') || text.includes('publication') || text.includes('publications') || text.includes('tv station') || text.includes('tv stations') || text.includes('television') || text.includes('radio') || text.includes('radio station') || text.includes('radio stations') || text.includes('news') || text.includes('broadcast') || text.includes('newspaper') || text.includes('newspapers') || text.includes('magazine')) {
        features.add('media');
      }
      if (text.includes('medical') || text.includes('doctor') || text.includes('physician') || text.includes('clinic') || text.includes('hospital') || text.includes('pharmacy') || text.includes('medical building') || text.includes('medical center') || text.includes('medical office') || text.includes('medical practice') || text.includes('eye clinic')) features.add('medical');
      if (text.includes('park') || text.includes('plaza') || text.includes('fountain') || text.includes('fairgrounds') || text.includes('riverwalk')) features.add('park');
      if (features.has('park')) features.add('nature');
      if (text.includes('nature') || text.includes('forest') || text.includes('lake') || text.includes('garden') || text.includes('outdoor') || text.includes('trail')) features.add('nature');
      if ((card.tags || []).some((tag) => normalize(tag) === 'tourist attraction') || text.includes('tourist attraction') || text.includes('amusement park') || text.includes('winery') || text.includes('riverwalk') || text.includes('clock tower') || text.includes('chapel') || text.includes('fairgrounds') || text.includes('museum') || text.includes('zoo') || text.includes('recreation area') || text.includes('heritage museum')) {
        features.add('tourist attraction');
      }
      if (/\b(event|events|festival|fair)\b/.test(text) || text.includes('fairgrounds')) features.add('events');
      if (text.includes('airport') || text.includes('railroad') || text.includes('railway') || text.includes('train') || text.includes('terminal') || text.includes('transit') || text.includes('transport') || text.includes('bus') || text.includes('taxi') || text.includes('rideshare') || text.includes('mover') || text.includes('truckstop') || text.includes('shuttle') || text.includes('station')) {
        features.add('transportation');
      }
      if (text.includes('st. hilton') || text.includes('st hilton')) features.add('st hilton');
      if (text.includes('animal') || text.includes('zoo') || text.includes('pet') || text.includes('dog') || text.includes('cat') || text.includes('horse') || text.includes('forest') || text.includes('farm')) features.add('animal');
      if (text.includes('historic') || text.includes('history museum') || text.includes('original settlers') || text.includes('time travel') || text.includes('founding father') || text.includes('president') || text.includes('explorer') || text.includes('pharaoh') || text.includes('emperor') || text.includes('queen') || text.includes('outlaw') || text.includes('pirate') || text.includes('war chief') || text.includes('legendary inhabitant')) {
        features.add('historic');
      }
      if (text.includes('egypt')) {
        features.add('egypt');
      }
      if (text.includes('egypt') || text.includes('egyptian') || text.includes('pharaoh') || text.includes('sphinx') || text.includes('pyramid') || text.includes('nile')) {
        features.add('egyptian');
      }
      if (text.includes('myth') || text.includes('mythical') || text.includes('unicorn') || text.includes('sphinx') || text.includes('fairytale') || text.includes('legendary') || text.includes('storybook')) {
        features.add('mythical');
      }
      if (text.includes('monster') || text.includes('cryptid') || text.includes('sabre toothed werepanther') || text.includes('sasquatch') || text.includes('bigfoot') || text.includes('river monster') || text.includes('werepanther')) {
        features.add('monster');
      }
      if (text.includes('government') || text.includes('courthouse') || text.includes('county') || text.includes('mayor') || text.includes('commissioner') || text.includes('chief') || text.includes('president') || text.includes('sheriff') || text.includes('city manager') || text.includes('law enforcement') || text.includes('police') || text.includes('chamber of commerce')) {
        features.add('government');
      }
      if (text.includes('attorney') || text.includes('law office') || text.includes('law firm') || text.includes('lawyer')) features.add('attorneys');
      if (text.includes('bank') || text.includes('banks') || text.includes('banking')) features.add('bank');
      if (text.includes('pest control') || text.includes('exterminator') || text.includes('rid-a-pest')) features.add('pest control');
      if (text.includes('real estate') || text.includes('realtor') || text.includes('realty') || text.includes('mortgage')) features.add('real estate');
      if (text.includes('formal wear') || text.includes('bridal') || text.includes('prom') || text.includes('tuxedo')) features.add('formal wear');
      if (text.includes('sports') || text.includes('golf') || text.includes('gymnastics') || text.includes('wrestling') || text.includes('speedway') || text.includes('mini golf') || text.includes('country club') || text.includes('stadium') || text.includes('arena') || text.includes('race track')) {
        features.add('sports');
      }
      if (text.includes('liberty') || text.includes('freedom') || text.includes('patriotic') || text.includes('founding father')) {
        features.add('patriotic');
      }
      if (text.includes('automotive') || text.includes('auto') || text.includes('car') || text.includes('tire') || text.includes('speedway') || text.includes('railroad') || text.includes('truckstop')) features.add('automotive');
      if (text.includes('museum') || text.includes('arts') || text.includes('art center') || text.includes('arts center') || text.includes('amphitheater') || text.includes('theater') || text.includes('theatre') || text.includes('playhouse') || text.includes('performing arts')) {
        features.add('arts');
      }
      if (text.includes('music') || text.includes('musician') || text.includes('singer') || text.includes('singing') || text.includes('glee club') || text.includes('concert') || text.includes('band') || text.includes('dj')) features.add('music');
      if (/\bhat(s)?\b/.test(text) || text.includes('hatter') || text.includes('fedora') || text.includes('headwear') || text.includes('helmet')) features.add('hats');
      if (text.includes('french') || text.includes('paris') || text.includes('cajun')) features.add('french');
      if (text.includes('sailor') || text.includes('pirate') || text.includes('pirates') || text.includes('ship') || text.includes('sea') || text.includes('ocean')) features.add('sailors');
      if (text.includes('clown')) features.add('clown');
      if (text.includes('santa') || text.includes('elf') || text.includes('christmas') || text.includes('toy')) features.add('santa');
      if (text.includes('casino')) features.add('casino');
      if (text.includes('water') || text.includes('lake') || text.includes('river') || text.includes('bridge') || text.includes('fountain')) features.add('water');
      if ((card.tags || []).some((tag) => normalize(tag) === 'children') || /children|child|teen|youth/.test(normalize([card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' ')))) {
        features.add('children');
      }
      if (text.includes('insurance')) features.add('insurance');
      if (text.includes('air conditioning') || text.includes('heating and air') || text.includes('heating & air')) features.add('air conditioning');
      if ((card.tags || []).some((tag) => normalize(tag) === 'story')) features.add('story');
    }

    return features;
  }

  function isHistoricPeopleCard(card) {
    if (!card || card.type !== 'people') return false;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    return (
      (card.tags || []).some((tag) => normalize(tag) === 'historic')
      || text.includes('historic')
      || text.includes('history museum')
      || text.includes('original settlers')
      || text.includes('time travel')
      || text.includes('founding father')
      || text.includes('president')
      || text.includes('explorer')
      || text.includes('pharaoh')
      || text.includes('emperor')
      || text.includes('queen')
      || text.includes('outlaw')
      || text.includes('pirate')
      || text.includes('war chief')
      || text.includes('legendary inhabitant')
    );
  }

  function peoplePreferenceTokens(card) {
    return String(card.preferences || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function isFemaleCard(card) {
    if (!card) return false;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    return /woman|girl|lady|queen|heiress|teacher|nurse|singer|reporter|greeter|princess|deerfoot|sweet|st\.|miss|mrs|ms/.test(text);
  }

  function femaleCardCount(city) {
    if (!city?.cards?.length) return 0;
    return city.cards.filter((entry) => isFemaleCard(entry) || /female/i.test(normalize(entry.notes))).length;
  }

  function countMatchingPreferenceCards(token, city) {
    if (!city?.cards?.length) return 0;
    const cleaned = cleanedPreferenceText(token);
    if (!cleaned) return 0;
    const cleanedNormalized = normalize(cleaned);

    if (cleanedNormalized === 'story unicorn habitat') {
      return city.cards.filter((card) => normalize(card.name).includes('story unicorn habitat')).length;
    }

    const isChildrenPreference = /\bchildren\b|\bchild\b|\bkids?\b|\byouth\b/.test(cleanedNormalized);
    if (isChildrenPreference) {
      return city.cards.reduce((count, card) => {
        const virtualCity = { cards: [card] };
        const features = cityFeatures(virtualCity);
        if (!tokenMatchesFeature(cleaned, features, virtualCity)) return count;
        return count + Number(card.childrenCount || 1);
      }, 0);
    }

    return city.cards.reduce((count, card) => {
      const virtualCity = { cards: [card] };
      const features = cityFeatures(virtualCity);
      return count + (tokenMatchesFeature(cleaned, features, virtualCity) ? 1 : 0);
    }, 0);
  }

  function preferenceTokenScore(token, city) {
    const normalized = normalize(token);
    if (!normalized) return 0;
    const isNegative = /^-?1\s*for\b/i.test(token);
    const cleaned = token.replace(/^-?1\s*for\s*/i, '').replace(/^-\s*/i, '').trim();
    const cleanedNormalized = normalize(cleaned);

    if (/\bfemale(s)?\b/.test(cleanedNormalized)) {
      const count = femaleCardCount(city);
      return isNegative ? -count : count;
    }

    const count = countMatchingPreferenceCards(cleaned, city);
    if (!count) return 0;
    return isNegative ? -count : count;
  }

  function tokenMatchesFeature(token, features, city) {
    const normalized = normalize(token);
    if (!normalized) return false;

    const compact = normalized.replace(/\b(and|or|the|with|for|each|any|in|of|a|an|to|on)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const searchSpace = [...features];

    if (searchSpace.some((feature) => feature === normalized || normalized.includes(feature) || feature.includes(normalized))) {
      return true;
    }

    const ruleMap = [
      { pattern: /retail|shopping/, feature: 'retail' },
      { pattern: /mall/, feature: 'retail' },
      { pattern: /restaurant|bakery|ice cream|diner|cafe|bar|tavern|grill|pizza/, feature: 'restaurant' },
      { pattern: /library|book/, feature: 'library' },
      { pattern: /church|pastor|cathedral/, feature: 'church' },
      { pattern: /school|academy|college|day care|tutoring|learning|education/, feature: 'education' },
      { pattern: /dentist|dental|smile center/, feature: 'dental' },
      { pattern: /beauty|salon|spa|barber|makeup|cosmetic/, feature: 'beauty' },
      { pattern: /jewelry|jewelers|jeweler/, feature: 'jewelry' },
      { pattern: /media|publication|publications|tv station|tv stations|television|radio|radio station|radio stations|news|broadcast|newspaper|newspapers|magazine/, feature: 'media' },
      { pattern: /medical|doctor|physician|clinic|hospital|pharmacy|medical building|medical center|medical office|medical practice|eye clinic/, feature: 'medical' },
      { pattern: /park|plaza|fountain|fairgrounds|riverwalk/, feature: 'nature' },
      { pattern: /nature|forest|lake|garden|outdoor|trail/, feature: 'nature' },
      { pattern: /\b(event|events|festival|fair)\b|fairgrounds/, feature: 'events' },
      { pattern: /airport|railroad|railway|train|terminal|transit|transport|bus|taxi|rideshare|mover|truckstop|shuttle|station/, feature: 'transportation' },
      { pattern: /noel/, feature: 'noel' },
      { pattern: /wakona/, feature: 'wakona' },
      { pattern: /ringwald/, feature: 'ringwald' },
      { pattern: /pepperville/, feature: 'pepperville' },
      { pattern: /st\.?\s*hilton/, feature: 'st hilton' },
      { pattern: /animal|zoo|pet|dog|cat|horse|forest|farm/, feature: 'animal' },
      { pattern: /historic|history museum|original settlers|time travel|founding father|president|explorer|pharaoh|emperor|queen|outlaw|pirate|war chief|legendary inhabitant/, feature: 'historic' },
      { pattern: /egypt|egyptian/, feature: 'egyptian' },
      { pattern: /egypt|egyptian|pharaoh|sphinx|pyramid|nile/, feature: 'egyptian' },
      { pattern: /myth|mythical|unicorn|sphinx|fairytale|legendary|storybook/, feature: 'mythical' },
      { pattern: /monster|cryptid|sabre toothed werepanther|sasquatch|bigfoot|river monster|werepanther/, feature: 'monster' },
      { pattern: /government|courthouse|county|mayor|commissioner|law enforcement|police|sheriff|chamber of commerce/, feature: 'government' },
      { pattern: /chief|president|presidents|mayor|commissioner|sheriff/, feature: 'government' },
      { pattern: /attorney|law office|law firm|lawyer/, feature: 'attorneys' },
      { pattern: /pest control|exterminator|rid-a-pest/, feature: 'pest control' },
      { pattern: /real estate|realtor|realty|mortgage/, feature: 'real estate' },
      { pattern: /formal wear|bridal|prom|tuxedo/, feature: 'formal wear' },
      { pattern: /sports|golf|gymnastics|wrestling|speedway|mini golf|country club|stadium|arena|race track/, feature: 'sports' },
      { pattern: /patriotic|liberty|freedom|founding father/, feature: 'patriotic' },
      { pattern: /automotive|auto|car|tire|speedway|railroad|truckstop/, feature: 'automotive' },
      { pattern: /museum|arts|art center|arts center|amphitheater|theater|theatre|playhouse|performing arts/, feature: 'arts' },
      { pattern: /music|musician|singer|singing|glee club|concert|band|dj/, feature: 'music' },
      { pattern: /\bhat(s)?\b|\bhatter\b|\bfedora\b|\bheadwear\b|\bhelmet\b/, feature: 'hats' },
      { pattern: /french|paris|cajun/, feature: 'french' },
      { pattern: /sailor|sailors|pirate|pirates|ship|sea|ocean/, feature: 'sailors' },
      { pattern: /clown|clowns/, feature: 'clown' },
      { pattern: /santa|elf|christmas|toy/, feature: 'santa' },
      { pattern: /children under 18|children|child|kids|kid|teen|youth/, feature: 'children' },
      { pattern: /casino/, feature: 'casino' },
      { pattern: /water|lake|river|bridge|fountain/, feature: 'water' },
      { pattern: /insurance/, feature: 'insurance' },
      { pattern: /air conditioning|heating and air|heating & air/, feature: 'air conditioning' },
      { pattern: /historic americans/, feature: 'historic' },
      { pattern: /people with pepper|pepperville|pepper/, feature: 'pepper' },
      { pattern: /wakona/, feature: 'wakona' },
      { pattern: /female/, feature: 'female' },
      { pattern: /law enforcement personnel/, feature: 'government' },
      { pattern: /local government officials/, feature: 'government' },
      { pattern: /medical & dental facilities & personnel|medical and dental offices and personnel|medical and dental practice|medical office buildings|medical practices|physicians|doctors|hospitals|pharmacies/, feature: 'medical' },
      { pattern: /animals/, feature: 'animal' },
      { pattern: /mythical|myth|unicorn|sphinx|fairytale|legendary|storybook/, feature: 'mythical' },
      { pattern: /monster|cryptid|sabre toothed werepanther|sasquatch|bigfoot|river monster|werepanther/, feature: 'monster' },
      { pattern: /park system/, feature: 'park' },
    ];

    for (const rule of ruleMap) {
      if (rule.pattern.test(normalized) && features.has(rule.feature)) {
        return true;
      }
    }

    if (normalized.includes('anything located in or related to the wakona nation')) {
      return [...features].some((feature) => feature.includes('wakona'));
    }

    if (normalized.includes('historic americans')) {
      return features.has('historic');
    }

    if (normalized.includes('city with the most people or places containing pepper or pepperville')) {
      const countPepper = city.cards.filter((card) => /pepper/i.test(card.name) || /pepperville/i.test(card.name)).length;
      return countPepper > 0;
    }

    if (normalized.includes('anything with a body of water') || normalized.includes('even a fountain')) {
      return features.has('water');
    }

    return Boolean(compact && searchSpace.some((feature) => compact.includes(feature) || feature.includes(compact)));
  }

  function scorePeopleCard(card, city) {
    if (normalize(card.name) === 'mullet man jr.' && city.cards.some((entry) => normalize(entry.name) === 'mullet man')) {
      return 999;
    }
    let score = 0;

    for (const token of peoplePreferenceTokens(card)) {
      score += preferenceTokenScore(token, city);
    }

    return score;
  }

  function matchedPreferenceTokens(card, city) {
    const matches = [];

    for (const token of peoplePreferenceTokens(card)) {
      if (preferenceTokenScore(token, city) !== 0) {
        matches.push(token);
      }
    }

    return matches;
  }

  function cardFlavorText(card) {
    if (!card) return '';
    if (normalize(card.name) === 'ciera st hilton') {
      return '<div class="card-notes" style="margin-top: 8px;">Accomplished artist trained by some of the finest artists in the world.</div>';
    }
    return '';
  }

  function businessMatchesPendingPeople(businessCard) {
    if (!businessCard || businessCard.type !== 'business' || !state.pendingPeople.length) return [];
    const virtualCity = { cards: [businessCard] };
    return state.pendingPeople.filter((pending) => matchedPreferenceTokens(pending, virtualCity).length > 0);
  }

  function formatAttractedPendingPeople(cards) {
    const names = cards.map((card) => {
      const value = Number(card.value || 0);
      return value ? `${card.name} (${value > 0 ? '+' : ''}${value})` : card.name;
    });
    if (!names.length) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names[0]} and ${names.length - 1} more people`;
  }

  function cleanedPreferenceText(token) {
    return String(token || '')
      .replace(/^-?1\s*for\s*/i, '')
      .replace(/^-\s*/i, '')
      .trim();
  }

  function preferenceRowDelta(token, city) {
    return preferenceTokenScore(token, city);
  }

  function createPeopleBattle(card) {
    const rows = peoplePreferenceTokens(card).map((token) => ({
      token,
      label: cleanedPreferenceText(token),
      deltas: state.players.map((player) => preferenceRowDelta(token, player)),
    }));

    return {
      card,
      rows,
      totals: state.players.map(() => 0),
      bumpedPlayers: state.players.map(() => false),
      visibleRows: 0,
      activeRowIndex: -1,
      finished: false,
      winnerIndex: null,
      tiebreak: null,
      resultText: '',
      resultTone: 'normal',
    };
  }

  function clonePeopleBattleForDisplay(battle) {
    if (!battle) return null;
    return JSON.parse(JSON.stringify(battle));
  }

  function formatBattleDelta(delta) {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return String(delta);
    return '0';
  }

  function renderPeopleBattle(battle = state.peopleBattle) {
    if (!battle || !state.currentCard || state.currentCard.type !== 'people') return '';

    const playerCount = state.players.length;
    const playerColumns = state.players.map((player) => `<div class="battle-total-label">${escapeHtml(player.name)}</div>`).join('');
    const rows = battle.rows.length
      ? battle.rows.map((row, index) => {
          const revealed = index < battle.visibleRows;
          const active = index === battle.activeRowIndex;
          return `
            <div class="battle-row ${revealed ? 'revealed' : ''} ${active ? 'active' : ''}">
              <div class="battle-row-label">${escapeHtml(row.label || row.token)}</div>
              ${row.deltas.map((delta) => {
                const classes = ['battle-cell'];
                if (!revealed) {
                  classes.push('miss');
                } else if (delta > 0) {
                  classes.push('match');
                } else if (delta < 0) {
                  classes.push('negative');
                } else {
                  classes.push('miss');
                }
                return `<div class="${classes.join(' ')}">${revealed ? formatBattleDelta(delta) : '•'}</div>`;
              }).join('')}
            </div>
          `;
        }).join('')
      : '<div class="battle-result warn">This card has no preference rows to resolve.</div>';

    const totals = battle.totals.map((total, index) => {
      const bumped = Boolean(battle.bumpedPlayers?.[index]);
      const classes = ['battle-total-value'];
      if (bumped) {
        classes.push('bump');
      }
      return `<div class="${classes.join(' ')}">${total}</div>`;
    }).join('');

    const battleResult = battle.finished
      ? `<div class="battle-result ${battle.resultTone === 'warn' ? 'warn' : ''}">${escapeHtml(battle.resultText || '')}</div>`
      : `<div class="battle-note">Rows resolve left to right. The totals update after each row lands.</div>`;

    return `
      <div class="battle-screen">
        <div class="battle-header">
          <div class="battle-title">
            ${cardPhotoMarkup(battle.card, 'battle-card-photo')}
          </div>
          <div class="battle-copy">
            <div class="battle-kicker">Preference Battle</div>
            <h3>${escapeHtml(battle.card.name)}</h3>
            <p class="battle-subtitle">${escapeHtml(battle.card.occupation || 'People card')} - ${escapeHtml(battle.card.value >= 0 ? `+${battle.card.value}` : String(battle.card.value))} population</p>
            <div class="battle-note">${escapeHtml(battle.rows.length ? `${battle.rows.length} preference${battle.rows.length === 1 ? '' : 's'} to resolve` : 'No preferences listed')}</div>
          </div>
        </div>

        <div class="battle-scoreboard" style="--player-count: ${playerCount};">
          <div class="battle-scoreboard-head">
            <div>Preference</div>
            ${playerColumns}
          </div>
          ${rows}
          <div class="battle-totals">
            <div class="battle-total-label">Total</div>
            ${totals}
          </div>
        </div>

        ${battleResult}
      </div>
    `;
  }

  function citiesWithMatches(card) {
    return state.players
      .map((player, index) => ({ player, index, score: scorePeopleCard(card, player) }))
      .filter((entry) => entry.score > 0);
  }

  function totalPeopleInCity(city) {
    return city.cards.reduce((sum, card) => sum + (card.type === 'people' || card.type === 'business' ? Number(card.value || 0) : 0), 0);
  }

  function cityPopulation(city) {
    return city.cards.reduce((sum, card) => sum + Number(card.value || 0), 0);
  }

  function cityBusinessCards(city) {
    return city.cards.filter((card) => card.type === 'business');
  }

  function cityPeopleCards(city) {
    return city.cards.filter((card) => card.type === 'people');
  }

  function citySummary(city) {
    return {
      population: city.population,
      businesses: cityBusinessCards(city).length,
      people: cityPeopleCards(city).length,
      revenueUnits: cityRevenueUnits(city),
    };
  }

  function cityRevenueBreakdown(city) {
    return cityBusinessCards(city).map((card) => {
      const baseUnits = parseRevenueUnits(card.revenue, city);
      if (!Number.isFinite(baseUnits)) {
        return {
          label: `${card.name}: special`,
          tone: 'neutral',
          units: 0,
        };
      }
      const bonusUnits = revenueBonusUnits(city, card);
      const totalUnits = baseUnits + bonusUnits;
      const prefix = totalUnits > 0 ? '+' : '';
      const tone = totalUnits > 0 ? 'positive' : totalUnits < 0 ? 'negative' : 'neutral';
      return {
        label: `${card.name}: ${totalUnits === 0 ? '0R' : `${prefix}${totalUnits}R`}`,
        tone,
        units: totalUnits,
      };
    });
  }

  function cityRevenueUnits(city) {
    return cityBusinessCards(city).reduce((sum, card) => {
      const units = parseRevenueUnits(card.revenue, city);
      const bonusUnits = Number.isFinite(units) ? revenueBonusUnits(city, card) : 0;
      return sum + (Number.isFinite(units) ? units + bonusUnits : 0);
    }, 0);
  }

  function evaluateCityIncome(city) {
    const businessCards = cityBusinessCards(city);
    let revenueUnits = 0;
    let cash = 0;
    let population = 0;
    const specialLines = [];

    for (const card of businessCards) {
      const special = specialIncome(card, city);
      cash += Number(special.cash || 0);
      population += Number(special.population || 0);

      const text = String(card.revenue || '');
      const baseUnits = parseRevenueUnits(text, city);
      if (text === 'special' || baseUnits === null || Number.isNaN(baseUnits)) {
        continue;
      }

      const bonusUnits = revenueBonusUnits(city, card);
      const units = baseUnits + bonusUnits;
      revenueUnits += units;
      specialLines.push(`${card.name}: ${units > 0 ? '+' : ''}${units}R`);
    }

    const roll = revenueUnits === 0 ? null : roll2d6();
    let revenueCash = 0;
    if (roll !== null) {
      const chartRow = REVENUE_CHART[Math.min(30, Math.max(1, Math.abs(revenueUnits)))];
      const chartCash = chartRow?.[roll] ?? 0;
      revenueCash = revenueUnits < 0 ? -chartCash : chartCash;
      cash += revenueCash;
    }

    return {
      cash,
      population,
      revenueUnits,
      roll,
      revenueCash,
      specialLines,
    };
  }

  function isReactorCard(card) {
    return Boolean(card && /chattawa valley reactor/i.test(card.name));
  }

  function isPoolCard(card) {
    return Boolean(card && /poorly maintained pool/i.test(card.name));
  }

  function isGiantSpiderAttackCard(card) {
    return Boolean(card && /giant spider attack/i.test(card.name));
  }

  function isBoomTownCard(card) {
    return Boolean(card && /boom times/i.test(card.name));
  }

  function isPityFairyCard(card) {
    return Boolean(card && /pity fairy/i.test(card.name));
  }

  function isFestivalCard(card) {
    return Boolean(card && normalize(card.specialSubtype) === 'festival');
  }

  function specialCardBadgeLabel(card) {
    return isFestivalCard(card) ? 'FESTIVAL' : 'SPECIAL';
  }

  function specialCardEffectText(card) {
    if (!card) return 'No extra text provided';
    if (isFestivalCard(card)) {
      const value = Number(card.value || 0);
      return card.notes || `All City Managers bid on this special card. When you win it, host ${card.name} in your city. The event is such a success that ${value} people leave every other city and come to your city.`;
    }
    return card.notes || card.revenue || 'No extra text provided';
  }

  function spiderProtectionCardName(card) {
    if (!card) return null;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    if (/pepperville pest eliminators|ringwald rid-a-pest/i.test(text)) return card.name;
    if (text.includes('insurance')) return card.name;
    if (/captain dependable|chief timothy o.?hara|sheriff clay maddox|ninja dog/i.test(text)) return card.name;
    if (text.includes('law enforcement')) return card.name;
    if (text.includes('police') || text.includes('sheriff')) return card.name;
    return null;
  }

  function spiderProtectionSource(city) {
    if (!city?.cards?.length) return null;
    return city.cards.map((card) => spiderProtectionCardName(card)).find(Boolean) || null;
  }

  function findSpiderCityIndex() {
    return state.players.findIndex((player) => player.cards.some((card) => isGiantSpiderAttackCard(card)));
  }

  function spiderCardInCity(city) {
    if (!city?.cards?.length) return null;
    return city.cards.find((card) => isGiantSpiderAttackCard(card)) || null;
  }

  function removeSpiderCardFromCity(cityIndex, reason = '') {
    const city = state.players[cityIndex];
    if (!city) return null;
    const cardIndex = city.cards.findIndex((card) => isGiantSpiderAttackCard(card));
    if (cardIndex < 0) return null;
    const [card] = city.cards.splice(cardIndex, 1);
    if (reason) {
      log(reason, 'good');
    }
    return card || null;
  }

  function removeRandomBusinessFromCity(cityIndex) {
    const city = state.players[cityIndex];
    if (!city) return null;
    const candidates = city.cards
      .map((card, index) => ({ card, index }))
      .filter((entry) => entry.card.type === 'business');
    if (!candidates.length) return null;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) return null;
    city.cards.splice(chosen.index, 1);
    applyPopulationChange(city, -Number(chosen.card.value || 0), chosen.card.name);
    return chosen.card;
  }

  function cityCanBeProtectedAgainstSpider(city) {
    return Boolean(spiderProtectionSource(city));
  }

  function isSpiderProtectionCard(card) {
    return Boolean(spiderProtectionCardName(card));
  }

  function chooseReactorDestination(excludeIndex) {
    const candidates = state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== excludeIndex);

    if (!candidates.length) return 0;

    const highestPopulation = Math.max(...candidates.map((entry) => entry.player.population));
    const topPopulation = candidates.filter((entry) => entry.player.population === highestPopulation);
    const highestCash = Math.max(...topPopulation.map((entry) => entry.player.cash));
    const topCash = topPopulation.filter((entry) => entry.player.cash === highestCash);
    return topCash[Math.floor(Math.random() * topCash.length)]?.index ?? candidates[0].index;
  }

  function choosePoolDestination(excludeIndex) {
    return chooseReactorDestination(excludeIndex);
  }

  function chooseSpiderPlacementDestination(excludeIndex) {
    const candidates = state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== excludeIndex && !spiderProtectionSource(entry.player));

    if (!candidates.length) {
      return chooseReactorDestination(excludeIndex);
    }

    candidates.sort((a, b) => b.player.population - a.player.population || b.player.cash - a.player.cash || a.player.seat - b.player.seat);
    return candidates[0]?.index ?? chooseReactorDestination(excludeIndex);
  }

  function placeReactorCard(playerIndex, cityIndex, card) {
    const placer = state.players[playerIndex];
    const target = state.players[cityIndex];
    if (!placer || !target || !card) return false;

    addCardToCity(cityIndex, card, { fromSpecial: true, skipBusinessHooks: true });

    state.players.forEach((player, index) => {
      if (index !== cityIndex) {
        applyPopulationChange(player, -5, card.name);
      }
    });

    log(`${placer.name} placed ${card.name} in ${target.name}'s city. ${target.name} lost 20 population and the other two cities lost 5 each.`, 'warn');
    state.actionContext = null;
    state.cardResolution = {
      tone: 'good',
      message: `${placer.name} placed ${card.name} in ${target.name}'s city.`,
    };
    state.awaitingNextCard = true;
    state.currentStage = 'card-complete';
    maybeClaimPendingPeople();
    checkForWinner();
    maybeFinishTurn();
    render();
    return true;
  }

  function placePoolCard(playerIndex, cityIndex, card) {
    const placer = state.players[playerIndex];
    const target = state.players[cityIndex];
    if (!placer || !target || !card) return false;

    addCardToCity(cityIndex, card, { fromSpecial: true, skipBusinessHooks: true });

    log(`${placer.name} placed ${card.name} in ${target.name}'s city. ${target.name} lost 10 population and will lose 1R per turn.`, 'warn');
    state.actionContext = null;
    state.cardResolution = {
      tone: 'good',
      message: `${placer.name} placed ${card.name} in ${target.name}'s city.`,
    };
    state.awaitingNextCard = true;
    state.currentStage = 'card-complete';
    maybeClaimPendingPeople();
    checkForWinner();
    maybeFinishTurn();
    render();
    return true;
  }

  function placeGiantSpiderCard(playerIndex, cityIndex, card) {
    const placer = state.players[playerIndex];
    const target = state.players[cityIndex];
    if (!placer || !target || !card) return false;

    addCardToCity(cityIndex, card, { fromSpecial: true });

    const spiderStillActive = Boolean(spiderCardInCity(target));
    if (spiderStillActive) {
      state.cardResolution = {
        tone: 'good',
        message: `The Spider has been placed in ${target.name}.`,
      };
      log(`${placer.name} placed the Giant Spider in ${target.name}.`, 'good');
    } else {
      const protectorName = spiderProtectionSource(target);
      state.cardResolution = {
        tone: 'good',
        message: protectorName
          ? `${target.name} is protected by ${protectorName}, so the Giant Spider Attack card is removed from the game.`
          : `${card.name} was removed from the game.`,
      };
      log(
        protectorName
          ? `${target.name} protected the Giant Spider with ${protectorName}.`
          : `${card.name} was removed from the game.`,
        'good',
      );
    }

    state.actionContext = null;
    state.awaitingNextCard = true;
    state.currentStage = 'card-complete';
    maybeClaimPendingPeople();
    checkForWinner();
    maybeFinishTurn();
    render();
    return true;
  }

  function applyPopulationChange(player, amount, reason) {
    if (!amount) return 0;

    let delta = amount;
    if (player.population + delta < 0) {
      delta = -player.population;
    }

    player.population += delta;
    return delta;
  }

  function addCardToCity(playerIndex, card, opts = {}) {
    const player = state.players[playerIndex];
    if (!player) return;

    if (card.type === 'people' && Number(card.value || 0) < 0) {
      if (hasTag(card, 'Animal') && player.specials.jailNegativeAnimals) {
        state.discard.push(card);
        log(`${player.name} jailed ${card.name} before it could enter the city.`, 'good');
        return;
      }

      if (!hasTag(card, 'Animal') && player.specials.jailNegativePeople > 0) {
        player.specials.jailNegativePeople -= 1;
        state.discard.push(card);
        log(`${player.name} jailed ${card.name} before it could enter the city.`, 'good');
        return;
      }
    }

    player.cards.push(card);
    const popChange = Number(card.value || 0);
    if (!(card.type === 'special' && isFestivalCard(card))) {
      applyPopulationChange(player, popChange, card.name);
    }

    if (card.type === 'business' && !opts.skipBusinessHooks) {
      const pressBonus = handlePressPendingOnBusiness(player, card);
      if (pressBonus) {
        applyPopulationChange(player, pressBonus, card.name);
        if (pressBonus > 0) {
          log(`${card.name} triggered the pending press bonus in ${player.name}'s city: +${pressBonus} population.`, 'good');
        } else {
          log(`${card.name} triggered the pending press penalty in ${player.name}'s city: ${pressBonus} population.`, 'warn');
        }
      }
    }

    if (card.type === 'special' && !opts.skipBusinessHooks) {
      handleSpecialOnAcquire(playerIndex, card, opts);
    } else if (card.type === 'business' && !opts.skipBusinessHooks) {
      handleBusinessOnAcquire(playerIndex, card, opts);
    }

    if (card.type === 'people') {
      maybeClaimPendingPeople();
    }
  }

  function handleBusinessOnAcquire(playerIndex, card, opts = {}) {
    const player = state.players[playerIndex];
    const city = player;
    const cardName = card.name;

    if (/Chattawa Valley Times|Chattawa Valley News & Views/i.test(cardName)) {
      city.specials.pressPending = { name: cardName };
      log(`${cardName} is active in ${player.name}'s city. The next business they open will be featured in the magazine.`, 'good');
    }

    if (/Pepperville Pest Eliminators|Ringwald Rid-A-Pest/i.test(cardName)) {
      city.specials.spiderProtection = true;
      log(`${player.name} now has Giant Spider protection from ${cardName}.`, 'good');
    }

    if (isSpiderProtectionCard(card) && spiderCardInCity(city)) {
      const removed = removeSpiderCardFromCity(playerIndex);
      if (removed) {
        log(`${cardName} exterminated the Giant Spider in ${player.name}'s city.`, 'good');
      }
      state.cardResolution = {
        tone: 'good',
        message: `${cardName} exterminated the Giant Spider in ${player.name}'s city.`,
      };
    }

    if (/Chattawa Insurance|Valley Shield Insurance/i.test(cardName)) {
      city.specials.countyShield += 1;
      log(`${player.name} now has permanent insurance protection.`, 'good');
    }

    if (isMoverCard(card)) {
      log(`${cardName} can move one business or people card from another city into ${player.name}'s city.`, 'good');
      void startMoverSequence(playerIndex, card, player.name);
    }

    if (/Chattawa Valley Convention & Visitors Bureau/i.test(cardName)) {
      const drawn = drawUntilPeopleCard();
      if (drawn) {
        log(`${cardName} drew ${drawn.name} from the deck and sent it to ${player.name}'s city.`, 'good');
        addCardToCity(playerIndex, drawn, { fromSpecial: true });
      } else {
        log(`${cardName} could not find a People card because the deck is empty.`, 'warn');
      }
    }

    if (/Time Travel Terminal/i.test(cardName)) {
      const drawn = drawFirstHistoricPeopleCard();
      if (drawn) {
        log(`${cardName} sent ${drawn.name} to ${player.name}'s city from the time stream.`, 'good');
        addCardToCity(playerIndex, drawn, { fromSpecial: true });
      } else {
        log(`${cardName} could not find a Historic People card in the remaining deck.`, 'warn');
      }
    }

    if (/Lake Ringwald/i.test(cardName)) {
      log(`${player.name} will gain 1 population at the end of each turn from Lake Ringwald.`, 'good');
    }

    if (/Chattawa Valley Recreation Area/i.test(cardName)) {
      log(`${player.name} will gain 1 additional resident at the end of each turn from the Recreation Area.`, 'good');
    }

    if (/Chattawa Valley Times|Chattawa Valley News & Views/i.test(cardName)) {
      // handled above
    }

    if (/Phineas & Abigail Pepper Statue/i.test(cardName)) {
      log(`${cardName} attracts 5 people immediately.`, 'good');
    }

    if (/CommunityVerse Medical Pavilion|Greater Pepperville Medical Building/i.test(cardName)) {
      log(`${cardName} will add bonus revenue for medical, dental, and pharmacy businesses.`, 'good');
    }

    if (/Trivia by Dylan/i.test(cardName)) {
      log(`${cardName} will add up to +2R to restaurant revenue in this city.`, 'good');
    }

    if (/Santa's Noel Workshop/i.test(cardName)) {
      log(`${cardName} will boost Santa, elf, and Rent-A-Elf revenue in this city.`, 'good');
    }

    if (/Foothills Women's Center/i.test(cardName)) {
      log(`${cardName} uses a gender-count special that can be filled in later if you want a manual house rule.`, 'warn');
    }

    if (isBankCard(card)) {
      log(`${cardName} pays $1 per 20 people in this city during income.`, 'good');
    }

    if (/Chattawa Smile Center|Riverwalk Dental Associates/i.test(cardName)) {
      log(`${cardName} can gain +1R if George Washington is in the same city.`, 'good');
    }

    if (isAttorneyCard(card)) {
      log(`${cardName} can gain +1R if the Courthouse is in the same city.`, 'good');
    }

    if (opts.fromSpecial) {
      maybeClaimPendingPeople();
    }
  }

  function handleSpecialOnAcquire(playerIndex, card, opts = {}) {
    const player = state.players[playerIndex];
    if (!player) return;

    if (isGiantSpiderAttackCard(card)) {
      const protectorName = spiderProtectionSource(player);
      if (protectorName) {
        removeSpiderCardFromCity(playerIndex);
        state.cardResolution = {
          tone: 'good',
          message: `${player.name} is protected by ${protectorName}, so the Giant Spider Attack card is removed from the game.`,
        };
        log(`${player.name} is protected by ${protectorName}, so the Giant Spider Attack card was removed from the game.`, 'good');
        return;
      }

      log(`${player.name} now has the Giant Spider Attack in their city.`, 'warn');
      return;
    }

    if (isFestivalCard(card)) {
      void startFestivalSequence(playerIndex, card);
      return;
    }

    if (isSpiderProtectionCard(card) && spiderCardInCity(player)) {
      const removed = removeSpiderCardFromCity(playerIndex);
      if (removed) {
        const protectionName = spiderProtectionSource(player) || card.name;
        state.cardResolution = {
          tone: 'good',
          message: `${protectionName} exterminated the Giant Spider in ${player.name}'s city.`,
        };
        log(`${protectionName} exterminated the Giant Spider in ${player.name}'s city.`, 'good');
      }
    }

    if (/bumbles the magician/i.test(card.name)) {
      void startBumblesSequence(playerIndex, card, player.name);
    }

    if (/chief timothy o.?hara|sheriff clay maddox/i.test(card.name)) {
      const cityName = player.name;
      const jailed = jailCardsFromCity(player, (entry) => isNegativePeopleCard(entry) && !hasTag(entry, 'Animal'), card.name, 1);
      const hasJailCredit = jailed.length === 0;
      if (hasJailCredit) {
        player.specials.jailNegativePeople += 1;
      }
      void playLawEnforcementSequence(playerIndex, card, cityName, jailed, hasJailCredit);
    }

    if (/captain dependable/i.test(card.name)) {
      void playCaptainDependableSequence(playerIndex, card, player.name);
    }

    if (/ninja dog/i.test(card.name)) {
      const jailed = jailCardsFromCity(player, (entry) => isNegativeAnimalCard(entry), card.name);
      player.specials.jailNegativeAnimals = true;
      if (jailed.length) {
        const freed = jailed.reduce((sum, entry) => sum + Math.abs(Number(entry.value || 0)), 0);
        log(`${player.name}'s Ninja Dog jailed ${jailed.length} negative animal${jailed.length === 1 ? '' : 's'}, restoring +${freed} population.`, 'good');
      } else {
        log(`${player.name}'s Ninja Dog is ready to jail negative animals in the city.`, 'good');
      }
    }

    if (/pity fairy/i.test(card.name)) {
      log(`The Pity Fairy is now watching the scoreboard. At the end of each round, it will bring 5 people to the city in last place.`, 'good');
    }

    if (/fairytale lake & forest/i.test(card.name)) {
      log(`${card.name} is now in ${player.name}'s city and will add 1 population at the end of each turn.`, 'good');
    }

  }

  async function playLawEnforcementSequence(playerIndex, card, cityName, jailedCards, hasJailCredit) {
    const player = state.players[playerIndex];
    if (!player) return;

    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      playerIndex,
      cityName,
      jailedCards,
      hasJailCredit,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${card.name} has come to ${cityName} and is looking for Negative Characters.`,
    };
    state.currentStage = 'special-resolution';
    render();

    const step1 = await waitForSpecialSequence(900, token);
    if (!step1 || state.specialSequenceToken !== token) return;

    if (jailedCards.length) {
      const targetName = jailedCards[0].name;
      const freed = jailedCards.reduce((sum, entry) => sum + Math.abs(Number(entry.value || 0)), 0);
      state.cardResolution = {
        tone: 'good',
        message: `${card.name} found ${targetName} and took them into custody, restoring +${freed} population.`,
      };
      log(`${card.name} found ${targetName} in ${cityName} and took them into custody.`, 'good');
    } else {
      state.cardResolution = {
        tone: 'warn',
        message: `${card.name} has not found any Negative Characters in ${cityName}.`,
      };
      log(`${card.name} has not found any Negative Characters in ${cityName}.`, 'warn');
    }
    render();

    const step2 = await waitForSpecialSequence(1100, token);
    if (!step2 || state.specialSequenceToken !== token) return;

    const closingText = hasJailCredit
      ? `${card.name} is now standing by in ${cityName} and is ready to jail the next negative person that arrives.`
      : `${card.name} has finished its visit to ${cityName}.`;
    state.cardResolution = {
      tone: 'good',
      message: closingText,
    };
    render();

    const step3 = await waitForSpecialSequence(900, token);
    if (!step3 || state.specialSequenceToken !== token) return;

    state.specialSequence = null;
    state.currentStage = 'card-complete';
    render();
  }

  async function playCaptainDependableSequence(playerIndex, card, cityName) {
    const player = state.players[playerIndex];
    if (!player) return;

    const token = ++state.specialSequenceToken;
    const jailedCards = jailCardsFromCity(player, (entry) => isNegativePeopleCard(entry), card.name);
    const freed = jailedCards.reduce((sum, entry) => sum + Math.abs(Number(entry.value || 0)), 0);

    state.specialSequence = {
      card,
      playerIndex,
      cityName,
      jailedCards,
      hasJailCredit: false,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${card.name} has come to ${cityName} and is looking for Negative Characters.`,
    };
    state.currentStage = 'special-resolution';
    render();

    const step1 = await waitForSpecialSequence(900, token);
    if (!step1 || state.specialSequenceToken !== token) return;

    if (jailedCards.length) {
      const names = jailedCards.map((entry) => entry.name).join(', ');
      state.cardResolution = {
        tone: 'good',
        message: `${card.name} found ${jailedCards.length} negative character${jailedCards.length === 1 ? '' : 's'} and cleared them out, restoring +${freed} population.`,
      };
      log(`${card.name} found ${names} in ${cityName} and cleared out all negative characters.`, 'good');
    } else {
      state.cardResolution = {
        tone: 'warn',
        message: `${card.name} has not found any Negative Characters in ${cityName}.`,
      };
      log(`${card.name} has not found any Negative Characters in ${cityName}.`, 'warn');
    }
    render();

    const step2 = await waitForSpecialSequence(1100, token);
    if (!step2 || state.specialSequenceToken !== token) return;

    state.cardResolution = {
      tone: 'good',
      message: `${card.name} has finished its visit to ${cityName}.`,
    };
    render();

    const step3 = await waitForSpecialSequence(900, token);
    if (!step3 || state.specialSequenceToken !== token) return;

    state.specialSequence = null;
    state.currentStage = 'card-complete';
    render();
  }

  async function startFestivalSequence(playerIndex, card) {
    const player = state.players[playerIndex];
    if (!player) return false;

    const value = Math.max(0, Number(card.value || 0));
    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      playerIndex,
      cityName: player.name,
      phase: 'festival',
      value,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${card.name} is being hosted in ${player.name}'s city.`,
    };
    state.currentStage = 'special-resolution';
    render();

    const step1 = await waitForSpecialSequence(850, token);
    if (!step1 || state.specialSequenceToken !== token) return false;

    const otherPlayers = state.players.filter((_, index) => index !== playerIndex);
    for (const other of otherPlayers) {
      applyPopulationChange(other, -value, card.name);
    }
    applyPopulationChange(player, value * otherPlayers.length, card.name);

    const message = `${card.name} was such a success that ${value} people left every other city and came to ${player.name}.`;
    log(message, 'good');
    state.specialSequence = null;
    state.cardResolution = {
      tone: 'good',
      message,
    };
    state.currentStage = 'card-complete';
    state.awaitingNextCard = true;
    maybeClaimPendingPeople();
    checkForWinner();
    render();
    return true;
  }

  function chooseGiantSpiderAction(cityIndex) {
    const city = state.players[cityIndex];
    if (!city) return { type: 'roll' };
    const businessCount = city.cards.filter((card) => card.type === 'business').length;
    if (city.cash >= 75 && businessCount > 0) {
      return { type: 'pay' };
    }
    return { type: 'roll' };
  }

  function resolveGiantSpiderDecision(decision) {
    if (!state.giantSpiderDecisionResolve) return;
    const resolve = state.giantSpiderDecisionResolve;
    state.giantSpiderDecisionResolve = null;
    if (state.giantSpiderSequenceTimer) {
      clearTimeout(state.giantSpiderSequenceTimer);
      state.giantSpiderSequenceTimer = null;
    }
    resolve(decision);
  }

  async function playGiantSpiderSequence(cityIndex) {
    const city = state.players[cityIndex];
    const spiderCard = spiderCardInCity(city);
    if (!city || !spiderCard) return false;

    const token = ++state.giantSpiderSequenceToken;
    state.giantSpiderSequence = {
      card: spiderCard,
      cityIndex,
      cityName: city.name,
      phase: 'prompt',
      roll: null,
      result: null,
      token,
    };
    state.actionContext = {
      type: 'giant-spider',
      card: spiderCard,
      cityIndex,
      phase: 'prompt',
    };
    state.cardResolution = {
      tone: 'warn',
      message: `${city.name} currently has the Giant Spider.`,
    };
    state.currentStage = 'giant-spider-prompt';
    render();

    const decision = await new Promise((resolve) => {
      state.giantSpiderDecisionResolve = resolve;

      if (!city.isHuman) {
        const timer = setTimeout(() => {
          if (state.giantSpiderSequenceToken !== token) return;
          state.giantSpiderSequenceTimer = null;
          resolveGiantSpiderDecision(chooseGiantSpiderAction(cityIndex).type);
        }, 700);
        state.giantSpiderSequenceTimer = timer;
      }
    });

    if (state.giantSpiderSequenceToken !== token || !decision) return false;

    const activeCity = state.players[cityIndex];
    if (!activeCity) return false;

    if (decision === 'pay') {
      if (activeCity.cash < 75) {
        state.giantSpiderSequence = null;
        state.actionContext = null;
        return false;
      }

      activeCity.cash -= 75;
      removeSpiderCardFromCity(cityIndex);
      state.giantSpiderSequence.phase = 'paid';
      state.cardResolution = {
        tone: 'good',
        message: `${activeCity.name} paid $75 to destroy the Giant Spider before the roll.`,
      };
      log(`${activeCity.name} paid $75 to destroy the Giant Spider before the roll.`, 'good');
      render();
      await new Promise((resolve) => setTimeout(resolve, 900));
      if (state.giantSpiderSequenceToken !== token) return false;

      state.giantSpiderSequence = null;
      state.actionContext = null;
      state.currentStage = 'giant-spider-complete';
      return true;
    }

    state.giantSpiderSequence.phase = 'rolling';
    state.cardResolution = {
      tone: 'warn',
      message: `${activeCity.name} still has the Giant Spider. The Spider has NOT been removed. Dice Roll is:`,
    };
    state.currentStage = 'giant-spider-rolling';
    render();

    await new Promise((resolve) => setTimeout(resolve, 850));
    if (state.giantSpiderSequenceToken !== token) return false;

    const die1 = rollDie(6);
    const die2 = rollDie(6);
    const total = die1 + die2;
    state.giantSpiderSequence.roll = [die1, die2];
    state.giantSpiderSequence.phase = 'result';

    if (total === 7 || die1 === die2) {
      removeSpiderCardFromCity(cityIndex);
      const reason = total === 7 ? 'the dice roll equals 7' : 'the dice roll was doubles';
      state.cardResolution = {
        tone: 'good',
        message: `The Spider has been removed because ${reason}. Dice Roll is: ${die1} and ${die2}.`,
      };
      log(`The Giant Spider in ${activeCity.name} was destroyed because ${reason}.`, 'good');
    } else {
      const removedBusiness = removeRandomBusinessFromCity(cityIndex);
      if (removedBusiness) {
        state.cardResolution = {
          tone: 'warn',
          message: `The Spider has removed ${removedBusiness.name}. Dice Roll is: ${die1} and ${die2}.`,
        };
        log(`The Giant Spider in ${activeCity.name} removed ${removedBusiness.name}.`, 'warn');
      } else {
        state.cardResolution = {
          tone: 'warn',
          message: `The Spider did not find a business to remove. Dice Roll is: ${die1} and ${die2}.`,
        };
        log(`The Giant Spider in ${activeCity.name} found no business to remove.`, 'warn');
      }
    }

    render();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (state.giantSpiderSequenceToken !== token) return false;

    state.giantSpiderSequence = null;
    state.actionContext = null;
    state.currentStage = 'giant-spider-complete';
    return true;
  }

  function moverEligibleCards(player) {
    return (player?.cards || []).filter((card) => card.type === 'business' || card.type === 'people');
  }

  function bumblesEligibleTargets(playerIndex) {
    return state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== playerIndex && (entry.player?.cards || []).length > 0);
  }

  function highestValueCard(cards) {
    return [...(cards || [])].sort((a, b) => Number(b.value || 0) - Number(a.value || 0) || a.type.localeCompare(b.type) || a.name.localeCompare(b.name))[0] || null;
  }

  function chooseBumblesTarget(playerIndex) {
    const candidates = bumblesEligibleTargets(playerIndex);
    if (!candidates.length) return null;

    const scored = candidates.map((entry) => {
      const bestCard = highestValueCard(entry.player.cards);
      return {
        ...entry,
        bestCard,
        score: {
          population: Number(entry.player?.population || 0),
          cash: Number(entry.player?.cash || 0),
          bestCardValue: bestCard ? Number(bestCard.value || 0) : Number.NEGATIVE_INFINITY,
        },
      };
    });

    scored.sort((a, b) => b.score.population - a.score.population || b.score.cash - a.score.cash || b.score.bestCardValue - a.score.bestCardValue || a.index - b.index);
    return scored[0]?.index ?? null;
  }

  function chooseBumblesCard(playerIndex, targetIndex) {
    const target = state.players[targetIndex];
    if (!target) return null;
    const candidates = target.cards
      .map((card, index) => ({ card, index }))
      .sort((a, b) => Number(b.card.value || 0) - Number(a.card.value || 0) || a.index - b.index);
    return candidates[0] || null;
  }

  function chooseBumblesFailureCard(playerIndex, excludeCard = null) {
    const player = state.players[playerIndex];
    if (!player) return null;
    const cards = player.cards
      .filter((card) => card !== excludeCard && normalize(card.name) !== 'bumbles the magician');
    if (!cards.length) return null;
    return cards[Math.floor(Math.random() * cards.length)] || null;
  }

  function moveCardWithFollowers(fromIndex, toIndex, card, reason) {
    const from = state.players[fromIndex];
    const to = state.players[toIndex];
    if (!from || !to || !card) return [];

    const followerSource = from.cards.slice();
    const followers = card.type === 'business'
      ? []
      : followerSource.filter((entry) => entry !== card && entry.type === 'people' && matchedPreferenceTokens(entry, { cards: [card] }).length > 0);

    if (!moveCardBetweenCities(fromIndex, toIndex, card, reason)) return [];

    for (const follower of followers) {
      moveCardBetweenCities(fromIndex, toIndex, follower, reason);
    }

    return followers;
  }

  function chooseMoverTarget(playerIndex, card) {
    const mover = state.players[playerIndex];
    if (!mover) return null;

    const candidates = state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== playerIndex && moverEligibleCards(entry.player).length > 0);

    if (!candidates.length) return null;

    const ranked = state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== playerIndex && moverEligibleCards(entry.player).length > 0)
      .sort((a, b) => b.player.population - a.player.population || b.player.cash - a.player.cash || a.player.seat - b.player.seat);

    const leader = ranked[0];
    const leaderPopulation = leader?.player?.population ?? 0;
    const roundProgress = state.initialDeckSize ? 1 - (state.deck.length / state.initialDeckSize) : 0;
    const lateGame = roundProgress >= 0.65 || state.round >= 5 || leaderPopulation >= 150;

    const scored = candidates.map((entry) => {
      const bestCard = chooseMoverCard(playerIndex, entry.index);
      if (!bestCard) {
        return { ...entry, score: Number.NEGATIVE_INFINITY, bestCard: null };
      }

      let score = bestCard.score;
      if (leader && entry.index === leader.index) {
        score += lateGame ? 16 : 7;
      } else if (lateGame && entry.player.population >= Math.max(0, leaderPopulation - 15)) {
        score += 4;
      }
      if (/special/i.test(String(card?.revenue || ''))) {
        score += 1;
      }
      return { ...entry, score, bestCard };
    });

    scored.sort((a, b) => b.score - a.score || b.player.population - a.player.population || a.index - b.index);
    return scored[0]?.index ?? null;
  }

  function chooseMoverCard(playerIndex, targetIndex) {
    const mover = state.players[playerIndex];
    const target = state.players[targetIndex];
    if (!mover || !target) return null;

    const options = moverEligibleCards(target)
      .map((card, index) => ({
        card,
        index,
        score: moverTransferScore(card, target, mover),
      }))
      .sort((a, b) => b.score - a.score || Number(b.card.value || 0) - Number(a.card.value || 0) || a.index - b.index);

    return options[0] || null;
  }

  function moveCardBetweenCities(fromIndex, toIndex, card, reason) {
    const from = state.players[fromIndex];
    const to = state.players[toIndex];
    if (!from || !to || !card) return false;

    const fromCardIndex = from.cards.indexOf(card);
    if (fromCardIndex < 0) return false;

    from.cards.splice(fromCardIndex, 1);
    applyPopulationChange(from, -Number(card.value || 0), reason || card.name);

    to.cards.push(card);
    applyPopulationChange(to, Number(card.value || 0), reason || card.name);
    return true;
  }

  function startMoverSequence(playerIndex, card, cityName) {
    const player = state.players[playerIndex];
    if (!player) return false;

    const eligibleTargets = state.players.some((entry, index) => index !== playerIndex && moverEligibleCards(entry).length > 0);
    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      playerIndex,
      cityName,
      phase: 'choose-target',
      targetIndex: null,
      chosenCardIndex: null,
    };
    state.actionContext = {
      type: 'place-mover',
      buyerIndex: playerIndex,
      card,
      phase: 'choose-target',
      targetIndex: null,
      chosenCardIndex: null,
    };
    state.currentStage = 'special-resolution';

    if (!eligibleTargets) {
      state.cardResolution = {
        tone: 'warn',
        message: `${card.name} found no eligible cards to move in the other cities.`,
      };
      state.specialSequence = null;
      state.actionContext = null;
      state.currentStage = 'card-complete';
      state.awaitingNextCard = true;
      render();
      return false;
    }

    state.cardResolution = {
      tone: 'good',
      message: `${card.name} is ready to move a card. Choose a player to take from.`,
    };
    render();

    if (player.isHuman) {
      return true;
    }

    void (async () => {
      const step1 = await waitForSpecialSequence(800, token);
      if (!step1 || state.specialSequenceToken !== token) return;

      const targetIndex = chooseMoverTarget(playerIndex, card);
      if (targetIndex === null) {
        state.cardResolution = {
          tone: 'warn',
          message: `${card.name} found no eligible cards to move in the other cities.`,
        };
        state.specialSequence = null;
        state.actionContext = null;
        state.currentStage = 'card-complete';
        state.awaitingNextCard = true;
        render();
        return;
      }

      applyMoverTarget(playerIndex, targetIndex);

      const step2 = await waitForSpecialSequence(700, token);
      if (!step2 || state.specialSequenceToken !== token) return;

      const chosen = chooseMoverCard(playerIndex, targetIndex);
      if (!chosen) {
        state.cardResolution = {
          tone: 'warn',
          message: `${card.name} could not find a card worth moving in ${state.players[targetIndex].name}'s city.`,
        };
        state.specialSequence = null;
        state.actionContext = null;
        state.currentStage = 'card-complete';
        state.awaitingNextCard = true;
        render();
        return;
      }

      applyMoverCard(playerIndex, chosen.index, { deferFinalize: true });

      const step3 = await waitForSpecialSequence(700, token);
      if (!step3 || state.specialSequenceToken !== token) return;

      state.specialSequence = null;
      state.actionContext = null;
      state.cardResolution = {
        tone: 'good',
        message: `${card.name} moved ${chosen.card.name} from ${state.players[targetIndex].name}'s city to ${player.name}'s city.`,
      };
      state.currentStage = 'card-complete';
      state.awaitingNextCard = true;
      maybeClaimPendingPeople();
      checkForWinner();
      render();
    })();

    return true;
  }

  function startBumblesSequence(playerIndex, card, cityName) {
    const player = state.players[playerIndex];
    if (!player) return false;

    const eligibleTargets = bumblesEligibleTargets(playerIndex);
    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      playerIndex,
      cityName,
      phase: 'choose-target',
      targetIndex: null,
      chosenCardIndex: null,
    };
    state.actionContext = {
      type: 'place-bumbles',
      buyerIndex: playerIndex,
      card,
      phase: 'choose-target',
      targetIndex: null,
    };
    state.currentStage = 'special-resolution';

    if (!eligibleTargets.length) {
      state.cardResolution = {
        tone: 'warn',
        message: `${card.name} found no opponents with cards to target.`,
      };
      state.specialSequence = null;
      state.actionContext = null;
      state.currentStage = 'card-complete';
      state.awaitingNextCard = true;
      render();
      return false;
    }

    state.cardResolution = {
      tone: 'good',
      message: `${player.name} won ${card.name} and is choosing an opponent to test the trick on.`,
    };
    render();

    if (player.isHuman) {
      return true;
    }

    void (async () => {
      const step1 = await waitForSpecialSequence(700, token);
      if (!step1 || state.specialSequenceToken !== token) return;

      const targetIndex = chooseBumblesTarget(playerIndex);
      if (targetIndex === null) {
        state.cardResolution = {
          tone: 'warn',
          message: `${card.name} found no opponents with cards to target.`,
        };
        state.specialSequence = null;
        state.actionContext = null;
        state.currentStage = 'card-complete';
        state.awaitingNextCard = true;
        maybeClaimPendingPeople();
        checkForWinner();
        render();
        return;
      }

      applyBumblesTarget(playerIndex, targetIndex);
    })();

    return true;
  }

  function applyBumblesTarget(playerIndex, targetIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'place-bumbles' || ctx.buyerIndex !== playerIndex) return false;
    const player = state.players[playerIndex];
    const target = state.players[targetIndex];
    if (!player || !target) return false;

    const targetCards = target.cards || [];
    if (!targetCards.length) return false;

    ctx.phase = 'attempting';
    ctx.targetIndex = targetIndex;
    state.specialSequence = {
      ...(state.specialSequence || {}),
      phase: 'attempting',
      targetIndex,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${player.name} has WON ${ctx.card.name} and is attempting it on ${target.name}.`,
    };
    render();

    void (async () => {
      const token = state.specialSequenceToken;
      const step1 = await waitForSpecialSequence(850, token);
      if (!step1 || state.specialSequenceToken !== token) return;

      const success = rollDie(3) <= 2;
      const targetCard = chooseBumblesCard(playerIndex, targetIndex);
      const actionLabel = success ? 'successfully stole' : 'backfired and gave';
      let followerText = '';

      if (success && targetCard) {
        const followers = moveCardWithFollowers(targetIndex, playerIndex, targetCard.card, ctx.card.name);
        if (followers.length) {
          followerText = ` ${followers.length === 1
            ? `The matching person ${followers[0].name} followed it.`
            : `The matching people ${followers.map((entry) => entry.name).join(', ')} followed it.`}`;
        }
        state.cardResolution = {
          tone: 'good',
          message: `${ctx.card.name} ${actionLabel} ${targetCard.card.name} from ${target.name}.${followerText}`,
        };
        log(`${player.name} used ${ctx.card.name} to steal ${targetCard.card.name} from ${target.name}.`, 'good');
      } else {
        const lostCard = chooseBumblesFailureCard(playerIndex, ctx.card);
        if (lostCard) {
          const followers = moveCardWithFollowers(playerIndex, targetIndex, lostCard, ctx.card.name);
          if (followers.length) {
            followerText = ` ${followers.length === 1
              ? `The matching person ${followers[0].name} followed it.`
              : `The matching people ${followers.map((entry) => entry.name).join(', ')} followed it.`}`;
          }
          state.cardResolution = {
            tone: 'warn',
            message: `${ctx.card.name} backfired and ${lostCard.name} was given to ${target.name}.${followerText}`,
          };
          log(`${player.name}'s ${ctx.card.name} backfired and gave ${lostCard.name} to ${target.name}.`, 'warn');
        } else {
          state.cardResolution = {
            tone: 'warn',
            message: `${ctx.card.name} backfired, but ${player.name} had no other cards to lose.`,
          };
          log(`${player.name}'s ${ctx.card.name} backfired, but there was no other card to give away.`, 'warn');
        }
      }
      render();

      const step2 = await waitForSpecialSequence(1000, token);
      if (!step2 || state.specialSequenceToken !== token) return;

      state.specialSequence = null;
      state.actionContext = null;
      state.currentStage = 'card-complete';
      maybeClaimPendingPeople();
      checkForWinner();
      render();
    })();

    return true;
  }

  function applyMoverTarget(playerIndex, targetIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'place-mover') return false;
    if (ctx.buyerIndex !== playerIndex) return false;
    const mover = state.players[playerIndex];
    const target = state.players[targetIndex];
    if (!mover || !target) return false;

    const eligible = moverEligibleCards(target);
    if (!eligible.length) return false;

    ctx.phase = 'choose-card';
    ctx.targetIndex = targetIndex;
    ctx.chosenCardIndex = null;
    state.specialSequence = {
      ...(state.specialSequence || {}),
      phase: 'choose-card',
      targetIndex,
      chosenCardIndex: null,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${state.actionContext.card.name} chose ${target.name}. Now choose a card to move.`,
    };
    render();
    return true;
  }

  function applyMoverCard(playerIndex, cardIndex, opts = {}) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'place-mover' || ctx.buyerIndex !== playerIndex) return false;
    const targetIndex = ctx.targetIndex;
    if (!Number.isInteger(targetIndex)) return false;

    const target = state.players[targetIndex];
    const mover = state.players[playerIndex];
    if (!target || !mover) return false;

    const eligible = moverEligibleCards(target);
    const chosen = eligible[cardIndex];
    if (!chosen) return false;

    moveCardBetweenCities(targetIndex, playerIndex, chosen, ctx.card.name);
    log(`${mover.name} moved ${chosen.name} from ${target.name}'s city with ${ctx.card.name}.`, 'good');
    state.cardResolution = {
      tone: 'good',
      message: `${ctx.card.name} moved ${chosen.name} from ${target.name}'s city to ${mover.name}'s city.`,
    };
    const finalize = opts.deferFinalize !== true;
    if (finalize) {
      state.specialSequence = null;
      state.actionContext = null;
      state.currentStage = 'card-complete';
      state.awaitingNextCard = true;
      maybeClaimPendingPeople();
      checkForWinner();
    }
    render();
    return true;
  }

  function handlePressPendingOnBusiness(city, card) {
    if (!city.specials.pressPending) return 0;
    const delta = Number(card.value || 0) >= 0 ? 5 : -5;
    city.specials.pressPending = null;
    return delta;
  }

  function drawUntilPeopleCard() {
    while (state.deck.length) {
      const card = state.deck.shift();
      if (card.type === 'people') return card;
      state.discard.push(card);
    }
    return null;
  }

  function drawFirstHistoricPeopleCard() {
    const index = state.deck.findIndex((card) => isHistoricPeopleCard(card));
    if (index < 0) return null;
    return state.deck.splice(index, 1)[0];
  }

  function takeHighestValueDiscardCard(playerIndex) {
    const player = state.players[playerIndex];
    if (!player || !state.discard.length) return null;

    const candidates = state.discard
      .map((card, index) => ({ card, index }))
      .sort((a, b) => {
        const valueDiff = Number(b.card.value || 0) - Number(a.card.value || 0);
        if (valueDiff) return valueDiff;
        const typeRank = (entry) => (entry.type === 'business' ? 2 : entry.type === 'people' ? 1 : 0);
        const typeDiff = typeRank(b.card) - typeRank(a.card);
        if (typeDiff) return typeDiff;
        return a.index - b.index;
      });

    const best = candidates[0];
    if (!best) return null;

    state.discard.splice(best.index, 1);
    addCardToCity(playerIndex, best.card, { fromSpecial: true });
    return best.card;
  }

  function revealNextCard() {
    if (state.peopleBattle) {
      log('The preference battle is still resolving.', 'warn');
      return;
    }

    if (state.awaitingNextCard && state.currentCard) {
      state.awaitingNextCard = false;
      state.cardResolution = null;
      state.currentCard = null;
      state.currentStage = 'ready-to-reveal';
    }

    if (!state.turnQueue.length) {
      maybeFinishTurn();
      render();
      return;
    }

    const card = state.turnQueue.shift();
    state.currentCard = card;
    state.currentStage = `${card.type}-reveal`;
    state.actionContext = null;
    render();

    if (isBoomTownCard(card)) {
      void startBoomTownSequence(card);
    } else if (isPityFairyCard(card)) {
      void startPityFairySequence(card);
    } else if (/blind luck/i.test(card.name)) {
      void startBlindLuckSequence(0, card);
    } else if (card.type === 'business' || card.type === 'special') {
      startAuction(card);
    } else if (card.type === 'people') {
      void resolvePeopleCard(card);
    } else {
      log(`Event cards are coming later. ${card.name} is currently treated as a placeholder.`, 'warn');
      state.discard.push(card);
      state.currentCard = null;
      state.currentStage = 'ready-to-reveal';
      render();
    }
  }

  function startAuction(card) {
    const order = state.players
      .map((player, index) => ({ player, index }))
      .sort((a, b) => a.player.population - b.player.population || a.player.seat - b.player.seat);

    state.actionContext = {
      type: 'auction',
      card,
      order,
      activeBidders: order.map((entry) => entry.index),
      turnIndex: 0,
      lastActor: null,
      passedBidders: new Set(),
      passesSinceBid: 0,
      highBid: 0,
      highBidder: null,
      finished: false,
    };
    state.currentStage = 'auction';
    log(`Auction opened for ${card.name}. Lowest population bids first.`);
    render();
    runAuctionAutoplay();
    render();
  }

  function auctionHasOpponentsLeft(ctx) {
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return false;
    if (ctx.highBidder === null) {
      return ctx.order.some((entry) => !ctx.passedBidders?.has(entry.index));
    }
    return ctx.order.some((entry) => entry.index !== ctx.highBidder && !ctx.passedBidders?.has(entry.index));
  }

  function currentAuctionBidder() {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return null;
    const active = ctx.activeBidders || [];
    if (!active.length) return null;
    if (ctx.highBidder !== null && active.length === 1 && active[0] === ctx.highBidder) return null;
    const order = ctx.order || [];
    const lastActor = ctx.lastActor;
    const startPosition = lastActor === null || lastActor === undefined
      ? -1
      : order.findIndex((entry) => entry.index === lastActor);
    let playerIndex = null;
    for (let offset = 1; offset <= order.length; offset += 1) {
      const entry = order[(startPosition + offset) % order.length];
      if (entry && active.includes(entry.index)) {
        playerIndex = entry.index;
        break;
      }
    }
    if (playerIndex === null) {
      playerIndex = active[ctx.turnIndex % active.length];
    }
    return ctx.order.find((entry) => entry.index === playerIndex) || null;
  }

  function removeAuctionBidder(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction') return;
    const active = ctx.activeBidders || [];
    const position = active.indexOf(playerIndex);
    if (position < 0) return;
    active.splice(position, 1);
    if (!active.length) {
      ctx.turnIndex = 0;
      return;
    }
    if (position < ctx.turnIndex) {
      ctx.turnIndex -= 1;
    }
    if (ctx.turnIndex >= active.length) {
      ctx.turnIndex = 0;
    }
  }

  function advanceAuctionIndex() {
    const ctx = state.actionContext;
    if (!ctx) return;
    const active = ctx.activeBidders || [];
    ctx.turnIndex = active.length ? (ctx.turnIndex + 1) % active.length : 0;
  }

  function auctionPassedNames(ctx) {
    if (!ctx?.passedBidders?.size) return [];
    return ctx.order
      .filter((entry) => ctx.passedBidders.has(entry.index))
      .map((entry) => state.players[entry.index]?.name)
      .filter(Boolean);
  }

  function auctionRemainingNames(ctx) {
    if (!ctx?.activeBidders?.length) return [];
    return ctx.activeBidders
      .map((index) => state.players[index]?.name)
      .filter(Boolean);
  }

  function bid(playerIndex) {
    bidByAmount(playerIndex, 1);
  }

  function bidByAmount(playerIndex, amount) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return;
    const active = currentAuctionBidder();
    if (!active || active.index !== playerIndex) return;

    const player = state.players[playerIndex];
    const increment = Number(amount) || 0;
    if (increment <= 0) return;

    if (player.cash < ctx.highBid + increment) {
      log(`${player.name} cannot afford to bid ${money(ctx.highBid + increment)}.`, 'warn');
      return;
    }

    ctx.highBid += increment;
    ctx.highBidder = playerIndex;
    ctx.passedBidders.delete(playerIndex);
    ctx.passesSinceBid = 0;
    ctx.lastActor = playerIndex;
    log(`${player.name} bid ${money(ctx.highBid)} for ${ctx.card.name}.`);
    maybeResolveAuction();
    runAuctionAutoplay();
    render();
  }

  function passBid(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return;
    const active = currentAuctionBidder();
    if (!active || active.index !== playerIndex) return;

    log(`${state.players[playerIndex].name} passed on ${ctx.card.name}.`);
    ctx.passedBidders.add(playerIndex);
    ctx.lastActor = playerIndex;
    removeAuctionBidder(playerIndex);
    ctx.passesSinceBid += 1;
    maybeResolveAuction();
    runAuctionAutoplay();
    render();
  }

  function chooseAuctionAction(playerIndex) {
    const ctx = state.actionContext;
    const player = state.players[playerIndex];
    if (!ctx || ctx.type !== 'auction' || ctx.finished || !player || player.isHuman) return null;

    const strategy = player.strategy || auctionStrategyForSeat(player.seat);
    const tuning = auctionPersonality(playerIndex);
    const reserve = estimateAuctionReserve(ctx.card, playerIndex, strategy);
    const highBid = Number(ctx.highBid || 0);
    const currentLeader = ctx.highBidder;
    const leaderBuffer = tuning.leaderBuffer;
    const outsiderBuffer = tuning.outsiderBuffer;

    if (highBid >= reserve + leaderBuffer && currentLeader === playerIndex) {
      return { type: 'pass' };
    }

    if (highBid >= reserve + outsiderBuffer && currentLeader !== playerIndex) {
      return { type: 'pass' };
    }

    const gap = reserve - highBid;
    let amount = 1;
    if (gap >= tuning.largeGap) {
      amount = 10;
    } else if (gap >= tuning.mediumGap) {
      amount = strategy === 'aggressive' ? 10 : 5;
    } else if (gap >= tuning.smallGap) {
      amount = 5;
    }

    amount = Math.min(amount, player.cash - highBid);
    if (amount <= 0) return { type: 'pass' };

    return { type: 'bid', amount };
  }

  function auctionStrategyForSeat(seat) {
    if (seat === 1) return 'aggressive';
    if (seat === 2) return 'conservative';
    if (seat === 3) return 'balanced';
    return 'balanced';
  }

  function auctionPersonality(playerIndex) {
    const player = state.players[playerIndex];
    const name = normalize(player?.name || '');
    const seat = Number(player?.seat ?? playerIndex);

    if (name.includes('dylan')) {
      return {
        reserveMultiplier: 0.82,
        leaderBuffer: 2,
        outsiderBuffer: 4,
        smallGap: 4,
        mediumGap: 9,
        largeGap: 14,
      };
    }

    if (name.includes('monica')) {
      return {
        reserveMultiplier: 1.2,
        leaderBuffer: 1,
        outsiderBuffer: 2,
        smallGap: 5,
        mediumGap: 10,
        largeGap: 15,
      };
    }

    if (name.includes('joseph')) {
      return {
        reserveMultiplier: 1.14,
        leaderBuffer: 1,
        outsiderBuffer: 2,
        smallGap: 5,
        mediumGap: 10,
        largeGap: 15,
      };
    }

    if (seat === 1) {
      return {
        reserveMultiplier: 0.92,
        leaderBuffer: 1,
        outsiderBuffer: 4,
        smallGap: 4,
        mediumGap: 9,
        largeGap: 14,
      };
    }

    if (seat === 2) {
      return {
        reserveMultiplier: 1.08,
        leaderBuffer: 1,
        outsiderBuffer: 3,
        smallGap: 5,
        mediumGap: 10,
        largeGap: 15,
      };
    }

    if (seat === 3) {
      return {
        reserveMultiplier: 1.06,
        leaderBuffer: 1,
        outsiderBuffer: 3,
        smallGap: 5,
        mediumGap: 10,
        largeGap: 15,
      };
    }

    return {
      reserveMultiplier: 1,
      leaderBuffer: 1,
      outsiderBuffer: 3,
      smallGap: 5,
      mediumGap: 10,
      largeGap: 15,
    };
  }

  function projectedAuctionCity(player, card) {
    const currentPopulation = Math.max(0, Number(player?.population || 0));
    const addedPopulation = Number(card?.value || 0);
    const cards = [...(player?.cards || [])];
    if (card) cards.push(card);
    return {
      cards,
      population: Math.max(0, currentPopulation + addedPopulation),
    };
  }

  function auctionCardValue(card, playerIndex, strategy = 'balanced') {
    if (!card) return 1;
    const player = state.players[playerIndex];
    const currentCity = player || { cards: [], population: 0, cash: 0 };
    const futureCity = projectedAuctionCity(player, card);

    const currentPopulation = Math.max(0, Number(currentCity.population || 0));
    const futurePopulation = Math.max(0, Number(futureCity.population || 0));
    const populationGain = Math.max(0, futurePopulation - currentPopulation);
    const populationValue = Math.max(0, Number(card.value || 0));

    const currentRevenue = cityRevenueUnits(currentCity);
    const futureRevenue = cityRevenueUnits(futureCity);
    const revenueGain = Math.max(0, futureRevenue - currentRevenue);

    const currentSpecial = specialIncome(card, currentCity);
    const futureSpecial = specialIncome(card, futureCity);
    const cashGain = Math.max(0, Number(futureSpecial.cash || 0) - Number(currentSpecial.cash || 0));
    const specialPopGain = Math.max(0, Number(futureSpecial.population || 0) - Number(currentSpecial.population || 0));

    const attractedCards = card.type === 'business' ? businessMatchesPendingPeople(card) : [];
    const attractionScore = attractedCards.reduce((sum, pending) => sum + Number(pending.value || 0), 0);
    const negativeAttractionCount = attractedCards.filter((pending) => Number(pending.value || 0) < 0).length;
    const positiveAttractionCount = attractedCards.length - negativeAttractionCount;

    const leader = state.players.reduce((best, candidate) => {
      if (!candidate) return best;
      if (!best) return candidate;
      if (candidate.population > best.population) return candidate;
      if (candidate.population === best.population && candidate.cash > best.cash) return candidate;
      return best;
    }, null);
    const leaderDistance = Math.max(0, 200 - Number(leader?.population || 0));
    const roundProgress = state.initialDeckSize ? 1 - (state.deck.length / state.initialDeckSize) : 0;
    const lateGame = roundProgress >= 0.65 || state.round >= 5 || leaderDistance <= 35;

    let score = 0;
    score += populationGain * (strategy === 'aggressive' ? 2.5 : strategy === 'conservative' ? 2.1 : 2.3);
    score += revenueGain * (strategy === 'aggressive' ? 7 : strategy === 'conservative' ? 4.5 : 5.5);
    score += cashGain * (strategy === 'aggressive' ? 5 : strategy === 'conservative' ? 4 : 4.5);
    score += specialPopGain * 2;
    score += attractionScore * (strategy === 'aggressive' ? 1.5 : strategy === 'conservative' ? 0.85 : 1.1);
    score += positiveAttractionCount * (strategy === 'aggressive' ? 1.5 : strategy === 'conservative' ? 1 : 1.2);
    score -= negativeAttractionCount * (strategy === 'aggressive' ? 2.5 : strategy === 'conservative' ? 4 : 3);

    if (lateGame) {
      const denialFactor = Math.max(0, 30 - leaderDistance);
      score += populationGain * (strategy === 'aggressive' ? 0.9 : strategy === 'conservative' ? 0.35 : 0.6);
      score += revenueGain * (strategy === 'aggressive' ? 1.25 : strategy === 'conservative' ? 0.65 : 0.95);
      score += cashGain * (strategy === 'aggressive' ? 0.75 : strategy === 'conservative' ? 0.45 : 0.6);
      score += denialFactor * (strategy === 'aggressive' ? 0.6 : strategy === 'conservative' ? 0.25 : 0.4);
    }

    const cashReservePressure = Math.max(0, 35 - Number(player?.cash || 0));
    score -= cashReservePressure * (strategy === 'aggressive' ? 0.08 : strategy === 'conservative' ? 0.2 : 0.12);

    if (/special/i.test(String(card.revenue || ''))) {
      score += strategy === 'aggressive' ? 2 : strategy === 'conservative' ? 0 : 1;
    }

    if (card.type === 'special') {
      score += strategy === 'aggressive' ? 1 : strategy === 'conservative' ? -1 : 0;
    }

    if (isMoverCard(card)) {
      score += bestMoverOpportunityScore(playerIndex, strategy) * (strategy === 'aggressive' ? 0.8 : strategy === 'conservative' ? 0.6 : 0.7);
    }

    return score;
  }

  function estimateAuctionReserve(card, playerIndex = null, strategy = 'balanced') {
    if (!card) return 1;
    const tuning = playerIndex === null ? null : auctionPersonality(playerIndex);

    if (isReactorCard(card)) {
      const ranked = state.players
        .map((player, index) => ({ player, index }))
        .sort((a, b) => b.player.population - a.player.population || b.player.cash - a.player.cash || a.player.seat - b.player.seat);
      const player = playerIndex === null ? null : state.players[playerIndex];
      const leader = ranked[0]?.player ?? null;
      const runnerUp = ranked[1]?.player ?? null;
      const leaderPopulation = leader?.population ?? 0;
      const runnerUpPopulation = runnerUp?.population ?? 0;
      const leadGap = Math.max(0, leaderPopulation - runnerUpPopulation);
      const activeRank = playerIndex === null ? 2 : Math.max(0, ranked.findIndex((entry) => entry.index === playerIndex));
      const playerPopulation = player?.population ?? 0;
      const playerGapToLeader = Math.max(0, leaderPopulation - playerPopulation);
      const leadDistance = Math.max(0, 200 - leaderPopulation);
      const cash = Math.max(0, player?.cash ?? 0);
      const cashReserveFloor = leadDistance <= 15 ? 4 : leadDistance <= 30 ? 6 : 8;
      const cashReserve = Math.min(cash, Math.max(cashReserveFloor, Math.round(cash * (leadDistance <= 15 ? 0.15 : leadDistance <= 30 ? 0.25 : 0.35))));

      let strategicValue = 16;
      if (activeRank === 0) {
        strategicValue += Math.max(0, 18 - leadDistance) * 0.9;
        strategicValue += Math.max(0, 20 - leadGap) * 0.4;
      } else if (activeRank === 1) {
        strategicValue += Math.max(0, 24 - playerGapToLeader) * 0.85;
        strategicValue += Math.max(0, 18 - leadGap) * 0.7;
      } else {
        strategicValue += Math.max(0, 14 - playerGapToLeader) * 0.4;
        strategicValue += Math.max(0, 12 - leadGap) * 0.25;
      }
      strategicValue += Math.max(0, 20 - cash) * 0.15;
      strategicValue += leadDistance <= 10 ? 10 : leadDistance <= 20 ? 5 : 0;

      const reserveCap = Math.max(8, cash - cashReserve);
      return Math.max(8, Math.min(Math.round(strategicValue), reserveCap));
    }

    const populationValue = Math.max(0, Number(card.value || 0));
    const baseScore = auctionCardValue(card, playerIndex, strategy);
    const populationFloor = populationValue >= 12 ? 4 : populationValue >= 7 ? 3 : 2;
    const strategyOffset = strategy === 'aggressive' ? 2 : strategy === 'conservative' ? -1 : 0;
    const reserve = Math.max(1, Math.round(baseScore + populationFloor + strategyOffset));
    const multiplier = tuning?.reserveMultiplier ?? 1;
    return Math.max(1, Math.round(reserve * multiplier));
  }

  function applyAuctionBid(playerIndex, amount) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return false;
    const active = currentAuctionBidder();
    if (!active || active.index !== playerIndex) return false;

    const player = state.players[playerIndex];
    const increment = Number(amount) || 0;
    if (increment <= 0) return false;

    if (player.cash < ctx.highBid + increment) {
      log(`${player.name} cannot afford to bid ${money(ctx.highBid + increment)}.`, 'warn');
      return false;
    }

    ctx.highBid += increment;
    ctx.highBidder = playerIndex;
    ctx.passesSinceBid = 0;
    ctx.passedBidders.delete(playerIndex);
    ctx.lastActor = playerIndex;
    log(`${player.name} bid ${money(ctx.highBid)} for ${ctx.card.name}.`);
    maybeResolveAuction();
    return true;
  }

  function applyAuctionPass(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return false;
    const active = currentAuctionBidder();
    if (!active || active.index !== playerIndex) return false;

    log(`${state.players[playerIndex].name} passed on ${ctx.card.name}.`);
    ctx.passedBidders.add(playerIndex);
    ctx.lastActor = playerIndex;
    removeAuctionBidder(playerIndex);
    ctx.passesSinceBid += 1;
    maybeResolveAuction();
    return true;
  }

  function runAuctionAutoplay() {
    let guard = 0;

    while (guard < 20) {
      const ctx = state.actionContext;
      if (!ctx || ctx.type !== 'auction' || ctx.finished) return;

      const active = currentAuctionBidder();
      if (!active) return;

      const player = state.players[active.index];
      if (!player || player.isHuman) return;

      const action = chooseAuctionAction(active.index);
      if (!action) return;

      if (action.type === 'bid') {
        applyAuctionBid(active.index, action.amount);
      } else {
        applyAuctionPass(active.index);
      }

      if (!state.actionContext || state.actionContext.type !== 'auction' || state.actionContext.finished) return;
      guard += 1;
    }
  }

  async function maybeResolveAuction() {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'auction' || ctx.finished) return;

    const active = currentAuctionBidder();
    const activeBidders = ctx.activeBidders || [];

    if (!ctx.highBidder && activeBidders.length === 0) {
      ctx.finished = true;
      log(`${ctx.card.name} went unsold and was discarded.`, 'warn');
      state.discard.push(ctx.card);
      state.actionContext = null;
      state.cardResolution = {
        tone: 'warn',
        message: `${ctx.card.name} went unsold and was discarded.`,
      };
      state.awaitingNextCard = true;
      state.currentStage = 'card-complete';
      maybeClaimPendingPeople();
      render();
      return;
    }

    if (ctx.highBidder !== null && (activeBidders.length === 0 || (activeBidders.length === 1 && activeBidders[0] === ctx.highBidder))) {
      ctx.finished = true;
      const winner = state.players[ctx.highBidder];
      winner.cash -= ctx.highBid;
      const token = ++state.cardResolutionToken;
      state.cardResolution = {
        tone: 'good',
        message: `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)}.`,
      };
      state.currentStage = 'business-resolution';
      state.actionContext = null;
      render();
      await waitForCardResolution(1100, token);
      if (state.cardResolutionToken !== token) return;

      const isReactor = isReactorCard(ctx.card);
      const isPool = isPoolCard(ctx.card);
      const winMessage = isReactor
        ? `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)}. Choose a city to place it in.`
        : isPool
          ? `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)}. Choose a city to place it in.`
          : isGiantSpiderAttackCard(ctx.card)
          ? `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)}. Choose a city to place it in.`
          : `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)} and it was placed in their city.`;
      log(winMessage, 'good');
      if (isGiantSpiderAttackCard(ctx.card)) {
        state.cardResolution = {
          tone: 'good',
          message: `${winner.name} won ${ctx.card.name} for ${money(ctx.highBid)}. Choose a city to place it in.`,
        };
        state.actionContext = {
          type: 'place-spider',
          buyerIndex: ctx.highBidder,
          card: ctx.card,
        };
        state.currentStage = 'place-spider';
        render();

        const buyer = state.players[ctx.highBidder];
        if (!buyer?.isHuman) {
          const cityIndex = chooseSpiderPlacementDestination(ctx.highBidder);
          if (Number.isInteger(cityIndex)) {
            placeGiantSpiderCard(ctx.highBidder, cityIndex, ctx.card);
          }
        }
        return;
      }
      if (isPool) {
        state.cardResolution = null;
        state.actionContext = {
          type: 'place-pool',
          buyerIndex: ctx.highBidder,
          card: ctx.card,
          bid: ctx.highBid,
        };
        state.currentStage = 'place-pool';
        render();

        const buyer = state.players[ctx.highBidder];
        if (!buyer?.isHuman) {
          const cityIndex = choosePoolDestination(ctx.highBidder);
          if (Number.isInteger(cityIndex)) {
            placePoolCard(ctx.highBidder, cityIndex, ctx.card);
          }
        }
        return;
      }
      if (!isReactor) {
        addCardToCity(ctx.highBidder, ctx.card);
        if (!state.actionContext || (state.actionContext.type !== 'blind-luck' && state.actionContext.type !== 'place-mover')) {
          state.awaitingNextCard = true;
          state.currentStage = 'card-complete';
          maybeClaimPendingPeople();
          checkForWinner();
        }
        render();
        return;
      }

      state.cardResolution = null;
      state.actionContext = {
        type: 'place-reactor',
        buyerIndex: ctx.highBidder,
        card: ctx.card,
        bid: ctx.highBid,
      };
      state.currentStage = 'place-reactor';
      render();

      const buyer = state.players[ctx.highBidder];
      if (!buyer?.isHuman) {
        const cityIndex = chooseReactorDestination(ctx.highBidder);
        placeReactorCard(ctx.highBidder, cityIndex, ctx.card);
      }
    }
  }

  async function resolvePeopleCard(card) {
    const token = ++state.peopleBattleToken;
    const battle = createPeopleBattle(card);
    state.peopleBattle = battle;
    state.currentStage = 'people-battle';
    render();

    // Give the battle screen a beat to appear before the first row lands.
    await waitForPeopleBattle(320, token);
    if (state.peopleBattleToken !== token) return;

    for (let i = 0; i < battle.rows.length; i += 1) {
      const row = battle.rows[i];
      battle.activeRowIndex = i;
      battle.visibleRows = i + 1;
      battle.bumpedPlayers = row.deltas.map((delta) => delta !== 0);
      row.deltas.forEach((delta, playerIndex) => {
        battle.totals[playerIndex] += delta;
      });
      render();

      const keepGoing = await waitForPeopleBattle(i === 0 ? 1100 : 820, token);
      if (!keepGoing || state.peopleBattleToken !== token) return;
    }

    battle.activeRowIndex = -1;
    const topScore = Math.max(0, ...battle.totals);

    if (topScore <= 0) {
      battle.finished = true;
      battle.resultTone = 'warn';
      battle.resultText = `${card.name} does not match any current city, so it waits in the center of the table.`;
      render();
      await waitForPeopleBattle(750, token);
      if (state.peopleBattleToken !== token) return;

      state.pendingPeople.push(card);
      const pendingMessage = `${card.name} has no current city match and waits in the center of the table.`;
      announce(pendingMessage, 'warn');
      log(pendingMessage, 'warn');
      state.peopleBattle = null;
      state.cardResolution = {
        tone: 'warn',
        message: pendingMessage,
      };
      state.awaitingNextCard = true;
      state.currentStage = 'card-complete';
      maybeClaimPendingPeople();
      checkForWinner();
      render();
      return;
    }

    const leaders = battle.totals
      .map((score, index) => ({ score, index }))
      .filter((entry) => entry.score === topScore);
    let winnerEntry = leaders[0];

    if (leaders.length > 1) {
      const rollResults = leaders.map((entry) => ({ ...entry, roll: rollDie(6) }));
      rollResults.sort((a, b) => b.roll - a.roll || a.index - b.index);
      winnerEntry = rollResults[0];
      battle.resultTone = 'warn';
      battle.resultText = `Tie on ${card.name}. ${rollResults.map((entry) => `${state.players[entry.index].name} rolled ${entry.roll}`).join('; ')}. ${state.players[winnerEntry.index].name} won the tie-breaker.`;
      render();
      await waitForPeopleBattle(1250, token);
      if (state.peopleBattleToken !== token) return;
    }

    const winnerPreferences = matchedPreferenceTokens(card, state.players[winnerEntry.index]);
    const reasonText = winnerPreferences.length ? ` because it matched ${winnerPreferences.join(', ')}` : '';
    const value = Number(card.value || 0);
    const changeText = value > 0
      ? `adding ${value} population`
      : value < 0
        ? `subtracting ${Math.abs(value)} population`
        : 'changing population by 0';
    const tieText = leaders.length > 1
      ? ` It was a tie, so each tied city rolled a die and the highest roll won.`
      : '';
    const attractionMessage = `${card.name} was attracted to ${state.players[winnerEntry.index].name}'s city${reasonText}, ${changeText}.${tieText}`;

    battle.finished = true;
    battle.resultTone = 'good';
    battle.resultText = attractionMessage;
    render();
    await waitForPeopleBattle(750, token);
    if (state.peopleBattleToken !== token) return;

    addCardToCity(winnerEntry.index, card);
    announce(attractionMessage, 'good');
    log(attractionMessage, 'good');
    state.peopleBattle = null;
    state.cardResolution = {
      tone: 'good',
      message: attractionMessage,
      peopleBattle: clonePeopleBattleForDisplay(battle),
    };
    state.awaitingNextCard = true;
    state.currentStage = 'card-complete';
    maybeClaimPendingPeople();
    checkForWinner();
    render();
  }

  function maybeClaimPendingPeople() {
    if (!state.pendingPeople.length) return;

    let claimedSomething = true;
    while (claimedSomething) {
      claimedSomething = false;
      for (let i = 0; i < state.pendingPeople.length; i += 1) {
        const pending = state.pendingPeople[i];
        const matches = citiesWithMatches(pending);
        if (!matches.length) continue;

        const topScore = Math.max(...matches.map((entry) => entry.score));
        const leaders = matches.filter((entry) => entry.score === topScore);
        const winnerEntry = leaders.length === 1 ? leaders[0] : leaders.sort(() => Math.random() - 0.5)[0];
        const winnerPreferences = matchedPreferenceTokens(pending, winnerEntry.player);
        state.pendingPeople.splice(i, 1);
        addCardToCity(winnerEntry.index, pending);
        const reasonText = winnerPreferences.length ? ` because it matched ${winnerPreferences.join(', ')}` : '';
        const claimMessage = `${pending.name} was claimed from the middle of the table by ${winnerEntry.player.name}${reasonText}.`;
        announce(claimMessage, 'good');
        log(claimMessage, 'good');
        claimedSomething = true;
        break;
      }
    }
  }

  function revenueBonusUnits(city, card) {
    let bonus = 0;
    const names = city.cards.map((entry) => normalize(entry.name));
    const features = cityFeatures(city);
    const hasGeorgeWashington = names.some((name) => name === normalize('George Washington'));
    const hasCourthouse = city.cards.some((entry) => {
      const text = normalize([entry.name, entry.occupation, entry.notes, ...(entry.tags || [])].filter(Boolean).join(' '));
      return text.includes('courthouse');
    });
    const businesses = cityBusinessCards(city);
    const restaurantCount = businesses.filter((business) => {
      const text = normalize([business.name, business.occupation, business.notes, ...(business.tags || [])].filter(Boolean).join(' '));
      return text.includes('restaurant') || text.includes('cafe') || text.includes('diner') || text.includes('grill') || text.includes('pizza') || text.includes('tavern') || text.includes('bar') || text.includes('bakery') || text.includes('ice cream');
    }).length;
    const medicalCount = businesses.filter((business) => {
      const text = normalize([business.name, business.occupation, business.notes, ...(business.tags || [])].filter(Boolean).join(' '));
      return text.includes('medical') || text.includes('dental') || text.includes('clinic') || text.includes('pharmacy');
    }).length;

    if (/Chattawa Smile Center|Riverwalk Dental Associates/i.test(card.name) && hasGeorgeWashington) {
      bonus += 1;
    }

    if (isAttorneyCard(card) && hasCourthouse) {
      bonus += 1;
    }

    if (/CommunityVerse Medical Pavilion|Greater Pepperville Medical Building/i.test(card.name)) {
      bonus += medicalCount;
    }

    if (/Trivia by Dylan/i.test(card.name)) {
      bonus += Math.min(2, restaurantCount);
    }

    if (/Santa's Noel Workshop/i.test(card.name)) {
      const santaCount = city.cards.filter((entry) => /santa|elf/i.test(entry.name)).length;
      bonus += santaCount;
    }

    if (/Chattawa County Chamber of Commerce/i.test(card.name)) {
      bonus += 0;
    }

    return bonus;
  }

  function isBankCard(card) {
    if (!card) return false;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    return (
      text.includes('bank')
      || text.includes('banks')
      || text.includes('banking')
      || (card.tags || []).some((tag) => normalize(tag) === 'bank')
    );
  }

  function isMoverCard(card) {
    if (!card) return false;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    return (
      text.includes('mover')
      || text.includes('movers')
      || text.includes('moving company')
      || (card.tags || []).some((tag) => normalize(tag) === 'movers')
    );
  }

  function isAttorneyCard(card) {
    if (!card) return false;
    const text = normalize([card.name, card.occupation, card.notes, ...(card.tags || [])].filter(Boolean).join(' '));
    return (
      text.includes('attorney')
      || text.includes('attorneys')
      || text.includes('law office')
      || text.includes('law firm')
      || text.includes('lawyer')
      || (card.tags || []).some((tag) => {
        const normalized = normalize(tag);
        return normalized === 'attorney' || normalized === 'attorneys';
      })
    );
  }

  function projectCityWithCard(player, addCard = null, removeCard = null) {
    const cards = (player?.cards || []).filter((entry) => entry !== removeCard);
    if (addCard) cards.push(addCard);
    const population = Math.max(
      0,
      Number(player?.population || 0)
        - (removeCard ? Number(removeCard.value || 0) : 0)
        + (addCard ? Number(addCard.value || 0) : 0),
    );
    return {
      ...player,
      cards,
      population,
    };
  }

  function cardUtilityScore(card, city) {
    if (!card || !city) return 0;
    const revenueUnits = parseRevenueUnits(card.revenue, city);
    const special = specialIncome(card, city);
    const populationScore = Number(card.value || 0) * 3;
    const revenueScore = Number.isFinite(revenueUnits) ? revenueUnits * 6 : 0;
    const cashScore = Number(special.cash || 0) * 5;
    const specialPopulationScore = Number(special.population || 0) * 3;
    return populationScore + revenueScore + cashScore + specialPopulationScore;
  }

  function moverTransferScore(card, sourcePlayer, targetPlayer) {
    if (!card || !sourcePlayer || !targetPlayer) return Number.NEGATIVE_INFINITY;
    const sourceScore = cardUtilityScore(card, sourcePlayer);
    const targetScore = cardUtilityScore(card, projectCityWithCard(targetPlayer, card));
    return sourceScore + targetScore;
  }

  function bestMoverOpportunityScore(playerIndex, strategy = 'balanced') {
    const mover = state.players[playerIndex];
    if (!mover) return 0;

    const ranked = state.players
      .map((player, index) => ({ player, index }))
      .filter((entry) => entry.index !== playerIndex && entry.player.cards.length)
      .sort((a, b) => b.player.population - a.player.population || b.player.cash - a.player.cash || a.player.seat - b.player.seat);

    const leaderIndex = ranked[0]?.index ?? null;
    const leaderPopulation = ranked[0]?.player?.population ?? 0;
    const roundProgress = state.initialDeckSize ? 1 - (state.deck.length / state.initialDeckSize) : 0;
    const lateGame = roundProgress >= 0.65 || state.round >= 5 || leaderPopulation >= 150;

    let bestScore = 0;
    for (const entry of ranked) {
      const targetPlayer = entry.player;
      const targetCards = targetPlayer.cards.filter((card) => card.type === 'business' || card.type === 'people');
      for (const card of targetCards) {
        let score = moverTransferScore(card, targetPlayer, mover);
        if (entry.index === leaderIndex) {
          score += lateGame ? 16 : 7;
        } else if (lateGame && entry.player.population >= Math.max(0, leaderPopulation - 15)) {
          score += 4;
        }
        if (strategy === 'aggressive') score *= 1.1;
        if (strategy === 'conservative') score *= 0.9;
        if (score > bestScore) bestScore = score;
      }
    }

    return bestScore;
  }

  function specialIncome(card, city) {
    const notes = normalize(card.notes);
    const name = card.name;
    let cash = 0;
    let population = 0;

    if (isBankCard(card)) {
      cash += Math.floor(city.population / 20);
    }

    if (/pepperville women's center/i.test(name)) {
      if (city.population > 50) {
        const femaleCount = femaleCardCount(city);
        cash += Math.min(20, femaleCount * 2);
      }
    }

    if (/lake ringwald/i.test(name)) {
      population += 1;
    }

    if (/chattawa valley recreation area/i.test(name)) {
      population += 1;
    }

    if (/fairytale lake & forest/i.test(name)) {
      population += 1;
    }

    if (/phinaes and abigail pepper statue/i.test(name)) {
      population += 5;
    }

    if (/chattawa valley times|this week in pepperville/i.test(name)) {
      // no direct income
    }

    if (/recycling center/i.test(name)) {
      // no direct income
    }

    if (/pepperville riverwalk|chattawa bridge|pepperville clock tower|wpep - channel 7|640 the chatt talk|pepperville arts center|chattawa county courthouse|chattawa valley high school|pepperchurch/i.test(name)) {
      // these are already handled by the revenue text, but some have special behaviors only in notes.
    }

    return { cash, population };
  }

  function pityFairyIsInPlay() {
    return state.players.some((player) => player.cards.some((card) => /pity fairy/i.test(card.name)));
  }

  function pityFairyHolderIndex() {
    return state.players.findIndex((player) => player.cards.some((card) => /pity fairy/i.test(card.name)));
  }

  function movePityFairyToCity(fromIndex, toIndex) {
    if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= state.players.length) return false;
    const cardName = 'Pity Fairy';
    const fromPlayer = Number.isInteger(fromIndex) && fromIndex >= 0 ? state.players[fromIndex] : null;
    const toPlayer = state.players[toIndex];
    if (!toPlayer) return false;

    if (fromPlayer && fromIndex !== toIndex) {
      const cardIndex = fromPlayer.cards.findIndex((card) => /pity fairy/i.test(card.name));
      if (cardIndex >= 0) {
        const [card] = fromPlayer.cards.splice(cardIndex, 1);
        toPlayer.cards.push(card);
        return true;
      }
    }

    if (!fromPlayer) {
      const card = data.businesses.find((entry) => /pity fairy/i.test(entry.name));
      if (card && !toPlayer.cards.some((entry) => /pity fairy/i.test(entry.name))) {
        toPlayer.cards.push(cloneCard(card, 'special'));
        return true;
      }
    }

    return fromIndex !== toIndex;
  }

  function choosePityFairyTarget() {
    if (!state.players.length) return null;
    const ranked = state.players
      .map((player, index) => ({ player, index }))
      .sort((a, b) => a.player.population - b.player.population || a.player.cash - b.player.cash || a.player.seat - b.player.seat);
    const lowestPopulation = ranked[0]?.player?.population ?? 0;
    const populationTied = ranked.filter((entry) => entry.player.population === lowestPopulation);
    const lowestCash = Math.min(...populationTied.map((entry) => entry.player.cash));
    const cashTied = populationTied.filter((entry) => entry.player.cash === lowestCash);
    const winner = cashTied[0] || populationTied[0] || ranked[0] || null;
    if (!winner) return null;
    return {
      index: winner.index,
      tiedPopulation: populationTied.length > 1,
      tiedCash: cashTied.length > 1,
    };
  }

  function applyPityFairy() {
    if (!pityFairyIsInPlay()) return null;
    const holderIndex = pityFairyHolderIndex();
    const target = choosePityFairyTarget();
    if (!target) return null;

    const player = state.players[target.index];
    if (!player) return null;

    if (holderIndex !== target.index) {
      movePityFairyToCity(holderIndex, target.index);
    }

    applyPopulationChange(player, 5, 'Pity Fairy');
    playPityFairyAudio();

    const message = target.tiedPopulation
      ? `The Pity Fairy is in play. Because there was a tie for the lowest population, it checks cash and brings 5 new people to ${player.name}.`
      : `The Pity Fairy is in play. It brings 5 new people to ${player.name}.`;

    log(message, 'good');
    return {
      targetName: player.name,
      message,
      tiedPopulation: target.tiedPopulation,
      tiedCash: target.tiedCash,
      holderIndex,
      targetIndex: target.index,
    };
  }

  function blindLuckCardIndex() {
    return state.deck.findIndex((card) => /blind luck/i.test(card.name));
  }

  function blindLuckCurrentBuyer() {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'blind-luck' || ctx.finished || ctx.phase !== 'offer') return null;
    const active = ctx.activeBuyers || [];
    if (!active.length) return null;
    const playerIndex = active[ctx.turnIndex % active.length];
    if (!Number.isInteger(playerIndex)) return null;
    return { index: playerIndex, player: state.players[playerIndex] || null };
  }

  function rotatePlayerOrder(startIndex = 0) {
    const total = state.players.length;
    if (!total) return [];
    return Array.from({ length: total }, (_, offset) => (startIndex + offset) % total);
  }

  function removeBlindLuckBuyer(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'blind-luck' || ctx.finished) return;
    const active = ctx.activeBuyers || [];
    const position = active.indexOf(playerIndex);
    if (position < 0) return;
    active.splice(position, 1);
    if (!active.length) {
      ctx.turnIndex = 0;
      return;
    }
    if (position < ctx.turnIndex) {
      ctx.turnIndex -= 1;
    }
    if (ctx.turnIndex >= active.length) {
      ctx.turnIndex = 0;
    }
  }

  function chooseBlindLuckAction(playerIndex) {
    const ctx = state.actionContext;
    const player = state.players[playerIndex];
    if (!ctx || ctx.type !== 'blind-luck' || ctx.finished || !player || player.isHuman) return null;
    if (player.cash < 20 || !ctx.offer) return { type: 'pass' };

    const others = state.players.filter((_, index) => index !== playerIndex);
    const highestOpponentCash = others.length ? Math.max(...others.map((opponent) => opponent.cash)) : 0;
    const averageOpponentCash = others.length
      ? others.reduce((sum, opponent) => sum + Number(opponent.cash || 0), 0) / others.length
      : 0;
    const cardsLeft = state.turnQueue.length;
    const cashAfterPurchase = player.cash - 20;
    const stimulusRange = cashAfterPurchase < 20;

    let buyBias = 0.7;

    if (player.cash >= 50) buyBias += 0.12;
    else if (player.cash >= 40) buyBias += 0.08;
    else if (player.cash <= 30) buyBias -= 0.15;

    if (player.cash <= 25) buyBias -= 0.05;

    if (cardsLeft <= 7 && player.cash <= 30) {
      buyBias -= averageOpponentCash <= 25 ? 0.2 : 0.1;
    }

    if (cardsLeft <= 4) {
      buyBias += 0.08;
    }

    if (stimulusRange) {
      buyBias += 0.18;
    }

    if (highestOpponentCash >= player.cash + 25) {
      buyBias += 0.16;
    }

    if (averageOpponentCash >= 40) {
      buyBias += 0.08;
    } else if (averageOpponentCash <= 25 && player.cash <= 30) {
      buyBias -= 0.18;
    }

    if (player.cash <= 25 && averageOpponentCash <= 25 && cardsLeft <= 7) {
      buyBias -= 0.15;
    }

    buyBias = Math.max(0.1, Math.min(0.95, buyBias));
    return Math.random() < buyBias ? { type: 'buy' } : { type: 'pass' };
  }

  async function startBlindLuckSequence(playerIndex, card) {
    const offer = state.deck[0] || null;
    const order = rotatePlayerOrder(playerIndex);
    const token = ++state.blindLuckToken;
    state.actionContext = {
      type: 'blind-luck',
      card,
      cardOwnerIndex: playerIndex,
      offer,
      order,
      activeBuyers: order.slice(),
      turnIndex: 0,
      phase: offer ? 'offer' : 'empty',
      finished: false,
      buyerIndex: null,
      revealedCard: null,
      lastActorIndex: null,
      token,
    };
    state.cardResolution = {
      tone: offer ? 'good' : 'warn',
      message: offer
        ? 'Blind Luck is offering the top card in the draw pile to each player for $20.'
        : 'Blind Luck found the draw pile empty and fizzled out.',
    };
    state.currentStage = 'special-resolution';
    render();

    if (!offer) {
      await waitForBlindLuck(900, token);
      if (state.blindLuckToken !== token) return;
      finishBlindLuckSequence(playerIndex, 'Blind Luck found the draw pile empty and fizzled out.', state.actionContext);
      return;
    }

    runBlindLuckAutoplay();
  }

  async function startPityFairySequence(card) {
    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      type: 'pity-fairy',
      phase: 'announce',
      targetIndex: null,
    };
    state.cardResolution = {
      tone: 'good',
      message: 'The Pity Fairy is searching for the city with the lowest population.',
    };
    state.currentStage = 'special-resolution';
    render();

    const step1 = await waitForSpecialSequence(700, token);
    if (!step1 || state.specialSequenceToken !== token) return;

    const target = choosePityFairyTarget();
    if (!target) {
      state.cardResolution = {
        tone: 'warn',
        message: 'The Pity Fairy could not find a city to visit.',
      };
      state.specialSequence = null;
      state.currentCard = null;
      state.awaitingNextCard = true;
      state.currentStage = 'card-complete';
      render();
      return;
    }

    addCardToCity(target.index, card, { fromSpecial: true });
    state.specialSequence = {
      ...(state.specialSequence || {}),
      type: 'pity-fairy',
      phase: 'placed',
      targetIndex: target.index,
    };
    state.cardResolution = {
      tone: 'good',
      message: `${card.name} goes to ${state.players[target.index].name}, the city with the lowest population.`,
    };
    render();

    const step2 = await waitForSpecialSequence(900, token);
    if (!step2 || state.specialSequenceToken !== token) return;

    state.specialSequence = null;
    state.currentStage = 'card-complete';
    state.awaitingNextCard = true;
    render();
  }

  async function startBoomTownSequence(card) {
    const token = ++state.specialSequenceToken;
    state.specialSequence = {
      card,
      type: 'boom-town',
      phase: 'announce',
      playerIndex: 0,
      drawNumber: 0,
      drawsTaken: 0,
    };
    state.cardResolution = {
      tone: 'good',
      message: 'Boom Times is erupting. Each city will receive two cards from the top of the deck.',
    };
    state.currentStage = 'special-resolution';
    render();

    const initialWait = await waitForSpecialSequence(700, token);
    if (!initialWait || state.specialSequenceToken !== token) return;

    let drawsTaken = 0;
    let deckEmpty = false;

    for (let playerIndex = 0; playerIndex < state.players.length; playerIndex += 1) {
      const player = state.players[playerIndex];
      if (!player) continue;

      for (let drawNumber = 0; drawNumber < 2; drawNumber += 1) {
        const drawn = state.deck.shift();
        if (!drawn) {
          deckEmpty = true;
          break;
        }

        drawsTaken += 1;
        state.specialSequence = {
          ...(state.specialSequence || {}),
          type: 'boom-town',
          phase: 'drawing',
          playerIndex,
          drawNumber: drawNumber + 1,
          drawsTaken,
        };
        state.cardResolution = {
          tone: 'good',
          message: `${card.name} sends ${drawn.name} to ${player.name} (${drawNumber + 1}/2 for this city).`,
        };
        render();

        const step = await waitForSpecialSequence(500, token);
        if (!step || state.specialSequenceToken !== token) return;

        addCardToCity(playerIndex, drawn, { fromSpecial: true, skipBusinessHooks: true });
        log(`${card.name} delivered ${drawn.name} to ${player.name}.`, 'good');
        maybeClaimPendingPeople();
        render();
      }

      if (deckEmpty) break;
    }

    state.discard.push(card);
    state.specialSequence = null;
    state.cardResolution = {
      tone: 'good',
      message: drawsTaken
        ? deckEmpty
          ? `${card.name} finished early because the deck ran out after ${drawsTaken} drawn card${drawsTaken === 1 ? '' : 's'}.`
          : `${card.name} finished. ${drawsTaken} card${drawsTaken === 1 ? '' : 's'} were dealt out across the cities.`
        : `${card.name} finished, but the deck was empty.`,
    };
    state.currentStage = 'card-complete';
    state.awaitingNextCard = true;
    maybeClaimPendingPeople();
    checkForWinner();
    render();
  }

  function finishBlindLuckSequence(holderIndex, message = null, ctxRef = null) {
    if (Number.isInteger(holderIndex) && holderIndex >= 0 && holderIndex < state.players.length) {
      const holder = state.players[holderIndex];
      const cardIndex = holder.cards.findIndex((card) => /blind luck/i.test(card.name));
      if (cardIndex >= 0) {
        const [card] = holder.cards.splice(cardIndex, 1);
        state.discard.push(card);
      }
    }
    if (state.currentCard && /blind luck/i.test(state.currentCard.name)) {
      state.discard.push(state.currentCard);
    }
    if (!ctxRef || state.actionContext === ctxRef || state.actionContext?.type === 'blind-luck') {
      state.actionContext = null;
    }
    state.cardResolution = message
      ? { tone: 'good', message }
      : null;
    state.awaitingNextCard = true;
    state.currentStage = 'card-complete';
    maybeClaimPendingPeople();
    checkForWinner();
    render();
  }

  async function buyBlindLuckCard(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'blind-luck' || ctx.finished) return false;
    const player = state.players[playerIndex];
    const offer = ctx.offer || state.deck[0] || null;
    if (!player || !offer || player.cash < 20) return false;

    ctx.buyerIndex = playerIndex;
    ctx.lastActorIndex = playerIndex;
    ctx.phase = 'drawing';
    const holderIndex = ctx.cardOwnerIndex;
    player.cash -= 20;
    log(`${player.name} bought a top card sight unseen for $20.`, 'good');
    state.cardResolution = {
      tone: 'good',
      message: `${player.name} bought a top card sight unseen for $20.`,
    };
    state.currentStage = 'special-resolution';
    render();

    const token = ctx.token;
    await waitForBlindLuck(650, token);
    if (state.blindLuckToken !== token || state.actionContext !== ctx) return false;

    const prize = state.deck.shift() || offer;
    ctx.phase = 'reveal';
    ctx.revealedCard = prize;
    state.cardResolution = {
      tone: 'good',
      message: `${player.name} got ${prize.name}.`,
    };
    render();

    await waitForBlindLuck(1100, token);
    if (state.blindLuckToken !== token || state.actionContext !== ctx) return false;

    addCardToCity(playerIndex, prize, { fromSpecial: true });
    log(`Blind Luck revealed ${prize.name} for ${player.name}.`, 'good');
    ctx.finished = true;
    finishBlindLuckSequence(holderIndex, `${player.name} got ${prize.name} from Blind Luck.`, ctx);
    return true;
  }

  async function passBlindLuckCard(playerIndex) {
    const ctx = state.actionContext;
    if (!ctx || ctx.type !== 'blind-luck' || ctx.finished) return false;
    const player = state.players[playerIndex];
    if (!player) return false;

    ctx.lastActorIndex = playerIndex;
    ctx.phase = 'passing';
    state.cardResolution = {
      tone: 'good',
      message: `${player.name} passed on Blind Luck.`,
    };
    state.currentStage = 'special-resolution';
    render();

    const token = ctx.token;
    await waitForBlindLuck(650, token);
    if (state.blindLuckToken !== token || state.actionContext !== ctx) return false;

    log(`${player.name} passed on Blind Luck's top-card offer.`, 'normal');
    removeBlindLuckBuyer(playerIndex);
    ctx.turnIndex = ctx.activeBuyers && ctx.activeBuyers.length ? ctx.turnIndex % ctx.activeBuyers.length : 0;

    const next = blindLuckCurrentBuyer();
    if (!next) {
      log('Nobody bought the top card from Blind Luck.', 'warn');
      ctx.finished = true;
      finishBlindLuckSequence(ctx.cardOwnerIndex, 'Blind Luck finished with no buyers.', ctx);
      return true;
    }

    ctx.phase = 'offer';
    state.cardResolution = {
      tone: 'good',
      message: 'Blind Luck is offering the top card in the draw pile to each player for $20.',
    };
    render();
    runBlindLuckAutoplay();
    return true;
  }

  function runBlindLuckAutoplay() {
    let guard = 0;
    while (guard < 20) {
      const ctx = state.actionContext;
      if (!ctx || ctx.type !== 'blind-luck' || ctx.finished) return;

      const active = blindLuckCurrentBuyer();
      if (!active) return;
      const player = active.player;
      if (!player || player.isHuman) return;

      const action = chooseBlindLuckAction(active.index);
      if (!action) return;

      if (action.type === 'buy') {
        buyBlindLuckCard(active.index);
      } else {
        passBlindLuckCard(active.index);
      }

      if (!state.actionContext || state.actionContext.type !== 'blind-luck' || state.actionContext.finished) return;
      guard += 1;
    }
  }

  function evaluateRevenueCard(card, city) {
    const text = String(card.revenue || '');
    const special = specialIncome(card, city);

    if (text === 'special') {
      return special;
    }

    const baseUnits = parseRevenueUnits(text, city);
    if (baseUnits === null || Number.isNaN(baseUnits)) {
      return special;
    }

    let effectiveBaseUnits = baseUnits;
    if (/phineas pepper amphitheater/i.test(card.name) && effectiveBaseUnits === -1 && cityHasRestaurantInLocation(city, 'Pepperville Historic District')) {
      effectiveBaseUnits = 0;
    }

    const bonusUnits = revenueBonusUnits(city, card);

    if (effectiveBaseUnits === 0 && bonusUnits === 0) {
      return {
        cash: special.cash,
        population: special.population,
        units: 0,
        roll: null,
        baseUnits: effectiveBaseUnits,
        bonusUnits,
      };
    }

    const units = effectiveBaseUnits + bonusUnits;
    const roll = roll2d6();
    const chartRow = REVENUE_CHART[Math.min(30, Math.max(1, Math.abs(units)))];
    const cash = chartRow?.[roll] ?? 0;
    const signedCash = units < 0 ? -cash : cash;
    return {
      cash: signedCash + special.cash,
      population: special.population,
      units,
      roll,
      baseUnits: effectiveBaseUnits,
      bonusUnits,
    };
  }

  async function collectIncome() {
    if (!state.started || state.winner) return;

    cancelEndRound();
    log(`Income phase for Round ${state.round}.`);

    const spiderCityIndex = findSpiderCityIndex();
    if (spiderCityIndex >= 0) {
      const spiderResolved = await playGiantSpiderSequence(spiderCityIndex);
      if (!spiderResolved && state.giantSpiderSequenceToken) {
        // The sequence may have been canceled or interrupted.
        return;
      }
    }

    const token = ++state.endRoundToken;
    const peopleRows = [];
    const moneyRows = [];
    const stimulusRows = [];

    for (const player of state.players) {
      let cashDelta = 0;
      let specialPopDelta = 0;
      player.incomeBreakdown = [];
      const result = evaluateCityIncome(player);
      cashDelta += result.cash || 0;
      specialPopDelta += result.population || 0;

      const rollLabel = result.roll ? `, rolled ${result.roll}` : '';
      const revenueCashLabel = result.revenueCash ? ` ${result.revenueCash >= 0 ? '+' : ''}${money(result.revenueCash)}` : ' $0';
      player.incomeBreakdown.push(`City total: ${result.revenueUnits >= 0 ? '+' : ''}${result.revenueUnits}R${rollLabel}${revenueCashLabel}`);

      if (result.specialLines.length) {
        player.incomeBreakdown.push(`Special income: ${result.specialLines.join(', ')}`);
      }

      if (specialPopDelta) {
        applyPopulationChange(player, specialPopDelta, 'end-of-round special');
      }

      const growthDelta = rollDie(6);
      applyPopulationChange(player, growthDelta, 'end-of-round people growth');

      peopleRows.push({
        name: player.name,
        delta: growthDelta,
      });
      moneyRows.push({
        name: player.name,
        delta: cashDelta,
      });

      const preIncomeCash = player.cash;
      const postIncomeCash = preIncomeCash + cashDelta;
      player.cash = Math.max(0, postIncomeCash);

      if (cashDelta !== 0) {
        log(`${player.name} netted ${money(cashDelta)} from city income.`);
      } else {
        log(`${player.name} broke even on cash income.`);
      }

      if (postIncomeCash < 0) {
        log(`${player.name}'s cash income would have dropped below $0, so it was floored at $0.`, 'warn');
      }

      if (specialPopDelta) {
        log(`${player.name} gained ${specialPopDelta > 0 ? '+' : ''}${specialPopDelta} population from end-of-round specials.`, 'good');
      }

      log(`${player.name} gained +${growthDelta} population from random end-of-round growth.`, 'good');

      if (player.cash < 20) {
        stimulusRows.push({
          name: player.name,
          delta: 20,
          before: player.cash,
          after: player.cash + 20,
        });
      }
    }

    state.turnQueue = [];
    state.currentCard = null;
    state.endRound = {
      round: state.round,
      stage: 'people',
      peopleRows,
      moneyRows,
      stimulusRows,
      pityFairy: null,
    };
    state.currentStage = 'end-of-round-people';
    render();

    const keepGoing = await waitForEndRound(1100, token);
    if (!keepGoing || state.endRoundToken !== token) return;

    state.endRound.stage = 'money';
    state.currentStage = 'end-of-round-money';
    render();

    const finish = await waitForEndRound(1100, token);
    if (!finish || state.endRoundToken !== token) return;

    const pityFairy = applyPityFairy();
    if (pityFairy) {
      state.endRound.pityFairy = pityFairy;
      state.endRound.stage = 'pity-fairy';
      state.currentStage = 'end-of-round-pity-fairy';
      render();

      const pityWait = await waitForEndRound(1100, token);
      if (!pityWait || state.endRoundToken !== token) return;
    }

    state.endRound.stage = 'stimulus';
    state.currentStage = 'end-of-round-stimulus';
    if (state.endRound.stimulusRows.length) {
      for (const row of state.endRound.stimulusRows) {
        const player = state.players.find((entry) => entry.name === row.name);
        if (!player) continue;
        player.cash = row.after;
        log(`${player.name} received ${money(row.delta)} stimulus, bringing them to ${money(player.cash)}.`, 'good');
      }
    }
    render();

    const stimulusWait = await waitForEndRound(1100, token);
    if (!stimulusWait || state.endRoundToken !== token) return;

    state.endRound.stage = 'done';
    state.currentStage = 'income-complete';
    checkForWinner(true);
    render();

    if (!state.winner) {
      state.currentStage = 'ready-for-next-round';
      log('Round complete. Begin the next round when you are ready.');
      render();
    }
  }

  function maybeFinishTurn() {
    if (!state.started || state.winner) return;
    if (state.currentCard) return;
    if (state.actionContext) return;
    if (state.turnQueue.length) return;
    if (state.currentStage === 'ready-for-next-round' || state.currentStage === 'income-complete' || state.currentStage === 'end-of-round-people' || state.currentStage === 'end-of-round-money' || state.currentStage === 'end-of-round-stimulus') return;
    collectIncome();
  }

  function checkForWinner(afterIncome = false) {
    const leaders = [...state.players].sort((a, b) => b.population - a.population || b.cash - a.cash);
    const top = leaders[0];
    if (!top) return;

    const hitTarget = top.population >= 200;
    if (!hitTarget || !afterIncome) return;

    const tied = state.players.filter((player) => player.population === top.population);
    if (tied.length > 1) {
      log(`A tie at ${top.population} population will trigger one more round.`, 'warn');
      return;
    }

    state.winner = top;
    state.currentStage = 'game-over';
    log(`${top.name} wins City Manager: Pepperville with ${top.population} population!`, 'good');
    render();
  }

  function renderStatusLine() {
    const parts = [];
    if (!state.started) {
      parts.push('<span class="status-pill">Waiting to start</span>');
    } else {
      parts.push(`<span class="status-pill">Cards left: ${state.deck.length}</span>`);
      if (state.currentCard) {
        parts.push(`<span class="status-pill">${escapeHtml(state.currentCard.type)} card active</span>`);
      }
      if (state.winner) {
        parts.push(`<span class="status-pill warn">Winner: ${escapeHtml(state.winner.name)}</span>`);
      }
    }
    els.statusLine.innerHTML = parts.join('');
  }

  function renderCurrentCard() {
    const card = state.currentCard;
    if (state.actionContext?.type === 'giant-spider') {
      const ctx = state.actionContext;
      const spiderCard = ctx.card || data.businesses.find((entry) => isGiantSpiderAttackCard(entry)) || {
        name: 'Giant Spider Attack',
        type: 'special',
        photoFile: 'giant-spider-attack.jpg',
      };
      const city = state.players[ctx.cityIndex];
      const phase = state.giantSpiderSequence?.phase || ctx.phase || 'prompt';
      const roll = state.giantSpiderSequence?.roll || null;
      let extraLine = '';
      let noteLine = state.cardResolution?.message || '';

      if (phase === 'prompt') {
        extraLine = `${city?.name || 'A city'} currently has the Giant Spider.`;
        noteLine = `Pay $75 before the roll to destroy it, or let the Spider roll against the city.`;
      } else if (phase === 'rolling') {
        extraLine = `${city?.name || 'A city'} currently has the Giant Spider.`;
        noteLine = 'The Spider has NOT been removed. Dice Roll is:';
      } else if (phase === 'result') {
        extraLine = `${city?.name || 'A city'} currently has the Giant Spider.`;
        noteLine = state.cardResolution?.message || 'The Spider is resolving.';
      } else if (phase === 'paid') {
        extraLine = `${city?.name || 'A city'} currently has the Giant Spider.`;
        noteLine = state.cardResolution?.message || 'The Spider has been destroyed before the roll.';
      }

      els.currentCard.innerHTML = renderCardShell(spiderCard, `<div class="card-badge special">${escapeHtml(specialCardBadgeLabel(spiderCard))}</div>`, `
        <div class="card-title">${escapeHtml(spiderCard.name)}</div>
        <div class="card-meta">${escapeHtml(extraLine)}</div>
        <div class="card-notes" style="margin-top: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(53, 53, 53, 0.08); border: 1px solid rgba(53, 53, 53, 0.12); font-weight: 700;">${escapeHtml(noteLine)}</div>
        ${roll ? `<div class="card-notes" style="margin-top: 10px;">Dice Roll: <strong>${roll[0]}</strong> and <strong>${roll[1]}</strong></div>` : ''}
      `);
      return;
    }

    if (state.winner && !card) {
      const winner = state.winner;
      const topCities = [...state.players]
        .sort((a, b) => b.population - a.population || b.cash - a.cash)
        .slice(0, 3)
        .map((player, index) => ({
          name: player.name,
          rank: index + 1,
          population: player.population,
          cash: player.cash,
          revenue: citySummary(player).revenueUnits,
        }));

      els.currentCard.innerHTML = `
        <div class="winner-screen">
          <div class="winner-banner">
            <div class="winner-kicker">City Manager Champion</div>
            <div class="winner-title">${escapeHtml(winner.name)}</div>
            <div class="winner-subtitle">has reached <strong>${winner.population}</strong> population and won City Manager: Pepperville.</div>
          </div>

          <div class="winner-grid">
            <div class="winner-main">
              <div class="winner-trophy">🏆</div>
              <div class="winner-stat-grid">
                <div class="winner-stat">
                  <div class="winner-stat-label">Final population</div>
                  <div class="winner-stat-value">${winner.population}</div>
                </div>
                <div class="winner-stat">
                  <div class="winner-stat-label">Cash on hand</div>
                  <div class="winner-stat-value">${money(winner.cash)}</div>
                </div>
                <div class="winner-stat">
                  <div class="winner-stat-label">Businesses</div>
                  <div class="winner-stat-value">${cityBusinessCards(winner).length}</div>
                </div>
                <div class="winner-stat">
                  <div class="winner-stat-label">People cards</div>
                  <div class="winner-stat-value">${cityPeopleCards(winner).length}</div>
                </div>
              </div>
              <div class="winner-callout">
                The city crossed the 200-resident mark after the final income check. Time to celebrate the new downtown powerhouse.
              </div>
            </div>

            <div class="winner-side">
              <div class="winner-side-title">Final standings</div>
              <div class="winner-leaderboard">
                ${topCities.map((player) => `
                  <div class="winner-leader">
                    <div>
                      <div class="winner-leader-name">${escapeHtml(player.rank === 1 ? `${player.name} - Winner` : player.name)}</div>
                      <div class="winner-leader-meta">${player.population} population · ${money(player.cash)} · ${player.revenue}R</div>
                    </div>
                    <div class="winner-leader-rank">#${player.rank}</div>
                  </div>
                `).join('')}
              </div>
              <div class="winner-note">
                Start a new game to build a different city, or use the card roster to explore the deck one more time.
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (!card) {
      const announcement = state.lastAnnouncement;
      if (state.endRound) {
        const peopleVisible = state.endRound.stage === 'people' || state.endRound.stage === 'money' || state.endRound.stage === 'pity-fairy' || state.endRound.stage === 'stimulus' || state.endRound.stage === 'done';
        const moneyVisible = state.endRound.stage === 'money' || state.endRound.stage === 'pity-fairy' || state.endRound.stage === 'stimulus' || state.endRound.stage === 'done';
        const pityFairyVisible = state.endRound.stage === 'pity-fairy' || state.endRound.stage === 'stimulus' || state.endRound.stage === 'done';
        const stimulusVisible = state.endRound.stage === 'stimulus' || state.endRound.stage === 'done';
        const renderRows = (rows, kind = 'plain') => rows.map((row) => {
          const value = Number(row.delta || 0);
          const display = kind === 'money'
            ? `${value > 0 ? '+' : value < 0 ? '-' : ''}$${Math.abs(value)}`
            : value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`;
          return `
          <div class="round-result-row">
            <div class="round-result-name">${escapeHtml(row.name)}</div>
            <div class="round-result-value ${value > 0 ? 'good' : value < 0 ? 'bad' : ''}">${escapeHtml(display)}</div>
          </div>
        `;
        }).join('');

        els.currentCard.innerHTML = `
          <div class="round-results">
            <div class="round-results-title">END OF ROUND RESULTS</div>
            ${moneyVisible ? `
              <section class="round-results-block">
                <div class="round-results-heading">RANDOM INCREASE OF MONEY</div>
                <div class="round-results-list">
                  ${renderRows(state.endRound.moneyRows, 'money')}
                </div>
              </section>
            ` : ''}
            ${pityFairyVisible && state.endRound.pityFairy ? `
              <section class="round-results-block">
                <div class="round-results-heading">PITY FAIRY</div>
                <div class="round-results-list">
                  <div class="round-results-foot">${escapeHtml(state.endRound.pityFairy.message)}</div>
                </div>
              </section>
            ` : ''}
            ${peopleVisible ? `
              <section class="round-results-block">
                <div class="round-results-heading">RANDOM INCREASE OF PEOPLE</div>
                <div class="round-results-list">
                  ${renderRows(state.endRound.peopleRows)}
                </div>
              </section>
            ` : ''}
            ${stimulusVisible ? `
              <section class="round-results-block">
                <div class="round-results-heading">STIMULUS PROGRAM</div>
                <div class="round-results-list">
                  ${state.endRound.stimulusRows.length ? state.endRound.stimulusRows.map((row) => `
                    <div class="round-result-row">
                      <div class="round-result-name">${escapeHtml(row.name)}</div>
                      <div class="round-result-value good">${escapeHtml(`+${money(row.delta)}`)}</div>
                    </div>
                  `).join('') : '<div class="round-results-foot">No cities needed stimulus.</div>'}
                </div>
                ${state.endRound.stimulusRows.length ? `<div class="round-results-foot">Cities below $20 each received $20 before the next round.</div>` : ''}
              </section>
            ` : ''}
            ${state.endRound.stage === 'done' ? `<div class="round-results-foot">Begin the next round when you are ready.</div>` : ''}
          </div>
        `;
        return;
      }
      els.currentCard.innerHTML = `
        <div class="card-badge">No card revealed yet</div>
        <div class="card-title">${state.started ? 'Reveal the next card when you are ready.' : 'Start a new game to begin.'}</div>
        <div class="card-meta">${state.started ? 'The next card is ready in the deck.' : 'Choose your players and start the table.'}</div>
        ${announcement ? `<div class="card-notes" style="margin-top: 12px; padding: 10px 12px; border-radius: 14px; background: rgba(107, 63, 27, 0.08); border: 1px solid rgba(107, 63, 27, 0.14);">${escapeHtml(announcement.message)}</div>` : ''}
        ${state.started && state.turnQueue.length ? `
          <div class="card-notes" style="margin-top: 12px;">
            <button data-action="reveal-next-card">Reveal Next Card</button>
          </div>
        ` : ''}
      `;
      return;
    }

    if (state.actionContext?.type === 'blind-luck') {
      const ctx = state.actionContext;
      const active = blindLuckCurrentBuyer();
      const playerName = (Number.isInteger(ctx.lastActorIndex) && state.players[ctx.lastActorIndex])
        ? state.players[ctx.lastActorIndex].name
        : active?.player?.name || 'the table';
      const phase = ctx.phase || 'offer';
      const titleText = phase === 'reveal' && ctx.revealedCard
        ? `${ctx.revealedCard.name}`
        : card.name;
      const mainMessage = phase === 'drawing'
        ? `${playerName} paid $20 and is drawing...`
        : phase === 'reveal' && ctx.revealedCard
          ? `${playerName} got ${ctx.revealedCard.name}.`
          : phase === 'passing'
            ? `${playerName} passed on Blind Luck.`
            : ctx.offer
              ? 'Blind Luck is offering the top card in the draw pile sight unseen for $20.'
              : 'Blind Luck found the draw pile empty.';
      const detailMessage = phase === 'reveal' && ctx.revealedCard
        ? (ctx.revealedCard.notes || ctx.revealedCard.revenue || ctx.revealedCard.occupation || 'The card is now being applied to that city.')
        : card.notes || card.revenue || 'No extra text provided';
      els.currentCard.innerHTML = renderCardShell(card, `<div class="card-badge special">${escapeHtml(specialCardBadgeLabel(card))}</div>`, `
        <div class="card-title">${escapeHtml(card.name)}</div>
        <div class="card-meta">${escapeHtml(detailMessage)}</div>
        <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
        ${phase === 'reveal' && ctx.revealedCard ? `<div class="card-notes" style="margin-top: 8px;">They got: <strong>${escapeHtml(titleText)}</strong></div>` : ''}
        <div class="card-notes" style="margin-top: 8px;">${escapeHtml(mainMessage)}</div>
        <div class="card-notes" style="margin-top: 8px;">Current player: ${escapeHtml(playerName)}.</div>
      `);
      return;
    }

    if (state.actionContext?.type === 'place-bumbles') {
      const ctx = state.actionContext;
      const owner = state.players[ctx.buyerIndex];
      if (!owner) return;
      const phase = ctx.phase || 'choose-target';
      const target = Number.isInteger(ctx.targetIndex) && state.players[ctx.targetIndex]
        ? state.players[ctx.targetIndex]
        : null;
      const targetCards = target?.cards || [];
      const targetCardsMarkup = targetCards.length
        ? `<div class="city-card-list" style="margin-top: 10px;">${targetCards.map((entry) => `<span class="card-pill">${escapeHtml(entry.name)}</span>`).join('')}</div>`
        : '<div class="small" style="margin-top: 8px;">That city has no cards yet.</div>';
      const instructions = phase === 'attempting'
        ? `Bumbles is reading the cards in ${target?.name || 'the chosen city'}.`
        : 'Choose an opponent. You can read their city cards after you pick one.';
      els.currentCard.innerHTML = renderCardShell(card, `<div class="card-badge special">${escapeHtml(specialCardBadgeLabel(card))}</div>`, `
        <div class="card-title">${escapeHtml(card.name)}</div>
        <div class="card-meta">${escapeHtml(card.notes || card.revenue || 'No extra text provided')}</div>
        <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
        <div class="card-notes" style="margin-top: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(53, 107, 103, 0.08); border: 1px solid rgba(53, 107, 103, 0.14); color: var(--accent-2); font-weight: 700;">${escapeHtml(instructions)}</div>
        ${target ? `<div class="card-notes" style="margin-top: 8px;">Target city: <strong>${escapeHtml(target.name)}</strong>.</div>` : ''}
        ${target ? targetCardsMarkup : ''}
        <div class="card-notes" style="margin-top: 8px;">Current owner: <strong>${escapeHtml(owner.name)}</strong>.</div>
      `);
      return;
    }

    if (state.actionContext?.type === 'place-mover') {
      const ctx = state.actionContext;
      const mover = state.players[ctx.buyerIndex];
      if (!mover) return;
      const phase = ctx.phase || 'choose-target';
      const target = Number.isInteger(ctx.targetIndex) && state.players[ctx.targetIndex]
        ? state.players[ctx.targetIndex]
        : null;
      const targetCards = target ? moverEligibleCards(target) : [];
      const instructions = phase === 'choose-card'
        ? `${mover.name} chose ${target?.name || 'a city'}. Now choose a card to move.`
        : `${mover.name} won ${card.name}. Choose a player to move a card from.`;
      els.currentCard.innerHTML = renderCardShell(card, `<div class="card-badge special">${escapeHtml(specialCardBadgeLabel(card))}</div>`, `
        <div class="card-title">${escapeHtml(card.name)}</div>
        <div class="card-meta">${escapeHtml(card.notes || card.revenue || 'No extra text provided')}</div>
        <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
        <div class="card-notes" style="margin-top: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(47, 111, 79, 0.08); border: 1px solid rgba(47, 111, 79, 0.14); color: var(--good); font-weight: 700;">${escapeHtml(instructions)}</div>
        ${phase === 'choose-card' && target ? `<div class="card-notes" style="margin-top: 8px;">Target city: <strong>${escapeHtml(target.name)}</strong> (${targetCards.length} eligible card${targetCards.length === 1 ? '' : 's'}).</div>` : ''}
      `);
      return;
    }

    if ((state.actionContext?.type === 'place-reactor' && isReactorCard(card)) || (state.actionContext?.type === 'place-pool' && isPoolCard(card))) {
      const buyer = state.players[state.actionContext.buyerIndex];
      const targetCity = buyer ? buyer.name : 'a city';
      els.currentCard.innerHTML = renderCardShell(card, '<div class="card-badge good">BUSINESS</div>', `
        <div class="card-title">${escapeHtml(card.name)}</div>
        <div class="card-meta">${escapeHtml(card.occupation || card.revenue || 'No extra text provided')}</div>
        <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
        <div class="card-notes" style="margin-top: 8px;">Revenue: ${formatRevenueRuleHtml(card.revenue || '')}</div>
        <div class="card-notes" style="margin-top: 12px; padding: 14px 16px; border-radius: 16px; background: rgba(47, 111, 79, 0.08); border: 1px solid rgba(47, 111, 79, 0.14); color: var(--good); font-weight: 700;">Choose which city gets the reactor. The chosen city loses 20 population, and the other two cities lose 5 population each.</div>
        <div class="card-notes" style="margin-top: 8px;">Current winner: ${escapeHtml(targetCity)}.</div>
      `);
      return;
    }

    if (card.type === 'people' && state.peopleBattle) {
      els.currentCard.innerHTML = renderPeopleBattle();
      return;
    }

    if (card.type === 'people' && state.cardResolution?.peopleBattle) {
      els.currentCard.innerHTML = `
        ${renderPeopleBattle(state.cardResolution.peopleBattle)}
      `;
      return;
    }

    if (state.cardResolution) {
      const resolutionClass = state.cardResolution.tone === 'warn' ? 'warn' : 'good';
      const cardBadge = card.type === 'special'
        ? specialCardBadgeLabel(card)
        : card.type === 'business'
          ? 'BUSINESS'
          : 'PEOPLE';
      const badgeClass = card.type === 'special' ? 'special' : resolutionClass;
      const metaLine = card.type === 'business'
        ? `Revenue: ${formatRevenueRuleHtml(card.revenue)}`
        : escapeHtml(card.occupation || card.revenue || 'No extra text provided');
      const extraInfo = card.type === 'people'
        ? `${cardLocationMarkup(card)}${card.preferences ? `<div class="card-notes" style="margin-top: 8px;">Preferences: ${escapeHtml(card.preferences)}</div>` : ''}${cardFlavorText(card)}`
        : `${cardLocationMarkup(card)}${cardCategoriesMarkup(card)}${card.type === 'special' ? `<div class="card-notes" style="margin-top: 8px;">${escapeHtml(specialCardEffectText(card))}</div>` : ''}`;
      els.currentCard.innerHTML = renderCardShell(card, `<div class="card-badge ${badgeClass}">${cardBadge}</div>`, `
        <div class="card-title">${escapeHtml(card.name)}</div>
        <div class="card-meta">${metaLine}</div>
        <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
        ${extraInfo}
        <div class="card-notes" style="margin-top: 12px; padding: 14px 16px; border-radius: 16px; background: ${resolutionClass === 'good' ? 'rgba(47, 111, 79, 0.08)' : 'rgba(155, 61, 43, 0.08)'}; border: 1px solid ${resolutionClass === 'good' ? 'rgba(47, 111, 79, 0.14)' : 'rgba(155, 61, 43, 0.14)'}; color: ${resolutionClass === 'good' ? 'var(--good)' : 'var(--bad)'}; font-weight: 700;">${escapeHtml(state.cardResolution.message)}</div>
      `);
      return;
    }

    const tone = card.type === 'special' ? 'special' : card.type === 'business' ? 'good' : card.type === 'people' ? 'warn' : 'normal';
    const badgeLabel = card.type === 'special' ? specialCardBadgeLabel(card) : card.type.toUpperCase();
    const notes = card.type === 'special'
      ? `<div class="card-notes" style="margin-top: 8px;">${escapeHtml(specialCardEffectText(card))}</div>`
      : card.notes
        ? `<div class="card-notes" style="margin-top: 8px;">${escapeHtml(card.notes)}</div>`
        : '';
    const attractedPendingPeople = card.type === 'business' ? businessMatchesPendingPeople(card) : [];
    const attractedMessage = attractedPendingPeople.length
      ? `<div class="card-notes" style="margin-top: 10px; padding: 12px 14px; border-radius: 14px; background: rgba(47, 111, 79, 0.08); border: 1px solid rgba(47, 111, 79, 0.14); color: var(--good); font-weight: 700;">Win this card and you will also attract ${escapeHtml(formatAttractedPendingPeople(attractedPendingPeople))}.</div>`
      : '';

    els.currentCard.innerHTML = renderCardShell(card, `<div class="card-badge ${tone === 'good' ? 'good' : tone === 'warn' ? 'bad' : tone === 'special' ? 'special' : ''}">${badgeLabel}</div>`, `
      <div class="card-title">${escapeHtml(card.name)}</div>
      <div class="card-meta">${card.type === 'business' ? `Revenue: ${formatRevenueRuleHtml(card.revenue)}` : escapeHtml(card.occupation || card.revenue || 'No extra text provided')}</div>
      <div class="card-notes" style="margin-top: 8px;">Population value: ${card.value >= 0 ? '+' : ''}${card.value}</div>
      ${cardCategoriesMarkup(card)}
      ${notes}
      ${card.type === 'people' ? `<div class="card-notes" style="margin-top: 8px;">Preferences: ${escapeHtml(card.preferences || '')}</div>${cardFlavorText(card)}` : ''}
      ${attractedMessage}
    `);
  }

  function renderTurnQueue() {
    const cards = state.turnQueue.slice(0, 8);
    const count = cards.length;
    els.turnQueue.innerHTML = `
      <div class="queue-strip" aria-label="Current round queue">
        ${Array.from({ length: 8 }, (_, index) => {
          const filled = index < count;
          return `<span class="queue-step ${filled ? 'filled' : ''}">${index + 1}</span>`;
        }).join('')}
      </div>
      <div class="queue-count">${count} card${count === 1 ? '' : 's'} remaining</div>
    `;
  }

  function renderActionArea() {
    const ctx = state.actionContext;
    const buttons = [];

    if (!state.started && !state.currentCard && !state.turnQueue.length && !ctx && !state.peopleBattle && !state.endRound) {
      els.actionArea.innerHTML = '<div class="small">Start a game to unlock the table.</div>';
      return;
    }

    if (state.winner) {
      els.actionArea.innerHTML = '<div class="small">The game is over. Start a new game to play again.</div>';
      return;
    }

    if (ctx?.type === 'giant-spider') {
      const city = state.players[ctx.cityIndex];
      const phase = state.giantSpiderSequence?.phase || ctx.phase || 'prompt';
      const cash = city?.cash ?? 0;
      if (!city) {
        els.actionArea.innerHTML = '<div class="small">The Giant Spider is resolving.</div>';
        return;
      }

      if (!city.isHuman) {
        const text = phase === 'prompt'
          ? `${city.name} is deciding whether to pay $75 to destroy the Giant Spider.`
          : 'The Giant Spider is resolving.';
        els.actionArea.innerHTML = `<div class="small">${escapeHtml(text)}</div>`;
        return;
      }

      if (phase === 'prompt') {
        buttons.push(`<div class="small"><strong>${escapeHtml(city.name)}</strong> currently has the Giant Spider. Do you want to pay $75 to destroy it before the roll?</div>`);
        buttons.push(`
          <div class="turn-actions">
            <button data-action="giant-spider-pay"${cash >= 75 ? '' : ' disabled'}>Pay $75 to Destroy</button>
            <button data-action="giant-spider-roll">Roll Instead</button>
          </div>
        `);
      } else {
        buttons.push(`<div class="small">${escapeHtml(city.name)} is resolving the Giant Spider.</div>`);
      }

      els.actionArea.innerHTML = buttons.join('');
      return;
    }

    if (state.peopleBattle) {
      els.actionArea.innerHTML = '<div class="small">The preference battle is resolving row by row.</div>';
      return;
    }

    if (ctx?.type === 'place-reactor' || ctx?.type === 'place-pool') {
      const placer = state.players[ctx.buyerIndex];
      if (!placer) return;
      if (placer.isHuman) {
        buttons.push(`<div class="small"><strong>${escapeHtml(placer.name)}</strong> won ${escapeHtml(ctx.card.name)}. Choose the city to place it in.</div>`);
        buttons.push(`
          <div class="turn-actions">
            ${state.players.map((player, index) => `
              <button data-action="${ctx?.type === 'place-pool' ? 'place-pool' : 'place-reactor'}" data-city="${index}">${escapeHtml(player.name)} (${player.population})</button>
            `).join('')}
          </div>
        `);
      } else {
        buttons.push(`<div class="small">AI is choosing where to place ${escapeHtml(ctx.card.name)}.</div>`);
      }
      els.actionArea.innerHTML = buttons.join('');
      return;
    }

    if (ctx?.type === 'place-spider') {
      const placer = state.players[ctx.buyerIndex];
      if (!placer) return;
      if (placer.isHuman) {
        buttons.push(`<div class="small"><strong>${escapeHtml(placer.name)}</strong> won ${escapeHtml(ctx.card.name)} and is choosing a city to place it in.</div>`);
        buttons.push(`
          <div class="turn-actions">
            ${state.players.map((player, index) => `
              <button data-action="place-spider" data-city="${index}">${escapeHtml(player.name)} (${player.population})</button>
            `).join('')}
          </div>
        `);
      } else {
        buttons.push(`<div class="small">AI is choosing where to place ${escapeHtml(ctx.card.name)}.</div>`);
      }
      els.actionArea.innerHTML = buttons.join('');
      return;
    }

    if (ctx?.type === 'place-mover') {
      const mover = state.players[ctx.buyerIndex];
      if (!mover) return;
      const phase = ctx.phase || 'choose-target';
      if (!mover.isHuman) {
        const targetName = Number.isInteger(ctx.targetIndex) && state.players[ctx.targetIndex]
          ? state.players[ctx.targetIndex].name
          : 'a city';
        const stepText = phase === 'choose-card'
          ? `AI is choosing which card to move from ${targetName}.`
          : `AI is choosing which city to steal from for ${ctx.card.name}.`;
        buttons.push(`<div class="small">${escapeHtml(stepText)}</div>`);
        els.actionArea.innerHTML = buttons.join('');
        return;
      }

      if (phase === 'choose-target') {
        const targets = state.players
          .map((player, index) => ({ player, index }))
          .filter((entry) => entry.index !== ctx.buyerIndex && moverEligibleCards(entry.player).length > 0);
        buttons.push(`<div class="small"><strong>${escapeHtml(mover.name)}</strong> won ${escapeHtml(ctx.card.name)}. Choose a player to move a card from.</div>`);
        buttons.push(`
          <div class="turn-actions">
            ${targets.map((entry) => `
              <button data-action="mover-target" data-player="${entry.index}">${escapeHtml(entry.player.name)} (${entry.player.population})</button>
            `).join('')}
          </div>
        `);
        if (!targets.length) {
          buttons.push('<div class="small warn">No eligible cards are available in the other cities.</div>');
        }
        els.actionArea.innerHTML = buttons.join('');
        return;
      }

      if (phase === 'choose-card') {
        const target = Number.isInteger(ctx.targetIndex) ? state.players[ctx.targetIndex] : null;
        const cards = target ? moverEligibleCards(target) : [];
        buttons.push(`<div class="small"><strong>${escapeHtml(mover.name)}</strong> chose <strong>${escapeHtml(target?.name || 'a city')}</strong>. Choose a card to move.</div>`);
        buttons.push(`
          <div class="turn-actions">
            ${cards.map((card, index) => `
              <button data-action="mover-card" data-card-index="${index}">${escapeHtml(card.name)} (${card.value >= 0 ? '+' : ''}${card.value})</button>
            `).join('')}
          </div>
        `);
        buttons.push(`
          <div class="turn-actions" style="margin-top: 8px;">
            <button data-action="mover-back">Back to Players</button>
          </div>
        `);
        els.actionArea.innerHTML = buttons.join('');
        return;
      }
    }

    if (ctx?.type === 'place-bumbles') {
      const owner = state.players[ctx.buyerIndex];
      if (!owner) return;
      const phase = ctx.phase || 'choose-target';
      if (!owner.isHuman) {
        const targetName = Number.isInteger(ctx.targetIndex) && state.players[ctx.targetIndex]
          ? state.players[ctx.targetIndex].name
          : 'an opponent';
        const stepText = phase === 'attempting'
          ? `AI is waiting to see whether the trick works against ${targetName}.`
          : `AI is choosing which opponent to target for ${ctx.card.name}.`;
        buttons.push(`<div class="small">${escapeHtml(stepText)}</div>`);
        els.actionArea.innerHTML = buttons.join('');
        return;
      }

      if (phase === 'choose-target') {
        const targets = bumblesEligibleTargets(ctx.buyerIndex);
        buttons.push(`<div class="small"><strong>${escapeHtml(owner.name)}</strong> won ${escapeHtml(ctx.card.name)}. Choose an opponent to target.</div>`);
        buttons.push(`
          <div class="turn-actions">
            ${targets.map((entry) => `
              <button data-action="bumbles-target" data-player="${entry.index}">${escapeHtml(entry.player.name)} (${entry.player.population})</button>
            `).join('')}
          </div>
        `);
        if (!targets.length) {
          buttons.push('<div class="small warn">No opponents have cards to target.</div>');
        }
        els.actionArea.innerHTML = buttons.join('');
        return;
      }

      if (phase === 'attempting') {
        const target = Number.isInteger(ctx.targetIndex) ? state.players[ctx.targetIndex] : null;
        buttons.push(`<div class="small">${escapeHtml(owner.name)} is attempting ${escapeHtml(ctx.card.name)} on <strong>${escapeHtml(target?.name || 'an opponent')}</strong>.</div>`);
        buttons.push('<div class="small">The trick is resolving now.</div>');
        els.actionArea.innerHTML = buttons.join('');
        return;
      }
    }

    if (state.endRound && state.endRound.stage !== 'done') {
      els.actionArea.innerHTML = '<div class="small">End-of-round results are resolving.</div>';
      return;
    }

    if (ctx?.type === 'blind-luck') {
      const active = blindLuckCurrentBuyer();
      const phase = ctx.phase || 'offer';
      const offerText = phase === 'drawing'
        ? 'Blind Luck is drawing the top card now.'
        : phase === 'reveal'
          ? 'Blind Luck is revealing what was drawn.'
          : phase === 'passing'
            ? 'Blind Luck is moving on to the next player.'
            : ctx.offer
              ? 'Blind Luck is offering the top card in the draw pile sight unseen for $20.'
              : 'Blind Luck found the draw pile empty.';
      if (!active) {
        els.actionArea.innerHTML = `<div class="small">${escapeHtml(offerText)}</div>`;
        return;
      }

      const player = active.player;
      if (!player) {
        els.actionArea.innerHTML = `<div class="small">${escapeHtml(offerText)}</div>`;
        return;
      }
      if (!player.isHuman) {
        buttons.push(`<div class="small">${escapeHtml(offerText)} Waiting for ${escapeHtml(player.name)} to decide.</div>`);
        els.actionArea.innerHTML = buttons.join('');
        return;
      }

      const canBuy = player.cash >= 20 && Boolean(ctx.offer);
      buttons.push(`<div class="small">${escapeHtml(offerText)} Current player: <strong>${escapeHtml(player.name)}</strong>.</div>`);
      buttons.push(`
        <div class="turn-actions">
          <button data-action="blind-luck-buy"${canBuy ? '' : ' disabled'}>Buy top card for $20</button>
          <button data-action="blind-luck-pass">Pass</button>
        </div>
      `);
      els.actionArea.innerHTML = buttons.join('');
      return;
    }

    if (state.awaitingNextCard && state.currentCard) {
      buttons.push(`<div class="small">That card is done. Press Reveal Next Card to continue.</div>`);
      buttons.push(`
        <div class="turn-actions">
          <button data-action="reveal-next-card">Reveal Next Card</button>
        </div>
      `);
      els.actionArea.innerHTML = buttons.join('');
      return;
    }

    if (state.cardResolution) {
      els.actionArea.innerHTML = `<div class="small">${escapeHtml(state.cardResolution.message)}</div>`;
      return;
    }

    if (ctx?.type === 'auction') {
      const bidder = currentAuctionBidder();
      if (!bidder) {
        els.actionArea.innerHTML = '<div class="small">The auction is resolving.</div>';
        return;
      }
      const bidderPlayer = state.players[bidder.index];
      if (!bidderPlayer.isHuman) {
        buttons.push(`<div class="small">Waiting for ${escapeHtml(bidderPlayer.name)} to act.</div>`);
        els.actionArea.innerHTML = buttons.join('');
        return;
      }
      const canBid1 = bidderPlayer.cash >= ctx.highBid + 1;
      const canBid5 = bidderPlayer.cash >= ctx.highBid + 5;
      const canBid10 = bidderPlayer.cash >= ctx.highBid + 10;
      const highBidderName = ctx.highBidder !== null && state.players[ctx.highBidder]
        ? state.players[ctx.highBidder].name
        : 'No bids yet';
      const passedNames = auctionPassedNames(ctx);
      const remainingNames = auctionRemainingNames(ctx);
      buttons.push(`<div class="small">Current bidder: <strong>${escapeHtml(bidderPlayer.name)}</strong>. High bid: ${money(ctx.highBid)}.</div>`);
      buttons.push(`<div class="small">High bidder: <strong>${escapeHtml(highBidderName)}</strong>.</div>`);
      buttons.push(`<div class="small">Passed: ${passedNames.length ? escapeHtml(passedNames.join(', ')) : 'nobody yet'}.</div>`);
      buttons.push(`<div class="small">Still bidding: ${remainingNames.length ? escapeHtml(remainingNames.join(', ')) : 'none'}.</div>`);
      buttons.push(`
        <div class="turn-actions">
          <button data-action="bid" data-amount="1"${canBid1 ? '' : ' disabled'}>Bid +$1</button>
          <button data-action="bid" data-amount="5"${canBid5 ? '' : ' disabled'}>Bid +$5</button>
          <button data-action="bid" data-amount="10"${canBid10 ? '' : ' disabled'}>Bid +$10</button>
          <button data-action="pass">Pass</button>
        </div>
      `);
    } else if (ctx?.type === 'place-business') {
      buttons.push(`<div class="small">${escapeHtml(state.players[ctx.buyerIndex].name)} won the auction for <strong>${escapeHtml(ctx.card.name)}</strong> for ${money(ctx.bid)}.</div>`);
    } else if (state.currentCard?.type === 'people') {
      buttons.push('<div class="small">People cards resolve automatically when revealed. If nobody matches, the card waits in the center.</div>');
    } else if (!state.turnQueue.length && state.currentStage === 'ready-for-next-round') {
      buttons.push('<div class="small">The turn is over. Collect income has already run, so start the next round when you are ready.</div>');
    } else if (state.turnQueue.length) {
      buttons.push('<div class="small">Reveal the next face-down card to continue the round.</div>');
      buttons.push(`
        <div class="turn-actions">
          <button data-action="reveal-next-card">Reveal Next Card</button>
        </div>
      `);
    } else {
      buttons.push('<div class="small">Begin a new round after you finish reviewing income.</div>');
    }

    if (ctx?.type === 'place-business') {
      buttons.push('<div class="small" style="margin-top: 8px;">Choose the destination city below.</div>');
    }

    els.actionArea.innerHTML = buttons.join('');
  }

  function renderPlayers() {
    els.playerGrid.innerHTML = state.players.length
        ? state.players.map((player, index) => {
          const summary = citySummary(player);
          const cityCards = player.cards.map((card) => `<span class="card-pill">${escapeHtml(card.name)}</span>`).join('');
          const revenueBreakdown = cityRevenueBreakdown(player)
            .map((row) => `<span class="revenue-pill revenue-${escapeHtml(row.tone)}">${escapeHtml(row.label)}</span>`)
            .join(' · ');
          const incomeBreakdown = player.incomeBreakdown.length
            ? `<div class="small" style="margin-top: 10px;">Last income: ${player.incomeBreakdown.map((line) => escapeHtml(line)).join('<br />')}</div>`
            : '';
          const specials = [];
          if (player.specials.countyShield) specials.push(`<span class="chip good">${player.specials.countyShield} insurance polic${player.specials.countyShield === 1 ? 'y' : 'ies'}</span>`);
          if (player.specials.spiderProtection || player.cards.some((card) => isSpiderProtectionCard(card))) specials.push('<span class="chip good">Spider protection</span>');
          if (player.cards.some((card) => isGiantSpiderAttackCard(card))) specials.push('<span class="chip bad">Giant Spider active</span>');
          if (player.specials.pressPending) specials.push('<span class="chip">Press pending</span>');
          if (player.specials.jailNegativePeople) specials.push('<span class="chip good">Law enforcement jail ready</span>');
          if (player.specials.jailNegativeAnimals) specials.push('<span class="chip good">Animal jail active</span>');
          const stageClass = index === 0 && state.currentCard ? 'active' : '';

          return `
            <div class="player-card ${stageClass}">
              <div class="player-top">
                <h3 class="player-name">${escapeHtml(player.name)}</h3>
                <div class="small">${player.seat + 1}</div>
              </div>
              <div class="player-stats">
                <span><strong>${player.population}</strong> population</span>
                <span><strong>${money(player.cash)}</strong> cash</span>
                <span><strong>${summary.revenueUnits}R</strong></span>
                <span>${summary.businesses} businesses</span>
                <span>${summary.people} people</span>
              </div>
              <div class="small" style="margin: 10px 0 4px;">Revenue now: ${revenueBreakdown || 'No revenue cards.'}</div>
              <div class="city-card-list">${specials.join('')}</div>
              <div class="city-card-list">${cityCards || '<span class="small">No cards in city yet.</span>'}</div>
              ${incomeBreakdown}
            </div>
          `;
        }).join('')
      : '<div class="small">Start a game to populate the cities.</div>';
  }

  function renderPendingPeople() {
    els.pendingPeople.innerHTML = state.pendingPeople.length
      ? state.pendingPeople.map((card) => `<span class="card-pill">${escapeHtml(card.name)}</span>`).join('')
      : '<div class="small">No pending people cards.</div>';
  }

  function renderDiscardPile() {
    els.discardPile.innerHTML = state.discard.length
      ? state.discard.slice(-16).map((card) => `<span class="card-pill">${escapeHtml(card.name)}</span>`).join('')
      : '<div class="small">Nothing in the discard pile yet.</div>';
  }

  function renderLog() {
    els.log.innerHTML = state.log.length
      ? state.log.map((item) => `
        <div class="log-item">
          <div class="log-time">${escapeHtml(item.time)} ${escapeHtml(item.tone)}</div>
          <div>${escapeHtml(item.message)}</div>
        </div>
      `).join('')
      : '<div class="small">The log will show bids, claims, and income changes.</div>';
  }

  function renderCounters() {
    els.roundValue.textContent = state.started ? String(state.round) : '-';
    els.deckValue.textContent = state.started ? String(state.deck.length) : '-';
    els.turnCardsValue.textContent = state.started ? String(state.turnQueue.length) : '-';
    els.stageValue.textContent = state.started ? state.currentStage.replace(/-/g, ' ') : 'Setup';
    els.peopleCountPill.textContent = `People: ${data.people.length}`;
    els.businessCountPill.textContent = `Businesses: ${data.businesses.length}`;
  }

  function renderButtons() {
    const ctx = state.actionContext;
    const busy = !!state.peopleBattle || !!state.specialSequence || (!!state.cardResolution && !state.awaitingNextCard) || !!(state.endRound && state.endRound.stage !== 'done') || state.actionContext?.type === 'place-reactor' || state.actionContext?.type === 'place-pool' || state.actionContext?.type === 'place-mover' || state.actionContext?.type === 'place-bumbles' || state.actionContext?.type === 'place-spider' || state.actionContext?.type === 'giant-spider' || state.actionContext?.type === 'blind-luck';
    els.nextRoundBtn.disabled = !state.started || !!state.currentCard || state.turnQueue.length > 0 || state.winner || busy;
    const canRevealNow = state.started
      && !state.winner
      && !state.currentCard
      && (state.turnQueue.length > 0 || state.awaitingNextCard);
    els.revealCardBtn.disabled = !canRevealNow;
    els.shuffleDeckBtn.disabled = !state.started;

    if (ctx?.type === 'auction') {
      const active = currentAuctionBidder();
      els.revealCardBtn.disabled = true;
      els.nextRoundBtn.disabled = true;
      if (active) {
        const bidder = state.players[active.index];
        els.stageValue.textContent = `Auction: ${bidder.name}`;
      }
    }
  }

  function render() {
    document.body.classList.toggle('game-started', state.started);
    document.body.classList.toggle('people-battle-mode', Boolean(state.peopleBattle));
    document.body.classList.toggle('end-round-mode', Boolean(state.endRound));
    renderCounters();
    renderStatusLine();
    renderCurrentCard();
    renderTurnQueue();
    renderPlayers();
    renderPendingPeople();
    renderDiscardPile();
    if (state.rosterOpen) renderRoster();
    renderActionArea();
    renderButtons();
  }

  function nextRound() {
    if (!state.started || state.winner) return;
    if (state.turnQueue.length || state.currentCard) {
      log('Finish the current round before starting the next one.', 'warn');
      return;
    }
    beginRound();
    render();
  }

  document.addEventListener('click', (event) => {
    const photo = event.target.closest('[data-photo-preview="true"]');
    if (photo) {
      const img = photo.querySelector('img');
      const src = photo.dataset.photoSrc || img?.src || '';
      const title = photo.dataset.photoTitle || img?.alt || 'Card photo';
      const meta = photo.dataset.photoMeta || '';
      if (src) {
        openPhotoViewer(src, title, meta);
      }
      return;
    }

    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const cityIndex = button.dataset.city ? Number(button.dataset.city) : null;

    if (action === 'bid') {
      const bidder = currentAuctionBidder();
      if (bidder) bidByAmount(bidder.index, Number(button.dataset.amount || 1));
    } else if (action === 'pass') {
      const bidder = currentAuctionBidder();
      if (bidder) passBid(bidder.index);
    } else if (action === 'blind-luck-buy') {
      const buyer = blindLuckCurrentBuyer();
      if (buyer) buyBlindLuckCard(buyer.index);
    } else if (action === 'blind-luck-pass') {
      const buyer = blindLuckCurrentBuyer();
      if (buyer) passBlindLuckCard(buyer.index);
    } else if (action === 'reveal-next-card') {
      revealNextCard();
    } else if (action === 'place-reactor' || action === 'place-pool') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-reactor' && ctx?.type !== 'place-pool') return;
      const cityIndex = Number(button.dataset.city);
      if (Number.isFinite(cityIndex)) {
        if (ctx.type === 'place-pool') {
          placePoolCard(ctx.buyerIndex, cityIndex, ctx.card);
        } else {
          placeReactorCard(ctx.buyerIndex, cityIndex, ctx.card);
        }
      }
    } else if (action === 'place-spider') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-spider') return;
      const cityIndex = Number(button.dataset.city);
      if (Number.isFinite(cityIndex)) {
        placeGiantSpiderCard(ctx.buyerIndex, cityIndex, ctx.card);
      }
    } else if (action === 'mover-target') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-mover') return;
      const targetIndex = Number(button.dataset.player);
      if (Number.isInteger(targetIndex)) {
        applyMoverTarget(ctx.buyerIndex, targetIndex);
      }
    } else if (action === 'mover-card') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-mover') return;
      const cardIndex = Number(button.dataset.cardIndex);
      if (Number.isInteger(cardIndex)) {
        applyMoverCard(ctx.buyerIndex, cardIndex);
      }
    } else if (action === 'mover-back') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-mover') return;
      ctx.phase = 'choose-target';
      ctx.targetIndex = null;
      ctx.chosenCardIndex = null;
      state.cardResolution = {
        tone: 'good',
        message: `${ctx.card.name} is ready to move a card. Choose a player to take from.`,
      };
      render();
    } else if (action === 'bumbles-target') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'place-bumbles') return;
      const targetIndex = Number(button.dataset.player);
      if (Number.isInteger(targetIndex)) {
        applyBumblesTarget(ctx.buyerIndex, targetIndex);
      }
    } else if (action === 'giant-spider-pay') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'giant-spider') return;
      resolveGiantSpiderDecision('pay');
    } else if (action === 'giant-spider-roll') {
      const ctx = state.actionContext;
      if (ctx?.type !== 'giant-spider') return;
      resolveGiantSpiderDecision('roll');
    }
  });

  els.startGameBtn.addEventListener('click', startGame);
  els.nextRoundBtn.addEventListener('click', nextRound);
  els.revealCardBtn.addEventListener('click', revealNextCard);
  els.cardRosterBtn.addEventListener('click', () => {
    openRoster(state.rosterType || 'business');
  });
  els.rosterCloseBtn.addEventListener('click', closeRoster);
  els.rosterOverlay.addEventListener('click', (event) => {
    if (event.target === els.rosterOverlay) {
      closeRoster();
    }
  });
  els.rosterTabs.forEach((button) => {
    button.addEventListener('click', () => {
      state.rosterType = button.dataset.rosterType || 'business';
      renderRoster();
    });
  });
  els.photoViewerCloseBtn.addEventListener('click', closePhotoViewer);
  els.photoViewerOverlay.addEventListener('click', (event) => {
    if (event.target === els.photoViewerOverlay) {
      closePhotoViewer();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.photoViewerOpen) {
      closePhotoViewer();
      return;
    }
    if (event.key === 'Escape' && state.rosterOpen) {
      closeRoster();
    }
  });
  els.shuffleDeckBtn.addEventListener('click', () => {
    if (!state.started) return;
    state.deck = shuffle(state.deck);
    log('Deck shuffled again.', 'good');
    render();
  });
  els.clearLogBtn.addEventListener('click', () => {
    state.log = [];
    renderLog();
  });

  els.playerCount.addEventListener('change', () => {
    const count = Number(els.playerCount.value);
    els.playerNameInputs.forEach((input, index) => {
      input.parentElement.classList.toggle('hidden', index >= count);
    });
  });

  for (let i = 0; i < els.playerNameInputs.length; i += 1) {
    els.playerNameInputs[i].parentElement.classList.toggle('hidden', i >= Number(els.playerCount.value));
  }

  resetGame();
  els.rulePill.textContent = 'Festival events enabled';
})();
