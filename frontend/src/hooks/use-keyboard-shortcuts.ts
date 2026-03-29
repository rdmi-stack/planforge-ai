import { useEffect } from "react"

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      const shift = e.shiftKey
      const key = e.key.toLowerCase()

      let combo = ""
      if (meta) combo += "mod+"
      if (shift) combo += "shift+"
      combo += key

      const handler = shortcuts[combo]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
