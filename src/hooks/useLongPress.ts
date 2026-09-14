import React, { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
}: UseLongPressOptions) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const startPress = useCallback(
    (clientX: number, clientY: number) => {
      isLongPressRef.current = false;
      startPosRef.current = { x: clientX, y: clientY };
      setIsPressing(true);

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        setIsPressing(false);
        try {
          if ('vibrate' in navigator) {
            navigator.vibrate?.(50);
          }
        } catch {
          // ignore vibration errors
        }
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  }, []);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);

    if (!isLongPressRef.current && onClick) {
      onClick();
    }
    isLongPressRef.current = false;
  }, [onClick]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger on primary left click
      if (e.button !== 0) return;
      startPress(e.clientX, e.clientY);
    },
    [startPress]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      endPress();
    },
    [endPress]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      cancelPress();
    },
    [cancelPress]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 1) {
        cancelPress();
        return;
      }
      const touch = e.touches[0];
      startPress(touch.clientX, touch.clientY);
    },
    [startPress, cancelPress]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startPosRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dist = Math.hypot(
        touch.clientX - startPosRef.current.x,
        touch.clientY - startPosRef.current.y
      );
      // Cancel if user moved more than 10 pixels (scrolling)
      if (dist > 10) {
        cancelPress();
      }
    },
    [cancelPress]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      endPress();
    },
    [endPress]
  );

  const handleTouchCancel = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  return {
    isPressing,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      onContextMenu: (e: React.MouseEvent) => {
        // Prevent default context menu if long-press is active
        if (isLongPressRef.current) {
          e.preventDefault();
        }
      },
    },
  };
}
