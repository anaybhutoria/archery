export const DEFAULT_TARGET_Y = 249.5
export const PIVOT = { x: 100, y: 250 }

export const VOSK_MODEL_URL =
  'https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz'

export const VOSK_GRAMMAR =
  '["draw", "shoot", "shot", "shop", "steady", "power", "big", "eagle", "buy", "[unk]"]'

export const UPGRADE_DEFS = {
  steadyAim: {
    name: 'Steady Aim',
    desc: 'Reduces aim wobble',
    costs: [3, 8, 15],
  },
  powerDraw: {
    name: 'Power Draw',
    desc: 'Increases draw distance',
    costs: [3, 8, 15],
  },
  bigBow: {
    name: 'Big Bow',
    desc: 'Larger bow and arrow',
    costFn: (level) => Math.floor(3 * Math.pow(1.5, level)),
  },
  eagleEye: {
    name: 'Eagle Eye',
    desc: 'Larger bullseye zone',
    costFn: (level) => Math.floor(3 * Math.pow(1.5, level)),
  },
}

export function getUpgradeCost(def, level) {
  if (def.costFn) return def.costFn(level)
  if (level < def.costs.length) return def.costs[level]
  return null
}
