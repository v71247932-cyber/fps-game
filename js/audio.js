/**
 * audio.js - Procedural Audio System
 * Generates all game sounds using Web Audio API (no external files needed).
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.8;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Audio not available:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSFXVolume(v) {
        if (this.sfxGain) this.sfxGain.gain.value = v;
    }

    setMusicVolume(v) {
        if (this.musicGain) this.musicGain.gain.value = v;
    }

    playShoot() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Noise burst for gunshot
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.1);

        // Low thump
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playHit() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playDamage() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playKill() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        [600, 800, 1000].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        });
    }

    playReload() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Click sound
        const click = ctx.createOscillator();
        click.type = 'square';
        click.frequency.value = 2000;
        const cg = ctx.createGain();
        cg.gain.setValueAtTime(0.15, now);
        cg.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        click.connect(cg);
        cg.connect(this.sfxGain);
        click.start(now);
        click.stop(now + 0.02);

        // Slide sound
        const slide = ctx.createOscillator();
        slide.type = 'sawtooth';
        slide.frequency.setValueAtTime(300, now + 0.3);
        slide.frequency.linearRampToValueAtTime(600, now + 0.5);
        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0, now);
        sg.gain.setValueAtTime(0.1, now + 0.3);
        sg.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        slide.connect(sg);
        sg.connect(this.sfxGain);
        slide.start(now + 0.3);
        slide.stop(now + 0.55);

        // Final click
        const click2 = ctx.createOscillator();
        click2.type = 'square';
        click2.frequency.value = 2500;
        const cg2 = ctx.createGain();
        cg2.gain.setValueAtTime(0, now);
        cg2.gain.setValueAtTime(0.15, now + 0.7);
        cg2.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        click2.connect(cg2);
        cg2.connect(this.sfxGain);
        click2.start(now + 0.7);
        click2.stop(now + 0.72);
    }

    playDeath() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.6);
    }

    playFootstep() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const bufSize = ctx.sampleRate * 0.04;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 6) * 0.3;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const filt = ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 600;

        const g = ctx.createGain();
        g.gain.value = 0.15;

        src.connect(filt);
        filt.connect(g);
        g.connect(this.sfxGain);
        src.start(now);
    }

    playEmpty() {
        if (!this.initialized) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 1500;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.1, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.03);
    }
}

// Global audio instance
const gameAudio = new AudioManager();
