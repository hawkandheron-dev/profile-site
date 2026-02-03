/**
 * Hook to detect mobile viewport and orientation
 * Uses matchMedia for reliable detection with SSR safety
 */

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}
