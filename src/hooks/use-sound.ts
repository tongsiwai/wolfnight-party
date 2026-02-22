import { useRef, useCallback, useEffect } from 'react';

type SoundName =
  | 'wolf-howl'
  | 'crickets'
  | 'card-flip'
  | 'vote'
  | 'elimination'
  | 'victory'
  | 'dawn'
  | 'night-ambient'
  | 'button-click';

// Generate simple sound effects using Web Audio API
function createOscillatorSound(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  duration: number,
  gain: number = 0.3,
  freqEnd?: number
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function createNoiseSound(ctx: AudioContext, duration: number, gain: number = 0.05): void {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.5;

  const g = ctx.createGain();
  g.gain.value = gain;

  source.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);
  source.start();
}

const soundEffects: Record<SoundName, (ctx: AudioContext) => void> = {
  'wolf-howl': (ctx) => {
    // Eerie ascending howl
    createOscillatorSound(ctx, 'sine', 200, 1.5, 0.25, 600);
    setTimeout(() => createOscillatorSound(ctx, 'sine', 250, 1.2, 0.15, 550), 200);
  },
  'crickets': (ctx) => {
    // Quick chirps
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createOscillatorSound(ctx, 'square', 4000 + Math.random() * 1000, 0.05, 0.03);
      }, i * 120 + Math.random() * 80);
    }
  },
  'night-ambient': (ctx) => {
    // Low drone
    createOscillatorSound(ctx, 'sine', 80, 2, 0.08);
    createOscillatorSound(ctx, 'sine', 120, 2, 0.05);
    createNoiseSound(ctx, 2, 0.02);
  },
  'card-flip': (ctx) => {
    // Quick swoosh
    createNoiseSound(ctx, 0.15, 0.15);
    createOscillatorSound(ctx, 'sine', 800, 0.1, 0.1, 1200);
  },
  'vote': (ctx) => {
    // Stamp sound
    createOscillatorSound(ctx, 'square', 150, 0.1, 0.2);
    createNoiseSound(ctx, 0.08, 0.2);
  },
  'elimination': (ctx) => {
    // Dramatic descending tone
    createOscillatorSound(ctx, 'sawtooth', 400, 0.8, 0.15, 80);
    setTimeout(() => createNoiseSound(ctx, 0.3, 0.1), 300);
  },
  'victory': (ctx) => {
    // Fanfare: ascending notes
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, 'sine', freq, 0.4, 0.2), i * 200);
    });
  },
  'dawn': (ctx) => {
    // Bright ascending chime
    createOscillatorSound(ctx, 'sine', 600, 0.6, 0.15, 1200);
    setTimeout(() => createOscillatorSound(ctx, 'triangle', 800, 0.5, 0.1, 1400), 150);
  },
  'button-click': (ctx) => {
    createOscillatorSound(ctx, 'sine', 600, 0.05, 0.08, 800);
  },
};

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((name: SoundName) => {
    try {
      const ctx = getContext();
      soundEffects[name](ctx);
    } catch {
      // Silently fail if audio isn't available
    }
  }, [getContext]);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
    };
  }, []);

  return { play };
}
