import {useEffect, useRef} from 'react';

type RealtimeEventType =
  | 'ready'
  | 'ping'
  | 'customers:created'
  | 'orders:created'
  | 'inventory:updated';

type UseRealtimeOptions = {
  onEvent: (type: RealtimeEventType, data: any) => void;
  enabled?: boolean;
};

export function useRealtime({onEvent, enabled = true}: UseRealtimeOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    const es = new EventSource('/api/events');

    const handle = (type: RealtimeEventType) => (e: MessageEvent) => {
      let data: any = null;
      try {
        data = e.data ? JSON.parse(e.data) : null;
      } catch {
        data = e.data;
      }
      onEventRef.current(type, data);
    };

    es.addEventListener('ready', handle('ready'));
    es.addEventListener('ping', handle('ping'));
    es.addEventListener('customers:created', handle('customers:created'));
    es.addEventListener('orders:created', handle('orders:created'));
    es.addEventListener('inventory:updated', handle('inventory:updated'));

    es.onerror = () => {
      // Browser auto-reconnects EventSource; keep silent.
    };

    return () => {
      es.close();
    };
  }, [enabled]);
}

