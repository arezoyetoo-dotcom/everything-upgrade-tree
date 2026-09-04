// Everything Upgrade Tree - Core Game Engine (Canon EUT Edition)

var Decimal = (typeof window !== 'undefined' && window.Decimal) ? window.Decimal : (typeof global !== 'undefined' && global.Decimal) ? global.Decimal : (typeof require !== 'undefined' ? require('./decimal.js').Decimal : null);
var D = (typeof window !== 'undefined' && window.D) ? window.D : (typeof global !== 'undefined' && global.D) ? global.D : (typeof require !== 'undefined' ? require('./decimal.js').D : function(v, e) { return new Decimal(v, e); });

function getNodeDefs() {
  if (typeof NODE_DEFS !== 'undefined') return NODE_DEFS;
  if (typeof window !== 'undefined' && window.NODE_DEFS) return window.NODE_DEFS;
  if (typeof global !== 'undefined' && global.NODE_DEFS) return global.NODE_DEFS;
  if (typeof require !== 'undefined') {
    try { return require('./tree-data.js').NODE_DEFS; } catch(e){}
  }
  return {};
}

class GameEngine {
  constructor() {
    this.saveKey = 'everything_upgrade_tree_canon_v2';

    // Currencies
    this.currencies = {
      matter: D(0),       // Points (₽)
      totalMatter: D(0),
      research: D(0),     // Research Points (λ)
      totalResearch: D(0),
      prestige: D(0),     // Prestige Points (₹)
      totalPrestige: D(0),
      transcend: D(0),    // Transcend Points (τ)
      totalTranscend: D(0),
      bits: D(0),         // Bits (฿)
      pointX: D(0),       // Point-X (₽X)
      qubits: D(0),       // Qubits (Ψ)
      starMass: D(0),     // Solar Mass (☉)
      euros: D(0)         // Euros (€)
    };

    // Node upgrade levels: { [nodeId]: number }
    this.upgrades = {};

    // Player Leveling & Mobility
    this.player = {
      level: 1,
      xp: 0,
      perkPoints: 0,
      perks: {
        pointMagnet: 0,
        researchSpeed: 0,
        speedDemon: 0,
        kineticLeap: 0
      },
      walkspeed: 16,
      jumpPower: 50
    };

    // Statistics & Timers
    this.stats = {
      callsign: 'ASTRAL_EXPLORER_01',
      totalClicks: 0,
      totalPrestiges: 0,
      totalTranscensions: 0,
      startTime: Date.now(),
      lastSavedTime: Date.now(),
      bonusLastClaimTime: 0,
      hardcoreMode: false,
      gameCompleted: false,
      peakMatter: D(0),
      node27Time: null, // Timestamp for #27 Delayed Gratification
      totalDonations: 0,
      offlineHoursCap: 72
    };

    // Boombox Music Player State (#9)
    this.boombox = {
      isPlaying: false,
      currentTrack: 0,
      tracks: [
        { name: 'Cosmic Drift', bpm: 84 },
        { name: 'Astral Coffee', bpm: 78 },
        { name: 'Deep Space Lo-Fi', bpm: 90 },
        { name: 'Singularity Chill', bpm: 72 }
      ]
    };

    // Calculated Production Rates
    this.rates = {
      matterPerSec: D(0),
      researchPerSec: D(0),
      bitsPerSec: D(0),
      pointXPerSec: D(0),
      eurosPerSec: D(0),
      clickPower: D(1)
    };

    this.offlineReward = null;
    this.initialized = false;
  }

  init() {
    this.loadGame();
    if (!this.upgrades['node_1']) {
      this.upgrades['node_1'] = 1;
    }
    this.recalculateStatsAndRates();
    this.calculateOfflineProgress();
    this.initialized = true;
  }

  getNodeDef(nodeId) {
    const defs = getNodeDefs();
    return defs[nodeId];
  }

  // -------------------------------------------------------------
  // 1. Dynamic Level Caps & Node Costs
  // -------------------------------------------------------------
  getNodeMaxLevel(nodeId) {
    if (nodeId === 'node_4') {
      let cap = 5;
      if (this.upgrades['node_7']) cap += 7;
      if (this.upgrades['node_15']) cap += 30;
      if (this.upgrades['node_30']) cap += 250;
      return cap;
    }
    const def = this.getNodeDef(nodeId);
    return def ? def.maxLevel : 1;
  }

  getNodeCost(nodeId) {
    const def = this.getNodeDef(nodeId);
    if (!def) return D(0);
    const lvl = this.upgrades[nodeId] || 0;

    let cost = D(0);
    if (typeof def.costFormula === 'function') {
      cost = def.costFormula(lvl, this);
    } else {
      cost = def.baseCost;
    }

    if (this.stats.hardcoreMode) {
      cost = cost.mul(5);
    }
    return cost;
  }

  isNodeUnlocked(nodeId) {
    const def = this.getNodeDef(nodeId);
    if (!def) return false;
    const req = def.requires || def.prerequisites;
    if (!req) return true;
    if (Array.isArray(req)) {
      if (req.length === 0) return true;
      return req.every(preId => (this.upgrades[preId] || 0) > 0);
    }
    const keys = Object.keys(req);
    if (keys.length === 0) return true;
    return keys.every(preId => (this.upgrades[preId] || 0) >= (req[preId] || 1));
  }

  canAffordNode(nodeId) {
    const def = this.getNodeDef(nodeId);
    if (!def) return false;
    const curLevel = this.upgrades[nodeId] || 0;
    const maxLvl = this.getNodeMaxLevel(nodeId);
    if (maxLvl > 0 && curLevel >= maxLvl) return false;

    const cost = this.getNodeCost(nodeId);
    if (cost.isZero()) return true;

    const currencyKey = def.currency || 'matter';
    const playerCurr = this.currencies[currencyKey] || D(0);
    return playerCurr.gte(cost);
  }

  buyNode(nodeId) {
    if (!this.isNodeUnlocked(nodeId)) return false;
    if (!this.canAffordNode(nodeId)) return false;

    const def = this.getNodeDef(nodeId);
    const cost = this.getNodeCost(nodeId);
    const currencyKey = def.currency || 'matter';

    if (!cost.isZero() && this.currencies[currencyKey]) {
      this.currencies[currencyKey] = this.currencies[currencyKey].sub(cost);
    }

    this.upgrades[nodeId] = (this.upgrades[nodeId] || 0) + 1;

    // Trigger timestamp for #27 Delayed Gratification
    if (nodeId === 'node_27' && !this.stats.node27Time) {
      this.stats.node27Time = Date.now();
    }

    // Award XP when unlocking any upgrade
    this.addXp(15 * (this.upgrades[nodeId] || 1));

    if (nodeId === 'node_40') {
      this.stats.gameCompleted = true;
    }

    this.recalculateStatsAndRates();
    this.saveGame();
    return true;
  }

  // -------------------------------------------------------------
  // 2. Production & Multipliers Math Engine
  // -------------------------------------------------------------
  recalculateStatsAndRates() {
    const defs = getNodeDefs();

    // 1. Mobility & Jump Power
    let speed = 16;
    if (this.upgrades['node_17']) speed += 4;
    if (this.upgrades['node_26']) speed += 3;
    if (this.upgrades['node_28']) speed += 2;
    if (this.upgrades['node_33']) speed += 2;
    if (this.upgrades['node_36']) speed += 3;
    if (this.upgrades['node_37']) speed += 1;
    if (this.upgrades['node_38']) speed += 2;
    if (this.upgrades['node_39']) speed += 2;
    speed += (this.player.perks.speedDemon || 0) * 2;
    this.player.walkspeed = speed;

    let jump = 50;
    if (this.upgrades['node_28']) jump += 10;
    if (this.upgrades['node_33']) jump += 5;
    jump += (this.player.perks.kineticLeap || 0) * 5;
    this.player.jumpPower = jump;

    // 2. Points (₽) Production Rate
    if (this.upgrades['node_1']) {
      let pts = D(1);

      // #2: x2 ₽ gain
      if (this.upgrades['node_2']) pts = pts.mul(2);

      // #3: x3 ₽ gain
      if (this.upgrades['node_3']) pts = pts.mul(3);

      // #4: +0.5x per level
      const lvl4 = this.upgrades['node_4'] || 0;
      if (lvl4 > 0) {
        pts = pts.mul(D(1).add(D(lvl4).mul(0.5)));
      }

      // #5: Self-boost based on exponent (0.30, or 0.35 if #21 owned)
      if (this.upgrades['node_5'] && defs['node_5']) {
        pts = pts.mul(defs['node_5'].effect(1, this));
      }

      // #6: x1.2 compounding per unlocked point upgrade
      if (this.upgrades['node_6'] && defs['node_6']) {
        pts = pts.mul(defs['node_6'].effect(1, this));
      }

      // #10: x4 ₽ gain
      if (this.upgrades['node_10']) pts = pts.mul(4);

      // #11: Research boost
      if (this.upgrades['node_11'] && defs['node_11']) {
        pts = pts.mul(defs['node_11'].effect(1, this));
      }

      // #12: x1.3 compounding per level
      const lvl12 = this.upgrades['node_12'] || 0;
      if (lvl12 > 0) {
        pts = pts.mul(D(1.3).pow(lvl12));
      }

      // #14: x5 ₽ gain
      if (this.upgrades['node_14']) pts = pts.mul(5);

      // #24: Holy Grail (Prestige boost)
      if (this.upgrades['node_24'] && defs['node_24']) {
        pts = pts.mul(defs['node_24'].effect(1, this));
      }

      // #27: Delayed Gratification
      if (this.upgrades['node_27'] && defs['node_27']) {
        pts = pts.mul(defs['node_27'].effect(1, this));
      }

      // #29: Megabytes (Bits boost)
      if (this.upgrades['node_29'] && defs['node_29']) {
        pts = pts.mul(defs['node_29'].effect(1, this));
      }

      // Player leveling perk: Point Magnet (+10% per rank)
      if (this.player.perks.pointMagnet > 0) {
        pts = pts.mul(1 + this.player.perks.pointMagnet * 0.1);
      }

      // #25: After Halcyon (^1.05 ₽ gain after all multipliers)
      if (this.upgrades['node_25']) {
        pts = pts.pow(1.05);
      }

      this.rates.matterPerSec = pts;
    } else {
      this.rates.matterPerSec = D(0);
    }

    // 3. Research Points (λ) Rate
    if (this.upgrades['node_8']) {
      let res = D(1);
      if (this.upgrades['node_19']) res = res.mul(3);

      if (this.player.perks.researchSpeed > 0) {
        res = res.mul(1 + this.player.perks.researchSpeed * 0.1);
      }

      if (this.upgrades['node_31']) {
        res = res.pow(1.05);
      }
      this.rates.researchPerSec = res;
    } else {
      this.rates.researchPerSec = D(0);
    }

    // 4. Bits (฿) Rate (from #28 / #29)
    if (this.upgrades['node_28'] || this.upgrades['node_29']) {
      this.rates.bitsPerSec = D(100);
    } else {
      this.rates.bitsPerSec = D(0);
    }

    // 5. Point-X (₽X) Rate
    if (this.upgrades['node_33']) {
      let px = D(5);
      if (this.upgrades['node_34']) {
        px = px.pow(1.1);
      }
      this.rates.pointXPerSec = px;
    } else {
      this.rates.pointXPerSec = D(0);
    }

    // 6. Euros (€) from Fortune 500 (#37)
    if (this.upgrades['node_37']) {
      this.rates.eurosPerSec = D(2);
    }

    // 7. Click Power
    const baseClick = Decimal.max(1, this.rates.matterPerSec.mul(0.1));
    this.rates.clickPower = baseClick;
  }

  // -------------------------------------------------------------
  // 3. Manual Click Action & XP Progression
  // -------------------------------------------------------------
  clickSingularity() {
    this.recalculateStatsAndRates();
    const yieldAmount = this.rates.clickPower;

    this.currencies.matter = this.currencies.matter.add(yieldAmount);
    this.currencies.totalMatter = this.currencies.totalMatter.add(yieldAmount);
    this.stats.totalClicks++;

    let xpGain = 1;
    if (this.upgrades['node_22']) {
      const totalLevels = Object.values(this.upgrades).reduce((a, b) => a + b, 0);
      xpGain += totalLevels * 2;
    }

    this.addXp(xpGain);
    return { amount: yieldAmount, isCrit: false, xp: xpGain };
  }

  addXp(amount) {
    if (!this.upgrades['node_16']) return;

    this.player.xp += amount;
    while (this.player.xp >= this.getXpRequiredForNextLevel()) {
      this.player.xp -= this.getXpRequiredForNextLevel();
      this.player.level++;
      this.player.perkPoints++;
      if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playMaxed();
    }
  }

  getXpRequiredForNextLevel() {
    let req = 100 * Math.pow(this.player.level, 1.4);
    if (this.upgrades['node_23']) {
      req /= 1.5;
    }
    if (this.upgrades['node_32']) {
      req *= 0.7;
    }
    return Math.max(10, Math.floor(req));
  }

  upgradePerk(perkKey) {
    if (this.player.perkPoints > 0 && this.player.perks[perkKey] !== undefined) {
      this.player.perkPoints--;
      this.player.perks[perkKey]++;
      this.recalculateStatsAndRates();
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 4. Donation Baseplate (#0d Unethical Tipping)
  // -------------------------------------------------------------
  donate(amount) {
    const amt = D(amount);
    if (amt.gt(0) && this.currencies.matter.gte(amt)) {
      this.currencies.matter = this.currencies.matter.sub(amt);
      this.stats.totalDonations = D(this.stats.totalDonations || 0).add(amt);
      this.addXp(Math.min(5000, Math.max(50, Math.floor(amt.log10() * 30))));
      return true;
    }
    return false;
  }

  // -------------------------------------------------------------
  // 5. Bonus Baseplate (#18 A lot more to come)
  // -------------------------------------------------------------
  getBonusCooldownRemaining() {
    const now = Date.now();
    const elapsed = (now - (this.stats.bonusLastClaimTime || 0)) / 1000;
    return Math.max(0, 60 - elapsed);
  }

  claimBonusDrop() {
    if (!this.upgrades['node_18']) return null;
    if (this.getBonusCooldownRemaining() > 0) return null;

    this.stats.bonusLastClaimTime = Date.now();
    const ptsReward = Decimal.max(100, this.rates.matterPerSec.mul(30));
    const resReward = this.upgrades['node_8'] ? Decimal.max(10, this.rates.researchPerSec.mul(20)) : D(0);

    this.currencies.matter = this.currencies.matter.add(ptsReward);
    this.currencies.totalMatter = this.currencies.totalMatter.add(ptsReward);

    if (resReward.gt(0)) {
      this.currencies.research = this.currencies.research.add(resReward);
      this.currencies.totalResearch = this.currencies.totalResearch.add(resReward);
    }

    this.addXp(120);
    return { pts: ptsReward, res: resReward };
  }

  // -------------------------------------------------------------
  // 6. Leaderboard / Hall of Fame (#20)
  // -------------------------------------------------------------
  setCallsign(name) {
    if (name && typeof name === 'string') {
      this.stats.callsign = name.trim().slice(0, 24).toUpperCase();
      this.saveGame();
    }
  }

  toggleHardcore() {
    this.stats.hardcoreMode = !this.stats.hardcoreMode;
    this.saveGame();
    return this.stats.hardcoreMode;
  }

  // -------------------------------------------------------------
  // 7. Delta-Time Loop & Offline Progress
  // -------------------------------------------------------------
  tick(dt) {
    if (this.rates.matterPerSec.gt(0)) {
      const dMatter = this.rates.matterPerSec.mul(dt);
      this.currencies.matter = this.currencies.matter.add(dMatter);
      this.currencies.totalMatter = this.currencies.totalMatter.add(dMatter);
    }

    if (this.rates.researchPerSec.gt(0)) {
      const dRes = this.rates.researchPerSec.mul(dt);
      this.currencies.research = this.currencies.research.add(dRes);
      this.currencies.totalResearch = this.currencies.totalResearch.add(dRes);
    }

    if (this.rates.bitsPerSec.gt(0)) {
      this.currencies.bits = this.currencies.bits.add(this.rates.bitsPerSec.mul(dt));
    }

    if (this.rates.pointXPerSec.gt(0)) {
      this.currencies.pointX = this.currencies.pointX.add(this.rates.pointXPerSec.mul(dt));
    }

    if (this.rates.eurosPerSec.gt(0)) {
      this.currencies.euros = this.currencies.euros.add(this.rates.eurosPerSec.mul(dt));
    }

    if (!this.stats.peakMatter || this.currencies.matter.gt(this.stats.peakMatter)) {
      this.stats.peakMatter = this.currencies.matter;
    }
  }

  calculateOfflineProgress() {
    const now = Date.now();
    const elapsed = Math.max(0, (now - this.stats.lastSavedTime) / 1000);

    if (elapsed > 5) {
      const capSec = this.stats.offlineHoursCap * 3600;
      const effectiveSec = Math.min(elapsed, capSec);
      const offlineEarned = this.rates.matterPerSec.mul(effectiveSec * 0.6);

      this.currencies.matter = this.currencies.matter.add(offlineEarned);
      this.currencies.totalMatter = this.currencies.totalMatter.add(offlineEarned);

      this.offlineReward = {
        secondsAway: elapsed,
        efficiency: 60,
        matterEarned: offlineEarned
      };
    }
    this.stats.lastSavedTime = now;
  }

  // -------------------------------------------------------------
  // 8. Save / Load
  // -------------------------------------------------------------
  saveGame() {
    try {
      if (typeof localStorage === 'undefined') return false;
      this.stats.lastSavedTime = Date.now();

      const save = {
        currencies: {
          matter: this.currencies.matter.toString(),
          totalMatter: this.currencies.totalMatter.toString(),
          research: this.currencies.research.toString(),
          totalResearch: this.currencies.totalResearch.toString(),
          prestige: this.currencies.prestige.toString(),
          totalPrestige: this.currencies.totalPrestige.toString(),
          transcend: this.currencies.transcend.toString(),
          totalTranscend: this.currencies.totalTranscend.toString(),
          bits: this.currencies.bits.toString(),
          pointX: this.currencies.pointX.toString(),
          qubits: this.currencies.qubits.toString(),
          starMass: this.currencies.starMass.toString(),
          euros: this.currencies.euros.toString()
        },
        upgrades: this.upgrades,
        player: this.player,
        stats: {
          ...this.stats,
          peakMatter: this.stats.peakMatter ? this.stats.peakMatter.toString() : '0',
          totalDonations: this.stats.totalDonations ? this.stats.totalDonations.toString() : '0'
        }
      };

      localStorage.setItem(this.saveKey, JSON.stringify(save));
      return true;
    } catch (e) {
      console.warn("Save failed:", e);
      return false;
    }
  }

  loadGame() {
    try {
      if (typeof localStorage === 'undefined') return false;
      const data = localStorage.getItem(this.saveKey);
      if (!data) return false;

      const p = JSON.parse(data);
      if (p.currencies) {
        Object.keys(p.currencies).forEach(k => {
          this.currencies[k] = D(p.currencies[k] || 0);
        });
      }
      if (p.upgrades) this.upgrades = p.upgrades;
      if (p.player) this.player = { ...this.player, ...p.player };
      if (p.stats) {
        this.stats = { ...this.stats, ...p.stats };
        if (p.stats.peakMatter) this.stats.peakMatter = D(p.stats.peakMatter);
        if (p.stats.totalDonations) this.stats.totalDonations = D(p.stats.totalDonations);
      }

      return true;
    } catch (e) {
      console.warn("Load error:", e);
      return false;
    }
  }

  exportSaveString() {
    this.saveGame();
    return btoa(localStorage.getItem(this.saveKey) || '{}');
  }

  importSaveString(b64) {
    try {
      const json = atob(b64);
      JSON.parse(json);
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
  module.exports = { GameEngine, getNodeDefs };
}
if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
  window.gameEngine = window.gameEngine || new GameEngine();
}
