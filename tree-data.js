// Everything Upgrade Tree - Canon Node Constellation
// Based on https://everything-upgrade-tree.fandom.com/wiki/Everything_Upgrade_Tree_Wiki

if (typeof D === 'undefined' && typeof require !== 'undefined') {
  var { D, Decimal } = require('./decimal.js');
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
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NODE_DEFS };
} else {
  window.NODE_DEFS = NODE_DEFS;
}
