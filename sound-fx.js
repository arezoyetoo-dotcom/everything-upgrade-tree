// Web Audio API Procedural Sound Engine & Generative Boombox for Everything Upgrade Tree
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sfxVolume = 0.65;
    this.droneOsc = null;
    this.droneGain = null;
    this.droneActive = false;
    this.initialized = false;

    // Boombox Music Synthesizer (#9 But its not all empty)
    this.boomboxVolume = 0.45;
    this.boomboxPlaying = false;
    this.currentTrackIndex = 0;
    this.boomboxFilterFreq = 2200;
    this.tracks = [
      { id: 'drift', name: 'Cosmic Drift', bpm: 84, scale: [220, 261.63, 293.66, 329.63, 392, 440, 523.25], type: 'ambient' },
      { id: 'coffee', name: 'Astral Coffee', bpm: 78, scale: [196, 246.94, 293.66, 369.99, 440, 493.88], type: 'jazz' },
      { id: 'lofi', name: 'Deep Space Lo-Fi', bpm: 90, scale: [174.61, 220, 261.63, 329.63, 349.23, 440], type: 'chill' },
      { id: 'singularity', name: 'Singularity Chill', bpm: 72, scale: [164.81, 196, 220, 246.94, 293.66, 329.63], type: 'drone' }
    ];
    this.boomboxStep = 0;
    this.boomboxTimer = null;
    this.visualizerBars = [0.2, 0.4, 0.7, 0.3, 0.8, 0.5, 0.9, 0.4, 0.6, 0.3];
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext could not be initialized:", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && typeof this.ctx.resume === 'function' && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (e) {}
    }
    return !!(this.ctx && typeof this.ctx.createOscillator === 'function');
  }

  playClick() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 480 + Math.random() * 80;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  playBuy() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    [523.25, 783.99].forEach((freq, idx) => {
      const start = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.18);
    });
  }

  playMaxed() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const start = t + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  playPrestige() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.8);

    gain.gain.setValueAtTime(0.5 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  playMine() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400 + Math.random() * 200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playCard() {
    if (this.muted) return;
    if (!this.ensureContext()) return;

    const t = this.ctx.currentTime;
    [880, 1108.73, 1318.51].forEach((f, i) => {
      const start = t + i * 0.03;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  toggleDrone() {
    if (!this.ensureContext()) return;

    if (this.droneActive) {
      if (this.droneGain) {
        this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          if (this.droneOsc) {
            this.droneOsc.stop();
            this.droneOsc.disconnect();
            this.droneOsc = null;
          }
        }, 300);
      }
      this.droneActive = false;
      return false;
    } else {
      this.droneOsc = this.ctx.createOscillator();
      const droneLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.droneGain = this.ctx.createGain();

      this.droneOsc.type = 'sine';
      this.droneOsc.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2 drone

      droneLfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(8, this.ctx.currentTime);
      droneLfo.connect(lfoGain);
      lfoGain.connect(this.droneOsc.frequency);

      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.droneGain.gain.setTargetAtTime(0.08 * this.sfxVolume, this.ctx.currentTime, 1.0);

      this.droneOsc.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc.start();
      droneLfo.start();
      this.droneActive = true;
      return true;
    }
  }

  setVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.droneGain && this.ctx && this.droneActive) {
      this.droneGain.gain.setTargetAtTime(0.08 * this.sfxVolume, this.ctx.currentTime, 0.1);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      if (this.droneActive) this.toggleDrone();
      if (this.boomboxPlaying) this.pauseBoombox();
    }
    return this.muted;
  }

  // -------------------------------------------------------------
  // Generative Procedural Boombox Audio (#9)
  // -------------------------------------------------------------
  playBoombox() {
    if (!this.ensureContext()) return;
    this.boomboxPlaying = true;
    if (this.boomboxTimer) clearInterval(this.boomboxTimer);

    const track = this.tracks[this.currentTrackIndex];
    const stepDurationMs = (60 / track.bpm / 2) * 1000; // 8th note steps

    this.boomboxTimer = setInterval(() => {
      if (!this.boomboxPlaying || this.muted) return;
      this.triggerBoomboxStep();
    }, stepDurationMs);
  }

  pauseBoombox() {
    this.boomboxPlaying = false;
    if (this.boomboxTimer) {
      clearInterval(this.boomboxTimer);
      this.boomboxTimer = null;
    }
  }

  toggleBoombox() {
    if (this.boomboxPlaying) {
      this.pauseBoombox();
      return false;
    } else {
      this.playBoombox();
      return true;
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.boomboxPlaying) {
      this.playBoombox();
    }
    return this.getCurrentTrack();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.boomboxPlaying) {
      this.playBoombox();
    }
    return this.getCurrentTrack();
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  setBoomboxVolume(val) {
    this.boomboxVolume = Math.max(0, Math.min(1, val));
  }

  setFilterFreq(freq) {
    this.boomboxFilterFreq = Math.max(200, Math.min(8000, freq));
  }

  triggerBoomboxStep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const track = this.tracks[this.currentTrackIndex];
    const step = this.boomboxStep % 16;
    this.boomboxStep++;

    // Randomize visualizer bars
    for (let i = 0; i < this.visualizerBars.length; i++) {
      this.visualizerBars[i] = Math.random() * 0.7 + (step % 2 === 0 ? 0.3 : 0.1);
    }

    // 1. Kick on steps 0, 8 (or 0, 6, 10 for lo-fi swing)
    if (step === 0 || (track.type === 'chill' ? step === 6 || step === 10 : step === 8)) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.frequency.setValueAtTime(120, t);
      kickOsc.frequency.exponentialRampToValueAtTime(36, t + 0.12);
      kickGain.gain.setValueAtTime(0.35 * this.boomboxVolume, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      kickOsc.connect(kickGain);
      kickGain.connect(this.ctx.destination);
      kickOsc.start(t);
      kickOsc.stop(t + 0.15);
    }

    // 2. Soft Hi-Hat on offbeats (2, 4, 6, 10, 12, 14)
    if (step % 2 === 0 && step !== 0) {
      const hatOsc = this.ctx.createOscillator();
      const hatFilter = this.ctx.createBiquadFilter();
      const hatGain = this.ctx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(2000 + Math.random() * 500, t);
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(4000, t);
      hatGain.gain.setValueAtTime(0.06 * this.boomboxVolume, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      hatOsc.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(this.ctx.destination);
      hatOsc.start(t);
      hatOsc.stop(t + 0.04);
    }

    // 3. Melodic Warm Notes
    if (step % 4 === 0 || (step % 3 === 0 && Math.random() > 0.4)) {
      const noteIdx = Math.floor(Math.random() * track.scale.length);
      const freq = track.scale[noteIdx];
      const noteOsc = this.ctx.createOscillator();
      const noteFilter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      noteOsc.type = track.type === 'jazz' ? 'triangle' : 'sine';
      noteOsc.frequency.setValueAtTime(freq, t);

      noteFilter.type = 'lowpass';
      noteFilter.frequency.setValueAtTime(this.boomboxFilterFreq, t);

      const noteDuration = (step % 8 === 0) ? 0.6 : 0.28;
      noteGain.gain.setValueAtTime(0.16 * this.boomboxVolume, t);
      noteGain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

      noteOsc.connect(noteFilter);
      noteFilter.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      noteOsc.start(t);
      noteOsc.stop(t + noteDuration);
    }
  }
}

window.soundEngine = new SoundEngine();
