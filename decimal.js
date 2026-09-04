// Decimal Math Engine for Infinite Exponential Incremental Games
// Supports numbers up to 10^(1,000,000,000) with precision and high performance

var Decimal = class Decimal {
  constructor(mantissa = 0, exponent = 0) {
    if (mantissa instanceof Decimal) {
      this.m = mantissa.m;
      this.e = mantissa.e;
      return;
    }

    if (typeof mantissa === 'string') {
      const parsed = Decimal.fromString(mantissa);
      this.m = parsed.m;
      this.e = parsed.e;
      return;
    }

    if (typeof mantissa === 'number') {
      if (isNaN(mantissa) || mantissa === 0) {
        this.m = 0;
        this.e = 0;
        return;
      }
      if (!isFinite(mantissa)) {
        this.m = mantissa > 0 ? 1 : -1;
        this.e = 1e9;
        return;
      }

      this.m = mantissa;
      this.e = exponent;
      this.normalize();
      return;
    }

    this.m = 0;
    this.e = 0;
  }

  normalize() {
    if (this.m === 0) {
      this.e = 0;
      return this;
    }

    const sign = Math.sign(this.m);
    let absM = Math.abs(this.m);

    if (absM >= 10 || absM < 1) {
      const expChange = Math.floor(Math.log10(absM));
      absM = absM / Math.pow(10, expChange);
      this.e += expChange;
    }

    this.m = sign * absM;

    if (this.e < -50) {
      this.m = 0;
      this.e = 0;
    }

    return this;
  }

  static fromString(str) {
    str = str.trim().replace(/,/g, '');
    if (!str || str === '0') return new Decimal(0, 0);

    // Named number multipliers
    const NAMES = {
      'thousand': 3,
      'k': 3,
      'million': 6,
      'm': 6,
      'billion': 9,
      'b': 9,
      'trillion': 12,
      't': 12,
      'quadrillion': 15,
      'qa': 15,
      'quintillion': 18,
      'qi': 18,
      'sextillion': 21,
      'sx': 21,
      'septillion': 24,
      'sp': 24,
      'octillion': 27,
      'oc': 27,
      'nonillion': 30,
      'no': 30,
      'decillion': 33,
      'undecillion': 36,
      'duodecillion': 39,
      'tredecillion': 42,
      'quattuordecillion': 45,
      'quindecillion': 48,
      'sexdecillion': 51,
      'septendecillion': 54,
      'octodecillion': 57,
      'novemdecillion': 60,
      'vigintillion': 63,
      'quinquinquagintillion': 168
    };

    // Check for "number name" format (e.g. "10 Nonillion")
    const match = str.match(/^([\d\.]+)\s*([a-zA-Z]+)$/);
    if (match) {
      const val = parseFloat(match[1]);
      const name = match[2].toLowerCase();
      if (NAMES[name] !== undefined) {
        return new Decimal(val, NAMES[name]);
      }
    }

    if (str.includes('e') || str.includes('E')) {
      const parts = str.split(/[eE]/);
      const m = parseFloat(parts[0]);
      const e = parseInt(parts[1], 10);
      return new Decimal(m, e);
    }

    const num = parseFloat(str);
    return new Decimal(num, 0);
  }

  static fromValue(val) {
    if (val instanceof Decimal) return val;
    return new Decimal(val);
  }

  toNumber() {
    if (this.e > 308) return Infinity;
    if (this.e < -308) return 0;
    return this.m * Math.pow(10, this.e);
  }

  add(other) {
    const o = Decimal.fromValue(other);
    if (this.m === 0) return new Decimal(o);
    if (o.m === 0) return new Decimal(this);

    const diff = this.e - o.e;
    if (diff > 16) return new Decimal(this);
    if (diff < -16) return new Decimal(o);

    const newM = this.m + o.m * Math.pow(10, -diff);
    return new Decimal(newM, this.e);
  }

  sub(other) {
    const o = Decimal.fromValue(other);
    if (o.m === 0) return new Decimal(this);
    if (this.m === 0) return new Decimal(-o.m, o.e);

    const diff = this.e - o.e;
    if (diff > 16) return new Decimal(this);
    if (diff < -16) return new Decimal(-o.m, o.e);

    const newM = this.m - o.m * Math.pow(10, -diff);
    if (Math.abs(newM) < 1e-15) return new Decimal(0, 0);
    return new Decimal(newM, this.e);
  }

  mul(other) {
    const o = Decimal.fromValue(other);
    if (this.m === 0 || o.m === 0) return new Decimal(0, 0);
    return new Decimal(this.m * o.m, this.e + o.e);
  }

  div(other) {
    const o = Decimal.fromValue(other);
    if (o.m === 0) return new Decimal(Infinity);
    if (this.m === 0) return new Decimal(0, 0);
    return new Decimal(this.m / o.m, this.e - o.e);
  }

  pow(power) {
    const p = typeof power === 'number' ? power : power.toNumber();
    if (p === 0) return new Decimal(1, 0);
    if (this.m === 0) return new Decimal(0, 0);

    const newE = this.e * p;
    const newM = Math.pow(this.m, p);

    if (isFinite(newM)) {
      return new Decimal(newM, Math.floor(newE));
    }

    const log10Val = (Math.log10(this.m) + this.e) * p;
    const targetE = Math.floor(log10Val);
    const targetM = Math.pow(10, log10Val - targetE);
    return new Decimal(targetM, targetE);
  }

  sqrt() {
    return this.pow(0.5);
  }

  log10() {
    if (this.m <= 0) return 0;
    return Math.log10(this.m) + this.e;
  }

  compare(other) {
    const o = Decimal.fromValue(other);
    if (this.m === 0 && o.m === 0) return 0;
    if (this.m > 0 && o.m <= 0) return 1;
    if (this.m <= 0 && o.m > 0) return -1;

    if (this.e > o.e) return this.m > 0 ? 1 : -1;
    if (this.e < o.e) return this.m > 0 ? -1 : 1;

    if (this.m > o.m) return 1;
    if (this.m < o.m) return -1;
    return 0;
  }

  gt(o) { return this.compare(o) > 0; }
  gte(o) { return this.compare(o) >= 0; }
  lt(o) { return this.compare(o) < 0; }
  lte(o) { return this.compare(o) <= 0; }
  eq(o) { return this.compare(o) === 0; }
  neq(o) { return this.compare(o) !== 0; }
  isZero() { return this.m === 0; }

  floor() {
    if (this.m === 0) return new Decimal(0);
    if (this.e >= 16) return new Decimal(this);
    if (this.e < 0) return new Decimal(this.m >= 0 ? 0 : -1);
    const val = Math.floor(this.toNumber());
    return new Decimal(val);
  }

  ceil() {
    if (this.m === 0) return new Decimal(0);
    if (this.e >= 16) return new Decimal(this);
    if (this.e < 0) return new Decimal(this.m > 0 ? 1 : 0);
    const val = Math.ceil(this.toNumber());
    return new Decimal(val);
  }

  round() {
    if (this.m === 0) return new Decimal(0);
    if (this.e >= 16) return new Decimal(this);
    const val = Math.round(this.toNumber());
    return new Decimal(val);
  }

  max(other) {
    return Decimal.max(this, other);
  }

  min(other) {
    return Decimal.min(this, other);
  }

  static max(a, b) {
    const da = Decimal.fromValue(a);
    const db = Decimal.fromValue(b);
    return da.gte(db) ? da : db;
  }

  static min(a, b) {
    const da = Decimal.fromValue(a);
    const db = Decimal.fromValue(b);
    return da.lte(db) ? da : db;
  }

  static log10(val) {
    const d = Decimal.fromValue(val);
    return d.log10();
  }

  // --- Formatting with Standard Idle Suffixes, Scientific & Engineering ---
  format(decimals = 2, notation = 'standard') {
    if (this.m === 0) return '0';
    if (this.e < 3) {
      const num = this.toNumber();
      if (Math.abs(num) < 0.001) return '0';
      if (Number.isInteger(num)) return num.toLocaleString('en-US');
      return num.toFixed(decimals).replace(/\.?0+$/, '');
    }

    if (notation === 'scientific' || (notation === 'standard' && this.e >= 66)) {
      return `${this.m.toFixed(2)}e${this.e}`;
    }

    if (notation === 'engineering') {
      const remainder = ((this.e % 3) + 3) % 3;
      const engExp = this.e - remainder;
      const engM = this.m * Math.pow(10, remainder);
      return `${engM.toFixed(2)}e${engExp}`;
    }

    // Extended Named Suffixes
    const SUFFIXES = [
      '', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
      'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod',
      'Vg'
    ];

    const tier = Math.floor(this.e / 3);
    if (tier < SUFFIXES.length) {
      const remainder = this.e % 3;
      const displayM = this.m * Math.pow(10, remainder);
      return `${displayM.toFixed(decimals)}${SUFFIXES[tier]}`;
    }

    return `${this.m.toFixed(2)}e${this.e}`;
  }

  toString() {
    if (this.m === 0) return '0';
    return `${this.m}e${this.e}`;
  }
}

// Global factory helper
var D = function D(val, exp = 0) {
  return new Decimal(val, exp);
};

if (typeof globalThis !== 'undefined') {
  globalThis.Decimal = Decimal;
  globalThis.D = D;
}
if (typeof window !== 'undefined') {
  window.Decimal = Decimal;
  window.D = D;
}
if (typeof global !== 'undefined') {
  global.Decimal = Decimal;
  global.D = D;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Decimal, D };
}
