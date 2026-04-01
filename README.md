# Archery Game

A voice-controlled archery game built with React. Aim with your voice, shoot with your words.

## How to Play

1. **Draw** — Say "draw" to pull back the bow
2. **Aim** — Hum at different pitches to aim (low = down, high = up)
3. **Shoot** — Say "shoot" to start a 3-second countdown, keep aiming!
4. **Score** — Hit the target for 50 pts, bullseye for 100 pts. Earn coins to spend in the shop
5. **Shop** — Say "shop" to toggle the store. Say "steady", "power", "big", or "eagle" to buy upgrades

## Upgrades

| Upgrade | Effect |
|---------|--------|
| Steady Aim | Reduces aim wobble |
| Power Draw | Increases draw distance |
| Big Bow | Larger bow and arrow |
| Eagle Eye | Larger bullseye zone |

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Requires microphone access for voice commands and pitch detection.

## Tech Stack

- React 18
- Vite
- GSAP (animations + motion paths)
- Vosk Browser (speech recognition)
- Web Audio API (pitch detection)
