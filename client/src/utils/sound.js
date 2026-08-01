let audioCtx = null;
let soundEnabled = false;

const playTone = (frequency = 800, duration = 50, type = 'square', volume = 0.03) => {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration / 1000 + 0.01);
  } catch (e) {
    // Silent fail
  }
};

export const sounds = {
  type: () => playTone(800 + Math.random() * 200, 30, 'square', 0.02),
  click: () => playTone(600, 50, 'sine', 0.03),
  success: () => {
    playTone(523, 100, 'sine', 0.03);
    setTimeout(() => playTone(659, 100, 'sine', 0.03), 100);
    setTimeout(() => playTone(784, 150, 'sine', 0.03), 200);
  },
  error: () => playTone(200, 200, 'sawtooth', 0.04),
  navigate: () => playTone(440, 80, 'triangle', 0.02),
  boot: () => playTone(1000, 30, 'square', 0.01),
};

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = (force) => {
  soundEnabled = force !== undefined ? force : !soundEnabled;
  return soundEnabled;
};