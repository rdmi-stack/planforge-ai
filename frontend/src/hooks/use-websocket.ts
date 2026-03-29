import { useEffect, useRef, useCallback, useState } from "react"

type UseWebSocketOptions = {
  url: string
  onMessage?: (data: unknown) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnect?: boolean
  reconnectInterval?: number
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnect = true,
  reconnectInterval = 3000,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<NodeJS.Timeout>(undefined)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setConnected(true)
      onOpen?.()
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch {
        onMessage?.(event.data)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      onClose?.()
      if (reconnect) {
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval)
      }
    }

    ws.onerror = (error) => {
      onError?.(error)
    }

    wsRef.current = ws
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current)
    wsRef.current?.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, send, disconnect }
}
