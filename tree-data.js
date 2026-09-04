// Everything Upgrade Tree - Master Node Constellation Graph
// Defines all physical coordinates, prerequisites, mathematical formulas, and sci-fi lore

const NODE_DEFS = {
  // -------------------------------------------------------------
  // 1. GENESIS & MANUAL POWER (Center Core)
  // -------------------------------------------------------------
  'singularity': {
    id: 'singularity',
    name: 'Primordial Singularity',
    tag: 'CORE ORIGIN',
    category: 'genesis',
    lore: 'The dense gravitational seed of creation. Manually pulse this central nucleus to coax raw matter into existence from the void.',
    icon: '✦',
    x: 0,
    y: 0,
    baseCost: D(0),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    isManualClicker: true,
    requires: {},
    effectDescription: 'Generates base Raw Matter (₽) when clicked.'
  },

  'manual_focus': {
    id: 'manual_focus',
    name: 'Kinetic Compression',
    tag: 'CLICK POWER',
    category: 'genesis',
    lore: 'Harmonically focusses kinetic strikes into the Singularity, dramatically compacting matter output.',
    icon: '⚡',
    x: 0,
    y: -140,
    baseCost: D(10),
    costMult: 1.35,
    currency: 'matter',
    maxLevel: 25,
    requires: { 'singularity': 1 },
    effect: (lvl) => D(1).add(D(lvl).mul(1.5)),
    effectDescription: (lvl) => `+${(lvl * 150)}% Click Power (Yields ${D(1).add(D(lvl).mul(1.5)).format(1)}x)`
  },

  'manual_overdrive': {
    id: 'manual_overdrive',
    name: 'Superluminal Impulse',
    tag: 'CRIT BURST',
    category: 'genesis',
    lore: 'Pumps tachyonic tachy-quarks through the click conduit, introducing high-yield quantum critical strikes.',
    icon: '💥',
    x: 0,
    y: -270,
    baseCost: D(250),
    costMult: 2.2,
    currency: 'matter',
    maxLevel: 5,
    requires: { 'manual_focus': 5 },
    effect: (lvl) => lvl * 0.1,
    effectDescription: (lvl) => `${lvl * 10}% Critical Strike Chance (10x Matter Burst)`
  },

  // -------------------------------------------------------------
  // 2. AUTOMATION CONSTELLATION (East Branch)
  // -------------------------------------------------------------
  'harvester_1': {
    id: 'harvester_1',
    name: 'Quantum Harvester',
    tag: 'AUTOMATION T1',
    category: 'automation',
    lore: 'Zero-point collectors scanning micro-singularities to extract ambient baryonic matter continuously.',
    icon: '⚙️',
    x: 180,
    y: 0,
    baseCost: D(15),
    costMult: 1.15,
    currency: 'matter',
    maxLevel: -1, // Infinite
    requires: { 'singularity': 1 },
    baseProd: D(1),
    effectDescription: (lvl) => `+${D(lvl).format()} ₽/sec base automation`
  },

  'harvester_2': {
    id: 'harvester_2',
    name: 'Tachyon Siphon',
    tag: 'AUTOMATION T2',
    category: 'automation',
    lore: 'Extracts matter retro-causally from adjacent collapsed realities where entropy has already run its course.',
    icon: '⏳',
    x: 350,
    y: 40,
    baseCost: D(125),
    costMult: 1.18,
    currency: 'matter',
    maxLevel: -1,
    requires: { 'harvester_1': 5 },
    baseProd: D(12),
    effectDescription: (lvl) => `+${D(lvl).mul(12).format()} ₽/sec base automation`
  },

  'harvester_3': {
    id: 'harvester_3',
    name: 'Antimatter Sieve',
    tag: 'AUTOMATION T3',
    category: 'automation',
    lore: 'Traps negative-mass particles in magnetic Penning traps, converting annihilation bursts into pure matter crystals.',
    icon: '💠',
    x: 520,
    y: 0,
    baseCost: D(1400),
    costMult: 1.20,
    currency: 'matter',
    maxLevel: -1,
    requires: { 'harvester_2': 8 },
    baseProd: D(110),
    effectDescription: (lvl) => `+${D(lvl).mul(110).format()} ₽/sec base automation`
  },

  'harvester_4': {
    id: 'harvester_4',
    name: 'Chrono Dynamo',
    tag: 'AUTOMATION T4',
    category: 'automation',
    lore: 'Gears that mesh with the relativistic flow of spacetime, accelerating matter production into warp overdrive.',
    icon: '⌛',
    x: 690,
    y: -40,
    baseCost: D(18000),
    costMult: 1.22,
    currency: 'matter',
    maxLevel: -1,
    requires: { 'harvester_3': 10 },
    baseProd: D(1250),
    effectDescription: (lvl) => `+${D(lvl).mul(1250).format()} ₽/sec base automation`
  },

  'harvester_5': {
    id: 'harvester_5',
    name: 'Dyson Swarmlet',
    tag: 'AUTOMATION T5',
    category: 'automation',
    lore: 'A micro-constellation of solar collectors encasing an artificial pocket star to feed the main matrix.',
    icon: '☀️',
    x: 860,
    y: 0,
    baseCost: D(280000),
    costMult: 1.25,
    currency: 'matter',
    maxLevel: -1,
    requires: { 'harvester_4': 10 },
    baseProd: D(16000),
    effectDescription: (lvl) => `+${D(lvl).mul(16000).format()} ₽/sec base automation`
  },

  'harvester_6': {
    id: 'harvester_6',
    name: 'Vacuum Synthesizer',
    tag: 'AUTOMATION T6',
    category: 'automation',
    lore: 'Bends the quantum vacuum field past the Schwinger limit to generate whole atoms spontaneously.',
    icon: '🌌',
    x: 1030,
    y: 50,
    baseCost: D(5000000),
    costMult: 1.28,
    currency: 'matter',
    maxLevel: -1,
    requires: { 'harvester_5': 10 },
    baseProd: D(250000),
    effectDescription: (lvl) => `+${D(lvl).mul(250000).format()} ₽/sec base automation`
  },

  // -------------------------------------------------------------
  // 3. RESONANCE & PERCENTAGE MULTIPLIERS (South Branch)
  // -------------------------------------------------------------
  'multiplier_1': {
    id: 'multiplier_1',
    name: 'Harmonic Resonance',
    tag: 'GLOBAL MULTIPLIER',
    category: 'resonance',
    lore: 'Tunes the harmonic frequency of all nodes, amplifying global energy transfer across the canvas.',
    icon: '〰️',
    x: 0,
    y: 160,
    baseCost: D(60),
    costMult: 1.35,
    currency: 'matter',
    maxLevel: 30,
    requires: { 'harvester_1': 3 },
    effect: (lvl) => D(1.18).pow(lvl),
    effectDescription: (lvl) => `All Production x${D(1.18).pow(lvl).format(2)} (+18% compound/lvl)`
  },

  'multiplier_2': {
    id: 'multiplier_2',
    name: 'Fractal Arrays',
    tag: 'LATTICE BOOST',
    category: 'resonance',
    lore: 'Constructs self-similar repeating geometric arrays that multiply production recursively.',
    icon: '❄️',
    x: -140,
    y: 280,
    baseCost: D(750),
    costMult: 1.50,
    currency: 'matter',
    maxLevel: 20,
    requires: { 'multiplier_1': 5 },
    effect: (lvl) => D(1.45).pow(lvl),
    effectDescription: (lvl) => `All Production x${D(1.45).pow(lvl).format(2)} (+45% compound/lvl)`
  },

  'multiplier_3': {
    id: 'multiplier_3',
    name: 'Entanglement Coils',
    tag: 'SYNERGY ENGINE',
    category: 'resonance',
    lore: 'Entangles every active node together. Total owned upgrade levels across the tree amplify global output.',
    icon: '🧬',
    x: 140,
    y: 280,
    baseCost: D(3200),
    costMult: 1.70,
    currency: 'matter',
    maxLevel: 15,
    requires: { 'multiplier_1': 5, 'harvester_2': 5 },
    effect: (lvl, state) => {
      const totalLevels = Object.values(state.upgrades).reduce((a, b) => a + b, 0);
      return D(1).add(D(totalLevels).mul(0.015 * lvl));
    },
    effectDescription: (lvl) => `+${(lvl * 1.5).toFixed(1)}% Global Output per total owned node level`
  },

  'multiplier_4': {
    id: 'multiplier_4',
    name: 'Hyper-Density Weaver',
    tag: 'EXPONENTIAL SURGE',
    category: 'resonance',
    lore: 'Weaves matter packets into higher-dimensional manifolds, doubling baseline throughput.',
    icon: '🔮',
    x: 0,
    y: 410,
    baseCost: D(65000),
    costMult: 2.0,
    currency: 'matter',
    maxLevel: 10,
    requires: { 'multiplier_2': 5, 'multiplier_3': 3 },
    effect: (lvl) => D(2.2).pow(lvl),
    effectDescription: (lvl) => `All Production x${D(2.2).pow(lvl).format(2)} (x2.2/lvl)`
  },

  'multiplier_5': {
    id: 'multiplier_5',
    name: 'Singularity Lattice',
    tag: 'CLICK-AUTO CONDUIT',
    category: 'resonance',
    lore: 'Bridges manual clicks directly to automated generators. Clicking gives an active production surge.',
    icon: '🌐',
    x: 0,
    y: 560,
    baseCost: D(1200000),
    costMult: 2.6,
    currency: 'matter',
    maxLevel: 5,
    requires: { 'multiplier_4': 5 },
    effect: (lvl) => lvl * 0.5,
    effectDescription: (lvl) => `Clicks boost automation by +${lvl * 50}% for 8s (Stackable)`
  },

  // -------------------------------------------------------------
  // 4. RESEARCH & DARK SCIENCE (Northwest Branch)
  // -------------------------------------------------------------
  'research_lab': {
    id: 'research_lab',
    name: 'Lambda Research Lab',
    tag: 'NEW CURRENCY: λ',
    category: 'research',
    lore: 'Constructs an advanced epistemological observatory. Siphons a fraction of matter into fundamental theoretical Research Points (λ).',
    icon: '🔬',
    x: -180,
    y: -120,
    baseCost: D(6000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'harvester_1': 10, 'multiplier_1': 5 },
    effectDescription: 'Unlocks Research Points (λ) & Science Tree'
  },

  'research_1': {
    id: 'research_1',
    name: 'Particle Collider',
    tag: 'RESEARCH T1',
    category: 'research',
    lore: 'Collides relativistic matter packets to generate theoretical breakthrough data.',
    icon: '⚛️',
    x: -340,
    y: -140,
    baseCost: D(10),
    costMult: 1.30,
    currency: 'research',
    maxLevel: -1,
    requires: { 'research_lab': 1 },
    effectDescription: (lvl) => `+${D(lvl).mul(0.5).format(1)} λ/sec base research production`
  },

  'research_2': {
    id: 'research_2',
    name: 'Quantum Epistemology',
    tag: 'THEORETIC BOOST',
    category: 'research',
    lore: 'Uses theoretical research insights to optimize matter synthesis formulas.',
    icon: '📜',
    x: -480,
    y: -230,
    baseCost: D(80),
    costMult: 1.60,
    currency: 'research',
    maxLevel: 15,
    requires: { 'research_1': 5 },
    effect: (lvl, state) => {
      const logVal = Math.max(0, state.currencies.research.log10());
      return D(1).add(D(logVal * lvl * 0.45));
    },
    effectDescription: (lvl) => `Research log-boosts Matter production (Level ${lvl})`
  },

  'research_3': {
    id: 'research_3',
    name: 'Superstring Weaving',
    tag: 'HYPER-EFFICIENCY',
    category: 'research',
    lore: 'Weaves subatomic strings across spacetime, boosting offline productivity and delta calculations.',
    icon: '🎻',
    x: -620,
    y: -130,
    baseCost: D(450),
    costMult: 2.0,
    currency: 'research',
    maxLevel: 5,
    requires: { 'research_2': 3 },
    effect: (lvl) => 0.5 + lvl * 0.1,
    effectDescription: (lvl) => `Offline Efficiency: ${Math.min(100, Math.round((0.5 + lvl * 0.1) * 100))}%`
  },

  'research_4': {
    id: 'research_4',
    name: 'Dimensional Discount',
    tag: 'COST COMPRESSION',
    category: 'research',
    lore: 'Folds physical metric spaces, compressing the raw material required for all upgrade nodes.',
    icon: '✂️',
    x: -770,
    y: -220,
    baseCost: D(2500),
    costMult: 2.5,
    currency: 'research',
    maxLevel: 8,
    requires: { 'research_3': 3 },
    effect: (lvl) => Math.pow(0.90, lvl),
    effectDescription: (lvl) => `All Node Costs Reduced by ${Math.round((1 - Math.pow(0.90, lvl)) * 100)}%`
  },

  // -------------------------------------------------------------
  // 5. DEEP MECHANICS PORTALS (Mining, Cards, Puzzle, etc.)
  // -------------------------------------------------------------
  'portal_mining': {
    id: 'portal_mining',
    name: 'Subterranean Quarry',
    tag: 'MINING LAYER',
    category: 'portal',
    lore: 'Drills deep into the planetary crust beneath the tree. Unlocks the interactive **Mining Quarry** with pickaxes, ores, and permanent forge alloys.',
    icon: '⛏️',
    x: 260,
    y: -180,
    baseCost: D(12000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'harvester_2': 5 },
    effectDescription: 'Unlocks Mining Quarry Baseplate & Forge'
  },

  'portal_cards': {
    id: 'portal_cards',
    name: 'Arcane Card Archive',
    tag: 'CARD DECKS',
    category: 'portal',
    lore: 'Summons the ancient archival deck vault. Unlocks **Card Packs & Deck Builder** to pull rare collectible buffs.',
    icon: '🃏',
    x: -260,
    y: 180,
    baseCost: D(35000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'multiplier_3': 3 },
    effectDescription: 'Unlocks Card Packs (Static, Foodaholic, Astral)'
  },

  'portal_puzzle': {
    id: 'portal_puzzle',
    name: 'Quantum Logic Terminal',
    tag: 'MINESWEEPER',
    category: 'portal',
    lore: 'Restores an ancient quantum computing console. Clear 8x8 logic grids for instant resource rushes and permanent relics.',
    icon: '🧩',
    x: 390,
    y: -320,
    baseCost: D(150000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    requires: { 'portal_mining': 1 },
    effectDescription: 'Unlocks Quantum Minesweeper Mini-Game'
  },

  // -------------------------------------------------------------
  // 6. PRESTIGE BASEPLATE 2 (West Branch - Major Paradigm Shift)
  // -------------------------------------------------------------
  'prestige_conduit': {
    id: 'prestige_conduit',
    name: 'The Great Prestige Conduit',
    tag: 'PRESTIGE RESET',
    category: 'prestige',
    lore: 'THE FIRST MAJOR RESET GATEWAY. Collapse your entire matter empire into pure dimensional Prestige Points (₹). Empowers permanent cosmic meta-progression.',
    icon: '🔱',
    x: -340,
    y: 0,
    baseCost: D(100000),
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    isPrestigeTrigger: true,
    requires: { 'research_lab': 1, 'multiplier_3': 2 },
    effectDescription: 'Unlocks Baseplate 2: Prestige Resets (₹)'
  },

  'prestige_1': {
    id: 'prestige_1',
    name: 'Eternal Genesis',
    tag: 'PERSISTENCE',
    category: 'prestige',
    lore: 'Encodes your muscle memory into reality. Start every prestige run with 1,000 ₽ and keep all manual click levels.',
    icon: '🌱',
    x: -500,
    y: 40,
    baseCost: D(1),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'prestige_conduit': 1 },
    effectDescription: 'Retain manual click levels & start with 1,000 ₽'
  },

  'prestige_2': {
    id: 'prestige_2',
    name: 'Astral Catalyst',
    tag: 'PRESTIGE MULTIPLIER',
    category: 'prestige',
    lore: 'Prestige Points actively emit a radiation that multiplies all lower-tier matter production.',
    icon: '☄️',
    x: -660,
    y: 20,
    baseCost: D(3),
    costMult: 1.8,
    currency: 'prestige',
    maxLevel: 20,
    requires: { 'prestige_1': 1 },
    effect: (lvl, state) => {
      const p = state.currencies.prestige.toNumber();
      return D(1).add(D(Math.pow(p + 1, 0.65) * (lvl * 1.5)));
    },
    effectDescription: (lvl) => `Prestige Points boost all Matter production (+${lvl * 150}% power)`
  },

  'prestige_3': {
    id: 'prestige_3',
    name: 'Autonomous Overseer',
    tag: 'AUTO-BUYER',
    category: 'prestige',
    lore: 'Deploys an AI governor that automatically acquires the cheapest automation upgrade whenever affordable.',
    icon: '🤖',
    x: -810,
    y: 50,
    baseCost: D(10),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'prestige_2': 3 },
    effectDescription: 'Automatically buys available automation upgrades'
  },

  'prestige_4': {
    id: 'prestige_4',
    name: 'Prestige Synergist',
    tag: 'PASSIVE ₹ FEED',
    category: 'prestige',
    lore: 'Channels raw matter back into prestige crystallization, generating passive Prestige without resetting.',
    icon: '♾️',
    x: -960,
    y: 0,
    baseCost: D(50),
    costMult: 2.2,
    currency: 'prestige',
    maxLevel: 10,
    requires: { 'prestige_3': 1 },
    effect: (lvl) => lvl * 0.002,
    effectDescription: (lvl) => `Passively generate ${(lvl * 0.2).toFixed(1)}% of Prestige on reset every sec`
  },

  // -------------------------------------------------------------
  // 7. TRANSCENSION BASEPLATE 3 & ASTRONOMY (Northeast Branch)
  // -------------------------------------------------------------
  'transcend_gate': {
    id: 'transcend_gate',
    name: 'Transcension Threshold',
    tag: 'TRANSCEND RESET',
    category: 'transcend',
    lore: 'THE SECOND MAJOR RESET LAYER. Transmute matter and prestige into cosmic Transcendence Points (τ). Tears open the astral ceiling.',
    icon: '👁️',
    x: 540,
    y: -220,
    baseCost: D(1000000000), // 1 Billion Matter
    costMult: 1,
    currency: 'matter',
    maxLevel: 1,
    isTranscendTrigger: true,
    requires: { 'harvester_4': 5, 'prestige_conduit': 1 },
    effectDescription: 'Unlocks Baseplate 3: Transcension (τ)'
  },

  'portal_astronomy': {
    id: 'portal_astronomy',
    name: 'Stellar Observatory',
    tag: 'STAR TREE & VOID',
    category: 'portal',
    lore: 'Unlocks the **Star Tree & Supermassive Black Hole**. Purchase celestial stars and feed mass to the Event Horizon to warp all game reality.',
    icon: '🔭',
    x: 710,
    y: -350,
    baseCost: D(5),
    costMult: 1,
    currency: 'transcend',
    maxLevel: 1,
    requires: { 'transcend_gate': 1 },
    effectDescription: 'Unlocks Astronomy, Star Tree & Black Hole'
  },

  'transcend_1': {
    id: 'transcend_1',
    name: 'Cosmic Architecture',
    tag: 'TRANSCEND T1',
    category: 'transcend',
    lore: 'Rewrites the physical laws of the matrix, granting a flat 10x multiplier to all automation generators.',
    icon: '🏛️',
    x: 870,
    y: -260,
    baseCost: D(15),
    costMult: 2.5,
    currency: 'transcend',
    maxLevel: 10,
    requires: { 'portal_astronomy': 1 },
    effect: (lvl) => D(10).pow(lvl),
    effectDescription: (lvl) => `All Automation x${D(10).pow(lvl).format(0)} (x10/lvl)`
  },

  // -------------------------------------------------------------
  // 8. CHALLENGES & VOID MASTERY (Southwest Branch)
  // -------------------------------------------------------------
  'portal_challenges': {
    id: 'portal_challenges',
    name: 'Trials of the Void',
    tag: 'CHALLENGE NEXUS',
    category: 'portal',
    lore: 'Unlocks Deduction & Fusion challenge trials. Enter reality distortions with extreme handicaps to win permanent meta-XP and relic multipliers.',
    icon: '⚔️',
    x: -340,
    y: 360,
    baseCost: D(5),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'prestige_conduit': 1 },
    effectDescription: 'Unlocks Deduction & Fusion Challenge Trials'
  },

  'challenge_node_1': {
    id: 'challenge_node_1',
    name: 'Zero-Point Mastery',
    tag: 'TRIAL REWARD',
    category: 'challenge',
    lore: 'Forged from completing the Zero-Automation trial. The Singularity pulses with thousandfold radiant fury.',
    icon: '🔥',
    x: -480,
    y: 450,
    baseCost: D(25),
    costMult: 1,
    currency: 'prestige',
    maxLevel: 1,
    requires: { 'portal_challenges': 1 },
    effectDescription: 'Permanent 1000x boost to manual click power'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NODE_DEFS };
} else {
  window.NODE_DEFS = NODE_DEFS;
}
