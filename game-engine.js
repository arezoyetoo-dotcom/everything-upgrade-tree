// Everything Upgrade Tree - Core Game Engine & Subsystem Architecture
class GameEngine {
  constructor() {
    this.saveKey = 'everything_upgrade_tree_save_v1';

    // Currencies
    this.currencies = {
      matter: D(0),
      totalMatter: D(0),
      research: D(0),
      totalResearch: D(0),
      prestige: D(0),
      totalPrestige: D(0),
      transcend: D(0),
      totalTranscend: D(0),
      quantumBits: D(0)
    };

    // Node upgrade levels: { [nodeId]: number }
    this.upgrades = {};

    // Statistics
    this.stats = {
      totalClicks: 0,
      totalPrestiges: 0,
      totalTranscensions: 0,
      startTime: Date.now(),
      lastSavedTime: Date.now(),
      offlineHoursCap: 72
    };

    // Subsystems
    this.mining = {
      pickaxeLevel: 1, // 1: Stone, 2: Copper, 3: Iron, 4: Plasma, 5: Singularity
      autoMining: false,
      grid: [], // 36 blocks (6x6)
      ores: {
        stone: 0,
        copper: 0,
        iron: 0,
        ruby: 0,
        celestial: 0
      },
      alloys: {
        copperWiring: 0,
        ironPlating: 0,
        rubyInfusion: 0,
        celestialAlloy: 0
      }
    };

    this.cards = {
      inventory: [], // [{ id, name, pack, rarity, desc, icon, buffType, value }]
      equipped: [null, null, null], // 3 active slots
      packsOpened: 0
    };

    this.astronomy = {
      stars: {
        alphaCentauri: false,
        siriusB: false,
        betelgeuse: false,
        polaris: false
      },
      blackHoleMass: 1.0, // In Solar Masses (M_sun)
      debrisAbsorbed: 0
    };

    this.minesweeper = {
      width: 8,
      height: 8,
      minesCount: 10,
      board: [], // { isMine, revealed, flagged, count }
      gameOver: false,
      won: false,
      relicsCleared: 0
    };

    this.challenges = {
      active: null, // null or 'zero_auto' | 'deceleration' | 'collapse'
      completed: {
        zero_auto: false,
        deceleration: false,
        collapse: false
      }
    };

    // Buffs & Multipliers cache
    this.rates = {
      matterPerSec: D(0),
      researchPerSec: D(0),
      clickPower: D(1),
      critChance: 0,
      critMult: 10
    };

    this.activeSurgeMultiplier = 1.0;
    this.surgeTimer = 0;

    this.offlineReward = null;
    this.initialized = false;
  }

  init() {
    this.loadGame();
    this.initMiningGrid();
    this.initMinesweeper();
    this.recalculateRates();
    this.initialized = true;

    // Check offline progress
    this.calculateOfflineProgress();
  }

  // -------------------------------------------------------------
  // 1. Production & Math Rates
  // -------------------------------------------------------------
  recalculateRates() {
    // 1. Base Click Power
    let clickBase = D(1);
    const focusLvl = this.upgrades['manual_focus'] || 0;
    if (focusLvl > 0) {
      clickBase = clickBase.mul(NODE_DEFS['manual_focus'].effect(focusLvl));
    }

    // Zero-Point Mastery Challenge reward
    if (this.upgrades['challenge_node_1']) {
      clickBase = clickBase.mul(1000);
    }

    // Card boosts for clicks
    const cardClickBuff = this.getCardBuffTotal('click_power');
    if (cardClickBuff > 0) {
      clickBase = clickBase.mul(1 + cardClickBuff);
    }

    this.rates.clickPower = clickBase;
    this.rates.critChance = (this.upgrades['manual_overdrive'] || 0) * 0.1;

    // 2. Base Automation (Harvesters)
    let autoMatter = D(0);

    // If Challenge: zero_auto active, automation is 0
    if (this.challenges.active !== 'zero_auto') {
      if (this.upgrades['harvester_1']) autoMatter = autoMatter.add(D(this.upgrades['harvester_1']).mul(1));
      if (this.upgrades['harvester_2']) autoMatter = autoMatter.add(D(this.upgrades['harvester_2']).mul(12));
      if (this.upgrades['harvester_3']) autoMatter = autoMatter.add(D(this.upgrades['harvester_3']).mul(110));
      if (this.upgrades['harvester_4']) autoMatter = autoMatter.add(D(this.upgrades['harvester_4']).mul(1250));
      if (this.upgrades['harvester_5']) autoMatter = autoMatter.add(D(this.upgrades['harvester_5']).mul(16000));
      if (this.upgrades['harvester_6']) autoMatter = autoMatter.add(D(this.upgrades['harvester_6']).mul(250000));
    }

    // 3. Multipliers
    let globalMult = D(1);

    // Harmonic Resonance
    if (this.upgrades['multiplier_1']) {
      globalMult = globalMult.mul(NODE_DEFS['multiplier_1'].effect(this.upgrades['multiplier_1']));
    }

    // Fractal Arrays
    if (this.upgrades['multiplier_2']) {
      globalMult = globalMult.mul(NODE_DEFS['multiplier_2'].effect(this.upgrades['multiplier_2']));
    }

    // Entanglement Coils
    if (this.upgrades['multiplier_3']) {
      globalMult = globalMult.mul(NODE_DEFS['multiplier_3'].effect(this.upgrades['multiplier_3'], this));
    }

    // Hyper-Density Weaver
    if (this.upgrades['multiplier_4']) {
      globalMult = globalMult.mul(NODE_DEFS['multiplier_4'].effect(this.upgrades['multiplier_4']));
    }

    // Quantum Epistemology (Research boost)
    if (this.upgrades['research_2']) {
      globalMult = globalMult.mul(NODE_DEFS['research_2'].effect(this.upgrades['research_2'], this));
    }

    // Astral Catalyst (Prestige boost)
    if (this.upgrades['prestige_2']) {
      globalMult = globalMult.mul(NODE_DEFS['prestige_2'].effect(this.upgrades['prestige_2'], this));
    }

    // Cosmic Architecture (Transcend boost)
    if (this.upgrades['transcend_1']) {
      globalMult = globalMult.mul(NODE_DEFS['transcend_1'].effect(this.upgrades['transcend_1']));
    }

    // Mining Alloy: Ruby Infusion
    if (this.mining.alloys.rubyInfusion > 0) {
      globalMult = globalMult.mul(1 + this.mining.alloys.rubyInfusion * 1.0);
    }

    // Card buffs for global production
    const cardProdBuff = this.getCardBuffTotal('production');
    if (cardProdBuff > 0) {
      globalMult = globalMult.mul(1 + cardProdBuff);
    }

    // Astronomy Stars
    if (this.astronomy.stars.alphaCentauri) globalMult = globalMult.mul(6);
    if (this.astronomy.stars.polaris) globalMult = globalMult.mul(11);

    // Black Hole Gravitational Lensing
    if (this.astronomy.blackHoleMass > 1.0) {
      const bhMult = Math.pow(this.astronomy.blackHoleMass, 0.4);
      globalMult = globalMult.mul(bhMult);
    }

    // Minesweeper Relics (each completed grid gives +50% global)
    if (this.minesweeper.relicsCleared > 0) {
      globalMult = globalMult.mul(1 + this.minesweeper.relicsCleared * 0.5);
    }

    // Active surge multiplier (from clicking Singularity Lattice)
    if (this.surgeTimer > 0) {
      globalMult = globalMult.mul(this.activeSurgeMultiplier);
    }

    // Challenge 2: Deceleration penalty
    if (this.challenges.active === 'deceleration') {
      globalMult = globalMult.mul(0.35);
    }

    this.rates.matterPerSec = autoMatter.mul(globalMult);

    // 4. Research Rate
    let researchBase = D(0);
    if (this.upgrades['research_lab']) {
      if (this.upgrades['research_1']) {
        researchBase = researchBase.add(D(this.upgrades['research_1']).mul(0.5));
      }
      if (this.astronomy.stars.siriusB) {
        researchBase = researchBase.mul(4);
      }
    }
    this.rates.researchPerSec = researchBase;
  }

  getCardBuffTotal(buffType) {
    let total = 0;
    this.cards.equipped.forEach(card => {
      if (card && card.buffType === buffType) {
        total += card.value;
      }
    });
    return total;
  }

  // -------------------------------------------------------------
  // 2. Manual Clicking Core
  // -------------------------------------------------------------
  clickSingularity() {
    this.recalculateRates();
    let yieldAmount = this.rates.clickPower;
    let isCrit = false;

    if (Math.random() < this.rates.critChance) {
      isCrit = true;
      yieldAmount = yieldAmount.mul(this.rates.critMult);
    }

    this.currencies.matter = this.currencies.matter.add(yieldAmount);
    this.currencies.totalMatter = this.currencies.totalMatter.add(yieldAmount);
    this.stats.totalClicks++;

    // Singularity Lattice click-auto boost
    if (this.upgrades['multiplier_5']) {
      const boostPerClick = NODE_DEFS['multiplier_5'].effect(this.upgrades['multiplier_5']);
      this.activeSurgeMultiplier = Math.min(10.0, this.activeSurgeMultiplier + boostPerClick);
      this.surgeTimer = 8.0; // 8 seconds duration
    }

    return { amount: yieldAmount, isCrit };
  }

  // -------------------------------------------------------------
  // 3. Node Upgrade Purchases
  // -------------------------------------------------------------
  getNodeCost(nodeId) {
    const def = NODE_DEFS[nodeId];
    if (!def) return D(Infinity);

    const currentLevel = this.upgrades[nodeId] || 0;
    if (def.maxLevel > 0 && currentLevel >= def.maxLevel) {
      return D(Infinity); // Maxed out
    }

    // Base cost formula: Cost = BaseCost * (Multiplier ^ CurrentLevel)
    let cost = def.baseCost.mul(Math.pow(def.costMult, currentLevel));

    // Research 4: Dimensional Discount
    if (this.upgrades['research_4']) {
      const discount = NODE_DEFS['research_4'].effect(this.upgrades['research_4']);
      cost = cost.mul(discount);
    }

    // Mining Alloy: Iron Plating (-15% cost)
    if (this.mining.alloys.ironPlating > 0) {
      cost = cost.mul(Math.max(0.4, 1 - this.mining.alloys.ironPlating * 0.15));
    }

    // Challenge 3: Collapse penalty (3x cost)
    if (this.challenges.active === 'collapse') {
      cost = cost.mul(3.0);
    }

    return cost;
  }

  canAffordNode(nodeId) {
    const def = NODE_DEFS[nodeId];
    if (!def) return false;

    // Check prerequisites
    for (const [reqId, reqLvl] of Object.entries(def.requires)) {
      if ((this.upgrades[reqId] || 0) < reqLvl) {
        return false;
      }
    }

    const cost = this.getNodeCost(nodeId);
    if (!isFinite(cost.toNumber()) || cost.compare(D(Infinity)) >= 0) return false;

    const cur = this.currencies[def.currency];
    return cur && cur.gte(cost);
  }

  isNodeUnlocked(nodeId) {
    const def = NODE_DEFS[nodeId];
    if (!def) return false;
    if (nodeId === 'singularity') return true;

    // Node is visible/unlocked if ALL its prerequisites are met
    for (const [reqId, reqLvl] of Object.entries(def.requires)) {
      if ((this.upgrades[reqId] || 0) < reqLvl) {
        return false;
      }
    }
    return true;
  }

  buyNode(nodeId) {
    if (!this.canAffordNode(nodeId)) return false;

    const def = NODE_DEFS[nodeId];
    const cost = this.getNodeCost(nodeId);

    // Deduct cost
    this.currencies[def.currency] = this.currencies[def.currency].sub(cost);

    // Increase level
    this.upgrades[nodeId] = (this.upgrades[nodeId] || 0) + 1;

    // Handle special trigger nodes
    if (def.isPrestigeTrigger && this.upgrades[nodeId] === 1) {
      // First time unlocking prestige
    }

    this.recalculateRates();
    return true;
  }

  // -------------------------------------------------------------
  // 4. Prestige & Transcension Resets
  // -------------------------------------------------------------
  calculatePrestigeGain() {
    // Prestige formula: ₹ = floor((Matter / 100,000)^0.5 * PrestigeModifiers)
    if (this.currencies.matter.lt(100000)) return D(0);

    const ratio = this.currencies.matter.div(100000).toNumber();
    let gain = D(Math.floor(Math.sqrt(ratio)));

    // Astral Dragon Card boost
    const cardPrestigeBuff = this.getCardBuffTotal('prestige_gain');
    if (cardPrestigeBuff > 0) {
      gain = gain.mul(1 + cardPrestigeBuff);
    }

    // Mining Alloy: Celestial Alloy (+200% Prestige)
    if (this.mining.alloys.celestialAlloy > 0) {
      gain = gain.mul(1 + this.mining.alloys.celestialAlloy * 2.0);
    }

    return Decimal.max(1, gain);
  }

  triggerPrestige() {
    const gain = this.calculatePrestigeGain();
    if (gain.lt(1)) return false;

    this.currencies.prestige = this.currencies.prestige.add(gain);
    this.currencies.totalPrestige = this.currencies.totalPrestige.add(gain);
    this.stats.totalPrestiges++;

    // Reset Matter, Research, and Baseplate 1 upgrades (except manual if Eternal Genesis owned)
    const hasGenesis = !!this.upgrades['prestige_1'];
    const keptFocus = hasGenesis ? (this.upgrades['manual_focus'] || 0) : 0;
    const keptOverdrive = hasGenesis ? (this.upgrades['manual_overdrive'] || 0) : 0;

    // Wipe Baseplate 1 automation and multipliers
    Object.keys(this.upgrades).forEach(id => {
      const def = NODE_DEFS[id];
      if (def && (def.category === 'automation' || def.category === 'resonance' || def.category === 'research')) {
        delete this.upgrades[id];
      }
    });

    if (!hasGenesis) {
      delete this.upgrades['manual_focus'];
      delete this.upgrades['manual_overdrive'];
      this.currencies.matter = D(0);
    } else {
      this.upgrades['manual_focus'] = keptFocus;
      this.upgrades['manual_overdrive'] = keptOverdrive;
      this.currencies.matter = D(1000); // 1,000 bonus start matter
    }

    this.currencies.research = D(0);
    this.recalculateRates();
    this.saveGame();
    return gain;
  }

  calculateTranscendGain() {
    if (this.currencies.matter.lt(1000000000)) return D(0);
    const ratio = this.currencies.matter.div(1000000000).toNumber();
    return Decimal.max(1, D(Math.floor(Math.pow(ratio, 0.35))));
  }

  triggerTranscension() {
    const gain = this.calculateTranscendGain();
    if (gain.lt(1)) return false;

    this.currencies.transcend = this.currencies.transcend.add(gain);
    this.currencies.totalTranscend = this.currencies.totalTranscend.add(gain);
    this.stats.totalTranscensions++;

    // Reset Baseplate 1 & 2
    this.currencies.matter = D(0);
    this.currencies.research = D(0);
    this.currencies.prestige = D(0);

    // Keep prestige permanent perks, wipe transient automation
    Object.keys(this.upgrades).forEach(id => {
      const def = NODE_DEFS[id];
      if (def && (def.category === 'automation' || def.category === 'resonance')) {
        delete this.upgrades[id];
      }
    });

    this.recalculateRates();
    this.saveGame();
    return gain;
  }

  // -------------------------------------------------------------
  // 5. Mining Subsystem
  // -------------------------------------------------------------
  initMiningGrid() {
    if (this.mining.grid.length === 36) return;
    this.mining.grid = [];
    const oreTypes = ['stone', 'stone', 'copper', 'copper', 'iron', 'ruby', 'celestial'];
    const weights = [50, 50, 25, 25, 12, 5, 2];

    for (let i = 0; i < 36; i++) {
      this.mining.grid.push(this.generateMineBlock());
    }
  }

  generateMineBlock() {
    const roll = Math.random() * 100;
    let type = 'stone';
    let hp = 3;
    let color = '#78716c';

    if (roll < 3) {
      type = 'celestial';
      hp = 30;
      color = '#c084fc';
    } else if (roll < 10) {
      type = 'ruby';
      hp = 18;
      color = '#f43f5e';
    } else if (roll < 25) {
      type = 'iron';
      hp = 10;
      color = '#38bdf8';
    } else if (roll < 55) {
      type = 'copper';
      hp = 6;
      color = '#fb923c';
    } else {
      type = 'stone';
      hp = 3;
      color = '#78716c';
    }

    return { type, maxHp: hp, hp: hp, color };
  }

  mineBlock(index) {
    if (!this.mining.grid[index]) return null;
    const block = this.mining.grid[index];

    // Pickaxe power: 1, 3, 8, 25, 100
    const pickPowers = [1, 3, 8, 25, 100];
    const power = pickPowers[this.mining.pickaxeLevel - 1] || 1;

    block.hp -= power;

    if (block.hp <= 0) {
      // Mined! Award ore
      const minedType = block.type;
      this.mining.ores[minedType] = (this.mining.ores[minedType] || 0) + 1;

      // Respawn block
      this.mining.grid[index] = this.generateMineBlock();
      return { broken: true, type: minedType };
    }

    return { broken: false, hp: block.hp };
  }

  upgradePickaxe() {
    const costs = [
      { copper: 15 },
      { iron: 25 },
      { ruby: 20 },
      { celestial: 15 }
    ];
    const nextCost = costs[this.mining.pickaxeLevel - 1];
    if (!nextCost) return false;

    const [ore, needed] = Object.entries(nextCost)[0];
    if ((this.mining.ores[ore] || 0) >= needed) {
      this.mining.ores[ore] -= needed;
      this.mining.pickaxeLevel++;
      return true;
    }
    return false;
  }

  craftAlloy(alloyKey) {
    const recipes = {
      copperWiring: { copper: 30, iron: 5 },
      ironPlating: { iron: 40, stone: 100 },
      rubyInfusion: { ruby: 25, copper: 50 },
      celestialAlloy: { celestial: 10, ruby: 30 }
    };
    const req = recipes[alloyKey];
    if (!req) return false;

    for (const [ore, qty] of Object.entries(req)) {
      if ((this.mining.ores[ore] || 0) < qty) return false;
    }

    for (const [ore, qty] of Object.entries(req)) {
      this.mining.ores[ore] -= qty;
    }

    this.mining.alloys[alloyKey] = (this.mining.alloys[alloyKey] || 0) + 1;
    this.recalculateRates();
    return true;
  }

  // -------------------------------------------------------------
  // 6. Card Packs & Deck System
  // -------------------------------------------------------------
  getAvailableCards() {
    return [
      { id: 'c1', name: 'Coffee Infusion', pack: 'Foodaholic', rarity: 'Common', icon: '☕', buffType: 'click_power', value: 0.6, desc: '+60% Manual Click Power' },
      { id: 'c2', name: 'Pizza Velocity', pack: 'Foodaholic', rarity: 'Rare', icon: '🍕', buffType: 'production', value: 1.2, desc: '+120% Automation Production' },
      { id: 'c3', name: 'Ramen Concentration', pack: 'Foodaholic', rarity: 'Epic', icon: '🍜', buffType: 'production', value: 3.5, desc: '+350% Global Production' },
      { id: 'c4', name: 'Copper Resonator', pack: 'Static', rarity: 'Common', icon: '🪨', buffType: 'production', value: 0.5, desc: '+50% Global Production' },
      { id: 'c5', name: 'Static Discharger', pack: 'Static', rarity: 'Rare', icon: '⚡', buffType: 'click_power', value: 1.5, desc: '+150% Click Power' },
      { id: 'c6', name: 'Tachyon Overclock', pack: 'Static', rarity: 'Epic', icon: '🔮', buffType: 'production', value: 4.0, desc: '+400% All Production' },
      { id: 'c7', name: 'Astral Dragon', pack: 'Cosmic', rarity: 'Legendary', icon: '🐉', buffType: 'prestige_gain', value: 3.0, desc: '+300% Prestige Point Gain' },
      { id: 'c8', name: 'Event Horizon Shard', pack: 'Cosmic', rarity: 'Astral', icon: '🌌', buffType: 'production', value: 10.0, desc: '+1000% Global Multiplier' }
    ];
  }

  openCardPack(packType) {
    const packCosts = {
      'Static': { currency: 'matter', cost: D(25000) },
      'Foodaholic': { currency: 'matter', cost: D(75000) },
      'Cosmic': { currency: 'prestige', cost: D(5) }
    };

    const cfg = packCosts[packType];
    if (!cfg) return null;

    if (this.currencies[cfg.currency].lt(cfg.cost)) return null;
    this.currencies[cfg.currency] = this.currencies[cfg.currency].sub(cfg.cost);

    const cards = this.getAvailableCards().filter(c => c.pack === packType);
    if (!cards.length) return null;

    // Weighted roll
    const pulled = cards[Math.floor(Math.random() * cards.length)];
    this.cards.inventory.push({ ...pulled, uid: Date.now() + Math.random() });
    this.cards.packsOpened++;

    this.saveGame();
    return pulled;
  }

  equipCard(cardUid, slotIndex) {
    if (slotIndex < 0 || slotIndex > 2) return false;
    const card = this.cards.inventory.find(c => c.uid === cardUid);
    if (!card) return false;

    this.cards.equipped[slotIndex] = card;
    this.recalculateRates();
    return true;
  }

  unequipCard(slotIndex) {
    if (slotIndex >= 0 && slotIndex <= 2) {
      this.cards.equipped[slotIndex] = null;
      this.recalculateRates();
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 7. Astronomy & Supermassive Black Hole
  // -------------------------------------------------------------
  buyStar(starKey) {
    const starCosts = {
      alphaCentauri: D(5),
      siriusB: D(15),
      betelgeuse: D(40),
      polaris: D(100)
    };
    const cost = starCosts[starKey];
    if (!cost || this.currencies.transcend.lt(cost)) return false;

    this.currencies.transcend = this.currencies.transcend.sub(cost);
    this.astronomy.stars[starKey] = true;
    this.recalculateRates();
    return true;
  }

  feedBlackHole(matterCost) {
    if (this.currencies.matter.lt(matterCost)) return false;
    this.currencies.matter = this.currencies.matter.sub(matterCost);

    // Expand mass
    this.astronomy.blackHoleMass += 0.5;
    this.astronomy.debrisAbsorbed++;
    this.recalculateRates();
    return true;
  }

  // -------------------------------------------------------------
  // 8. Quantum Logic (Minesweeper)
  // -------------------------------------------------------------
  initMinesweeper() {
    const total = this.minesweeper.width * this.minesweeper.height;
    this.minesweeper.board = [];
    this.minesweeper.gameOver = false;
    this.minesweeper.won = false;

    // Build empty cells
    for (let i = 0; i < total; i++) {
      this.minesweeper.board.push({
        isMine: false,
        revealed: false,
        flagged: false,
        count: 0
      });
    }

    // Place mines randomly
    let placed = 0;
    while (placed < this.minesweeper.minesCount) {
      const idx = Math.floor(Math.random() * total);
      if (!this.minesweeper.board[idx].isMine) {
        this.minesweeper.board[idx].isMine = true;
        placed++;
      }
    }

    // Compute adjacency counts
    for (let y = 0; y < this.minesweeper.height; y++) {
      for (let x = 0; x < this.minesweeper.width; x++) {
        const idx = y * this.minesweeper.width + x;
        if (this.minesweeper.board[idx].isMine) continue;

        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.minesweeper.width && ny >= 0 && ny < this.minesweeper.height) {
              const nidx = ny * this.minesweeper.width + nx;
              if (this.minesweeper.board[nidx].isMine) count++;
            }
          }
        }
        this.minesweeper.board[idx].count = count;
      }
    }
  }

  revealCell(index) {
    if (this.minesweeper.gameOver || this.minesweeper.won) return null;
    const cell = this.minesweeper.board[index];
    if (!cell || cell.revealed || cell.flagged) return null;

    cell.revealed = true;

    if (cell.isMine) {
      this.minesweeper.gameOver = true;
      return { status: 'exploded' };
    }

    // Award quantum reward
    const reward = D(this.rates.matterPerSec).mul(3).add(100);
    this.currencies.matter = this.currencies.matter.add(reward);

    // If blank (count 0), cascade flood-fill
    if (cell.count === 0) {
      const x = index % this.minesweeper.width;
      const y = Math.floor(index / this.minesweeper.width);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.minesweeper.width && ny >= 0 && ny < this.minesweeper.height) {
            this.revealCell(ny * this.minesweeper.width + nx);
          }
        }
      }
    }

    // Check victory condition
    const nonMines = this.minesweeper.board.filter(c => !c.isMine);
    if (nonMines.every(c => c.revealed)) {
      this.minesweeper.won = true;
      this.minesweeper.relicsCleared++;
      this.recalculateRates();
      return { status: 'victory', relics: this.minesweeper.relicsCleared };
    }

    return { status: 'safe', reward };
  }

  toggleFlag(index) {
    if (this.minesweeper.gameOver || this.minesweeper.won) return;
    const cell = this.minesweeper.board[index];
    if (cell && !cell.revealed) {
      cell.flagged = !cell.flagged;
    }
  }

  // -------------------------------------------------------------
  // 9. Delta-Time Loop & Offline Progress
  // -------------------------------------------------------------
  tick(dt) {
    // 1. Passive Surge decay
    if (this.surgeTimer > 0) {
      this.surgeTimer -= dt;
      if (this.surgeTimer <= 0) {
        this.activeSurgeMultiplier = 1.0;
        this.recalculateRates();
      }
    }

    // 2. Add automated Matter production
    if (this.rates.matterPerSec.gt(0)) {
      const deltaProd = this.rates.matterPerSec.mul(dt);
      this.currencies.matter = this.currencies.matter.add(deltaProd);
      this.currencies.totalMatter = this.currencies.totalMatter.add(deltaProd);
    }

    // 3. Add Research production
    if (this.rates.researchPerSec.gt(0)) {
      const deltaResearch = this.rates.researchPerSec.mul(dt);
      this.currencies.research = this.currencies.research.add(deltaResearch);
      this.currencies.totalResearch = this.currencies.totalResearch.add(deltaResearch);
    }

    // 4. Auto-Overseer (Prestige perk 3: buys cheapest available automation node)
    if (this.upgrades['prestige_3']) {
      this.runAutoOverseer();
    }

    // 5. Passive Prestige Feed (Prestige perk 4)
    if (this.upgrades['prestige_4']) {
      const pct = NODE_DEFS['prestige_4'].effect(this.upgrades['prestige_4']);
      const gain = this.calculatePrestigeGain().mul(pct * dt);
      if (gain.gt(0)) {
        this.currencies.prestige = this.currencies.prestige.add(gain);
      }
    }
  }

  runAutoOverseer() {
    const autoNodes = ['harvester_1', 'harvester_2', 'harvester_3', 'harvester_4', 'harvester_5', 'harvester_6'];
    let cheapestNode = null;
    let minCost = D(Infinity);

    for (const nId of autoNodes) {
      if (this.isNodeUnlocked(nId) && this.canAffordNode(nId)) {
        const cost = this.getNodeCost(nId);
        if (cost.lt(minCost)) {
          minCost = cost;
          cheapestNode = nId;
        }
      }
    }

    if (cheapestNode) {
      this.buyNode(cheapestNode);
    }
  }

  calculateOfflineProgress() {
    const now = Date.now();
    const elapsedSeconds = Math.max(0, (now - this.stats.lastSavedTime) / 1000);

    // Only grant offline report if gone for > 5 seconds
    if (elapsedSeconds > 5) {
      const capSeconds = this.stats.offlineHoursCap * 3600;
      const effectiveSec = Math.min(elapsedSeconds, capSeconds);

      // Offline efficiency (base 50%, upgraded via Superstring Weaving)
      let efficiency = 0.5;
      if (this.upgrades['research_3']) {
        efficiency = NODE_DEFS['research_3'].effect(this.upgrades['research_3']);
      }

      const offlineEarned = this.rates.matterPerSec.mul(effectiveSec * efficiency);
      this.currencies.matter = this.currencies.matter.add(offlineEarned);
      this.currencies.totalMatter = this.currencies.totalMatter.add(offlineEarned);

      this.offlineReward = {
        secondsAway: elapsedSeconds,
        efficiency: Math.round(efficiency * 100),
        matterEarned: offlineEarned
      };
    }
    this.stats.lastSavedTime = now;
  }

  // -------------------------------------------------------------
  // 10. Save / Load / Export
  // -------------------------------------------------------------
  saveGame() {
    try {
      if (typeof localStorage === 'undefined') return false;
      this.stats.lastSavedTime = Date.now();
      const saveState = {
        currencies: {
          matter: this.currencies.matter.toString(),
          totalMatter: this.currencies.totalMatter.toString(),
          research: this.currencies.research.toString(),
          totalResearch: this.currencies.totalResearch.toString(),
          prestige: this.currencies.prestige.toString(),
          totalPrestige: this.currencies.totalPrestige.toString(),
          transcend: this.currencies.transcend.toString(),
          totalTranscend: this.currencies.totalTranscend.toString(),
          quantumBits: this.currencies.quantumBits.toString()
        },
        upgrades: this.upgrades,
        stats: this.stats,
        mining: {
          pickaxeLevel: this.mining.pickaxeLevel,
          ores: this.mining.ores,
          alloys: this.mining.alloys
        },
        cards: {
          inventory: this.cards.inventory,
          equipped: this.cards.equipped,
          packsOpened: this.cards.packsOpened
        },
        astronomy: this.astronomy,
        relicsCleared: this.minesweeper.relicsCleared,
        challenges: this.challenges
      };

      localStorage.setItem(this.saveKey, JSON.stringify(saveState));
      return true;
    } catch (e) {
      console.warn("Auto-save failed:", e);
      return false;
    }
  }

  loadGame() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const data = localStorage.getItem(this.saveKey);
      if (!data) return false;

      const parsed = JSON.parse(data);

      if (parsed.currencies) {
        this.currencies.matter = D(parsed.currencies.matter || 0);
        this.currencies.totalMatter = D(parsed.currencies.totalMatter || 0);
        this.currencies.research = D(parsed.currencies.research || 0);
        this.currencies.totalResearch = D(parsed.currencies.totalResearch || 0);
        this.currencies.prestige = D(parsed.currencies.prestige || 0);
        this.currencies.totalPrestige = D(parsed.currencies.totalPrestige || 0);
        this.currencies.transcend = D(parsed.currencies.transcend || 0);
        this.currencies.totalTranscend = D(parsed.currencies.totalTranscend || 0);
        this.currencies.quantumBits = D(parsed.currencies.quantumBits || 0);
      }

      if (parsed.upgrades) this.upgrades = parsed.upgrades;
      if (parsed.stats) this.stats = { ...this.stats, ...parsed.stats };
      if (parsed.mining) {
        this.mining.pickaxeLevel = parsed.mining.pickaxeLevel || 1;
        this.mining.ores = { ...this.mining.ores, ...(parsed.mining.ores || {}) };
        this.mining.alloys = { ...this.mining.alloys, ...(parsed.mining.alloys || {}) };
      }
      if (parsed.cards) {
        this.cards.inventory = parsed.cards.inventory || [];
        this.cards.equipped = parsed.cards.equipped || [null, null, null];
        this.cards.packsOpened = parsed.cards.packsOpened || 0;
      }
      if (parsed.astronomy) this.astronomy = { ...this.astronomy, ...parsed.astronomy };
      if (parsed.relicsCleared) this.minesweeper.relicsCleared = parsed.relicsCleared;
      if (parsed.challenges) this.challenges = { ...this.challenges, ...parsed.challenges };

      return true;
    } catch (e) {
      console.warn("Save load error:", e);
      return false;
    }
  }

  exportSaveString() {
    this.saveGame();
    const data = localStorage.getItem(this.saveKey);
    return btoa(data || '{}');
  }

  importSaveString(b64) {
    try {
      const json = atob(b64);
      JSON.parse(json); // Test parse
      localStorage.setItem(this.saveKey, json);
      location.reload();
      return true;
    } catch (e) {
      alert("Invalid save string!");
      return false;
    }
  }

  hardReset() {
    localStorage.removeItem(this.saveKey);
    location.reload();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameEngine };
} else {
  window.GameEngine = GameEngine;
  window.gameEngine = new GameEngine();
}
