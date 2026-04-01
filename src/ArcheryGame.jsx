import { useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DEFAULT_TARGET_Y } from './constants'
import GameSVG from './GameSVG'
import StorePanel from './StorePanel'
import HelpModal from './HelpModal'
import HUD from './HUD'
import useGameEngine from './useGameEngine'
import useAudio from './useAudio'
import './ArcheryGame.css'

gsap.registerPlugin(MotionPathPlugin)

export default function ArcheryGame() {
  const svgRef = useRef(null)
  const randomAngleRef = useRef(0)
  const isDrawnRef = useRef(false)
  const analyserRef = useRef(null)
  const shootTimerRef = useRef(null)
  const targetRef = useRef(null)
  const targetYRef = useRef(DEFAULT_TARGET_Y)

  const [showHelp, setShowHelp] = useState(true)
  const [status, setStatus] = useState('Loading speech model...')
  const [countdown, setCountdown] = useState(null)
  const [heard, setHeard] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [coins, setCoins] = useState(0)
  const [storeOpen, setStoreOpen] = useState(false)
  const [upgrades, setUpgrades] = useState({
    steadyAim: 0, powerDraw: 0, bigBow: 0, eagleEye: 0,
  })

  const upgradesRef = useRef(upgrades)
  const coinsRef = useRef(coins)
  const storeOpenRef = useRef(storeOpen)
  upgradesRef.current = upgrades
  coinsRef.current = coins
  storeOpenRef.current = storeOpen

  const engineRef = useRef(null)
  engineRef.current = useGameEngine({
    svgRef, targetRef, randomAngleRef, isDrawnRef, shootTimerRef, targetYRef,
    upgradesRef, coinsRef, storeOpenRef,
    setStatus, setCountdown, setCoins, setScore, setStreak, setStoreOpen, setUpgrades, setHeard,
  })

  const onAimAtPoint = useCallback((point) => {
    engineRef.current?.aimAtPoint(point)
  }, [])

  const onVoiceCommand = useCallback((text) => {
    engineRef.current?.handleVoiceCommand(text)
  }, [])

  useAudio({
    analyserRef, isDrawnRef,
    setStatus, setHeard,
    onAimAtPoint, onVoiceCommand,
  })

  return (
    <div className="game-container">
      <GameSVG ref={svgRef} upgrades={upgrades} targetRef={targetRef} />
      <HUD score={score} streak={streak} coins={coins} countdown={countdown} status={status} heard={heard} />
      <StorePanel storeOpen={storeOpen} setStoreOpen={setStoreOpen} coins={coins} setCoins={setCoins} upgrades={upgrades} setUpgrades={setUpgrades} />
      <HelpModal showHelp={showHelp} setShowHelp={setShowHelp} />
    </div>
  )
}
