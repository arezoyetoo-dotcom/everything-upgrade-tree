// Everything Upgrade Tree - Canon Node Constellation
// Based on https://everything-upgrade-tree.fandom.com/wiki/Everything_Upgrade_Tree_Wiki

if (typeof D === 'undefined' && typeof require !== 'undefined') {
  const _dec = require('./decimal.js');
  if (typeof globalThis !== 'undefined') {
    globalThis.D = _dec.D;
    globalThis.Decimal = _dec.Decimal;
  }
}

const NODE_DEFS = {
  // #0d
  'node_0d': {
    id: 'node_0d',
    num: '#0d',
    name: 'Unethical Tipping',
    tag: 'BASEPLATE UNLOCK',
    category: 'baseplate',
    lore: 'Unlocks the Donation Baseplate (Optional). A mysterious tip jar floating in the void.',
    icon: '💸',
    x: -180,
    y: -120,
    baseCost: D(0),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_1': 1 },
    effectDescription: 'Unlocks the Donation Baseplate (Optional).'
  },

  // #1
  'node_1': {
    id: 'node_1',
    num: '#1',
    name: 'Generic beginning',
    tag: 'POINT PRODUCER',
    category: 'genesis',
    lore: 'Start gaining Points (₽) at a rate of 1/s. The foundation of everything.',
    icon: '✦',
    x: 0,
    y: 0,
    baseCost: D(0),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    isManualClicker: true,
    requires: {},
    effectDescription: 'Start gaining Points (₽) at a rate of 1/s.'
  },

  // #2
  'node_2': {
    id: 'node_2',
    num: '#2',
    name: 'An increase',
    tag: 'MULTIPLIER',
    category: 'production',
    lore: 'Doubles all baseline point income.',
    icon: '📈',
    x: -160,
    y: 140,
    baseCost: D(5),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_1': 1 },
    effect: () => D(2),
    effectDescription: '×2 ₽ gain.'
  },

  // #3
  'node_3': {
    id: 'node_3',
    num: '#3',
    name: 'A bigger increase',
    tag: 'MULTIPLIER',
    category: 'production',
    lore: 'Triples all baseline point income.',
    icon: '🚀',
    x: 0,
    y: 160,
    baseCost: D(12),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_1': 1 },
    effect: () => D(3),
    effectDescription: '×3 ₽ gain.'
  },

  // #4
  'node_4': {
    id: 'node_4',
    num: '#4',
    name: 'Multiple increases',
    tag: 'MULTI-LEVEL',
    category: 'production',
    lore: 'Compound upgradeable booster. Adds +0.5× ₽ gain for every level.',
    icon: '⚡',
    x: 160,
    y: 140,
    baseCost: D(25),
    costMult: 1.45,
    currency: 'matter',
    maxLevel: 5, // Dynamically expanded by #7, #15, #30!
    requires: { 'node_1': 1 },
    effect: (lvl) => D(1).add(D(lvl).mul(0.5)),
    effectDescription: (lvl) => `+0.5× ₽ gain per level (Current: ×${D(1).add(D(lvl).mul(0.5)).format(1)})`
  },

  // #5
  'node_5': {
    id: 'node_5',
    num: '#5',
    name: 'An advanced increase',
    tag: 'SELF-BOOST',
    category: 'production',
    lore: '₽ boosts itself based on an exponent.',
    icon: '🔮',
    x: -280,
    y: 260,
    baseCost: D(100),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_2': 1 },
    effect: (lvl, engine) => {
      if (!engine) return D(1);
      const exp = 0.30 + (engine.upgrades['node_21'] ? 0.05 : 0);
      const pts = engine.currencies.matter.toNumber();
      const mult = Math.pow(Math.max(1, Math.log10(pts + 10)), exp * 2.5);
      return D(Math.max(1, mult));
    },
    effectDescription: (lvl, engine) => {
      const exp = 0.30 + (engine && engine.upgrades['node_21'] ? 0.05 : 0);
      return `₽ boosts itself based on an exponent (${exp.toFixed(2)}).`;
    }
  },

  // #6
  'node_6': {
    id: 'node_6',
    num: '#6',
    name: 'It grows',
    tag: 'SYNERGY',
    category: 'production',
    lore: '×1.2 ₽ compounding for every point upgrade unlocked.',
    icon: '🌱',
    x: 0,
    y: 300,
    baseCost: D(500),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_3': 1 },
    effect: (lvl, engine) => {
      if (!engine) return D(1);
      const count = Object.keys(engine.upgrades).filter(k => engine.upgrades[k] > 0).length;
      return D(1.2).pow(count);
    },
    effectDescription: (lvl, engine) => {
      const count = engine ? Object.keys(engine.upgrades).filter(k => engine.upgrades[k] > 0).length : 0;
      return `×1.2 ₽ compounding for every point upgrade unlocked (${count} unlocked = ×${D(1.2).pow(count).format(1)}).`;
    }
  },

  // #7
  'node_7': {
    id: 'node_7',
    num: '#7',
    name: 'Even more levels',
    tag: 'CAP EXPANDER',
    category: 'production',
    lore: '+7 level cap to #4.',
    icon: '🔓',
    x: 280,
    y: 260,
    baseCost: D(1000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_4': 1 },
    effectDescription: '+7 level cap to #4.'
  },

  // #8
  'node_8': {
    id: 'node_8',
    num: '#8',
    name: 'New technologies',
    tag: 'RESEARCH CENTER',
    category: 'research',
    lore: 'Unlocks the Research Center.',
    icon: '🔬',
    x: -140,
    y: 420,
    baseCost: D(10000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_6': 1 },
    effectDescription: 'Unlocks the Research Center (λ).'
  },

  // #9
  'node_9': {
    id: 'node_9',
    num: '#9',
    name: 'But its not all empty',
    tag: 'BOOMBOX MUSIC',
    category: 'audio',
    lore: 'Unlocks the Boombox to play music.',
    icon: '📻',
    x: 180,
    y: -120,
    baseCost: D(100),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_1': 1 },
    effectDescription: 'Unlocks the Boombox to play music.'
  },

  // #10
  'node_10': {
    id: 'node_10',
    num: '#10',
    name: 'There it is',
    tag: 'MULTIPLIER',
    category: 'production',
    lore: '×4 ₽ gain.',
    icon: '💎',
    x: 140,
    y: 420,
    baseCost: D(125000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_7': 1 },
    effect: () => D(4),
    effectDescription: '×4 ₽ gain.'
  },

  // #11
  'node_11': {
    id: 'node_11',
    num: '#11',
    name: 'Push for research',
    tag: 'RESEARCH SYNERGY',
    category: 'research',
    lore: '₽ gain is boosted by Research Points (λ).',
    icon: '💡',
    x: -280,
    y: 560,
    baseCost: D(500000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_8': 1 },
    effect: (lvl, engine) => {
      if (!engine) return D(1);
      const res = engine.currencies.research.toNumber();
      return D(Math.max(1, Math.pow(res + 1, 0.35)));
    },
    effectDescription: '₽ gain is boosted by Research Points (λ).'
  },

  // #12
  'node_12': {
    id: 'node_12',
    num: '#12',
    name: 'Now with exponents',
    tag: 'EXPONENTIAL',
    category: 'production',
    lore: '×1.3 ₽ gain compounding for every level.',
    icon: '📈',
    x: 140,
    y: 560,
    baseCost: D(1000000),
    costMult: 1.8, // Decreased to 1.35 by #13!
    currency: 'matter',
    maxLevel: 25,
    requires: { 'node_10': 1 },
    effect: (lvl) => D(1.3).pow(lvl),
    effectDescription: (lvl) => `×1.3 compounding per level (Current: ×${D(1.3).pow(lvl).format(2)})`
  },

  // #13
  'node_13': {
    id: 'node_13',
    num: '#13',
    name: 'Cost cutting',
    tag: 'DISCOUNT',
    category: 'production',
    lore: "Decreases #12's cost scaling.",
    icon: '✂️',
    x: 0,
    y: 680,
    baseCost: D(10000000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_12': 1 },
    effectDescription: "Decreases #12's cost scaling."
  },

  // #14
  'node_14': {
    id: 'node_14',
    num: '#14',
    name: 'Thats a lot',
    tag: 'MULTIPLIER',
    category: 'production',
    lore: '×5 ₽ gain.',
    icon: '🔥',
    x: 280,
    y: 680,
    baseCost: D(400000000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_12': 1 },
    effect: () => D(5),
    effectDescription: '×5 ₽ gain.'
  },

  // #15
  'node_15': {
    id: 'node_15',
    num: '#15',
    name: 'TOO MANY LEVELS',
    tag: 'CAP EXPANDER',
    category: 'production',
    lore: '+30 level cap to #4.',
    icon: '💥',
    x: 420,
    y: 800,
    baseCost: D(10000000000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_14': 1 },
    effectDescription: '+30 level cap to #4.'
  },

  // #16
  'node_16': {
    id: 'node_16',
    num: '#16',
    name: 'Growing up',
    tag: 'LEVELING CENTER',
    category: 'leveling',
    lore: 'Unlocks the Leveling Center.',
    icon: '⭐',
    x: 280,
    y: 940,
    baseCost: D(100000000000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_15': 1 },
    effectDescription: 'Unlocks the Leveling Center.'
  },

  // #17
  'node_17': {
    id: 'node_17',
    num: '#17',
    name: 'A slight edge',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +4 walkspeed.',
    icon: '👟',
    x: -600,
    y: 560,
    baseCost: D(10000000),
    costMult: 1,
    currency: 'research',
    maxLevel: 1,
    requires: { 'node_11': 1 },
    effectDescription: 'Gain +4 walkspeed.'
  },

  // #18
  'node_18': {
    id: 'node_18',
    num: '#18',
    name: 'Meaningless fun',
    tag: 'BONUS BASEPLATE',
    category: 'baseplate',
    lore: 'Unlocks the Bonus Baseplate.',
    icon: '🎪',
    x: -600,
    y: 700,
    baseCost: D(10000000),
    costMult: 1,
    currency: 'research',
    maxLevel: 1,
    requires: { 'node_17': 1 },
    effectDescription: 'Unlocks the Bonus Baseplate.'
  },

  // #19
  'node_19': {
    id: 'node_19',
    num: '#19',
    name: 'A different, bigger increase',
    tag: 'RESEARCH BOOST',
    category: 'research',
    lore: '×3 λ (Research) gain.',
    icon: '🧪',
    x: -440,
    y: 480,
    baseCost: D(1000000000000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_8': 1 },
    effect: () => D(3),
    effectDescription: '×3 λ (Research) gain.'
  },

  // #20
  'node_20': {
    id: 'node_20',
    num: '#20',
    name: 'Competitive',
    tag: 'LEADERBOARD',
    category: 'baseplate',
    lore: 'Unlocks the Leaderboard Baseplate.',
    icon: '🏆',
    x: -140,
    y: 820,
    baseCost: D(1),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'node_11': 1, 'node_13': 1 },
    effectDescription: 'Unlocks the Leaderboard Baseplate.'
  },

  // #21
  'node_21': {
    id: 'node_21',
    num: '#21',
    name: 'Upgrade genetics',
    tag: 'GENETICS',
    category: 'research',
    lore: "Adds +0.05 exponent to #5's formula.",
    icon: '🧬',
    x: -440,
    y: 620,
    baseCost: D(100000),
    costMult: 1,
    currency: 'research',
    maxLevel: 1,
    requires: { 'node_11': 1 },
    effectDescription: "Adds +0.05 exponent to #5's formula."
  },

  // #22
  'node_22': {
    id: 'node_22',
    num: '#22',
    name: '1UP!',
    tag: 'XP BOOST',
    category: 'leveling',
    lore: 'Gain +2 XP per click for every upgrade level.',
    icon: '🍄',
    x: 140,
    y: 1080,
    baseCost: D('1 Quintillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_16': 1 },
    effectDescription: 'Gain +2 XP per click for every upgrade level.'
  },

  // #23
  'node_23': {
    id: 'node_23',
    num: '#23',
    name: 'Downsizing',
    tag: 'XP DISCOUNT',
    category: 'leveling',
    lore: 'Reduces Level XP requirements by ÷1.5.',
    icon: '📉',
    x: 280,
    y: 1080,
    baseCost: D('1 Quintillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_16': 1 },
    effectDescription: 'Reduces Level XP requirements by ÷1.5.'
  },

  // #24
  'node_24': {
    id: 'node_24',
    num: '#24',
    name: 'Holy grail',
    tag: 'PRESTIGE SYNERGY',
    category: 'prestige',
    lore: '₽ gain is boosted by Prestige Points (₹).',
    icon: '🏺',
    x: -280,
    y: 960,
    baseCost: D('1 Sextillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_20': 1 },
    effect: (lvl, engine) => {
      if (!engine) return D(1);
      const p = engine.currencies.prestige.toNumber();
      return D(Math.max(1, Math.pow(p + 1, 0.5) * 2));
    },
    effectDescription: '₽ gain is boosted by Prestige Points (₹).'
  },

  // #25
  'node_25': {
    id: 'node_25',
    num: '#25',
    name: 'After halcyon',
    tag: 'EXPONENT POW',
    category: 'production',
    lore: '^1.05 ₽ gain after all multipliers.',
    icon: '🕊️',
    x: -280,
    y: 1100,
    baseCost: D('1 Septillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_24': 1 },
    effectDescription: '^1.05 ₽ gain after all multipliers.'
  },

  // #26
  'node_26': {
    id: 'node_26',
    num: '#26',
    name: 'Divine soul',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +3 walkspeed.',
    icon: '👼',
    x: 0,
    y: 960,
    baseCost: D(100),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'node_20': 1 },
    effectDescription: 'Gain +3 walkspeed.'
  },

  // #27
  'node_27': {
    id: 'node_27',
    num: '#27',
    name: 'Delayed gratification',
    tag: 'TIME SCALING',
    category: 'production',
    lore: '₽ gain increases the longer you have this upgrade.',
    icon: '⏳',
    x: -140,
    y: 1220,
    baseCost: D('50 Sextillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_25': 1 },
    effect: (lvl, engine) => {
      if (!engine || !engine.stats.node27Time) return D(1);
      const secOwned = Math.max(0, (Date.now() - engine.stats.node27Time) / 1000);
      return D(1).add(D(secOwned * 0.0015)); // +9% per minute
    },
    effectDescription: '₽ gain increases the longer you have this upgrade.'
  },

  // #28
  'node_28': {
    id: 'node_28',
    num: '#28',
    name: 'Insane computation',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +2 walkspeed and +10 jump power.',
    icon: '💻',
    x: -300,
    y: 1360,
    baseCost: D(10000000),
    costMult: 1,
    currency: 'bits',
    maxLevel: 1,
    requires: { 'node_27': 1 },
    effectDescription: 'Gain +2 walkspeed and +10 jump power.'
  },

  // #29
  'node_29': {
    id: 'node_29',
    num: '#29',
    name: 'Megabytes',
    tag: 'BITS SYNERGY',
    category: 'production',
    lore: '₽ gain is boosted by Bits (฿).',
    icon: '💾',
    x: -140,
    y: 1360,
    baseCost: D(15000000),
    costMult: 1,
    currency: 'bits',
    maxLevel: 1,
    requires: { 'node_27': 1 },
    effect: (lvl, engine) => {
      if (!engine) return D(1);
      const bits = engine.currencies.bits.toNumber();
      return D(Math.max(1, Math.pow(bits + 1, 0.4)));
    },
    effectDescription: '₽ gain is boosted by Bits (฿).'
  },

  // #30
  'node_30': {
    id: 'node_30',
    num: '#30',
    name: 'Absolute FRENZY',
    tag: 'CAP EXPANDER',
    category: 'production',
    lore: '+250 level cap to #4 (Cost becomes exponential).',
    icon: '🌪️',
    x: 560,
    y: 940,
    baseCost: D('10 Nonillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_15': 1 },
    effectDescription: '+250 level cap to #4 (Cost becomes exponential).'
  },

  // #31
  'node_31': {
    id: 'node_31',
    num: '#31',
    name: 'Insignia',
    tag: 'RESEARCH POW',
    category: 'research',
    lore: '^1.05 λ gain after all multipliers.',
    icon: '🎖️',
    x: 700,
    y: 1060,
    baseCost: D('10 Quindecillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_30': 1 },
    effectDescription: '^1.05 λ gain after all multipliers.'
  },

  // #32
  'node_32': {
    id: 'node_32',
    num: '#32',
    name: 'Deflated to oblivion',
    tag: 'XP DISCOUNT',
    category: 'leveling',
    lore: 'Reduces XP requirement increase per level.',
    icon: '🌌',
    x: 420,
    y: 1080,
    baseCost: D('1 Quattuordecillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_23': 1 },
    effectDescription: 'Reduces XP requirement increase per level.'
  },

  // #33
  'node_33': {
    id: 'node_33',
    num: '#33',
    name: 'Cursed soul',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +2 walkspeed and +5 jump power.',
    icon: '👻',
    x: -140,
    y: 1500,
    baseCost: D(1000),
    costMult: 1,
    currency: 'pointX',
    maxLevel: 1,
    requires: { 'node_29': 1 },
    effectDescription: 'Gain +2 walkspeed and +5 jump power.'
  },

  // #34
  'node_34': {
    id: 'node_34',
    num: '#34',
    name: 'Light then dark',
    tag: 'POINT-X POW',
    category: 'production',
    lore: '^1.1 ₽X (Point-X) gain after all multipliers.',
    icon: '🌗',
    x: 0,
    y: 1500,
    baseCost: D('1 Septendecillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_33': 1 },
    effectDescription: '^1.1 ₽X (Point-X) gain after all multipliers.'
  },

  // #36
  'node_36': {
    id: 'node_36',
    num: '#36',
    name: 'Beyond beliefs',
    tag: 'UNLISTED MOBILITY',
    category: 'mobility',
    lore: 'Gain +3 walkspeed.',
    icon: '🛸',
    x: 200,
    y: 1360,
    baseCost: D('10 Octodecillion'),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'node_30': 1 },
    effectDescription: 'Gain +3 walkspeed.'
  },

  // #37
  'node_37': {
    id: 'node_37',
    num: '#37',
    name: 'Fortune 500',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +1 walkspeed.',
    icon: '💶',
    x: 360,
    y: 1360,
    baseCost: D(500),
    costMult: 1,
    currency: 'euros',
    maxLevel: 1,
    requires: { 'node_30': 1 },
    effectDescription: 'Gain +1 walkspeed.'
  },

  // #38
  'node_38': {
    id: 'node_38',
    num: '#38',
    name: 'Absurd Pricing',
    tag: 'MOBILITY',
    category: 'mobility',
    lore: 'Gain +2 walkspeed.',
    icon: '⚛️',
    x: 200,
    y: 1500,
    baseCost: D(1000),
    costMult: 1,
    currency: 'qubits',
    maxLevel: 1,
    requires: { 'node_36': 1 },
    effectDescription: 'Gain +2 walkspeed.'
  },

  // #39
  'node_39': {
    id: 'node_39',
    num: '#39',
    name: 'Gravitational Soul',
    tag: 'BLACK HOLE MOBILITY',
    category: 'astronomy',
    lore: 'Gain +2 walkspeed, but increases Black Hole radius.',
    icon: '🕳️',
    x: 360,
    y: 1500,
    baseCost: D(10000),
    costMult: 1,
    currency: 'starMass',
    maxLevel: 1,
    requires: { 'node_37': 1 },
    effectDescription: 'Gain +2 walkspeed, but increases Black Hole radius.'
  },

  // #40
  'node_40': {
    id: 'node_40',
    num: '#40',
    name: 'Post-game content',
    tag: 'HARDCORE BASEPLATE',
    category: 'baseplate',
    lore: 'Unlocks the Hardcore Baseplate. The ultimate endgame frontier.',
    icon: '👑',
    x: 100,
    y: 1680,
    baseCost: D('10 Quinquinquagintillion'),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'node_34': 1, 'node_38': 1, 'node_39': 1 },
    effectDescription: 'Unlocks the Hardcore Baseplate.'
  },

  // =============================================================
  // PRESTIGE BASEPLATE CANON NODES (#1p - #29p)
  // =============================================================

  // #1p the challenge
  'node_1p': {
    id: 'node_1p',
    num: '#1p',
    name: 'the challenge',
    tag: 'CHALLENGE UNLOCK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks the Mystic Obelisk to start challenges [PERMANENT].',
    icon: '⚔️',
    baseCost: D(250),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Unlocks the Mystic Obelisk to start challenges [PERMANENT].'
  },

  // #2p rocket shot
  'node_2p': {
    id: 'node_2p',
    num: '#2p',
    name: 'rocket shot',
    tag: 'DUAL MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: '+1× ₽ (Points) and +0.5× λ (Research) gain per level.',
    icon: '🚀',
    baseCost: D(0.05),
    costMult: 1.8,
    costFormula: (lvl) => D(0.05).mul(D(1.8).pow(lvl)),
    currency: 'prestige',
    maxLevel: 100,
    effectDescription: (lvl) => '+ ' + (lvl * 1) + '× ₽ gain and + ' + (lvl * 0.5).toFixed(1) + '× λ gain.'
  },

  // #3p to new heights
  'node_3p': {
    id: 'node_3p',
    num: '#3p',
    name: 'to new heights',
    tag: 'TREE EXPANSION',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Expands the points tree [PERMANENT].',
    icon: '🏔️',
    baseCost: D(0),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Expands the points tree [PERMANENT].'
  },

  // #4p duping IQ
  'node_4p': {
    id: 'node_4p',
    num: '#4p',
    name: 'duping IQ',
    tag: 'RESEARCH MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: 'Multiplies λ gained by ×2 compounding per level.',
    icon: '🧠',
    baseCost: D(3),
    costMult: 2.0,
    costFormula: (lvl) => D(3).mul(D(2.0).pow(lvl)),
    currency: 'prestige',
    maxLevel: 50,
    effectDescription: (lvl) => '×' + D(2).pow(lvl).format(0) + ' compounding λ gain.'
  },

  // #5p fast and furious
  'node_5p': {
    id: 'node_5p',
    num: '#5p',
    name: 'fast and furious',
    tag: 'AUTOMATION / QOL',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Point upgrades now "buy max" when clicked [PERMANENT].',
    icon: '⚡',
    baseCost: D(0),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Point upgrades now "buy max" when clicked [PERMANENT].'
  },

  // #6p angelic researchers
  'node_6p': {
    id: 'node_6p',
    num: '#6p',
    name: 'angelic researchers',
    tag: 'PASSIVE RESEARCH',
    category: 'prestige',
    subcategory: 'multi',
    lore: 'Start generating 1% of λ gain per second.',
    icon: '👼',
    baseCost: D(2.5),
    costMult: 2.2,
    costFormula: (lvl) => D(2.5).mul(D(2.2).pow(lvl)),
    currency: 'prestige',
    maxLevel: 25,
    effectDescription: (lvl) => 'Start generating ' + (lvl * 1) + '% of λ gain per second.'
  },

  // #7p different variations
  'node_7p': {
    id: 'node_7p',
    num: '#7p',
    name: 'different variations',
    tag: 'BUILDING UNLOCK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks the Level Transformer building [PERMANENT].',
    icon: '🎛️',
    baseCost: D(10),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Unlocks the Level Transformer building [PERMANENT].'
  },

  // #8p 2UP!
  'node_8p': {
    id: 'node_8p',
    num: '#8p',
    name: '2UP!',
    tag: 'XP MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: 'Multiplies XP gained on click by ×2 compounding.',
    icon: '⏫',
    baseCost: D(300),
    costMult: 2.5,
    costFormula: (lvl) => D(300).mul(D(2.5).pow(lvl)),
    currency: 'prestige',
    maxLevel: 30,
    effectDescription: (lvl) => '×' + D(2).pow(lvl).format(0) + ' XP gained on click compounding.'
  },

  // #9p incremental dream
  'node_9p': {
    id: 'node_9p',
    num: '#9p',
    name: 'incremental dream',
    tag: 'BASEPLATE UNLOCK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks the Automation Baseplate [PERMANENT].',
    icon: '🤖',
    baseCost: D(7.5),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Unlocks the Automation Baseplate [PERMANENT].'
  },

  // #10p generic filler
  'node_10p': {
    id: 'node_10p',
    num: '#10p',
    name: 'generic filler',
    tag: 'DUAL MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: '×2 to both ₹ and ₽ gain.',
    icon: '📦',
    baseCost: D(20),
    costMult: 2.5,
    costFormula: (lvl) => D(20).mul(D(2.5).pow(lvl)),
    currency: 'prestige',
    maxLevel: 50,
    effectDescription: (lvl) => '×' + D(2).pow(lvl).format(0) + ' to both ₹ and ₽ gain.'
  },

  // #11p unlazy scientists
  'node_11p': {
    id: 'node_11p',
    num: '#11p',
    name: 'unlazy scientists',
    tag: 'RESEARCH EXPANSION',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks more research upgrades.',
    icon: '🔬',
    baseCost: D(10000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Unlocks more research upgrades.'
  },

  // #12p level 999,999
  'node_12p': {
    id: 'node_12p',
    num: '#12p',
    name: 'level 999,999',
    tag: 'LEVEL MILESTONE',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks more level milestones.',
    icon: '🎖️',
    baseCost: D(25000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Unlocks more level milestones.'
  },

  // #13p ultra rocket shot
  'node_13p': {
    id: 'node_13p',
    num: '#13p',
    name: 'ultra rocket shot',
    tag: 'POINT MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: '+2× ₽ gain per level.',
    icon: '💥',
    baseCost: D(50),
    costMult: 2.0,
    costFormula: (lvl) => D(50).mul(D(2.0).pow(lvl)),
    currency: 'prestige',
    maxLevel: 50,
    effectDescription: (lvl) => '+' + (lvl * 2) + '× ₽ gain per level.'
  },

  // #14p deflation
  'node_14p': {
    id: 'node_14p',
    num: '#14p',
    name: 'deflation',
    tag: 'COST REDUCTION',
    category: 'prestige',
    subcategory: 'multi',
    lore: 'Point upgrade cost is reduced by 5% compounding every level.',
    icon: '📉',
    baseCost: D(50000),
    costMult: 2.5,
    costFormula: (lvl) => D(50000).mul(D(2.5).pow(lvl)),
    currency: 'prestige',
    maxLevel: 20,
    effectDescription: (lvl) => 'Point upgrade cost reduced by ' + (100 * (1 - Math.pow(0.95, lvl))).toFixed(1) + '% compounding.'
  },

  // #15p megabits
  'node_15p': {
    id: 'node_15p',
    num: '#15p',
    name: 'megabits',
    tag: 'BITS SYNERGY',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: '₹ gain is boosted by your Bits (฿).',
    icon: '💾',
    baseCost: D(35000000),
    costMult: 1,
    currency: 'bits',
    maxLevel: 1,
    effectDescription: (lvl, engine) => {
      const b = (engine && engine.currencies && engine.currencies.bits) ? engine.currencies.bits : D(0);
      const mult = D(1 + Math.max(0, b.add(1).log10() * 0.75));
      return '₹ gain is boosted by your Bits (฿) (currently ×' + mult.format(2) + ').';
    }
  },

  // #16p to be continued
  'node_16p': {
    id: 'node_16p',
    num: '#16p',
    name: 'to be continued',
    tag: 'CHALLENGE UNLOCK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks another challenge [PERMANENT].',
    icon: '⏳',
    baseCost: D(5000000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Unlocks another challenge [PERMANENT].'
  },

  // #17p the darkening
  'node_17p': {
    id: 'node_17p',
    num: '#17p',
    name: 'the darkening',
    tag: 'BASEPLATE UNLOCK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Unlocks the Point-X (₽X) Baseplate [PERMANENT].',
    icon: '🌑',
    baseCost: D(500000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Unlocks the Point-X (₽X) Baseplate [PERMANENT].'
  },

  // #18p noxious efficiency
  'node_18p': {
    id: 'node_18p',
    num: '#18p',
    name: 'noxious efficiency',
    tag: 'POINT-X BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Every level, improves the ₽X gain formula by an exponent of +0.01.',
    icon: '🧪',
    baseCost: D(50000000),
    costMult: 2.0,
    costFormula: (lvl) => D(50000000).mul(D(2.0).pow(lvl)),
    currency: 'prestige',
    maxLevel: 25,
    effectDescription: (lvl) => '+' + (lvl * 0.01).toFixed(2) + ' to ₽X gain formula exponent.'
  },

  // #19p no pain no gain
  'node_19p': {
    id: 'node_19p',
    num: '#19p',
    name: 'no pain no gain',
    tag: 'CHALLENGE MULTIPLIER',
    category: 'prestige',
    subcategory: 'multi',
    lore: '×1.15 ₹ gain for every level of prestige challenges beaten.',
    icon: '🩸',
    baseCost: D(50000),
    costMult: 2.5,
    costFormula: (lvl) => D(50000).mul(D(2.5).pow(lvl)),
    currency: 'prestige',
    maxLevel: 25,
    effectDescription: (lvl) => '×' + Math.pow(1.15, lvl).toFixed(2) + ' ₹ gain for every level of prestige challenges beaten.'
  },

  // #20p deeper flows
  'node_20p': {
    id: 'node_20p',
    num: '#20p',
    name: 'deeper flows',
    tag: 'AXP BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Every level, improves the AXP gain formula by an exponent of +0.04.',
    icon: '🌊',
    baseCost: D(1000000000),
    costMult: 2.5,
    costFormula: (lvl) => D(1000000000).mul(D(2.5).pow(lvl)),
    currency: 'prestige',
    maxLevel: 20,
    effectDescription: (lvl) => '+' + (lvl * 0.04).toFixed(2) + ' to AXP gain formula exponent.'
  },

  // #21p supermassive upgrade
  'node_21p': {
    id: 'node_21p',
    num: '#21p',
    name: 'supermassive upgrade',
    tag: 'SUN MULTIPLIER',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Every level, improves ☉ (Sun) gain by ×2.5 compounding.',
    icon: '☀️',
    baseCost: D(10000000000),
    costMult: 3.0,
    costFormula: (lvl) => D(10000000000).mul(D(3.0).pow(lvl)),
    currency: 'prestige',
    maxLevel: 25,
    effectDescription: (lvl) => '×' + D(2.5).pow(lvl).format(1) + ' compounding ☉ (Sun) gain.'
  },

  // #22p beyond balancing
  'node_22p': {
    id: 'node_22p',
    num: '#22p',
    name: 'beyond balancing',
    tag: 'XP EXPONENT',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Applies a ^1.5 exponent to XP gain after all multipliers.',
    icon: '⚖️',
    baseCost: D(1000000000000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Applies a ^1.5 exponent to XP gain after all multipliers.'
  },

  // #23p point production
  'node_23p': {
    id: 'node_23p',
    num: '#23p',
    name: 'point production',
    tag: 'CHALLENGE BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Improves the Point Deduction challenge boost formula.',
    icon: '🎯',
    baseCost: D(5000000000000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Improves the Point Deduction challenge boost formula.'
  },

  // #24p point reduction
  'node_24p': {
    id: 'node_24p',
    num: '#24p',
    name: 'point reduction',
    tag: 'CHALLENGE PERK',
    category: 'prestige',
    subcategory: 'unlock',
    lore: 'Reduces the Point Deduction debuff [PERMANENT].',
    icon: '🛡️',
    baseCost: D(10000000000),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    isPermanent: true,
    effectDescription: 'Reduces the Point Deduction debuff [PERMANENT].'
  },

  // #25p seed of light
  'node_25p': {
    id: 'node_25p',
    num: '#25p',
    name: 'seed of light',
    tag: 'MILESTONE BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Improves the formula for the first level milestone.',
    icon: '💡',
    baseCost: D(2500),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Improves the formula for the first level milestone.'
  },

  // #26p speciation of science
  'node_26p': {
    id: 'node_26p',
    num: '#26p',
    name: 'speciation of science',
    tag: 'CHALLENGE BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Improves the Extinction of Science challenge boost formula.',
    icon: '🧬',
    baseCost: D(1, 28), // 10 Octillion ₹ (1e28)
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Improves the Extinction of Science challenge boost formula.'
  },

  // #27p time dilation
  'node_27p': {
    id: 'node_27p',
    num: '#27p',
    name: 'time dilation',
    tag: 'COOLDOWN REDUCTION',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Reduces the cooldown of specific Point-X abilities by 1s per level.',
    icon: '⌛',
    baseCost: D(1, 26), // 100 Septillion ₹ (1e26)
    costMult: 2.0,
    costFormula: (lvl) => D(1, 26).mul(D(2.0).pow(lvl)),
    currency: 'prestige',
    maxLevel: 20,
    effectDescription: (lvl) => 'Reduces Point-X ability cooldowns by -' + lvl + 's.'
  },

  // #28p prominence
  'node_28p': {
    id: 'node_28p',
    num: '#28p',
    name: 'prominence',
    tag: 'MILESTONE BOOST',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: 'Improves the formula for the fourth level milestone.',
    icon: '👑',
    baseCost: D(1, 25), // 10 Septillion ₹ (1e25)
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    effectDescription: 'Improves the formula for the fourth level milestone.'
  },

  // #29p heavenly timewall
  'node_29p': {
    id: 'node_29p',
    num: '#29p',
    name: 'heavenly timewall',
    tag: 'TRANSCEND POW',
    category: 'prestige',
    subcategory: 'cosmic',
    lore: '×2τ (Transcend Points) gain compounding. Cost halves for every second spent in the current transcension.',
    icon: '🌌',
    baseCost: D(1, 100), // 1e100 (10 DTg)
    costMult: 2.0,
    costFormula: (lvl, engine) => {
      const transTime = (engine && engine.stats && engine.stats.transcensionTime) ? engine.stats.transcensionTime : 0;
      const discount = D(2).pow(Math.min(1000, transTime));
      let cost = D(1, 100).div(discount);
      if (cost.lt(1)) cost = D(1);
      return cost.mul(D(2.0).pow(lvl));
    },
    currency: 'prestige',
    maxLevel: 50,
    effectDescription: (lvl) => '×' + D(2).pow(lvl).format(0) + ' Transcend Points (τ) gain compounding. Cost halves every second spent in current transcension.'
  }

};

const PRESTIGE_NODE_IDS = ["node_1p","node_2p","node_3p","node_4p","node_5p","node_6p","node_7p","node_8p","node_9p","node_10p","node_11p","node_12p","node_13p","node_14p","node_15p","node_16p","node_17p","node_18p","node_19p","node_20p","node_21p","node_22p","node_23p","node_24p","node_25p","node_26p","node_27p","node_28p","node_29p"];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NODE_DEFS, PRESTIGE_NODE_IDS };
} else {
  window.NODE_DEFS = NODE_DEFS;
  window.PRESTIGE_NODE_IDS = PRESTIGE_NODE_IDS;
}
