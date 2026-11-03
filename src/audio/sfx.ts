let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

/** 必须在用户手势（点击）里调用一次，iOS 才允许出声 */
export function initAudio() {
  if (!enabled) return
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  if (!enabled || !ctx) return
  const t0 = ctx.currentTime + start
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  o.connect(g).connect(ctx.destination)
  o.start(t0)
  o.stop(t0 + dur)
}

export const sfx = {
  tap: () => tone(880, 0, 0.05, 'triangle', 0.08),
  ok: () => { tone(523, 0, 0.1); tone(659, 0.09, 0.16) },
  bad: () => tone(160, 0, 0.2, 'square', 0.1),
  levelUp: () => { tone(659, 0, 0.08); tone(784, 0.08, 0.08); tone(1047, 0.16, 0.2) },
  win: () => { tone(523, 0, 0.12); tone(659, 0.12, 0.12); tone(784, 0.24, 0.12); tone(1047, 0.36, 0.35) },
}
