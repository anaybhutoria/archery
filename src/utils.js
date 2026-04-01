export function getIntersection(s1, s2) {
  const dx1 = s1.x2 - s1.x1, dy1 = s1.y2 - s1.y1
  const dx2 = s2.x2 - s2.x1, dy2 = s2.y2 - s2.y1
  const cx = s1.x1 - s2.x1, cy = s1.y1 - s2.y1
  const denom = dy2 * dx1 - dx2 * dy1
  if (denom === 0) return null
  const ua = (dx2 * cy - dy2 * cx) / denom
  const ub = (dx1 * cy - dy1 * cx) / denom
  return {
    x: s1.x1 + ua * dx1,
    y: s1.y1 + ua * dy1,
    segment1: ua >= 0 && ua <= 1,
    segment2: ub >= 0 && ub <= 1,
  }
}

// Autocorrelation-based pitch detection
// Returns frequency in Hz, or -1 if signal is too quiet
export function detectPitch(analyser) {
  const buf = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(buf)

  let rms = 0
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / buf.length)
  if (rms < 0.01) return -1

  let r1 = 0, r2 = buf.length - 1
  const threshold = 0.2
  for (let i = 0; i < buf.length / 2; i++) {
    if (Math.abs(buf[i]) < threshold) { r1 = i; break }
  }
  for (let i = 1; i < buf.length / 2; i++) {
    if (Math.abs(buf[buf.length - i]) < threshold) { r2 = buf.length - i; break }
  }
  const slice = buf.slice(r1, r2)
  const len = slice.length

  const c = new Array(len).fill(0)
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i; j++) {
      c[i] += slice[j] * slice[j + i]
    }
  }

  let d = 0
  while (d < len - 1 && c[d] > c[d + 1]) d++
  let maxVal = -1, maxPos = -1
  for (let i = d; i < len; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i }
  }
  if (maxPos < 1 || maxPos >= len - 1) return -1

  const x1 = c[maxPos - 1], x2 = c[maxPos], x3 = c[maxPos + 1]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  const T0 = a ? maxPos - b / (2 * a) : maxPos

  return analyser.context.sampleRate / T0
}
