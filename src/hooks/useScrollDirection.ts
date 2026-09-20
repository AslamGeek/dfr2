import { useState, useEffect, useCallback } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  initialVisible?: boolean;
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 8, initialVisible = true } = options;
  const [isVisible, setIsVisible] = useState<boolean>(initialVisible);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always keep bars visible when near the top of the page
      if (scrollY <= 25) {
        setIsVisible(true);
        lastScrollY = Math.max(0, scrollY);
        ticking = false;
        return;
      }

      const diff = scrollY - lastScrollY;

      // Only toggle visibility if scroll delta exceeds the threshold
      if (Math.abs(diff) >= threshold) {
        if (diff > 0) {
          // Scrolling down -> hide top and bottom bars
          setIsVisible(false);
        } else {
          // Scrolling up -> reveal top and bottom bars
          setIsVisible(true);
        }
        lastScrollY = Math.max(0, scrollY);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const showBars = useCallback(() => setIsVisible(true), []);
  const hideBars = useCallback(() => setIsVisible(false), []);

  return { isVisible, showBars, hideBars };
}
