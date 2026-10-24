import { useEffect, useRef, useState } from 'react'
import { useMotionOK } from '@/lib/motion'
import { destruct, setDestructArmed, useDestructCalls } from '@/lib/ship'
import { terminal } from '@/lib/sound'

/** How long the countdown runs, in seconds. The film gives Ripley ten minutes; a visitor gets one. */
const COUNTDOWN = 60

type Phase = 'idle' | 'armed' | 'aborted' | 'blast' | 'lost' | 'waking'

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/**
 * The emergency destruct system, from the end of the film, started from MU/TH/UR ("self
 * destruct"). Every screen turns amber, the page pulses with warning light, a klaxon wails, and a
 * countdown runs at the foot of the page with a way to abort it, which Ripley never got. Left to
 * run out: a blast, a white-out, the wreck, and then the ship starts over from the opening
 * credits. No flashing with reduced motion.
 */
export default function Destruct({ onReset }: { onReset: () => void }) {
  const motionOK = useMotionOK()
  const [phase, setPhase] = useState<Phase>('idle')
  const [left, setLeft] = useState(COUNTDOWN)
  const reset = useRef(onReset)
  useEffect(() => {
    reset.current = onReset
  })

  useDestructCalls((on) => {
    if (on && (phase === 'idle' || phase === 'aborted')) {
      setLeft(COUNTDOWN)
      setPhase('armed')
    } else if (!on && phase === 'armed') setPhase('aborted')
  })

  // The screens go amber while it's live, and the ship knows it's armed.
  useEffect(() => {
    const alert = phase === 'armed' || phase === 'blast' || phase === 'lost'
    setDestructArmed(phase === 'armed')
    if (alert) document.documentElement.dataset.alert = 'destruct'
    else delete document.documentElement.dataset.alert
  }, [phase])
  useEffect(
    () => () => {
      setDestructArmed(false)
      delete document.documentElement.dataset.alert
    },
    [],
  )

  // Counting down: the klaxon every other second, then every second for the last ten.
  useEffect(() => {
    if (phase !== 'armed') return
    const t = window.setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase])
  useEffect(() => {
    if (phase !== 'armed') return
    if (left <= 0) setPhase('blast')
    else if (left <= 10 || left % 2 === 0) terminal.alarm()
  }, [left, phase])

  // The blast, the wreck, then the ship wakes again from the top.
  useEffect(() => {
    const after = (ms: number, next: () => void) => {
      const t = window.setTimeout(next, ms)
      return () => clearTimeout(t)
    }
    if (phase === 'blast') {
      terminal.blast()
      return after(1600, () => setPhase('lost'))
    }
    if (phase === 'lost')
      return after(3800, () => {
        reset.current()
        setPhase('waking')
      })
    if (phase === 'waking') return after(1200, () => setPhase('idle'))
    if (phase === 'aborted') return after(2600, () => setPhase('idle'))
  }, [phase])

  return (
    <>
      {phase === 'armed' && <div aria-hidden className={`destruct-glow ${motionOK ? '' : 'destruct-glow-still'}`} />}

      {(phase === 'armed' || phase === 'aborted') && (
        <div role="alert" className="pointer-events-none fixed inset-x-0 bottom-[4.5rem] z-[999] flex justify-center px-4">
          <div className="crt-screen crt-box pointer-events-auto px-6 py-3 text-center uppercase">
            <div className="relative z-[1]">
              {phase === 'armed' ? (
                <>
                  <div className="text-[clamp(10px,0.9vw,13px)]">Emergency destruct system engaged</div>
                  <div className="mt-1 text-[clamp(22px,2.6vw,36px)] tabular-nums">T-minus {clock(left)}</div>
                  <button type="button" onClick={() => destruct(false)} className="crt-link mt-2 px-2 text-[clamp(10px,0.9vw,13px)] uppercase">
                    [ Abort ]
                  </button>
                </>
              ) : (
                <div className="text-[clamp(11px,1vw,14px)]">Destruct sequence aborted</div>
              )}
            </div>
          </div>
        </div>
      )}

      {(phase === 'blast' || phase === 'lost' || phase === 'waking') && (
        <div className={`crt-screen fixed inset-0 z-[1000] flex items-center justify-center rounded-none ${phase === 'waking' ? 'destruct-wake' : ''}`}>
          {phase === 'blast' && motionOK && <div aria-hidden className="destruct-flash absolute inset-0 z-[4]" />}
          {phase !== 'blast' && (
            <div role="status" className="relative z-[1] px-6 text-center text-[clamp(13px,1.4vw,20px)] leading-[2] uppercase">
              <div>The ship has been destroyed.</div>
              <div className="crt-dim">Rebooting . . .</div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
