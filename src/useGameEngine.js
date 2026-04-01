import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PIVOT, DEFAULT_TARGET_Y, UPGRADE_DEFS, getUpgradeCost } from './constants'
import { getIntersection } from './utils'

export default function useGameEngine({
  svgRef, targetRef, randomAngleRef, isDrawnRef, shootTimerRef, targetYRef,
  upgradesRef, coinsRef, storeOpenRef,
  setStatus, setCountdown, setCoins, setScore, setStreak, setStoreOpen, setUpgrades, setHeard,
}) {
  const methodsRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current

    function aimAtPoint(point) {
      point.x = Math.min(point.x, PIVOT.x - 7)
      const dx = point.x - PIVOT.x
      const dy = point.y - PIVOT.y
      const angle = Math.atan2(dy, dx) + randomAngleRef.current
      const bowAngle = angle - Math.PI
      const maxDist = 80 + upgradesRef.current.powerDraw * 20
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
      const scale = Math.min(Math.max(distance / 30, 1), 2)

      gsap.to('#bow', { duration: 0.3, scaleX: scale, rotation: `${bowAngle}rad`, transformOrigin: 'right center' })
      gsap.to('.arrow-angle', { duration: 0.3, rotation: `${bowAngle}rad`, svgOrigin: '100 250' })
      gsap.to('.arrow-angle use', { duration: 0.3, x: -distance })
      gsap.to('#bow polyline', {
        duration: 0.3,
        attr: { points: `88,200 ${Math.min(PIVOT.x - (1 / scale) * distance, 88)},250 88,300` },
      })
      const radius = distance * 9
      const offset = { x: Math.cos(bowAngle) * radius, y: Math.sin(bowAngle) * radius }
      const arcWidth = offset.x * 3
      gsap.to('#arc', {
        duration: 0.3,
        attr: { d: `M100,250c${offset.x},${offset.y},${arcWidth - offset.x},${offset.y + 50},${arcWidth},50` },
        autoAlpha: distance / 60,
      })
    }

    function triggerDraw() {
      if (isDrawnRef.current) return
      const wobble = 1 - upgradesRef.current.steadyAim * 0.25
      randomAngleRef.current = (Math.random() * Math.PI * 0.03 - 0.015) * wobble
      gsap.to('.arrow-angle use', { duration: 0.3, opacity: 1 })
      isDrawnRef.current = true
      setStatus("Hum to aim · Say 'shoot' to fire")
      aimAtPoint({ x: PIVOT.x - 50, y: PIVOT.y + 30 })
    }

    function triggerShootCountdown() {
      let remaining = 3
      setCountdown(remaining)
      shootTimerRef.current = setInterval(() => {
        remaining--
        if (remaining > 0) { setCountdown(remaining) }
        else { clearInterval(shootTimerRef.current); shootTimerRef.current = null; setCountdown(null); triggerLoose() }
      }, 1000)
    }

    function triggerLoose() {
      if (!isDrawnRef.current) return
      isDrawnRef.current = false
      setStatus("Say 'draw' to aim")
      gsap.to('#bow', { duration: 0.4, scaleX: 1, transformOrigin: 'right center', ease: 'elastic.out(1, 0.3)' })
      gsap.to('#bow polyline', { duration: 0.4, attr: { points: '88,200 88,250 88,300' }, ease: 'elastic.out(1, 0.3)' })

      const arrowsGroup = svg.querySelector('.arrows')
      const newArrow = document.createElementNS('http://www.w3.org/2000/svg', 'use')
      newArrow.setAttribute('href', '#arrow')
      arrowsGroup.appendChild(newArrow)

      let hitDetected = false
      gsap.to(newArrow, {
        duration: 1.0, motionPath: { path: '#arc', autoRotate: true }, ease: 'none',
        onUpdate: function () {
          if (hitDetected) return
          const x = gsap.getProperty(newArrow, 'x'), y = gsap.getProperty(newArrow, 'y')
          const radians = (gsap.getProperty(newArrow, 'rotation') * Math.PI) / 180
          const arrowLen = 42 + upgradesRef.current.bigBow * 6
          const tScale = 0.7 + upgradesRef.current.eagleEye * 0.4
          const ty = targetYRef.current
          const eyeBonus = upgradesRef.current.eagleEye * 5
          const shiftX = 60 - (tScale - 0.7) * 80
          const cx = 900 + (903 - 900) * tScale + shiftX
          const arrowSeg = { x1: x, y1: y, x2: Math.cos(radians) * arrowLen + x, y2: Math.sin(radians) * arrowLen + y }
          const halfW = 21 * tScale + eyeBonus
          const halfH = 21 * tScale + eyeBonus
          const x1 = cx - halfW
          const x2 = cx + halfW
          const lineSeg = { x1, y1: ty + halfH, x2, y2: ty - halfH }
          const hit = getIntersection(arrowSeg, lineSeg)
          if (hit?.segment1 && hit?.segment2) {
            hitDetected = true; this.pause()
            const dist = Math.sqrt((hit.x - cx) ** 2 + (hit.y - ty) ** 2)
            const isBullseye = dist < 5 + upgradesRef.current.eagleEye * 5
            showMessage(isBullseye ? '.bullseye' : '.hit')
            setCoins(c => c + (isBullseye ? 3 : 1))
            setStreak(s => {
              const ns = s + 1, mul = Math.floor(ns / 3) + 1
              setScore(p => p + (isBullseye ? 100 : 50) * mul); return ns
            })
            setTimeout(() => moveTarget(), 2000)
          }
        },
        onComplete() { if (!hitDetected) { showMessage('.miss'); setStreak(0) } },
      })
      gsap.to('#arc', { duration: 0.3, opacity: 0 })
      gsap.set('.arrow-angle use', { opacity: 0 })
    }

    function moveTarget() {
      const arrowsGroup = svg.querySelector('.arrows')
      while (arrowsGroup.firstChild) arrowsGroup.removeChild(arrowsGroup.firstChild)
      const newY = 50 + Math.random() * 300
      targetYRef.current = newY
      gsap.to(targetRef.current, { duration: 0.5, y: newY - DEFAULT_TARGET_Y, ease: 'power2.out' })
    }

    function showMessage(selector) {
      const paths = document.querySelectorAll(`${selector} path`)
      gsap.killTweensOf(selector); gsap.killTweensOf(paths)
      gsap.set(selector, { autoAlpha: 1 })
      gsap.fromTo(paths, { rotation: -5, scale: 0, transformOrigin: 'center' },
        { duration: 0.5, scale: 1, ease: 'back.out(1.7)', stagger: 0.05 })
      gsap.to(paths, { duration: 0.3, delay: 2, rotation: 20, scale: 0, ease: 'back.in(1.7)', stagger: 0.03 })
    }

    function buyUpgrade(key) {
      const def = UPGRADE_DEFS[key]; if (!def) return
      const cost = getUpgradeCost(def, upgradesRef.current[key])
      if (cost === null || coinsRef.current < cost) return
      setCoins(c => c - cost); setUpgrades(u => ({ ...u, [key]: u[key] + 1 }))
    }

    function handleVoiceCommand(text) {
      if (!text) return
      setHeard(text)
      if (/\bshop\b/.test(text)) setStoreOpen(o => !o)
      else if (/\bsteady\b/.test(text) && storeOpenRef.current) buyUpgrade('steadyAim')
      else if (/\bpower\b/.test(text) && storeOpenRef.current) buyUpgrade('powerDraw')
      else if (/\bbig\b/.test(text) && storeOpenRef.current) buyUpgrade('bigBow')
      else if (/\beagle\b/.test(text) && storeOpenRef.current) buyUpgrade('eagleEye')
      else if (/\bdraw\b/.test(text) && !isDrawnRef.current) triggerDraw()
      else if (/\bshoot\b|\bshot\b/.test(text) && isDrawnRef.current && !shootTimerRef.current) triggerShootCountdown()
    }

    gsap.set('.arrow-angle use', { opacity: 0 })
    gsap.set('#arc', { autoAlpha: 0 })

    methodsRef.current = { aimAtPoint, handleVoiceCommand }

    return () => clearInterval(shootTimerRef.current)
  }, [])

  return methodsRef.current
}
