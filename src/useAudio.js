import { useEffect, useRef } from 'react'
import { createModel } from 'vosk-browser'
import { PIVOT, VOSK_MODEL_URL, VOSK_GRAMMAR } from './constants'
import { detectPitch } from './utils'

export default function useAudio({
  analyserRef, isDrawnRef,
  setStatus, setHeard,
  onAimAtPoint, onVoiceCommand,
}) {
  const audioContextRef = useRef(null)
  const recognizerRef = useRef(null)
  const processorRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    function startPitchLoop() {
      function loop() {
        rafRef.current = requestAnimationFrame(loop)
        if (!isDrawnRef.current || !analyserRef.current) return
        const freq = detectPitch(analyserRef.current)
        if (freq < 0) return
        const t = Math.max(0, Math.min(1, (freq - 80) / 320))
        const y = PIVOT.y + 120 - t * 240
        onAimAtPoint({ x: PIVOT.x - 80, y })
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    async function setup() {
      try {
        const [model, stream] = await Promise.all([
          createModel(VOSK_MODEL_URL),
          navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
        ])

        const ctx = new AudioContext()
        if (ctx.state === 'suspended') await ctx.resume()
        audioContextRef.current = ctx

        const recognizer = new model.KaldiRecognizer(ctx.sampleRate, VOSK_GRAMMAR)
        recognizer.setWords(true)
        recognizerRef.current = recognizer

        recognizer.on('result', (msg) => {
          const text = (msg.result?.text || '').toLowerCase().trim()
          if (text) onVoiceCommand(text)
        })

        recognizer.on('partialresult', (msg) => {
          const partial = (msg.result?.partial || '').toLowerCase().trim()
          if (partial) setHeard(partial)
        })

        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        analyserRef.current = analyser

        const processor = ctx.createScriptProcessor(4096, 1, 1)
        processorRef.current = processor
        processor.onaudioprocess = (e) => {
          recognizer.acceptWaveform(e.inputBuffer)
        }
        source.connect(processor)
        processor.connect(ctx.destination)

        startPitchLoop()
        setStatus("Say 'draw' to aim")
      } catch (err) {
        console.error('Audio setup failed:', err)
        setStatus('Speech model or microphone failed')
      }
    }

    setup()

    return () => {
      cancelAnimationFrame(rafRef.current)
      processorRef.current?.disconnect()
      recognizerRef.current?.remove()
      audioContextRef.current?.close()
    }
  }, [])
}
