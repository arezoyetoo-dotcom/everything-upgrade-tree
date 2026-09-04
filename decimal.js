// Decimal Math Engine for Infinite Exponential Incremental Games
// Supports numbers up to 10^(1,000,000,000) with precision and high performance

class Decimal {
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
      if (isNaN(mantissa)) {
        this.m = 0;
        this.e = 0;
        return;
      }
      if (mantissa === 0) {
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

    // Zero threshold
    if (this.e < -50) {
      this.m = 0;
      this.e = 0;
    }

    return this;
  }

  static fromString(str) {
    str = str.trim();
    if (!str || str === '0') return new Decimal(0, 0);

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

  // --- Formatting with Standard Idle Suffixes, Scientific & Engineering ---
  format(decimals = 2, notation = 'standard') {
    if (this.m === 0) return '0';
    if (this.e < 3) {
      const num = this.toNumber();
      if (Math.abs(num) < 0.001) return '0';
      if (Number.isInteger(num)) return num.toLocaleString('en-US');
      return num.toFixed(decimals).replace(/\.?0+$/, '');
    }

    if (notation === 'scientific' || (notation === 'standard' && this.e >= 93)) {
      return `${this.m.toFixed(2)}e${this.e}`;
    }

    if (notation === 'engineering') {
      const remainder = ((this.e % 3) + 3) % 3;
      const engExp = this.e - remainder;
      const engM = this.m * Math.pow(10, remainder);
      return `${engM.toFixed(2)}e${engExp}`;
    }

    // Standard Named Suffixes
    const SUFFIXES = [
      '', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
      'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod',
      'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Novg', 'Tg'
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
function D(val, exp = 0) {
  return new Decimal(val, exp);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Decimal, D };
} else {
  window.Decimal = Decimal;
  window.D = D;
}
