'use client'

import { useState, useEffect, useCallback } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollHeight > 0) {
      setProgress(scrollPosition / scrollHeight);
    } else {
      setProgress(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial call
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return progress;
}
