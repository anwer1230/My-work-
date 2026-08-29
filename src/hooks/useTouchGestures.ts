import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for touch Long-Press detection with haptic feedback
 */
export function useLongPress(
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  onClick?: (e: React.TouchEvent | React.MouseEvent) => void,
  ms: number = 450
) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<number | null>(null);
  const isTriggeredRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    isTriggeredRef.current = false;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { x: clientX, y: clientY };

    timerRef.current = window.setTimeout(() => {
      isTriggeredRef.current = true;
      setIsLongPressing(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
      onLongPress(e);
    }, ms);
  };

  const move = (e: React.TouchEvent | React.MouseEvent) => {
    if (!timerRef.current || !startPosRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = Math.abs(clientX - startPosRef.current.x);
    const dy = Math.abs(clientY - startPosRef.current.y);

    if (dx > 10 || dy > 10) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const clear = (e: React.TouchEvent | React.MouseEvent, shouldTriggerClick: boolean = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsLongPressing(false);
    if (shouldTriggerClick && !isTriggeredRef.current && onClick) {
      onClick(e);
    }
    startPosRef.current = null;
  };

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: (e: React.MouseEvent) => clear(e, true),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
  };
}

/**
 * Hook for Swipe-to-Reply on message bubbles (Telegram DrKLO standard)
 */
export function useSwipeToReply(onReplyTriggered: () => void, isRtl: boolean = false) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    hasTriggeredHaptic.current = false;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startXRef.current;
    const deltaY = currentY - startYRef.current;

    // Detect if horizontal gesture vs vertical scrolling
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      // Calculate directional resistance
      const directionFactor = isRtl ? 1 : -1;
      const rawSwipe = deltaX * directionFactor;

      if (rawSwipe > 0) {
        // Logarithmic damping resistance
        const damped = Math.min(rawSwipe * 0.55, 75);
        setSwipeOffset(damped * directionFactor);

        if (damped >= 40 && !hasTriggeredHaptic.current) {
          hasTriggeredHaptic.current = true;
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate(25);
            } catch {}
          }
        }
      } else {
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) >= 38) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
      onReplyTriggered();
    }

    setIsSwiping(false);
    setSwipeOffset(0);
    isHorizontalSwipe.current = null;
    hasTriggeredHaptic.current = false;
  };

  return {
    swipeOffset,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * Hook for Swipe Actions on Chat List Items (Telegram Android ItemTouchHelper / SwipeHelper)
 * Supports swiping left or right to reveal action buttons or auto-trigger on full swipe
 */
export function useChatSwipeActions({
  onArchive,
  onPin,
  onMute,
  onDelete,
  isRtl = false,
}: {
  onArchive?: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  isRtl?: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalRef = useRef<boolean | null>(null);
  const hapticSnappedRef = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalRef.current = null;
    hapticSnappedRef.current = false;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - startXRef.current;
    const dy = currentY - startYRef.current;

    if (isHorizontalRef.current === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalRef.current) {
      // Swipe range clamp
      const clamped = Math.max(-160, Math.min(160, dx));
      setOffset(clamped);

      if (Math.abs(clamped) > 70 && !hapticSnappedRef.current) {
        hapticSnappedRef.current = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(20);
          } catch {}
        }
      } else if (Math.abs(clamped) < 70) {
        hapticSnappedRef.current = false;
      }
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    isHorizontalRef.current = null;

    // Full swipe threshold activation (>120px)
    if (offset < -110) {
      if (isRtl ? onPin : onArchive) {
        (isRtl ? onPin : onArchive)?.();
      }
    } else if (offset > 110) {
      if (isRtl ? onArchive : onPin) {
        (isRtl ? onArchive : onPin)?.();
      }
    }

    // Spring back to 0
    setOffset(0);
  };

  return {
    offset,
    isDragging,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    resetOffset: () => setOffset(0),
  };
}

/**
 * Hook for Edge Swipe to open Navigation Drawer (Telegram Android DrawerLayout gesture)
 */
export function useEdgeSwipeDrawer(onOpenDrawer: () => void, isRtl: boolean = false) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const edgeThreshold = 35; // Pixels from edge

      if (isRtl) {
        if (touch.clientX >= window.innerWidth - edgeThreshold) {
          startXRef.current = touch.clientX;
          startYRef.current = touch.clientY;
        }
      } else {
        if (touch.clientX <= edgeThreshold) {
          startXRef.current = touch.clientX;
          startYRef.current = touch.clientY;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startXRef.current === null || startYRef.current === null) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startXRef.current;
      const dy = touch.clientY - startYRef.current;

      // Swiped inward with low vertical deviation
      if (Math.abs(dy) < 80) {
        if (isRtl ? dx < -40 : dx > 40) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
              navigator.vibrate(20);
            } catch {}
          }
          onOpenDrawer();
        }
      }

      startXRef.current = null;
      startYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onOpenDrawer, isRtl]);
}

/**
 * Hook for Pull-to-Refresh on Chat List with Telegram spinner feedback
 */
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [pullProgress, setPullProgress] = useState(0); // 0 to 1
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const dy = currentY - startYRef.current;

    if (dy > 0) {
      const progress = Math.min(dy / 80, 1.2);
      setPullProgress(progress);
    } else {
      setPullProgress(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullProgress >= 0.9 && !isRefreshing) {
      setIsRefreshing(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(30);
        } catch {}
      }
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      setPullProgress(0);
    }
  };

  return {
    pullProgress,
    isRefreshing,
    pullHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
