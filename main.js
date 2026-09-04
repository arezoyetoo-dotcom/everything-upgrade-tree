// Everything Upgrade Tree - Master UI Controller & Game Loop (Canon EUT Edition)
function startApp() {
  const engine = window.gameEngine || new GameEngine();
  window.gameEngine = engine;
  engine.init();

  const canvasContainer = document.getElementById('canvasContainer');
  const canvasRenderer = new InfiniteCanvas(canvasContainer, engine);

  // Sound Engine setup
  const sound = window.soundEngine || new SoundEngine();
  window.soundEngine = sound;
  document.addEventListener('click', () => {
    sound.ensureContext();
  }, { once: true });

  // -------------------------------------------------------------
  // DOM References: Header Resource Tickers & Mobility
  // -------------------------------------------------------------
  const matterValEl = document.getElementById('matterVal');
  const matterRateEl = document.getElementById('matterRate');
  const researchValEl = document.getElementById('researchVal');
  const researchRateEl = document.getElementById('researchRate');
  const bitsValEl = document.getElementById('bitsVal');
  const bitsRateEl = document.getElementById('bitsRate');
  const pointXValEl = document.getElementById('pointXVal');
  const pointXRateEl = document.getElementById('pointXRate');
  const eurosValEl = document.getElementById('eurosVal');
  const eurosRateEl = document.getElementById('eurosRate');
  const prestigeValEl = document.getElementById('prestigeVal');
  const transcendValEl = document.getElementById('transcendVal');

  const researchPill = document.getElementById('researchPill');
  const bitsPill = document.getElementById('bitsPill');
  const pointXPill = document.getElementById('pointXPill');
  const eurosPill = document.getElementById('eurosPill');
  const prestigePill = document.getElementById('prestigePill');
  const transcendPill = document.getElementById('transcendPill');

  const walkspeedValEl = document.getElementById('walkspeedVal');
  const jumpPowerValEl = document.getElementById('jumpPowerVal');

  // Mini-Boombox Widget
  const miniBoomboxWidget = document.getElementById('miniBoomboxWidget');
  const miniBoomboxTrackTitle = document.getElementById('miniBoomboxTrackTitle');
  const miniBoomboxPlayBtn = document.getElementById('miniBoomboxPlayBtn');
  const miniBoomboxNextBtn = document.getElementById('miniBoomboxNextBtn');
  const miniBoomboxExpandBtn = document.getElementById('miniBoomboxExpandBtn');

  // Navigation Tabs & View Panels
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const viewPanels = {
    tree: document.getElementById('treeView'),
    prestige: document.getElementById('prestigeOverlay'),
    boombox: document.getElementById('boomboxOverlay'),
    leveling: document.getElementById('levelingOverlay'),
    research: document.getElementById('researchOverlay'),
    donation: document.getElementById('donationOverlay'),
    bonus: document.getElementById('bonusOverlay'),
    records: document.getElementById('recordsOverlay'),
    mining: document.getElementById('miningOverlay'),
    cards: document.getElementById('cardsOverlay'),
    astronomy: document.getElementById('astronomyOverlay'),
    puzzle: document.getElementById('puzzleOverlay'),
    challenges: document.getElementById('challengesOverlay'),
    settings: document.getElementById('settingsOverlay')
  };

  let activeTab = 'tree';

  function switchTab(tabKey) {
    activeTab = tabKey;
    navTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    Object.keys(viewPanels).forEach(key => {
      const panel = viewPanels[key];
      if (panel) {
        panel.classList.toggle('active-view', key === tabKey);
      }
    });

    if (tabKey === 'tree') {
      canvasRenderer.render();
    } else if (tabKey === 'prestige') {
      renderPrestigeView();
    } else if (tabKey === 'boombox') {
      renderBoomboxView();
    } else if (tabKey === 'research') {
      renderResearchView();
    } else if (tabKey === 'leveling') {
      renderLevelingView();
    } else if (tabKey === 'donation') {
      renderDonationView();
    } else if (tabKey === 'bonus') {
      renderBonusView();
    } else if (tabKey === 'records') {
      renderRecordsView();
    } else if (tabKey === 'mining') {
      renderMiningView();
    } else if (tabKey === 'cards') {
      renderCardsView();
    } else if (tabKey === 'astronomy') {
      renderAstronomyView();
    } else if (tabKey === 'puzzle') {
      renderPuzzleView();
    } else if (tabKey === 'challenges') {
      renderChallengesView();
    }
  }

  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  window.switchTab = switchTab;
  // Global Baseplate Opening Handlers for Tree Clicks
  window.openBoomboxModal = () => switchTab('boombox');
  window.openLevelingModal = () => switchTab('leveling');
  window.openResearchModal = () => switchTab('research');
  window.openDonationModal = () => switchTab('donation');
  window.openBonusModal = () => switchTab('bonus');
  window.openLeaderboardModal = () => switchTab('records');
  window.openHardcoreModal = () => {
    const m = document.getElementById('hardcoreModal');
    if (m) m.classList.add('modal-open');
  };

  const closeHardcoreBtn = document.getElementById('closeHardcoreBtn');
  if (closeHardcoreBtn) {
    closeHardcoreBtn.addEventListener('click', () => {
      const m = document.getElementById('hardcoreModal');
      if (m) m.classList.remove('modal-open');
    });
  }

  // Check node unlocks to reveal navigation buttons
  function updateNavTabVisibilities() {
    const tabBoombox = document.getElementById('tabBoombox');
    if (tabBoombox) tabBoombox.style.display = engine.upgrades['node_9'] ? 'inline-flex' : 'none';

    const tabLeveling = document.getElementById('tabLeveling');
    if (tabLeveling) tabLeveling.style.display = engine.upgrades['node_16'] ? 'inline-flex' : 'none';

    const tabResearch = document.getElementById('tabResearch');
    if (tabResearch) tabResearch.style.display = engine.upgrades['node_8'] ? 'inline-flex' : 'none';

    const tabDonation = document.getElementById('tabDonation');
    if (tabDonation) tabDonation.style.display = engine.upgrades['node_0d'] ? 'inline-flex' : 'none';

    const tabBonus = document.getElementById('tabBonus');
    if (tabBonus) tabBonus.style.display = engine.upgrades['node_18'] ? 'inline-flex' : 'none';

    const tabRecords = document.getElementById('tabRecords');
    if (tabRecords) tabRecords.style.display = engine.upgrades['node_20'] ? 'inline-flex' : 'none';

    const tabPrestige = document.getElementById('tabPrestige');
    if (tabPrestige) {
      const showPrestige = (engine.stats.prestiges > 0) ||
                           engine.currencies.prestige.gt(0) ||
                           engine.currencies.matter.gte(D(1, 46));
      tabPrestige.style.display = showPrestige ? 'inline-flex' : 'none';
    }

    if (miniBoomboxWidget) {
      miniBoomboxWidget.style.display = engine.upgrades['node_9'] ? 'flex' : 'none';
    }

    const tabMining = document.querySelector('.nav-tab-btn[data-tab="mining"]');
    if (tabMining) tabMining.style.display = engine.upgrades['portal_mining'] ? 'inline-flex' : 'none';

    const tabCards = document.querySelector('.nav-tab-btn[data-tab="cards"]');
    if (tabCards) tabCards.style.display = engine.upgrades['portal_cards'] ? 'inline-flex' : 'none';

    const tabPuzzle = document.querySelector('.nav-tab-btn[data-tab="puzzle"]');
    if (tabPuzzle) tabPuzzle.style.display = engine.upgrades['portal_puzzle'] ? 'inline-flex' : 'none';

    const tabAstronomy = document.querySelector('.nav-tab-btn[data-tab="astronomy"]');
    if (tabAstronomy) tabAstronomy.style.display = engine.upgrades['portal_astronomy'] ? 'inline-flex' : 'none';

    const tabChallenges = document.querySelector('.nav-tab-btn[data-tab="challenges"]');
    if (tabChallenges) tabChallenges.style.display = (engine.upgrades['node_1p'] || engine.upgrades['portal_challenges']) ? 'inline-flex' : 'none';
  }

  // -------------------------------------------------------------
  // 1. Header Resource Tickers & Mobility Badges
  // -------------------------------------------------------------
  function updateHeaderTickers() {
    matterValEl.textContent = engine.currencies.matter.format(2);
    matterRateEl.textContent = `+${engine.rates.matterPerSec.format(1)}/s`;

    // Research Points (λ)
    const hasResearch = !!engine.upgrades['node_8'];
    researchPill.style.display = hasResearch ? 'inline-flex' : 'none';
    if (hasResearch) {
      researchValEl.textContent = engine.currencies.research.format(1);
      researchRateEl.textContent = `+${engine.rates.researchPerSec.format(1)}/s`;
    }

    // Bits (฿)
    const hasBits = !!engine.upgrades['node_28'] || !!engine.upgrades['node_29'];
    bitsPill.style.display = hasBits ? 'inline-flex' : 'none';
    if (hasBits) {
      bitsValEl.textContent = engine.currencies.bits.format(0);
      bitsRateEl.textContent = `+${engine.rates.bitsPerSec.format(0)}/s`;
    }

    // Point-X (₽X)
    const hasPointX = !!engine.upgrades['node_33'];
    pointXPill.style.display = hasPointX ? 'inline-flex' : 'none';
    if (hasPointX) {
      pointXValEl.textContent = engine.currencies.pointX.format(1);
      pointXRateEl.textContent = `+${engine.rates.pointXPerSec.format(1)}/s`;
    }

    // Euros (€)
    const hasEuros = !!engine.upgrades['node_37'];
    eurosPill.style.display = hasEuros ? 'inline-flex' : 'none';
    if (hasEuros) {
      eurosValEl.textContent = engine.currencies.euros.format(0);
      eurosRateEl.textContent = `+${engine.rates.eurosPerSec.format(0)}/s`;
    }

    // Prestige Points (₹)
    const hasPrestige = engine.currencies.totalPrestige.gt(0) || !!engine.upgrades['portal_astronomy'];
    prestigePill.style.display = hasPrestige ? 'inline-flex' : 'none';
    if (hasPrestige) {
      prestigeValEl.textContent = engine.currencies.prestige.format(1);
    }

    // Transcend Points (τ)
    const hasTranscend = engine.currencies.totalTranscend.gt(0);
    transcendPill.style.display = hasTranscend ? 'inline-flex' : 'none';
    if (hasTranscend) {
      transcendValEl.textContent = engine.currencies.transcend.format(0);
    }

    // Player Mobility Badges
    if (walkspeedValEl) walkspeedValEl.textContent = engine.player.walkspeed;
    if (jumpPowerValEl) jumpPowerValEl.textContent = engine.player.jumpPower;

    // Mini Boombox label
    if (miniBoomboxTrackTitle) {
      const curTrack = sound.getCurrentTrack();
      miniBoomboxTrackTitle.textContent = curTrack.name;
    }
  }

  // -------------------------------------------------------------
  // 2. Boombox Deck & Procedural Audio (#9)
  // -------------------------------------------------------------
  const bbMasterPlayBtn = document.getElementById('bbMasterPlayBtn');
  const bbPrevBtn = document.getElementById('bbPrevBtn');
  const bbNextBtn = document.getElementById('bbNextBtn');
  const bbVolSlider = document.getElementById('bbVolSlider');
  const bbVolLabel = document.getElementById('bbVolLabel');
  const bbFilterSlider = document.getElementById('bbFilterSlider');
  const bbFilterLabel = document.getElementById('bbFilterLabel');
  const bbCurrentTitle = document.getElementById('bbCurrentTitle');
  const bbCurrentGenre = document.getElementById('bbCurrentGenre');
  const bbBpmBadge = document.getElementById('bbBpmBadge');
  const boomboxStatusText = document.getElementById('boomboxStatusText');
  const reelLeft = document.getElementById('reelLeft');
  const reelRight = document.getElementById('reelRight');
  const tapesListEl = document.getElementById('tapesList');

  function renderBoomboxView() {
    const curTrack = sound.getCurrentTrack();
    if (bbCurrentTitle) bbCurrentTitle.textContent = curTrack.name;
    if (bbBpmBadge) bbBpmBadge.textContent = `${curTrack.bpm} BPM`;
    if (bbCurrentGenre) bbCurrentGenre.textContent = `Style: ${curTrack.type.toUpperCase()} • Procedural Synth Engine`;

    const isPlaying = sound.boomboxPlaying;
    if (bbMasterPlayBtn) {
      bbMasterPlayBtn.textContent = isPlaying ? '❚❚ PAUSE MUSIC' : '▶ PLAY MUSIC';
    }
    if (boomboxStatusText) {
      boomboxStatusText.textContent = isPlaying ? 'PLAYING TAPE • LO-FI ACTIVE' : 'READY • PAUSED';
    }

    if (reelLeft) reelLeft.classList.toggle('playing', isPlaying);
    if (reelRight) reelRight.classList.toggle('playing', isPlaying);

    if (miniBoomboxPlayBtn) {
      miniBoomboxPlayBtn.textContent = isPlaying ? '❚❚' : '▶';
    }

    // Render Tapes list
    if (tapesListEl) {
      tapesListEl.innerHTML = '';
      sound.tracks.forEach((tr, idx) => {
        const item = document.createElement('div');
        item.className = 'tape-item' + (idx === sound.currentTrackIndex ? ' active' : '');
        item.innerHTML = `
          <div>
            <div class="tape-item-name">${tr.name}</div>
            <div class="tape-item-meta">${tr.bpm} BPM • ${tr.type.toUpperCase()}</div>
          </div>
          <span>${idx === sound.currentTrackIndex && isPlaying ? '🔊' : '▶'}</span>
        `;
        item.addEventListener('click', () => {
          sound.currentTrackIndex = idx;
          sound.playBoombox();
          renderBoomboxView();
        });
        tapesListEl.appendChild(item);
      });
    }
  }

  if (bbMasterPlayBtn) {
    bbMasterPlayBtn.addEventListener('click', () => {
      sound.toggleBoombox();
      renderBoomboxView();
    });
  }

  if (bbPrevBtn) {
    bbPrevBtn.addEventListener('click', () => {
      sound.prevTrack();
      renderBoomboxView();
    });
  }

  if (bbNextBtn) {
    bbNextBtn.addEventListener('click', () => {
      sound.nextTrack();
      renderBoomboxView();
    });
  }

  if (miniBoomboxPlayBtn) {
    miniBoomboxPlayBtn.addEventListener('click', () => {
      sound.toggleBoombox();
      renderBoomboxView();
    });
  }

  if (miniBoomboxNextBtn) {
    miniBoomboxNextBtn.addEventListener('click', () => {
      sound.nextTrack();
      renderBoomboxView();
    });
  }

  if (miniBoomboxExpandBtn) {
    miniBoomboxExpandBtn.addEventListener('click', () => {
      switchTab('boombox');
    });
  }

  if (bbVolSlider) {
    bbVolSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      sound.setBoomboxVolume(val / 100);
      if (bbVolLabel) bbVolLabel.textContent = `${val}%`;
    });
  }

  if (bbFilterSlider) {
    bbFilterSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      sound.setFilterFreq(val);
      if (bbFilterLabel) bbFilterLabel.textContent = `${val} Hz`;
    });
  }

  // -------------------------------------------------------------
  // 3. Leveling Center (#16 Growing up)
  // -------------------------------------------------------------
  const playerLevelDisplay = document.getElementById('playerLevelDisplay');
  const playerRankName = document.getElementById('playerRankName');
  const playerXpNumbers = document.getElementById('playerXpNumbers');
  const playerXpBar = document.getElementById('playerXpBar');
  const playerPerkPointsDisplay = document.getElementById('playerPerkPointsDisplay');
  const xpDiscountInfo = document.getElementById('xpDiscountInfo');

  const perkLvlPointMagnet = document.getElementById('perkLvlPointMagnet');
  const perkBonusPointMagnet = document.getElementById('perkBonusPointMagnet');
  const perkLvlResearchSpeed = document.getElementById('perkLvlResearchSpeed');
  const perkBonusResearchSpeed = document.getElementById('perkBonusResearchSpeed');
  const perkLvlSpeedDemon = document.getElementById('perkLvlSpeedDemon');
  const perkBonusSpeedDemon = document.getElementById('perkBonusSpeedDemon');
  const perkLvlKineticLeap = document.getElementById('perkLvlKineticLeap');
  const perkBonusKineticLeap = document.getElementById('perkBonusKineticLeap');

  function renderLevelingView() {
    const lvl = engine.player.level;
    const curXp = Math.floor(engine.player.xp);
    const reqXp = engine.getXpRequiredForNextLevel();
    const pct = Math.min(100, Math.max(0, (curXp / reqXp) * 100));

    if (playerLevelDisplay) playerLevelDisplay.textContent = lvl;
    if (playerXpNumbers) playerXpNumbers.textContent = `${curXp} / ${reqXp} XP`;
    if (playerXpBar) playerXpBar.style.width = `${pct}%`;
    if (playerPerkPointsDisplay) playerPerkPointsDisplay.textContent = engine.player.perkPoints;

    const ranks = ['Novice Builder', 'Kinetic Apprentice', 'Cybernetic Adept', 'Singularity Master', 'Void Sovereign', 'Cosmic Demiurge'];
    const rIdx = Math.min(ranks.length - 1, Math.floor(lvl / 10));
    if (playerRankName) playerRankName.textContent = ranks[rIdx];

    // Discounts
    let formulaDesc = 'Formula: Base 100 × (Level^1.4)';
    if (engine.upgrades['node_23']) formulaDesc += ' • [÷1.5 Downsizing Active]';
    if (engine.upgrades['node_32']) formulaDesc += ' • [×0.7 Deflated Active]';
    if (xpDiscountInfo) xpDiscountInfo.textContent = formulaDesc;

    // Perks
    const p = engine.player.perks;
    if (perkLvlPointMagnet) perkLvlPointMagnet.textContent = `Rank ${p.pointMagnet}`;
    if (perkBonusPointMagnet) perkBonusPointMagnet.textContent = `Current Bonus: +${(p.pointMagnet * 10).toFixed(0)}% ₽`;

    if (perkLvlResearchSpeed) perkLvlResearchSpeed.textContent = `Rank ${p.researchSpeed}`;
    if (perkBonusResearchSpeed) perkBonusResearchSpeed.textContent = `Current Bonus: +${(p.researchSpeed * 10).toFixed(0)}% λ`;

    if (perkLvlSpeedDemon) perkLvlSpeedDemon.textContent = `Rank ${p.speedDemon}`;
    if (perkBonusSpeedDemon) perkBonusSpeedDemon.textContent = `Current Bonus: +${p.speedDemon * 2} Walkspeed`;

    if (perkLvlKineticLeap) perkLvlKineticLeap.textContent = `Rank ${p.kineticLeap}`;
    if (perkBonusKineticLeap) perkBonusKineticLeap.textContent = `Current Bonus: +${p.kineticLeap * 5} Jump Power`;
  }

  document.querySelectorAll('.perk-upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const perkKey = btn.dataset.perk;
      if (engine.upgradePerk(perkKey)) {
        sound.playBuy();
        renderLevelingView();
        updateHeaderTickers();
      } else {
        alert('Insufficient Perk Points! Gain XP to level up.');
      }
    });
  });

  // -------------------------------------------------------------
  // 4. Donation Baseplate (#0d Unethical Tipping)
  // -------------------------------------------------------------
  const totalDonatedVal = document.getElementById('totalDonatedVal');
  const karmicRankVal = document.getElementById('karmicRankVal');
  const karmicQuote = document.getElementById('karmicQuote');

  const voidQuotes = [
    '"The void purrs with unethical delight at your generosity."',
    '"A celestial monk tips his ethereal hat to your balance sheet."',
    '"Your sacrifice has been registered across four dimensions."',
    '"Money cannot buy happiness, but it can feed the void."',
    '"Somewhere in the astral depths, a ledger balance shifted in your favor."'
  ];

  function renderDonationView() {
    if (totalDonatedVal) {
      const tot = engine.stats.totalDonations ? D(engine.stats.totalDonations) : D(0);
      totalDonatedVal.textContent = `${tot.format(1)} ₽`;
    }

    if (karmicRankVal) {
      const tot = engine.stats.totalDonations ? D(engine.stats.totalDonations) : D(0);
      let rank = 'Novice Tipper';
      if (tot.gte(1000000000)) rank = 'Obsidian Void Patron';
      else if (tot.gte(10000000)) rank = 'Dimensional Philanthropist';
      else if (tot.gte(100000)) rank = 'Generous Contributor';
      else if (tot.gte(1000)) rank = 'Unethical Enthusiast';
      karmicRankVal.textContent = rank;
    }
  }

  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      let amountToDonate = D(0);
      if (btn.dataset.amt) {
        amountToDonate = D(btn.dataset.amt);
      } else if (btn.dataset.percent) {
        const pct = parseInt(btn.dataset.percent, 10);
        amountToDonate = engine.currencies.matter.mul(pct / 100);
      }

      if (amountToDonate.lte(0)) {
        alert('You have no Points (₽) to donate!');
        return;
      }

      if (engine.donate(amountToDonate)) {
        sound.playBuy();
        if (karmicQuote) {
          karmicQuote.textContent = voidQuotes[Math.floor(Math.random() * voidQuotes.length)];
        }
        renderDonationView();
        updateHeaderTickers();
      } else {
        alert('Insufficient Points (₽) for this donation!');
      }
    });
  });

  // -------------------------------------------------------------
  // 5. Bonus Baseplate (#18 A lot more to come)
  // -------------------------------------------------------------
  const claimBonusBtn = document.getElementById('claimBonusBtn');
  const bonusTimerText = document.getElementById('bonusTimerText');
  const bonusPointsPreview = document.getElementById('bonusPointsPreview');
  const bonusResearchPreview = document.getElementById('bonusResearchPreview');
  const bonusStatusBanner = document.getElementById('bonusStatusBanner');

  function renderBonusView() {
    const ptsReward = Decimal.max(100, engine.rates.matterPerSec.mul(30));
    const resReward = engine.upgrades['node_8'] ? Decimal.max(10, engine.rates.researchPerSec.mul(20)) : D(0);

    if (bonusPointsPreview) bonusPointsPreview.textContent = `+${ptsReward.format(1)} ₽`;
    if (bonusResearchPreview) bonusResearchPreview.textContent = `+${resReward.format(1)} λ`;

    const remaining = engine.getBonusCooldownRemaining();
    if (remaining <= 0) {
      if (bonusStatusBanner) bonusStatusBanner.textContent = 'DROP IN ORBIT: READY TO CLAIM!';
      if (bonusTimerText) bonusTimerText.textContent = 'Status: Supply Capsule Locked & Loaded';
      if (claimBonusBtn) {
        claimBonusBtn.disabled = false;
        claimBonusBtn.textContent = 'CLAIM SUPPLY DROP NOW';
      }
    } else {
      if (bonusStatusBanner) bonusStatusBanner.textContent = `CAPSULE IN TRANSIT (${Math.ceil(remaining)}s)`;
      if (bonusTimerText) bonusTimerText.textContent = `Cooldown Remaining: ${Math.ceil(remaining)}s`;
      if (claimBonusBtn) {
        claimBonusBtn.disabled = true;
        claimBonusBtn.textContent = `Recharging (${Math.ceil(remaining)}s)`;
      }
    }
  }

  if (claimBonusBtn) {
    claimBonusBtn.addEventListener('click', () => {
      const drop = engine.claimBonusDrop();
      if (drop) {
        sound.playMaxed();
        alert(`🎁 COSMIC SUPPLY DROP CLAIMED!
+${drop.pts.format(1)} Points (₽)
${drop.res.gt(0) ? '+' + drop.res.format(1) + ' Research (λ)' : ''}`);
        renderBonusView();
        updateHeaderTickers();
      }
    });
  }

  // -------------------------------------------------------------
  // 6. Records & Leaderboard (#20 Reaching the limits)
  // -------------------------------------------------------------
  const callsignInput = document.getElementById('callsignInput');
  const saveCallsignBtn = document.getElementById('saveCallsignBtn');
  const recPeakPoints = document.getElementById('recPeakPoints');
  const recNodesUnlocked = document.getElementById('recNodesUnlocked');
  const recPlayerLevel = document.getElementById('recPlayerLevel');
  const recClicks = document.getElementById('recClicks');
  const recPrestiges = document.getElementById('recPrestiges');
  const recTranscensions = document.getElementById('recTranscensions');
  const recSpeed = document.getElementById('recSpeed');
  const recJump = document.getElementById('recJump');
  const hardcoreStrip = document.getElementById('hardcoreStrip');
  const toggleHardcoreBtn = document.getElementById('toggleHardcoreBtn');

  function renderRecordsView() {
    if (callsignInput) callsignInput.value = engine.stats.callsign || 'ASTRAL_EXPLORER_01';
    if (recPeakPoints) {
      const p = engine.stats.peakMatter ? D(engine.stats.peakMatter) : D(0);
      recPeakPoints.textContent = p.format(2);
    }

    const canonUnlockedCount = Object.keys(NODE_DEFS).filter(k => (engine.upgrades[k] || 0) > 0).length;
    if (recNodesUnlocked) recNodesUnlocked.textContent = `${canonUnlockedCount} / ${Object.keys(NODE_DEFS).length}`;
    if (recPlayerLevel) recPlayerLevel.textContent = engine.player.level;
    if (recClicks) recClicks.textContent = engine.stats.totalClicks;
    if (recPrestiges) recPrestiges.textContent = engine.stats.totalPrestiges;
    if (recTranscensions) recTranscensions.textContent = engine.stats.totalTranscensions;
    if (recSpeed) recSpeed.textContent = engine.player.walkspeed;
    if (recJump) recJump.textContent = engine.player.jumpPower;

    // Hardcore toggle if #40 is owned
    if (hardcoreStrip) {
      hardcoreStrip.style.display = engine.upgrades['node_40'] ? 'flex' : 'none';
      if (toggleHardcoreBtn) {
        toggleHardcoreBtn.textContent = engine.stats.hardcoreMode ? 'Hardcore: ON (×5 Costs)' : 'Hardcore: OFF';
        toggleHardcoreBtn.style.background = engine.stats.hardcoreMode ? '#ef4444' : 'rgba(255,255,255,0.08)';
      }
    }

    // Badges Showcase Update
    const bResearchCard = document.getElementById('badgeResearchCard');
    const bResearchStatus = document.getElementById('badgeResearchStatus');
    const isResearchUnlocked = !!(engine.badges && engine.badges.research) || ((engine.stats.researchConversions || 0) > 0);
    if (bResearchCard) bResearchCard.classList.toggle('unlocked', isResearchUnlocked);
    if (bResearchStatus) {
      bResearchStatus.textContent = isResearchUnlocked ? 'UNLOCKED' : 'LOCKED';
      bResearchStatus.className = 'badge-status-pill ' + (isResearchUnlocked ? 'unlocked' : 'locked');
    }

    const bBeyondCard = document.getElementById('badgeBeyondCard');
    const bBeyondStatus = document.getElementById('badgeBeyondStatus');
    const isBeyondUnlocked = !!(engine.badges && engine.badges.beyondAnalysis) || !!engine.upgrades['secret_beyond_analysis'];
    if (bBeyondCard) bBeyondCard.classList.toggle('unlocked', isBeyondUnlocked);
    if (bBeyondStatus) {
      bBeyondStatus.textContent = isBeyondUnlocked ? 'UNLOCKED' : 'LOCKED';
      bBeyondStatus.className = 'badge-status-pill ' + (isBeyondUnlocked ? 'unlocked' : 'locked');
    }

    const bPrestigeCard = document.getElementById('badgePrestigeCard');
    const bPrestigeStatus = document.getElementById('badgePrestigeStatus');
    const isPrestigeUnlocked = (engine.stats.prestiges > 0) || (engine.stats.totalPrestiges > 0);
    if (bPrestigeCard) bPrestigeCard.classList.toggle('unlocked', isPrestigeUnlocked);
    if (bPrestigeStatus) {
      bPrestigeStatus.textContent = isPrestigeUnlocked ? 'UNLOCKED' : 'LOCKED';
      bPrestigeStatus.className = 'badge-status-pill ' + (isPrestigeUnlocked ? 'unlocked' : 'locked');
    }

    const bLofiCard = document.getElementById('badgeLofiCard');
    const bLofiStatus = document.getElementById('badgeLofiStatus');
    const isLofiUnlocked = !!engine.upgrades['node_9'];
    if (bLofiCard) bLofiCard.classList.toggle('unlocked', isLofiUnlocked);
    if (bLofiStatus) {
      bLofiStatus.textContent = isLofiUnlocked ? 'UNLOCKED' : 'LOCKED';
      bLofiStatus.className = 'badge-status-pill ' + (isLofiUnlocked ? 'unlocked' : 'locked');
    }
  }


  if (saveCallsignBtn && callsignInput) {
    saveCallsignBtn.addEventListener('click', () => {
      engine.setCallsign(callsignInput.value);
      sound.playBuy();
      alert(`Callsign updated to: ${engine.stats.callsign}`);
    });
  }

  if (toggleHardcoreBtn) {
    toggleHardcoreBtn.addEventListener('click', () => {
      const mode = engine.toggleHardcore();
      sound.playPrestige();
      alert(mode ? '⚠️ HARDCORE MODE ACTIVATED! All upgrades now cost ×5!' : 'Hardcore mode disabled.');
      renderRecordsView();
    });
  }

  // -------------------------------------------------------------
  // 7. Mining Quarry View
  // -------------------------------------------------------------
  const miningGridEl = document.getElementById('miningGrid');
  const pickaxeTitleEl = document.getElementById('pickaxeTitle');
  const pickaxePowerEl = document.getElementById('pickaxePower');
  const upgradePickaxeBtn = document.getElementById('upgradePickaxeBtn');
  const oreStoneEl = document.getElementById('oreStone');
  const oreCopperEl = document.getElementById('oreCopper');
  const oreIronEl = document.getElementById('oreIron');
  const oreRubyEl = document.getElementById('oreRuby');
  const oreCelestialEl = document.getElementById('oreCelestial');

  function renderMiningView() {
    if (!miningGridEl || !engine.mining) return;
    miningGridEl.innerHTML = '';

    const pickNames = ['Crude Stone Pick', 'Reinforced Copper Pick', 'Tempered Iron Drill', 'Plasma Ruby Laser', 'Singularity Smasher'];
    const pickPowers = [1, 3, 8, 25, 100];
    const curPick = engine.mining.pickaxeLevel || 1;

    if (pickaxeTitleEl) pickaxeTitleEl.textContent = pickNames[curPick - 1] || 'Quantum Pick';
    if (pickaxePowerEl) pickaxePowerEl.textContent = `Power: ${pickPowers[curPick - 1] || 1}`;

    if (oreStoneEl) oreStoneEl.textContent = engine.mining.ores.stone;
    if (oreCopperEl) oreCopperEl.textContent = engine.mining.ores.copper;
    if (oreIronEl) oreIronEl.textContent = engine.mining.ores.iron;
    if (oreRubyEl) oreRubyEl.textContent = engine.mining.ores.ruby;
    if (oreCelestialEl) oreCelestialEl.textContent = engine.mining.ores.celestial;

    if (engine.mining.grid) {
      engine.mining.grid.forEach((block, idx) => {
        const blockEl = document.createElement('div');
        blockEl.className = 'mine-block';
        blockEl.style.borderColor = block.color;

        const pct = Math.max(0, Math.min(100, (block.hp / block.maxHp) * 100));
        blockEl.innerHTML = `
          <div class="block-bar" style="height: ${pct}%; background: ${block.color}"></div>
          <div class="block-type">${block.type.toUpperCase()}</div>
          <div class="block-hp">${block.hp}/${block.maxHp}</div>
        `;

        blockEl.addEventListener('click', () => {
          sound.playMine();
          engine.mineBlock(idx);
          renderMiningView();
        });

        miningGridEl.appendChild(blockEl);
      });
    }

    if (upgradePickaxeBtn) {
      const costs = ['15 Copper', '25 Iron', '20 Ruby', '15 Celestial'];
      const nextCost = costs[curPick - 1];
      if (nextCost) {
        upgradePickaxeBtn.textContent = `Upgrade Pickaxe (${nextCost})`;
        upgradePickaxeBtn.disabled = false;
      } else {
        upgradePickaxeBtn.textContent = 'Pickaxe Maxed Out';
        upgradePickaxeBtn.disabled = true;
      }
    }
    renderAlloyForge();
  }

  if (upgradePickaxeBtn) {
    upgradePickaxeBtn.addEventListener('click', () => {
      if (engine.upgradePickaxe && engine.upgradePickaxe()) {
        sound.playBuy();
        renderMiningView();
      }
    });
  }

  function renderAlloyForge() {
    const alloysContainer = document.getElementById('alloysContainer');
    if (!alloysContainer || !engine.mining) return;
    alloysContainer.innerHTML = '';

    const alloyDefs = [
      { id: 'copperWiring', name: 'Copper Super-Wiring', cost: '30 Copper, 5 Iron', desc: '+25% Automation Speed' },
      { id: 'ironPlating', name: 'Dense Iron Plating', cost: '40 Iron, 100 Stone', desc: '-15% Tree Upgrade Costs' },
      { id: 'rubyInfusion', name: 'Ruby Quantum Infusion', cost: '25 Ruby, 50 Copper', desc: '+100% Global Production' },
      { id: 'celestialAlloy', name: 'Celestial Trans-Alloy', cost: '10 Celestial, 30 Ruby', desc: '+200% Prestige Gain' }
    ];

    alloyDefs.forEach(alloy => {
      const row = document.createElement('div');
      row.className = 'alloy-row';
      const count = (engine.mining.alloys && engine.mining.alloys[alloy.id]) || 0;

      row.innerHTML = `
        <div class="alloy-info">
          <div class="alloy-name">${alloy.name} <span class="alloy-count">(Level ${count})</span></div>
          <div class="alloy-desc">${alloy.desc} • Cost: ${alloy.cost}</div>
        </div>
        <button class="alloy-craft-btn" data-alloy="${alloy.id}">Forge Alloy</button>
      `;

      row.querySelector('.alloy-craft-btn').addEventListener('click', () => {
        if (engine.craftAlloy && engine.craftAlloy(alloy.id)) {
          sound.playBuy();
          renderMiningView();
        } else {
          alert('Insufficient ores to forge this alloy!');
        }
      });

      alloysContainer.appendChild(row);
    });
  }

  // -------------------------------------------------------------
  // 8. Astral Cards View
  // -------------------------------------------------------------
  function renderCardsView() {
    if (!engine.cards) return;
    for (let slot = 0; slot < 3; slot++) {
      const slotEl = document.getElementById(`deckSlot${slot + 1}`);
      if (!slotEl) continue;
      const card = engine.cards.equipped[slot];

      if (card) {
        slotEl.className = `deck-slot-card rarity-${card.rarity.toLowerCase()}`;
        slotEl.innerHTML = `
          <div class="card-rarity">${card.rarity}</div>
          <div class="card-icon">${card.icon}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-buff">${card.desc}</div>
          <button class="unequip-btn" data-slot="${slot}">✕ Unequip</button>
        `;
        slotEl.querySelector('.unequip-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          engine.unequipCard(slot);
          renderCardsView();
        });
      } else {
        slotEl.className = 'deck-slot-card slot-empty';
        slotEl.innerHTML = `
          <div class="empty-icon">+</div>
          <div class="empty-label">Slot ${slot + 1} Empty</div>
        `;
      }
    }

    const cardsInventoryEl = document.getElementById('cardsInventory');
    if (cardsInventoryEl) {
      cardsInventoryEl.innerHTML = '';
      if (!engine.cards.inventory || !engine.cards.inventory.length) {
        cardsInventoryEl.innerHTML = '<div class="empty-hint">No cards owned yet. Open card packs above!</div>';
      } else {
        engine.cards.inventory.forEach(card => {
          const cEl = document.createElement('div');
          cEl.className = `inventory-card rarity-${card.rarity.toLowerCase()}`;
          cEl.innerHTML = `
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-buff">${card.desc}</div>
            <div class="card-actions">
              <button class="equip-slot-btn" data-slot="0">Eq 1</button>
              <button class="equip-slot-btn" data-slot="1">Eq 2</button>
              <button class="equip-slot-btn" data-slot="2">Eq 3</button>
            </div>
          `;

          cEl.querySelectorAll('.equip-slot-btn').forEach(b => {
            b.addEventListener('click', () => {
              const targetSlot = parseInt(b.dataset.slot, 10);
              engine.equipCard(card.uid, targetSlot);
              sound.playCard();
              renderCardsView();
            });
          });

          cardsInventoryEl.appendChild(cEl);
        });
      }
    }
  }

  document.querySelectorAll('.card-pack-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const packType = btn.dataset.pack;
      if (engine.openCardPack) {
        const pulled = engine.openCardPack(packType);
        if (pulled) {
          sound.playCard();
          alert(`🃏 You pulled: ${pulled.name} (${pulled.rarity})!
${pulled.desc}`);
          renderCardsView();
        } else {
          alert('Insufficient currency to buy this card pack!');
        }
      }
    });
  });

  // -------------------------------------------------------------
  // 9. Astronomy View
  // -------------------------------------------------------------
  const blackHoleMassEl = document.getElementById('blackHoleMass');
  const feedBlackHoleBtn = document.getElementById('feedBlackHoleBtn');
  const bhMultiplierEl = document.getElementById('bhMultiplier');

  function renderAstronomyView() {
    if (!engine.astronomy) return;
    if (blackHoleMassEl) {
      blackHoleMassEl.textContent = `${engine.astronomy.blackHoleMass.toFixed(1)} M☉`;
    }
    if (bhMultiplierEl) {
      const bhMult = Math.pow(engine.astronomy.blackHoleMass, 0.4);
      bhMultiplierEl.textContent = `${bhMult.toFixed(2)}x Gravitational Lensing`;
    }

    const starDefs = [
      { id: 'alphaCentauri', name: 'Alpha Centauri', cost: '5 τ', desc: '+500% Matter Generation' },
      { id: 'siriusB', name: 'Sirius B', cost: '15 τ', desc: '+300% Research Generation' },
      { id: 'betelgeuse', name: 'Betelgeuse Supernova', cost: '40 τ', desc: '+500% Prestige Gain' },
      { id: 'polaris', name: 'Polaris Astral Beacon', cost: '100 τ', desc: '+1000% Global Multiplier' }
    ];

    const starsListEl = document.getElementById('starsList');
    if (starsListEl) {
      starsListEl.innerHTML = '';
      starDefs.forEach(star => {
        const isBought = engine.astronomy.stars && engine.astronomy.stars[star.id];
        const sEl = document.createElement('div');
        sEl.className = 'star-row' + (isBought ? ' star-purchased' : '');
        sEl.innerHTML = `
          <div class="star-info">
            <div class="star-name">${star.name}</div>
            <div class="star-desc">${star.desc} • Cost: ${star.cost}</div>
          </div>
          <button class="buy-star-btn" data-star="${star.id}">${isBought ? 'IGNITED' : 'Ignite Star'}</button>
        `;

        const bBtn = sEl.querySelector('.buy-star-btn');
        bBtn.disabled = isBought;
        bBtn.addEventListener('click', () => {
          if (engine.buyStar && engine.buyStar(star.id)) {
            sound.playMaxed();
            renderAstronomyView();
          } else {
            alert('Insufficient Transcendence Points (τ)!');
          }
        });

        starsListEl.appendChild(sEl);
      });
    }
  }

  if (feedBlackHoleBtn) {
    feedBlackHoleBtn.addEventListener('click', () => {
      const cost = D(100000);
      if (engine.feedBlackHole && engine.feedBlackHole(cost)) {
        sound.playPrestige();
        renderAstronomyView();
      } else {
        alert('Requires 100,000 Matter to feed the Event Horizon!');
      }
    });
  }

  // -------------------------------------------------------------
  // 10. Quantum Logic View
  // -------------------------------------------------------------
  const puzzleGridEl = document.getElementById('puzzleGrid');
  const resetPuzzleBtn = document.getElementById('resetPuzzleBtn');
  const relicsCountEl = document.getElementById('relicsCount');

  function renderPuzzleView() {
    if (!puzzleGridEl || !engine.minesweeper) return;
    puzzleGridEl.innerHTML = '';

    if (relicsCountEl) {
      relicsCountEl.textContent = engine.minesweeper.relicsCleared || 0;
    }

    if (engine.minesweeper.board) {
      engine.minesweeper.board.forEach((cell, idx) => {
        const cEl = document.createElement('div');
        cEl.className = 'puzzle-cell';

        if (cell.revealed) {
          cEl.classList.add('revealed');
          if (cell.isMine) {
            cEl.classList.add('mine');
            cEl.textContent = '💥';
          } else if (cell.count > 0) {
            cEl.textContent = cell.count;
            cEl.dataset.count = cell.count;
          }
        } else if (cell.flagged) {
          cEl.classList.add('flagged');
          cEl.textContent = '🚩';
        }

        cEl.addEventListener('click', () => {
          const res = engine.revealCell && engine.revealCell(idx);
          if (res) {
            if (res.status === 'exploded') {
              sound.playPrestige();
              alert('Quantum Anomaly Detonated! Reset the terminal to try again.');
            } else if (res.status === 'victory') {
              sound.playMaxed();
              alert(`Quantum Terminal Solved! You gained Quantum Relic #${res.relics} (+50% Global Multiplier)!`);
            } else {
              sound.playClick();
            }
            renderPuzzleView();
          }
        });

        cEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          if (engine.toggleFlag) {
            engine.toggleFlag(idx);
            sound.playClick();
            renderPuzzleView();
          }
        });

        puzzleGridEl.appendChild(cEl);
      });
    }
  }

  if (resetPuzzleBtn) {
    resetPuzzleBtn.addEventListener('click', () => {
      if (engine.resetMinesweeper) {
        engine.resetMinesweeper();
        renderPuzzleView();
      }
    });
  }

  // -------------------------------------------------------------
  // 11. Challenges View
  // -------------------------------------------------------------
  function renderChallengesView() {
    const chList = document.getElementById('challengesList');
    if (!chList || !engine.challenges) return;
    chList.innerHTML = '';

    const chDefs = [
      { id: 'matterDampening', name: 'Dimensional Friction', goal: '100,000 ₽', penalty: 'Point generation cut by 90%', reward: '+150% Global Multiplier' },
      { id: 'voidSilence', name: 'Absolute Zero Vacuum', goal: '1,000,000 ₽', penalty: 'No research points generated', reward: '+200% Prestige Yield' },
      { id: 'temporalShift', name: 'Chronos Distortion', goal: '10,000,000 ₽', penalty: 'Game speed halved', reward: '+100% Manual Click Power' }
    ];

    chDefs.forEach(ch => {
      const isCompleted = engine.challenges.completed && engine.challenges.completed[ch.id];
      const isActive = engine.challenges.activeId === ch.id;

      const card = document.createElement('div');
      card.className = 'challenge-card' + (isCompleted ? ' challenge-completed' : (isActive ? ' challenge-active' : ''));
      card.innerHTML = `
        <div class="challenge-title">${ch.name}</div>
        <div class="challenge-meta">Goal: ${ch.goal} • Restriction: ${ch.penalty}</div>
        <div class="challenge-reward">Reward: ${ch.reward}</div>
        <button class="challenge-start-btn">${isCompleted ? 'COMPLETED' : (isActive ? 'ABORT TRIAL' : 'ENTER TRIAL')}</button>
      `;

      card.querySelector('.challenge-start-btn').addEventListener('click', () => {
        if (isActive && engine.exitChallenge) {
          engine.exitChallenge(false);
        } else if (engine.startChallenge) {
          engine.startChallenge(ch.id);
        }
        renderChallengesView();
        switchTab('tree');
      });

      chList.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // 12. Prestige & Transcension Modals
  // -------------------------------------------------------------
  const prestigeModal = document.getElementById('prestigeModal');
  const prestigeGainPreview = document.getElementById('prestigeGainPreview');
  const confirmPrestigeBtn = document.getElementById('confirmPrestigeBtn');
  const closePrestigeBtn = document.getElementById('closePrestigeBtn');
  const modalPrestigeProgressPct = document.getElementById('modalPrestigeProgressPct');
  const modalPrestigeProgressBar = document.getElementById('modalPrestigeProgressBar');
  const modalPrestigeCurPoints = document.getElementById('modalPrestigeCurPoints');
  const openPrestigeBaseplateBtn = document.getElementById('openPrestigeBaseplateBtn');

  window.openPrestigeModal = function() {
    const can = engine.canPrestige ? engine.canPrestige() : false;
    const gain = engine.calculatePrestigeGain ? engine.calculatePrestigeGain() : D(0);
    const pct = engine.getPrestigeProgress ? engine.getPrestigeProgress() : 0;

    if (modalPrestigeProgressPct) modalPrestigeProgressPct.textContent = `${pct.toFixed(1)}%`;
    if (modalPrestigeProgressBar) modalPrestigeProgressBar.style.width = `${pct}%`;
    if (modalPrestigeCurPoints) modalPrestigeCurPoints.textContent = `Current: ${engine.currencies.matter.format(2)} / 10.00 Qd₽`;
    if (prestigeGainPreview) prestigeGainPreview.textContent = `+${gain.format(0)} ₹`;

    if (confirmPrestigeBtn) {
      confirmPrestigeBtn.disabled = !can;
      confirmPrestigeBtn.textContent = can ? `Trigger Prestige (+${gain.format(0)} ₹)` : 'Need 10 Qd₽';
    }

    if (prestigeModal) prestigeModal.classList.add('modal-open');
  };

  if (openPrestigeBaseplateBtn) {
    openPrestigeBaseplateBtn.addEventListener('click', () => {
      if (prestigeModal) prestigeModal.classList.remove('modal-open');
      switchTab('prestige');
    });
  }

  if (closePrestigeBtn) {
    closePrestigeBtn.addEventListener('click', () => {
      prestigeModal.classList.remove('modal-open');
    });
  }

  if (confirmPrestigeBtn) {
    confirmPrestigeBtn.addEventListener('click', () => {
      if (!engine.canPrestige()) return;
      const gained = engine.triggerPrestige();
      if (gained && gained.gt(0)) {
        sound.playPrestige();
        prestigeModal.classList.remove('modal-open');
        switchTab('prestige');
        renderPrestigeView();
        updateHeaderTickers();
        updateNavTabVisibilities();
        canvasRenderer.spawnFloatingText(`✦ REALITY COLLAPSED! +${gained.format(0)} ₹ ✦`, window.innerWidth / 2, window.innerHeight / 2, true);
      }
    });
  }

  const transcendModal = document.getElementById('transcendModal');
  const transcendGainPreview = document.getElementById('transcendGainPreview');
  const confirmTranscendBtn = document.getElementById('confirmTranscendBtn');
  const closeTranscendBtn = document.getElementById('closeTranscendBtn');

  window.openTranscendModal = function() {
    const gain = engine.calculateTranscendGain ? engine.calculateTranscendGain() : D(1);
    if (transcendGainPreview) transcendGainPreview.textContent = `+${gain.format(0)} τ`;
    if (transcendModal) transcendModal.classList.add('modal-open');
  };

  if (closeTranscendBtn) {
    closeTranscendBtn.addEventListener('click', () => {
      transcendModal.classList.remove('modal-open');
    });
  }

  if (confirmTranscendBtn) {
    confirmTranscendBtn.addEventListener('click', () => {
      const gained = engine.triggerTranscension ? engine.triggerTranscension() : null;
      if (gained && gained.gt(0)) {
        sound.playPrestige();
        transcendModal.classList.remove('modal-open');
        switchTab('tree');
        canvasRenderer.render();
      }
    });
  }

  // -------------------------------------------------------------
  // 13. Offline Progress Welcome Modal
  // -------------------------------------------------------------
  if (engine.offlineReward) {
    const offModal = document.getElementById('offlineModal');
    const offTimeEl = document.getElementById('offlineTime');
    const offEarnedEl = document.getElementById('offlineEarned');
    const offClaimBtn = document.getElementById('offlineClaimBtn');

    if (offModal && offTimeEl && offEarnedEl) {
      const hrs = Math.floor(engine.offlineReward.secondsAway / 3600);
      const mins = Math.floor((engine.offlineReward.secondsAway % 3600) / 60);
      const secs = Math.floor(engine.offlineReward.secondsAway % 60);

      offTimeEl.textContent = `${hrs}h ${mins}m ${secs}s`;
      offEarnedEl.textContent = `+${engine.offlineReward.matterEarned.format(2)} ₽`;
      offModal.classList.add('modal-open');

      if (offClaimBtn) {
        offClaimBtn.addEventListener('click', () => {
          sound.playBuy();
          offModal.classList.remove('modal-open');
        });
      }
    }
  }


  // -------------------------------------------------------------
  // PRESTIGE BASEPLATE CONTROLLER (#1p - #29p)
  // -------------------------------------------------------------
  let prestigeFilter = 'all';
  const prestigeBaseplateBalance = document.getElementById('prestigeBaseplateBalance');
  const prestigeLifetimeCount = document.getElementById('prestigeLifetimeCount');
  const prestigePeakMatter = document.getElementById('prestigePeakMatter');
  const prestigeProgressBar = document.getElementById('prestigeProgressBar');
  const prestigeProgressCur = document.getElementById('prestigeProgressCur');
  const prestigeProgressPct = document.getElementById('prestigeProgressPct');
  const prestigeGainBaseplate = document.getElementById('prestigeGainBaseplate');
  const prestigeTriggerActionBtn = document.getElementById('prestigeTriggerActionBtn');
  const prestigeCardsContainer = document.getElementById('prestigeCardsContainer');
  const prestigeBuyAllBtn = document.getElementById('prestigeBuyAllBtn');
  const prestigeFilterChips = document.getElementById('prestigeFilterChips');
  const prestigeOwnedSummary = document.getElementById('prestigeOwnedSummary');

  if (prestigeFilterChips) {
    prestigeFilterChips.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        prestigeFilterChips.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        prestigeFilter = btn.dataset.filter;
        renderPrestigeView();
      });
    });
  }

  if (prestigeTriggerActionBtn) {
    prestigeTriggerActionBtn.addEventListener('click', () => {
      if (!engine.canPrestige()) return;
      const gained = engine.triggerPrestige();
      if (gained && gained.gt(0)) {
        sound.playPrestige();
        canvasRenderer.spawnFloatingText(`✦ REALITY COLLAPSED! +${gained.format(0)} ₹ ✦`, window.innerWidth / 2, window.innerHeight / 2, true);
        renderPrestigeView();
        updateHeaderTickers();
        updateNavTabVisibilities();
      }
    });
  }

  if (prestigeBuyAllBtn) {
    prestigeBuyAllBtn.addEventListener('click', () => {
      const defs = getNodeDefs();
      const pIds = (typeof PRESTIGE_NODE_IDS !== 'undefined') ? PRESTIGE_NODE_IDS : Object.keys(defs).filter(k => k.endsWith('p'));
      let anyBought = false;
      pIds.forEach(id => {
        if (engine.canAffordNode(id)) {
          const b = engine.buyMaxNode ? engine.buyMaxNode(id) : engine.buyNode(id);
          if (b) anyBought = true;
        }
      });
      if (anyBought) {
        sound.playBuy();
        renderPrestigeView();
        updateHeaderTickers();
      }
    });
  }

  const pCardElements = new Map();

  function renderPrestigeView() {
    if (prestigeBaseplateBalance) prestigeBaseplateBalance.textContent = engine.currencies.prestige.format(2);
    if (prestigeLifetimeCount) prestigeLifetimeCount.textContent = (engine.stats.prestiges || 0);
    if (prestigePeakMatter) prestigePeakMatter.textContent = `Peak: ${(engine.stats.peakMatter ? engine.stats.peakMatter.format(2) : '0')} ₽`;

    // Progress & Reset Panel
    const can = engine.canPrestige ? engine.canPrestige() : false;
    const pct = engine.getPrestigeProgress ? engine.getPrestigeProgress() : 0;
    const gain = engine.calculatePrestigeGain ? engine.calculatePrestigeGain() : D(0);

    if (prestigeProgressBar) prestigeProgressBar.style.width = `${pct}%`;
    if (prestigeProgressCur) prestigeProgressCur.textContent = `${engine.currencies.matter.format(2)} / 10.00 Qd₽`;
    if (prestigeProgressPct) prestigeProgressPct.textContent = `${pct.toFixed(1)}%`;
    if (prestigeGainBaseplate) prestigeGainBaseplate.textContent = `+${gain.format(0)} ₹`;

    if (prestigeTriggerActionBtn) {
      prestigeTriggerActionBtn.disabled = !can;
      prestigeTriggerActionBtn.classList.toggle('ready', can);
    }

    const defs = getNodeDefs();
    const pIds = (typeof PRESTIGE_NODE_IDS !== 'undefined') ? PRESTIGE_NODE_IDS : Object.keys(defs).filter(k => k.endsWith('p'));

    let totalOwned = 0;
    pIds.forEach(id => {
      if ((engine.upgrades[id] || 0) > 0) totalOwned++;
    });
    if (prestigeOwnedSummary) prestigeOwnedSummary.textContent = `${totalOwned} / ${pIds.length} Upgrades Owned`;

    if (!prestigeCardsContainer) return;

    pIds.forEach(id => {
      const def = defs[id];
      if (!def) return;

      const subcat = def.subcategory || 'multi';
      const matchesFilter = (prestigeFilter === 'all') || (prestigeFilter === subcat);

      let card = pCardElements.get(id);
      if (!card) {
        card = document.createElement('div');
        card.className = 'prestige-card';
        card.dataset.node = id;
        card.dataset.subcat = subcat;

        card.innerHTML = `
          <div class="pcard-top-row">
            <div class="pcard-icon-box">${def.icon}</div>
            <div class="pcard-info">
              <div class="pcard-tag-row">
                <span class="pcard-num">${def.num}</span>
                <span class="pcard-lvl-badge" id="plvl-${id}">LVL 0</span>
              </div>
              <div class="pcard-title" title="${def.name}">${def.name}</div>
            </div>
          </div>
          <div class="pcard-desc-box">
            <div class="pcard-effect" id="peffect-${id}">Effect</div>
            <div class="pcard-lore">${def.lore}</div>
          </div>
          <div class="pcard-bottom-row">
            <div class="pcard-cost-pill" id="pcost-${id}">0 ₹</div>
            <div class="pcard-actions">
              <button class="pcard-btn" id="pbtn-${id}">BUY (+1)</button>
              ${def.maxLevel > 1 ? `<button class="pcard-btn pcard-max-btn" id="pbtnmax-${id}">MAX</button>` : ''}
            </div>
          </div>
        `;

        const buyBtn = card.querySelector(`#pbtn-${id}`);
        if (buyBtn) {
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (engine.buyNode(id)) {
              sound.playBuy();
              renderPrestigeView();
              updateHeaderTickers();
            }
          });
        }

        const maxBtn = card.querySelector(`#pbtnmax-${id}`);
        if (maxBtn) {
          maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (engine.buyMaxNode(id)) {
              sound.playBuy();
              renderPrestigeView();
              updateHeaderTickers();
            }
          });
        }

        pCardElements.set(id, card);
        prestigeCardsContainer.appendChild(card);
      }

      card.style.display = matchesFilter ? 'flex' : 'none';

      // Update Card State
      const lvl = engine.upgrades[id] || 0;
      const maxLvl = engine.getNodeMaxLevel(id);
      const isMaxed = maxLvl > 0 && lvl >= maxLvl;
      const canAfford = engine.canAffordNode(id);
      const cost = engine.getNodeCost(id);
      const symbol = def.currency === 'bits' ? '฿' : '₹';

      card.classList.toggle('affordable', canAfford && !isMaxed);
      card.classList.toggle('maxed', isMaxed);
      card.classList.toggle('permanent', !!def.isPermanent);

      const lvlBadge = card.querySelector(`#plvl-${id}`);
      if (lvlBadge) {
        if (def.isPermanent) {
          lvlBadge.textContent = lvl > 0 ? 'PERMANENT' : 'UNLOCKED';
          lvlBadge.className = 'pcard-lvl-badge ' + (lvl > 0 ? 'badge-perm' : '');
        } else if (isMaxed) {
          lvlBadge.textContent = 'MAXED';
          lvlBadge.className = 'pcard-lvl-badge badge-maxed';
        } else if (maxLvl > 1) {
          lvlBadge.textContent = `${lvl}/${maxLvl}`;
          lvlBadge.className = 'pcard-lvl-badge';
        } else {
          lvlBadge.textContent = lvl > 0 ? 'ACTIVE' : 'NOT OWNED';
          lvlBadge.className = 'pcard-lvl-badge ' + (lvl > 0 ? 'badge-maxed' : '');
        }
      }

      const effectEl = card.querySelector(`#peffect-${id}`);
      if (effectEl) {
        effectEl.textContent = typeof def.effectDescription === 'function' ? def.effectDescription(lvl, engine) : def.effectDescription;
      }

      const costEl = card.querySelector(`#pcost-${id}`);
      if (costEl) {
        costEl.textContent = isMaxed ? 'OWNED' : `${cost.format(2)} ${symbol}`;
      }

      const buyBtn = card.querySelector(`#pbtn-${id}`);
      if (buyBtn) {
        buyBtn.disabled = isMaxed || !canAfford;
        if (isMaxed) buyBtn.textContent = 'OWNED';
        else if (def.isPermanent && lvl > 0) buyBtn.textContent = 'ACTIVE';
        else buyBtn.textContent = 'BUY (+1)';
      }

      const maxBtn = card.querySelector(`#pbtnmax-${id}`);
      if (maxBtn) {
        maxBtn.disabled = isMaxed || !canAfford;
      }
    });
  }
  window.renderPrestigeView = renderPrestigeView;


  // -------------------------------------------------------------
  // Singularity Tap Engine & Clicker Dock Controller
  // -------------------------------------------------------------
  const singularityClickerDock = document.getElementById('singularityClickerDock');
  const minimizeClickerBtn = document.getElementById('minimizeClickerBtn');
  const singularityTapOrb = document.getElementById('singularityTapOrb');
  const orbClickPowerVal = document.getElementById('orbClickPowerVal');
  const frenzyMultVal = document.getElementById('frenzyMultVal');
  const frenzyBarFill = document.getElementById('frenzyBarFill');
  const critIndicatorBadge = document.getElementById('critIndicatorBadge');

  if (minimizeClickerBtn && singularityClickerDock) {
    minimizeClickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      singularityClickerDock.classList.toggle('minimized');
      minimizeClickerBtn.textContent = singularityClickerDock.classList.contains('minimized') ? '+' : '−';
    });
  }

  function handleManualTap(e) {
    if (e && e.stopPropagation) e.stopPropagation();

    // Auto-unlock #1 Generic beginning if not owned
    if (!engine.upgrades['node_1'] && engine.canAffordNode('node_1')) {
      engine.buyNode('node_1');
    }

    if (singularityTapOrb) {
      singularityTapOrb.classList.add('tap-active', 'shocking');
      setTimeout(() => singularityTapOrb.classList.remove('tap-active', 'shocking'), 100);
    }

    const res = engine.clickSingularity();
    sound.playClick(res.comboMult, res.isCrit);

    let x = window.innerWidth / 2;
    let y = window.innerHeight - 180;
    if (e && e.clientX) {
      x = e.clientX;
      y = e.clientY - 20;
    } else if (singularityTapOrb) {
      const rect = singularityTapOrb.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top - 15;
    }

    const text = `+${res.amount.format(1)} ₽` + (res.isCrit ? ' ⚡ CRIT!' : '') + (res.xp > 1 ? ` (+${res.xp} XP)` : '');
    canvasRenderer.spawnFloatingText(text, x, y, res.isCrit);

    updateClickerUI();
    updateHeaderTickers();
  }

  if (singularityTapOrb) {
    singularityTapOrb.addEventListener('click', handleManualTap);
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (activeTab === 'tree') {
        e.preventDefault();
        handleManualTap();
      }
    }
  });

  function updateClickerUI() {
    if (orbClickPowerVal) orbClickPowerVal.textContent = `+${engine.rates.clickPower.format(1)} ₽`;
    const combo = engine.stats.clickCombo || 0;
    const mult = engine.stats.comboMultiplier || 1.0;
    if (frenzyMultVal) frenzyMultVal.textContent = `${mult.toFixed(1)}×`;
    if (frenzyBarFill) frenzyBarFill.style.width = `${Math.min(100, (combo / 30) * 100)}%`;
    if (singularityTapOrb) {
      singularityTapOrb.classList.toggle('high-combo', combo >= 10);
    }
    if (critIndicatorBadge) {
      critIndicatorBadge.style.boxShadow = combo >= 15 ? '0 0 12px #fbbf24' : 'none';
    }
  }

  // -------------------------------------------------------------
  // Research Center (#8) View Controller & Conversion
  // -------------------------------------------------------------
  const rcMatterBalance = document.getElementById('rcMatterBalance');
  const rcResearchBalance = document.getElementById('rcResearchBalance');
  const rcConversionsCount = document.getElementById('rcConversionsCount');
  const rcPassiveStatus = document.getElementById('rcPassiveStatus');
  const rcPendingYieldVal = document.getElementById('rcPendingYieldVal');
  const rcConversionBar = document.getElementById('rcConversionBar');
  const rcCurrentPointsProgress = document.getElementById('rcCurrentPointsProgress');
  const rcCurrentPointsPct = document.getElementById('rcCurrentPointsPct');
  const initiateConversionBtn = document.getElementById('initiateConversionBtn');
  const rcCardsContainer = document.getElementById('rcCardsContainer');
  const rcUpgradesCount = document.getElementById('rcUpgradesCount');
  const probeSecretBtn = document.getElementById('probeSecretBtn');
  const radarStatusText = document.getElementById('radarStatusText');

  const rcMult19 = document.getElementById('rcMult19');
  const rcMult2p = document.getElementById('rcMult2p');
  const rcMult4p = document.getElementById('rcMult4p');
  const rcMultPerk = document.getElementById('rcMultPerk');
  const rcMult31 = document.getElementById('rcMult31');

  const rcCardElements = new Map();

  function renderResearchView() {
    if (rcMatterBalance) rcMatterBalance.textContent = `${engine.currencies.matter.format(2)} ₽`;
    if (rcResearchBalance) rcResearchBalance.textContent = `${engine.currencies.research.format(1)} λ`;
    if (rcConversionsCount) rcConversionsCount.textContent = (engine.stats.researchConversions || 0);

    // Passive Status (#6p)
    if (rcPassiveStatus) {
      const has6p = (engine.upgrades['node_6p'] || 0) > 0;
      if (has6p) {
        rcPassiveStatus.textContent = `ACTIVE (+${engine.rates.researchPerSec.format(1)} λ/s)`;
        rcPassiveStatus.style.color = '#34d399';
      } else {
        rcPassiveStatus.textContent = 'INACTIVE (0%/s) — Manual Conversion Only';
        rcPassiveStatus.style.color = '#fbbf24';
      }
    }

    // Conversion Reactor
    const canConvert = engine.canConvertResearch ? engine.canConvertResearch() : false;
    const pendingLambda = engine.calculatePendingResearch ? engine.calculatePendingResearch() : D(0);
    if (rcPendingYieldVal) rcPendingYieldVal.textContent = `+${pendingLambda.format(0)} λ`;

    if (initiateConversionBtn) {
      initiateConversionBtn.disabled = !canConvert;
      initiateConversionBtn.textContent = canConvert ? `⚡ INITIATE CONVERSION (+${pendingLambda.format(0)} λ)` : 'Need 20,000 ₽ to Convert';
    }

    const matterNum = engine.currencies.matter.toNumber();
    const progressPct = Math.min(100, Math.max(0, (matterNum / 20000) * 100));
    if (rcConversionBar) rcConversionBar.style.width = `${progressPct.toFixed(1)}%`;
    if (rcCurrentPointsProgress) rcCurrentPointsProgress.textContent = `${engine.currencies.matter.format(1)} / 20,000 ₽`;
    if (rcCurrentPointsPct) rcCurrentPointsPct.textContent = `${progressPct.toFixed(1)}%`;

    // Multiplier Pills
    if (rcMult19) rcMult19.classList.toggle('active', !!engine.upgrades['node_19']);
    if (rcMult2p) {
      const lvl = engine.upgrades['node_2p'] || 0;
      rcMult2p.textContent = `#2p Rocket: +${(lvl * 0.5).toFixed(1)}×`;
      rcMult2p.classList.toggle('active', lvl > 0);
    }
    if (rcMult4p) {
      const lvl = engine.upgrades['node_4p'] || 0;
      rcMult4p.textContent = `#4p Duping: ×${Math.pow(2, lvl)}`;
      rcMult4p.classList.toggle('active', lvl > 0);
    }
    if (rcMultPerk) {
      const rank = engine.player.perks.researchSpeed || 0;
      rcMultPerk.textContent = `Perk: +${rank * 10}%`;
      rcMultPerk.classList.toggle('active', rank > 0);
    }
    if (rcMult31) rcMult31.classList.toggle('active', !!engine.upgrades['node_31']);

    // Secret Anomaly
    const isSecretUnlocked = !!(engine.badges && engine.badges.beyondAnalysis) || !!engine.upgrades['secret_beyond_analysis'];
    if (probeSecretBtn) {
      probeSecretBtn.disabled = isSecretUnlocked;
      probeSecretBtn.textContent = isSecretUnlocked ? 'RELIC DISCOVERED (CLAIMED)' : 'SCAN & UNLOCK SECRET';
    }
    if (radarStatusText) {
      radarStatusText.textContent = isSecretUnlocked ? 'Status: Relic Synchronized [Beyond Analysis Badge Acquired]' : 'Status: Anomaly Signature Detected at (-550, 3244)';
      radarStatusText.style.color = isSecretUnlocked ? '#34d399' : '#c084fc';
    }

    // Machine Upgrade Cards Grid
    const defs = getNodeDefs();
    const rcIds = (typeof RESEARCH_CENTER_NODE_IDS !== 'undefined') ? RESEARCH_CENTER_NODE_IDS.filter(id => id !== 'secret_beyond_analysis') : [];

    let constructedCount = 0;
    rcIds.forEach(id => {
      if ((engine.upgrades[id] || 0) > 0) constructedCount++;
    });
    if (rcUpgradesCount) rcUpgradesCount.textContent = `${constructedCount} / ${rcIds.length} Machines Constructed`;

    if (!rcCardsContainer) return;

    rcIds.forEach(id => {
      const def = defs[id];
      if (!def) return;

      let card = rcCardElements.get(id);
      if (!card) {
        card = document.createElement('div');
        card.className = 'rc-card';
        card.dataset.node = id;

        card.innerHTML = `
          <div class="rc-card-top">
            <div class="rc-icon-box">${def.icon || '⚙️'}</div>
            <div class="rc-info">
              <div class="rc-title-row">
                <span class="rc-title">${def.name}</span>
                <span class="rc-lvl-pill" id="rclvl-${id}">LVL 0</span>
              </div>
            </div>
          </div>
          <div class="rc-desc-box">
            <div id="rceffect-${id}">${typeof def.effectDescription === 'function' ? def.effectDescription(0, engine) : def.effectDescription}</div>
          </div>
          <div class="rc-card-bottom">
            <span class="rc-cost-pill" id="rccost-${id}">0 λ</span>
            <button class="rc-buy-btn" id="rcbtn-${id}">BUY</button>
          </div>
        `;

        const buyBtn = card.querySelector(`#rcbtn-${id}`);
        if (buyBtn) {
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (engine.buyNode(id)) {
              sound.playBuy();
              renderResearchView();
              updateHeaderTickers();
            }
          });
        }

        rcCardElements.set(id, card);
        rcCardsContainer.appendChild(card);
      }

      // Update Card State
      const lvl = engine.upgrades[id] || 0;
      const maxLvl = engine.getNodeMaxLevel(id);
      const isMaxed = maxLvl > 0 && lvl >= maxLvl;
      const canAfford = engine.canAffordNode(id);
      const cost = engine.getNodeCost(id);

      card.classList.toggle('affordable', canAfford && !isMaxed);
      card.classList.toggle('maxed', isMaxed);

      const lvlPill = card.querySelector(`#rclvl-${id}`);
      if (lvlPill) {
        if (def.isPermanent) {
          lvlPill.textContent = lvl > 0 ? 'CONSTRUCTED' : 'UNOWNED';
          lvlPill.className = 'rc-lvl-pill ' + (lvl > 0 ? 'maxed' : '');
        } else if (isMaxed) {
          lvlPill.textContent = 'MAXED';
          lvlPill.className = 'rc-lvl-pill maxed';
        } else {
          lvlPill.textContent = `${lvl}/${maxLvl}`;
          lvlPill.className = 'rc-lvl-pill';
        }
      }

      const effectEl = card.querySelector(`#rceffect-${id}`);
      if (effectEl) {
        effectEl.textContent = typeof def.effectDescription === 'function' ? def.effectDescription(lvl, engine) : def.effectDescription;
      }

      const costEl = card.querySelector(`#rccost-${id}`);
      if (costEl) {
        costEl.textContent = isMaxed ? 'OWNED' : `${cost.format(0)} λ`;
      }

      const buyBtn = card.querySelector(`#rcbtn-${id}`);
      if (buyBtn) {
        buyBtn.disabled = isMaxed || !canAfford;
        buyBtn.textContent = isMaxed ? 'OWNED' : 'BUY';
      }
    });
  }

  // Conversion Button Listener
  if (initiateConversionBtn) {
    initiateConversionBtn.addEventListener('click', () => {
      if (!engine.canConvertResearch()) return;
      const res = engine.convertResearch();
      if (res && res.gained && res.gained.gt(0)) {
        sound.playConvert();
        renderResearchView();
        updateHeaderTickers();
        canvasRenderer.spawnFloatingText(`✦ RESEARCH CONVERTED! +${res.gained.format(0)} λ ✦`, window.innerWidth / 2, window.innerHeight / 2, true);
      }
    });
  }

  // Probe Secret Listener
  if (probeSecretBtn) {
    probeSecretBtn.addEventListener('click', () => {
      if (engine.unlockSecretBeyondAnalysis()) {
        sound.playSecretUnlock();
        renderResearchView();
        renderRecordsView();
        canvasRenderer.spawnFloatingText('🔮 OBSCURITY BADGE: BEYOND ANALYSIS UNLOCKED! 🔮', window.innerWidth / 2, window.innerHeight / 2, true);
      }
    });
  }

  window.renderResearchView = renderResearchView;

  // -------------------------------------------------------------
  // 14. Sound FX, Drone & Camera Controls
  // -------------------------------------------------------------
  const centerCamBtn = document.getElementById('centerCamBtn');
  if (centerCamBtn) {
    centerCamBtn.addEventListener('click', () => {
      canvasRenderer.centerCamera();
    });
  }

  const droneToggleBtn = document.getElementById('droneToggleBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  if (droneToggleBtn) {
    droneToggleBtn.addEventListener('click', () => {
      const active = sound.toggleDrone();
      droneToggleBtn.classList.toggle('active', active);
      droneToggleBtn.textContent = active ? 'Drone: ON' : 'Drone: OFF';
    });
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      const muted = sound.toggleMute();
      soundToggleBtn.classList.toggle('active', !muted);
      soundToggleBtn.textContent = muted ? 'SFX: MUTED' : 'SFX: ON';
    });
  }

  // -------------------------------------------------------------
  // 15. Master Game Loop (60 FPS Delta Time)
  // -------------------------------------------------------------
  let lastFrameTime = performance.now();
  let autoSaveTimer = 0;
  const eqBars = document.querySelectorAll('.eq-bar');
  const miniEqBars = document.querySelectorAll('.mini-visualizer-bars span');

  function gameLoop(now) {
    requestAnimationFrame(gameLoop);

    const rawDelta = (now - lastFrameTime) / 1000;
    const dt = isNaN(rawDelta) || rawDelta <= 0 ? 0.016 : Math.min(0.2, rawDelta);
    lastFrameTime = now;

    // Tick Game Logic
    engine.tick(dt);

    // Canvas update
    canvasRenderer.update(dt);
    if (activeTab === 'tree') {
      canvasRenderer.render();
      updateClickerUI();
    } else if (activeTab === 'research') {
      renderResearchView();
    } else if (activeTab === 'prestige') {
      renderPrestigeView();
    } else if (activeTab === 'bonus') {
      renderBonusView();
    }

    // Update Header Tickers & Tabs
    updateHeaderTickers();
    updateNavTabVisibilities();

    // Boombox visualizer animation
    if (sound.boomboxPlaying) {
      sound.visualizerBars.forEach((h, idx) => {
        if (eqBars[idx]) {
          eqBars[idx].style.height = `${Math.max(10, Math.floor(h * 100))}%`;
        }
        if (miniEqBars[idx % miniEqBars.length]) {
          miniEqBars[idx % miniEqBars.length].style.height = `${Math.max(20, Math.floor(h * 100))}%`;
        }
      });
    }

    // Auto-Save every 5 seconds
    autoSaveTimer += dt;
    if (autoSaveTimer >= 5.0) {
      engine.saveGame();
      autoSaveTimer = 0;
    }
  }

  requestAnimationFrame(gameLoop);

  // Settings Buttons
  const saveBtn = document.getElementById('manualSaveBtn');
  const exportBtn = document.getElementById('exportSaveBtn');
  const importBtn = document.getElementById('importSaveBtn');
  const hardResetBtn = document.getElementById('hardResetBtn');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      engine.saveGame();
      sound.playClick();
      alert('Game state saved to local storage!');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const str = engine.exportSaveString();
      navigator.clipboard.writeText(str).then(() => {
        alert('Save string copied to clipboard!');
      }).catch(() => {
        prompt('Copy your save string below:', str);
      });
    });
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      const str = prompt('Paste your base64 save string:');
      if (str) {
        engine.importSaveString(str);
      }
    });
  }

  if (hardResetBtn) {
    hardResetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to HARD RESET? All progress will be permanently erased.')) {
        if (confirm('FINAL WARNING: This cannot be undone. Wipe all progress?')) {
          engine.hardReset();
        }
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
