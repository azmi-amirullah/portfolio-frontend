export const playSuccessBeep = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';

    osc.start(ctx.currentTime);

    osc.frequency.setValueAtTime(1700, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.25);

    osc.onended = () => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  } catch (error) {
    console.warn('Audio playback failed', error);
  }
};
