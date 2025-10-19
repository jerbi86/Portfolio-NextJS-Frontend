"use client";

import { useCallback, useEffect, useMemo, useRef, useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { motion, useAnimationControls, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

type PageTransitionProps = {
  children: React.ReactNode;
};

// Tunable timings for the transition
const TRANSITION = {
  coverIn: 0.7, // grey layer covers screen
  swapGrey: 0.4, // grey exits while gradient enters
  swapGrad: 0.3, // slightly faster gradient entry
  revealGrad: 0.3, // slightly faster gradient reveal
  dwellMs: 220, // pause while fully covered before swap
};

type StartOptions = { href: string; replace?: boolean; scroll?: boolean; restoreTargetScroll?: boolean };

type PageTransitionAPI = {
  start: (opts: StartOptions) => Promise<void>;
};

const PageTransitionContext = createContext<PageTransitionAPI | null>(null);
export function usePageTransition(): PageTransitionAPI {
  const ctx = useContext(PageTransitionContext);
  if (!ctx) {
    throw new Error("usePageTransition must be used within PageTransition provider");
  }
  return ctx;
}

// Optional accessor: returns null when provider is not present
export function usePageTransitionOptional(): PageTransitionAPI | null {
  try {
    return useContext(PageTransitionContext);
  } catch {
    return null;
  }
}

// A global page transition overlay that runs on client navigations.
// Sequence:
// 1) Grey layer slides up to cover the page
// 2) Brief pause
// 3) Grey slides off while gradient layer slides in underneath to cover
// 4) Gradient continues up revealing new content
export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const firstLoadRef = useRef(true);
  const skipNextRef = useRef(false); // Skip effect when we drive transition ourselves
  const animatingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const popRestoreRef = useRef(false);

  const grey = useAnimationControls();
  const grad = useAnimationControls();

  const ease = useMemo(
    () => [0.22, 1, 0.36, 1] as [number, number, number, number],
    [],
  );

  // Ensure we control scroll restoration during transitions
  useEffect(() => {
    try {
      if ('scrollRestoration' in history) {
        const prev = (history as any).scrollRestoration;
        (history as any).scrollRestoration = 'manual';
        return () => { try { (history as any).scrollRestoration = prev || 'auto'; } catch {} };
      }
    } catch {}
  }, []);

  // Detect browser back/forward to restore scroll from storage even without our link flag
  useEffect(() => {
    const onPop = () => { popRestoreRef.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Continuously snapshot scroll position for the current route so it's accurate on refresh/return
  useEffect(() => {
    let raf = 0 as number | any;
    const readScroll = () => {
      try {
        // Do not overwrite the saved value while a restoration is pending
        if (sessionStorage.getItem('restore-scroll-target') === '1') return;
        const y = typeof window.scrollY === 'number'
          ? window.scrollY
          : (document.scrollingElement?.scrollTop || 0);
        sessionStorage.setItem(`scroll:${pathname}`, String(y));
      } catch {}
    };
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(readScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    // Avoid taking an initial snapshot at mount to preserve the last saved value
    return () => {
      window.removeEventListener('scroll', onScroll as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  // On initial mount, restore saved scroll for this route (or hash target) if any
  useEffect(() => {
    (async () => {
      try {
        const initialHash = typeof window !== 'undefined' ? (window.location.hash || '') : '';
        const hashTarget = initialHash ? initialHash.replace(/^#/, '') : null;
        await waitForContentReady({ targetPath: pathname, restoreTargetScroll: !hashTarget, hashTarget });
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshScroll = () => {
    try {
      gsap.registerPlugin(ScrollTrigger);
      // Multiple passes to catch anchor jumps/layout shifts
      const run = () => {
        try { ScrollTrigger.refresh(); } catch {}
      };
      requestAnimationFrame(run);
      setTimeout(run, 60);
      setTimeout(run, 140);
    } catch {}
  };

  // Wait until the new route's content is painted and key assets are ready
  const waitForContentReady = useCallback(async (opts?: { targetPath?: string; restoreTargetScroll?: boolean; hashTarget?: string | null }) => {
    // If a targetPath is provided, ensure location changed before proceeding
    if (opts?.targetPath) {
      const target = opts.targetPath;
      const startTs = Date.now();
      while (Date.now() - startTs < 800) {
        try {
          if (window.location && window.location.pathname === target) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 16));
      }
    }
    const forceScrollTo = async (y: number) => {
      // Try aggressively over a few frames to combat layout shifts or other code
      const apply = (val: number) => {
        try {
          (window as any).scrollTo({ top: val, behavior: 'instant' });
        } catch {
          window.scrollTo(0, val);
        }
        try {
          // Some engines still use these fallbacks
          (document.scrollingElement || document.documentElement).scrollTop = val;
          document.body.scrollTop = val;
        } catch {}
      };
      apply(y);
      // Re-apply across several RAFs to ensure it sticks
      for (let i = 0; i < 6; i++) {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        const cur = typeof window.scrollY === 'number' ? window.scrollY : (document.scrollingElement?.scrollTop || 0);
        if (Math.abs(cur - y) <= 2) break;
        apply(y);
      }
    };
    // Yield to microtask queue
    await Promise.resolve();
    // Two RAFs to ensure the browser had a chance to paint new DOM
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    // If we need to restore scroll for the target path, do an early restore
    if (opts?.restoreTargetScroll) {
      const path = opts?.targetPath || window.location.pathname;
      try {
        const key = `scroll:${path}`;
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const y = Math.max(0, parseInt(raw, 10) || 0);
          await forceScrollTo(y);
        }
      } catch {}
    }

    // Wait for fonts if supported
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
  
    // If there's a hash target, wait until that anchor exists in the DOM
    let anchorEl: HTMLElement | null = null;
    const hashRaw = opts?.hashTarget ?? (typeof window !== 'undefined' ? (window.location.hash || '') : '');
    const hash = (hashRaw || '').replace(/^#/, '');
    if (hash) {
      for (let i = 0; i < 90; i++) { // ~1.5s @ 60fps
        try {
          anchorEl = (document.getElementById(hash) as HTMLElement) || (document.querySelector(`[name="${hash}"]`) as HTMLElement);
          if (anchorEl) break;
        } catch {}
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    }    }
    } catch {}

    // If there's a hash target, wait until that anchor exists in the DOM
    let anchorEl: HTMLElement | null = null;
    const hashRaw = opts?.hashTarget ?? (typeof window !== 'undefined' ? (window.location.hash || '') : '');
    const hash = (hashRaw || '').replace(/^#/, '');
    if (hash) {
      for (let i = 0; i < 90; i++) { // ~1.5s @ 60fps
        try {
          anchorEl = (document.getElementById(hash) as HTMLElement) || (document.querySelector(`[name="${hash}"]`) as HTMLElement);
          if (anchorEl) break;
        } catch {}
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }
    }

    // Wait for above-the-fold images within the new content, with timeout safety
    const container = contentRef.current;
    if (container) {
      const imgs = Array.from(container.querySelectorAll<HTMLImageElement>("img")).filter((img) => !img.complete);

      if (imgs.length > 0) {
        await new Promise<void>((resolve) => {
          let resolved = false;
          const done = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };

          const timeout = setTimeout(done, 900); // cap wait to avoid laggy feel

          let remaining = imgs.length;
          const onLoad = () => {
            remaining -= 1;
            if (remaining <= 0) {
              clearTimeout(timeout);
              done();
            }
          };

          imgs.forEach((img) => {
            if (img.complete) {
              onLoad();
              return;
            }
            const off = () => {
              img.removeEventListener("load", onLoad);
              img.removeEventListener("error", onLoad);
            };
            img.addEventListener("load", () => {
              off();
              onLoad();
            });
            img.addEventListener("error", () => {
              off();
              onLoad();
            });
          });
        });
      }
    }

    // Additionally wait for inline CSS background images (e.g., style.backgroundImage)
    try {
      const elementsWithBg = Array.from(container.querySelectorAll<HTMLElement>("*[style*='background-image']"));
      const bgUrls = new Set<string>();
      const urlRe = /url\((?:\"|\')?([^\)\"\']+)(?:\"|\')?\)/g;
      for (const el of elementsWithBg) {
        const bg = el.style.backgroundImage || "";
        let m: RegExpExecArray | null;
        while ((m = urlRe.exec(bg))) {
          const url = m[1];
          if (url && !url.startsWith("data:")) bgUrls.add(url);
        }
      }
      if (bgUrls.size > 0) {
        await new Promise<void>((resolve) => {
          let remaining = bgUrls.size;
          let done = false;
          const finish = () => { if (!done) { done = true; resolve(); } };
          const timeout = setTimeout(finish, 1000);
          const onAny = () => { remaining -= 1; if (remaining <= 0) { clearTimeout(timeout); finish(); } };
          bgUrls.forEach((u) => {
            try {
              const im = new Image();
              im.onload = onAny;
              im.onerror = onAny;
              im.src = u;
            } catch { onAny(); }
          });
        });
      }
    } catch {}

    // If there's a hash target, prefer scrolling to that anchor rather than restoring last position
    const hash2 = (opts?.hashTarget ?? (typeof window !== 'undefined' ? (window.location.hash || '') : '')).replace(/^#/, '');
    if (hash2) {
      try {
      } catch {}
    }
    if (hash2) {
      try {
        const el = anchorEl || document.getElementById(hash2) || document.querySelector(`[name="${hash2}"]`);
        if (el) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          let offset = 0;
          try {
            const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--anchor-offset');
            const parsed = parseInt(cssVar, 10);
            if (!Number.isNaN(parsed)) offset = parsed;
          } catch {}
          try {
            if (offset === 0) {
              const nav = document.querySelector('div.fixed.top-0') as HTMLElement | null;
              if (nav) offset = Math.max(offset, nav.getBoundingClientRect().height || 0);
            }
          } catch {}
          if (offset === 0) offset = 96;
          const y = Math.max(0, (window.scrollY || 0) + rect.top - offset);
          await forceScrollTo(y);
        }
      } catch {}
    }

    // Optionally restore saved scroll again (after images) to account for layout shifts
    if (!hash && opts?.restoreTargetScroll) {
      const path = opts?.targetPath || window.location.pathname;
      try {
        const key = `scroll:${path}`;
        const raw = sessionStorage.getItem(key);
        if (raw) {
          const y = Math.max(0, parseInt(raw, 10) || 0);
          await forceScrollTo(y);
          sessionStorage.removeItem(key);
        }
      } catch {}
    }
  }, []);

  const start = useCallback(async ({ href, replace, scroll, restoreTargetScroll }: StartOptions) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    skipNextRef.current = true; // prevent effect on pathname
    setIsAnimating(true);

    // Parse target path and hash
    const [rawPath, hashPart] = href.split("#");
    const targetPath = rawPath || "/";

    // Save the current page scroll position (origin) defensively
    try {
      const originPath = window.location.pathname;
      const y = typeof window.scrollY === 'number' ? window.scrollY : (document.scrollingElement?.scrollTop || 0);
      sessionStorage.setItem(`scroll:${originPath}`, String(y));
    } catch {}

    await Promise.all([
      grey.set({ y: "100%" }),
      grad.set({ y: "100%" }),
    ]);

    // Cover with grey before navigation
    await grey.start({ y: "0%", transition: { duration: TRANSITION.coverIn, ease } });

    await new Promise((r) => setTimeout(r, TRANSITION.dwellMs));

    // Navigate while covered
    try {
      if (replace) router.replace(href, { scroll });
      else router.push(href, { scroll });
    } catch {}

    // Ensure new content is painted and ready before reveal animations
    await waitForContentReady({ targetPath, restoreTargetScroll: !!(scroll === false && restoreTargetScroll) && !hashPart, hashTarget: hashPart || null });
    try { sessionStorage.removeItem('restore-scroll-target'); } catch {}

    // Swap: grey exits, gradient enters
    await Promise.all([
      grey.start({ y: "-100%", transition: { duration: TRANSITION.swapGrey, ease } }),
      grad.start({ y: "0%", transition: { duration: TRANSITION.swapGrad, ease } }),
    ]);

    // Reveal
    await grad.start({ y: "-100%", transition: { duration: TRANSITION.revealGrad, ease } });

    setIsAnimating(false);
    animatingRef.current = false;
    refreshScroll();
    // Allow effect to run for future non-programmatic navigations
    // Give one tick to avoid racing the effect
    setTimeout(() => {
      skipNextRef.current = false;
    }, 0);
  }, [ease, grad, grey, router, waitForContentReady]);

  useEffect(() => {
    // Skip first mount; the layout has a dedicated initial preloader
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }

    if (skipNextRef.current) {
      return; // controlled by start()
    }

    let cancelled = false;

    const run = async () => {
      setIsAnimating(true);
      await Promise.all([
        grey.set({ y: "100%" }),
        grad.set({ y: "100%" }),
      ]);

      // Cover with grey
      await grey.start({ y: "0%", transition: { duration: TRANSITION.coverIn, ease } });

      // Brief dwell while we sync, then wait until content is really ready
      await new Promise((r) => setTimeout(r, TRANSITION.dwellMs));

      // Only restore scroll if a flag was set by a triggering link (and no hash target)
      let shouldRestore = false;
      try { shouldRestore = sessionStorage.getItem('restore-scroll-target') === '1'; } catch {}
      try {
        const saved = sessionStorage.getItem(`scroll:${pathname}`);
        if (saved != null) shouldRestore = true;
      } catch {}
      const currentHash = typeof window !== 'undefined' ? (window.location.hash || '') : '';
      const hashTarget = currentHash ? currentHash.replace(/^#/, '') : null;
      if (popRestoreRef.current) {
        shouldRestore = true;
      }
      await waitForContentReady({ restoreTargetScroll: shouldRestore && !hashTarget, hashTarget });
      try { sessionStorage.removeItem('restore-scroll-target'); } catch {}
      popRestoreRef.current = false;

      // Swap: grey exits up, gradient enters to cover
      await Promise.all([
        grey.start({ y: "-100%", transition: { duration: TRANSITION.swapGrey, ease } }),
        grad.start({ y: "0%", transition: { duration: TRANSITION.swapGrad, ease } }),
      ]);

      // Reveal: gradient continues upward to uncover new content
      await grad.start({ y: "-100%", transition: { duration: TRANSITION.revealGrad, ease } });

      if (!cancelled) {
        setIsAnimating(false);
        // Refresh ScrollTrigger to ensure in-view animations compute correctly after route change
        refreshScroll();
      }
    };

    run();

    return () => {
      cancelled = true;
      grey.stop();
      grad.stop();
    };
    // Only when pathname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, waitForContentReady]);

  return (
    <PageTransitionContext.Provider value={{ start }}>
      {/* Content keyed by pathname to ensure fresh mount per page; exit is immediate to avoid flicker */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          ref={contentRef}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Full-screen overlay, above everything */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            key="page-transition-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="pointer-events-auto fixed inset-0 z-[100] overflow-hidden"
            aria-hidden
          >
            {/* Grey layer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={grey}
              style={{
                willChange: "transform",
              }}
              className="absolute inset-0 bg-neutral-800 z-20"
            />

            {/* Gradient layer using theme colors */}
            <motion.div
              initial={{ y: "100%" }}
              animate={grad}
              style={{
                willChange: "transform",
                backgroundImage:
                  "linear-gradient(135deg, var(--gradient-primary), var(--gradient-secondary), var(--gradient-tertiary))",
              }}
              className="absolute inset-0 z-10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
}


