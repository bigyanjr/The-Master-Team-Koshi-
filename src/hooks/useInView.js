import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref to attach to an element and a boolean that tracks whether
 * that element is in the viewport.
 *
 * By default (`once: true`) it triggers a single time and then stops
 * watching. Pass `once: false` to have it flip back to false when the
 * element scrolls out of view, so a scroll-in animation can replay every
 * time the user scrolls back to it.
 */
export default function useInView({ threshold = 0.2, once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) observer.disconnect();
      } else if (!once) {
        setInView(false);
      }
    }, { threshold });

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return [ref, inView];
}
