// Web Audio API ambient soundscape generator and SFX engine

type GenreTheme = 'Misterio' | 'Policial / Noir' | 'Ciencia Ficción' | 'Fantasía' | null;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentGenre: GenreTheme = null;
  private isAmbientPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: (AudioNode | number)[] = [];
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- SFX Generators ---
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext not allowed before user interaction
    }
  }

  public playSelectOption() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.12, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.25);
      });
    } catch {}
  }

  public playDiceRoll() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200 + Math.random() * 400, now + i * 0.06);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.04);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.04);
      }
    } catch {}
  }

  public playDiceResult(isSuccess: boolean) {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      if (isSuccess) {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + i * 0.08);
          gain.gain.setValueAtTime(0.18, t + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(t + i * 0.08);
          osc.stop(t + i * 0.08 + 0.35);
        });
      } else {
        [440, 415.3, 392, 349.23].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + i * 0.12);
          gain.gain.setValueAtTime(0.12, t + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(t + i * 0.12);
          osc.stop(t + i * 0.12 + 0.3);
        });
      }
    } catch {}
  }

  public playChapterChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      [392, 587.33, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);
        gain.gain.setValueAtTime(0.15, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 0.6);
      });
    } catch {}
  }

  // --- Ambient Generators ---
  public toggleAmbient(genre: GenreTheme): boolean {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient(genre);
      return true;
    }
  }

  public setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public isPlayingAmbient(): boolean {
    return this.isAmbientPlaying;
  }

  public startAmbient(genre: GenreTheme) {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    this.currentGenre = genre;
    this.isAmbientPlaying = true;

    try {
      if (genre === 'Policial / Noir') {
        this.startNoirAmbient();
      } else if (genre === 'Ciencia Ficción') {
        this.startSciFiAmbient();
      } else if (genre === 'Fantasía') {
        this.startFantasyAmbient();
      } else {
        // Misterio default
        this.startMysteryAmbient();
      }
    } catch (e) {
      console.error('Failed to start ambient audio:', e);
    }
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    for (const item of this.ambientNodes) {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          (item as any).stop?.();
          (item as any).disconnect?.();
        } catch {}
      }
    }
    this.ambientNodes = [];
  }

  // Noir: Rain noise generator + gentle jazzy low drone
  private startNoirAmbient() {
    if (!this.ctx || !this.ambientGain) return;

    // Rain sound via filtered buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown/pink noise
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);
    whiteNoise.start();

    // Muted low piano chord drone (Eb minor / Bb)
    const osc1 = this.ctx.createOscillator();
    const oscGain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(116.54, this.ctx.currentTime); // Bb2
    oscGain1.gain.setValueAtTime(0.08, this.ctx.currentTime);
    osc1.connect(oscGain1);
    oscGain1.connect(this.ambientGain);
    osc1.start();

    this.ambientNodes.push(whiteNoise, filter, rainGain, osc1, oscGain1);
  }

  // Sci-Fi: Space rumble + slow cosmic LFO sweep + subtle telemetry ping
  private startSciFiAmbient() {
    if (!this.ctx || !this.ambientGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    osc.start();
    lfo.start();

    // Periodic telemetry ping
    const intervalId = window.setInterval(() => {
      if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1800 + Math.random() * 400, this.ctx.currentTime);
      pingGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      pingGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      ping.connect(pingGain);
      pingGain.connect(this.ambientGain);
      ping.start();
      ping.stop(this.ctx.currentTime + 0.15);
    }, 4500);

    this.ambientNodes.push(osc, filter, lfo, lfoGain, gain, intervalId);
  }

  // Fantasy: Warm harmonic drone (D modal) + crystalline chimes
  private startFantasyAmbient() {
    if (!this.ctx || !this.ambientGain) return;

    // Harmonic roots
    const freqs = [146.83, 220.0, 293.66]; // D3, A3, D4
    freqs.forEach((f) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      osc.connect(gain);
      gain.connect(this.ambientGain);
      osc.start();
      this.ambientNodes.push(osc, gain);
    });

    // Occasional mystic chime
    const intervalId = window.setInterval(() => {
      if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;
      const chimeFreqs = [587.33, 659.25, 880.0, 1046.5];
      const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, this.ctx.currentTime);
      chimeGain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      chime.connect(chimeGain);
      chimeGain.connect(this.ambientGain);
      chime.start();
      chime.stop(this.ctx.currentTime + 1.2);
    }, 3800);

    this.ambientNodes.push(intervalId);
  }

  // Mystery: Deep eerie sub drone + clock ticking
  private startMysteryAmbient() {
    if (!this.ctx || !this.ambientGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55.0, this.ctx.currentTime); // A1
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(58.27, this.ctx.currentTime); // Detuned for eerie beating pulse

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ambientGain);

    osc1.start();
    osc2.start();

    // Clock tick interval
    const intervalId = window.setInterval(() => {
      if (!this.ctx || !this.isAmbientPlaying || !this.ambientGain) return;
      const tick = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();
      tick.type = 'square';
      tick.frequency.setValueAtTime(1200, this.ctx.currentTime);
      tickGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      tickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
      tick.connect(tickGain);
      tickGain.connect(this.ambientGain);
      tick.start();
      tick.stop(this.ctx.currentTime + 0.02);
    }, 1000);

    this.ambientNodes.push(osc1, osc2, gain, intervalId);
  }

  // --- Text-to-Speech (Web Speech API) ---
  public speakText(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;
    this.stopSpeech();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/#+\s*/g, '')
      .replace(/\*{1,2}/g, '')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    // Try finding best Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Jorge') || v.name.includes('Mónica'))
    ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.speechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.speechUtterance = null;
    }
  }

  public isSpeechActive(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }
}

export const sound = new SoundEngine();
