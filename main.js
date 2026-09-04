// Everything Upgrade Tree - Master UI Controller & Game Loop
document.addEventListener('DOMContentLoaded', () => {
  const engine = window.gameEngine;
  engine.init();

  const canvasContainer = document.getElementById('canvasContainer');
  const canvasRenderer = new InfiniteCanvas(canvasContainer, engine);

  // Sound Engine setup
  const sound = window.soundEngine;
  document.addEventListener('click', () => {
    sound.ensureContext();
  }, { once: true });

  // DOM References: Header Resource Tickers
  const matterValEl = document.getElementById('matterVal');
  const matterRateEl = document.getElementById('matterRate');
  const researchValEl = document.getElementById('researchVal');
  const researchRateEl = document.getElementById('researchRate');
  const prestigeValEl = document.getElementById('prestigeVal');
  const transcendValEl = document.getElementById('transcendVal');

  const researchPill = document.getElementById('researchPill');
  const prestigePill = document.getElementById('prestigePill');
  const transcendPill = document.getElementById('transcendPill');

  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const viewPanels = {
    tree: document.getElementById('treeView'),
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

  // Check portal node unlocks to enable sub-system tabs
  function updateNavTabVisibilities() {
    const tabMining = document.querySelector('.nav-tab-btn[data-tab="mining"]');
    if (tabMining) tabMining.style.display = engine.upgrades['portal_mining'] ? 'inline-flex' : 'none';

    const tabCards = document.querySelector('.nav-tab-btn[data-tab="cards"]');
    if (tabCards) tabCards.style.display = engine.upgrades['portal_cards'] ? 'inline-flex' : 'none';

    const tabPuzzle = document.querySelector('.nav-tab-btn[data-tab="puzzle"]');
    if (tabPuzzle) tabPuzzle.style.display = engine.upgrades['portal_puzzle'] ? 'inline-flex' : 'none';

    const tabAstronomy = document.querySelector('.nav-tab-btn[data-tab="astronomy"]');
    if (tabAstronomy) tabAstronomy.style.display = engine.upgrades['portal_astronomy'] ? 'inline-flex' : 'none';

    const tabChallenges = document.querySelector('.nav-tab-btn[data-tab="challenges"]');
    if (tabChallenges) tabChallenges.style.display = engine.upgrades['portal_challenges'] ? 'inline-flex' : 'none';
  }

  // -------------------------------------------------------------
  // 1. Header Resource Tickers
  // -------------------------------------------------------------
  function updateHeaderTickers() {
    matterValEl.textContent = engine.currencies.matter.format(2);
    matterRateEl.textContent = `+${engine.rates.matterPerSec.format(1)}/s`;

    // Show/Hide Currency Badges Based on Progression
    const hasResearch = !!engine.upgrades['research_lab'];
    researchPill.style.display = hasResearch ? 'inline-flex' : 'none';
    if (hasResearch) {
      researchValEl.textContent = engine.currencies.research.format(1);
      researchRateEl.textContent = `+${engine.rates.researchPerSec.format(1)}/s`;
    }

    const hasPrestige = engine.currencies.totalPrestige.gt(0) || !!engine.upgrades['prestige_conduit'];
    prestigePill.style.display = hasPrestige ? 'inline-flex' : 'none';
    if (hasPrestige) {
      prestigeValEl.textContent = engine.currencies.prestige.format(1);
    }

    const hasTranscend = engine.currencies.totalTranscend.gt(0) || !!engine.upgrades['transcend_gate'];
    transcendPill.style.display = hasTranscend ? 'inline-flex' : 'none';
    if (hasTranscend) {
      transcendValEl.textContent = engine.currencies.transcend.format(0);
    }
  }

  // -------------------------------------------------------------
  // 2. Mining Quarry View
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
    if (!miningGridEl) return;
    miningGridEl.innerHTML = '';

    // Pickaxe display
    const pickNames = ['Crude Stone Pick', 'Reinforced Copper Pick', 'Tempered Iron Drill', 'Plasma Ruby Laser', 'Singularity Smasher'];
    const pickPowers = [1, 3, 8, 25, 100];
    const curPick = engine.mining.pickaxeLevel;

    if (pickaxeTitleEl) pickaxeTitleEl.textContent = pickNames[curPick - 1] || 'Quantum Pick';
    if (pickaxePowerEl) pickaxePowerEl.textContent = `Power: ${pickPowers[curPick - 1] || 1}`;

    // Ore counts
    if (oreStoneEl) oreStoneEl.textContent = engine.mining.ores.stone;
    if (oreCopperEl) oreCopperEl.textContent = engine.mining.ores.copper;
    if (oreIronEl) oreIronEl.textContent = engine.mining.ores.iron;
    if (oreRubyEl) oreRubyEl.textContent = engine.mining.ores.ruby;
    if (oreCelestialEl) oreCelestialEl.textContent = engine.mining.ores.celestial;

    // Render 36 blocks
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
        const res = engine.mineBlock(idx);
        renderMiningView();
      });

      miningGridEl.appendChild(blockEl);
    });

    // Upgrade Pickaxe Button
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
      if (engine.upgradePickaxe()) {
        sound.playBuy();
        renderMiningView();
      }
    });
  }

  // Alloy Forge
  function renderAlloyForge() {
    const alloysContainer = document.getElementById('alloysContainer');
    if (!alloysContainer) return;
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
      const count = engine.mining.alloys[alloy.id] || 0;

      row.innerHTML = `
        <div class="alloy-info">
          <div class="alloy-name">${alloy.name} <span class="alloy-count">(Level ${count})</span></div>
          <div class="alloy-desc">${alloy.desc} • Cost: ${alloy.cost}</div>
        </div>
        <button class="alloy-craft-btn" data-alloy="${alloy.id}">Forge Alloy</button>
      `;

      row.querySelector('.alloy-craft-btn').addEventListener('click', () => {
        if (engine.craftAlloy(alloy.id)) {
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
  // 3. Astral Cards & Deck Builder View
  // -------------------------------------------------------------
  function renderCardsView() {
    // 3 Deck Slots
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

    // Card Collection Inventory
    const cardsInventoryEl = document.getElementById('cardsInventory');
    if (cardsInventoryEl) {
      cardsInventoryEl.innerHTML = '';
      if (!engine.cards.inventory.length) {
        cardsInventoryEl.innerHTML = '<div class="empty-hint">No cards owned yet. Open card packs above!</div>';
      }

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

  // Card Pack Buttons
  document.querySelectorAll('.card-pack-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const packType = btn.dataset.pack;
      const pulled = engine.openCardPack(packType);
      if (pulled) {
        sound.playCard();
        alert(`🃏 You pulled: ${pulled.name} (${pulled.rarity})!\n${pulled.desc}`);
        renderCardsView();
      } else {
        alert('Insufficient currency to buy this card pack!');
      }
    });
  });

  // -------------------------------------------------------------
  // 4. Astronomy & Black Hole View
  // -------------------------------------------------------------
  const blackHoleMassEl = document.getElementById('blackHoleMass');
  const feedBlackHoleBtn = document.getElementById('feedBlackHoleBtn');
  const bhMultiplierEl = document.getElementById('bhMultiplier');

  function renderAstronomyView() {
    if (blackHoleMassEl) {
      blackHoleMassEl.textContent = `${engine.astronomy.blackHoleMass.toFixed(1)} M☉`;
    }
    if (bhMultiplierEl) {
      const bhMult = Math.pow(engine.astronomy.blackHoleMass, 0.4);
      bhMultiplierEl.textContent = `${bhMult.toFixed(2)}x Gravitational Lensing`;
    }

    // Stars catalog
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
        const isBought = engine.astronomy.stars[star.id];
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
          if (engine.buyStar(star.id)) {
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
      if (engine.feedBlackHole(cost)) {
        sound.playPrestige();
        renderAstronomyView();
      } else {
        alert('Requires 100,000 Matter to feed the Event Horizon!');
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Quantum Minesweeper View
  // -------------------------------------------------------------
  const puzzleGridEl = document.getElementById('puzzleGrid');
  const resetPuzzleBtn = document.getElementById('resetPuzzleBtn');
  const relicsCountEl = document.getElementById('relicsCount');

  function renderPuzzleView() {
    if (!puzzleGridEl) return;
    puzzleGridEl.innerHTML = '';

    if (relicsCountEl) {
      relicsCountEl.textContent = engine.minesweeper.relicsCleared;
    }

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

      // Left click to reveal
      cEl.addEventListener('click', () => {
        const res = engine.revealCell(idx);
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

      // Right click to flag
      cEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        engine.toggleFlag(idx);
        sound.playClick();
        renderPuzzleView();
      });

      puzzleGridEl.appendChild(cEl);
    });
  }

  if (resetPuzzleBtn) {
    resetPuzzleBtn.addEventListener('click', () => {
      engine.initMinesweeper();
      renderPuzzleView();
    });
  }

  // -------------------------------------------------------------
  // 6. Void Challenges View
  // -------------------------------------------------------------
  function renderChallengesView() {
    const chList = document.getElementById('challengesList');
    if (!chList) return;
    chList.innerHTML = '';

    const challengesDef = [
      { id: 'zero_auto', name: 'Zero-Automation Trial', goal: 'Reach 50,000 Matter with NO automatic harvesters.', reward: 'Permanent 1000x Click Power (Unlocks Zero-Point Mastery)' },
      { id: 'deceleration', name: 'Entropy Deceleration', goal: 'Reach 500,000 Matter with 65% reduced global speed.', reward: '+200% Base Game Velocity' },
      { id: 'collapse', name: 'Singularity Collapse', goal: 'Reach 1,000,000 Matter with 3x upgrade costs.', reward: '-40% Upgrade Base Costs' }
    ];

    challengesDef.forEach(ch => {
      const isCompleted = engine.challenges.completed[ch.id];
      const isActive = engine.challenges.active === ch.id;

      const card = document.createElement('div');
      card.className = 'challenge-card' + (isActive ? ' active-trial' : '') + (isCompleted ? ' completed-trial' : '');

      card.innerHTML = `
        <div class="ch-header">
          <span class="ch-name">${ch.name}</span>
          <span class="ch-status">${isCompleted ? 'COMPLETED ✓' : (isActive ? 'IN PROGRESS' : 'AVAILABLE')}</span>
        </div>
        <div class="ch-goal">${ch.goal}</div>
        <div class="ch-reward">Reward: ${ch.reward}</div>
        <button class="ch-toggle-btn">${isActive ? 'Abandon Challenge' : (isCompleted ? 'Replay Challenge' : 'Start Trial')}</button>
      `;

      card.querySelector('.ch-toggle-btn').addEventListener('click', () => {
        if (isActive) {
          engine.challenges.active = null;
        } else {
          engine.challenges.active = ch.id;
          engine.triggerPrestige(); // Resets progress into challenge
        }
        renderChallengesView();
        switchTab('tree');
      });

      chList.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // 7. Prestige & Transcension Modals
  // -------------------------------------------------------------
  const prestigeModal = document.getElementById('prestigeModal');
  const prestigeGainPreview = document.getElementById('prestigeGainPreview');
  const confirmPrestigeBtn = document.getElementById('confirmPrestigeBtn');
  const closePrestigeBtn = document.getElementById('closePrestigeBtn');

  window.openPrestigeModal = function() {
    const gain = engine.calculatePrestigeGain();
    if (prestigeGainPreview) prestigeGainPreview.textContent = `+${gain.format(0)} ₹`;
    if (prestigeModal) prestigeModal.classList.add('modal-open');
  };

  if (closePrestigeBtn) {
    closePrestigeBtn.addEventListener('click', () => {
      prestigeModal.classList.remove('modal-open');
    });
  }

  if (confirmPrestigeBtn) {
    confirmPrestigeBtn.addEventListener('click', () => {
      const gained = engine.triggerPrestige();
      if (gained && gained.gt(0)) {
        sound.playPrestige();
        prestigeModal.classList.remove('modal-open');
        switchTab('tree');
        canvasRenderer.render();
      }
    });
  }

  // Transcension Modal
  const transcendModal = document.getElementById('transcendModal');
  const transcendGainPreview = document.getElementById('transcendGainPreview');
  const confirmTranscendBtn = document.getElementById('confirmTranscendBtn');
  const closeTranscendBtn = document.getElementById('closeTranscendBtn');

  window.openTranscendModal = function() {
    const gain = engine.calculateTranscendGain();
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
      const gained = engine.triggerTranscension();
      if (gained && gained.gt(0)) {
        sound.playPrestige();
        transcendModal.classList.remove('modal-open');
        switchTab('tree');
        canvasRenderer.render();
      }
    });
  }

  // -------------------------------------------------------------
  // 8. Offline Progress Welcome Modal
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
  // 9. Sound FX & Drone Toggles
  // -------------------------------------------------------------
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
  // 10. Master Game Loop (60 FPS Delta Time)
  // -------------------------------------------------------------
  let lastFrameTime = performance.now();
  let autoSaveTimer = 0;

  function gameLoop(now) {
    requestAnimationFrame(gameLoop);

    const dt = Math.min(0.2, (now - lastFrameTime) / 1000); // capped at 200ms
    lastFrameTime = now;

    // Tick Game Logic
    engine.tick(dt);

    // Canvas update
    canvasRenderer.update(dt);
    if (activeTab === 'tree') {
      canvasRenderer.render();
    }

    // Update Header Tickers
    updateHeaderTickers();
    updateNavTabVisibilities();

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

  // Hook prestige conduits in canvas click
  window.checkPrestigeTrigger = function() {
    if (engine.currencies.matter.gte(100000)) {
      window.openPrestigeModal();
    }
  };
});
