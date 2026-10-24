import { useEffect, useRef } from 'react'

/**
 * How MU/TH/UR reaches the screens it doesn't own: each scene listens for its own screens by name,
 * and anything can call up the computer itself. A small event bus, so the scenes and the computer
 * don't need to know about each other.
 */
export type ScreenId =
  | 'map'
  | `personnel:${number}`
  | 'log:games'
  | 'log:music'
  | 'log:movies'
  | 'words:coworkers'
  | 'words:clients'

const bus = new EventTarget()

/** Calls `handler` with each event of `type`, always the latest `handler` passed. */
function useBus<T>(type: string, handler: (detail: T) => void) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })
  useEffect(() => {
    const on = (e: Event) => latest.current((e as CustomEvent<T>).detail)
    bus.addEventListener(type, on)
    return () => bus.removeEventListener(type, on)
  }, [type])
}

/** Switches to a scene's screen — a personnel file, a recreation log, the survey map. */
export function openScreen(id: ScreenId) {
  bus.dispatchEvent(new CustomEvent<ScreenId>('screen', { detail: id }))
}

/** For a scene: runs `handler` whenever a screen is asked for, to pick out its own. */
export const useScreens = (handler: (id: ScreenId) => void) => useBus('screen', handler)

/** Switches off whatever scene screen is up — on the way to MU/TH/UR (/ from any screen). */
export function closeScreens() {
  bus.dispatchEvent(new CustomEvent('close'))
}

/** For a screen: runs `handler` when the screens are told to switch off. */
export const useCloseScreens = (handler: () => void) => useBus('close', handler)

/** Whether the emergency destruct system is counting down, kept by the sequence itself. */
let armed = false
export const destructArmed = () => armed
export const setDestructArmed = (on: boolean) => {
  armed = on
}

/** Starts the emergency destruct sequence, or aborts it. */
export function destruct(on: boolean) {
  bus.dispatchEvent(new CustomEvent<boolean>('destruct', { detail: on }))
}

/** For the sequence: runs `handler` with true to start, false to abort. */
export const useDestructCalls = (handler: (on: boolean) => void) => useBus('destruct', handler)

/** Brings up MU/TH/UR, with one of the skill files open if `group` names one. */
export function openMother(group?: string) {
  bus.dispatchEvent(new CustomEvent<string | undefined>('mother', { detail: group }))
}

/** For the computer's host: runs `handler` whenever something calls the computer up. */
export const useMotherCalls = (handler: (group?: string) => void) => useBus('mother', handler)
