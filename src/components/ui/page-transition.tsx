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

type StartOptions = { href: string; replace?: boolean; scroll?: boolean };

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

  const grey = useAnimationControls();
  const grad = useAnimationControls();

  const ease = useMemo(
    () => [0.22, 1, 0.36, 1] as [number, number, number, number],
    [],
  );

  const refreshScroll = () => {
    try {
      gsap.registerPlugin(ScrollTrigger);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } catch {}
  };

  const start = useCallback(async ({ href, replace, scroll }: StartOptions) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    skipNextRef.current = true; // prevent effect on pathname
    setIsAnimating(true);

    // Parse target path and hash
    const [rawPath] = href.split("#");
    const targetPath = rawPath || "/";

    // If leaving home, remember scroll position to restore later
    try {
      if (typeof window !== "undefined" && pathname === "/" && targetPath !== "/") {
        sessionStorage.setItem("home-scroll", String(window.scrollY || 0));
      }
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
      const scrollOpt = targetPath === "/" ? false : scroll;
      if (replace) router.replace(href, { scroll: scrollOpt });
      else router.push(href, { scroll: scrollOpt });
    } catch {}

    // Swap: grey exits, gradient enters
    await Promise.all([
      grey.start({ y: "-100%", transition: { duration: TRANSITION.swapGrey, ease } }),
      grad.start({ y: "0%", transition: { duration: TRANSITION.swapGrad, ease } }),
    ]);

    // Reveal
    await grad.start({ y: "-100%", transition: { duration: TRANSITION.revealGrad, ease } });

    setIsAnimating(false);
    animatingRef.current = false;
    // Restore home scroll if applicable, then refresh triggers
    try {
      if (typeof window !== "undefined" && targetPath === "/") {
        const saved = Number(sessionStorage.getItem("home-scroll") || 0);
        if (!Number.isNaN(saved)) {
          window.scrollTo(0, saved);
        }
      }
    } catch {}
    refreshScroll();
    // Allow effect to run for future non-programmatic navigations
    // Give one tick to avoid racing the effect
    setTimeout(() => {
      skipNextRef.current = false;
    }, 0);
  }, [ease, grad, grey, router]);

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

      // Brief dwell while route is stable under the cover
      await new Promise((r) => setTimeout(r, TRANSITION.dwellMs));

      // Swap: grey exits up, gradient enters to cover
      await Promise.all([
        grey.start({ y: "-100%", transition: { duration: TRANSITION.swapGrey, ease } }),
        grad.start({ y: "0%", transition: { duration: TRANSITION.swapGrad, ease } }),
      ]);

      // Reveal: gradient continues upward to uncover new content
      await grad.start({ y: "-100%", transition: { duration: TRANSITION.revealGrad, ease } });

      if (!cancelled) {
        setIsAnimating(false);
        // If we landed on home via non-programmatic nav (e.g., back button), try restoring saved scroll
        try {
          if (typeof window !== "undefined" && window.location.pathname === "/") {
            const saved = Number(sessionStorage.getItem("home-scroll") || 0);
            if (!Number.isNaN(saved)) {
              window.scrollTo(0, saved);
            }
          }
        } catch {}
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
  }, [pathname]);

  return (
    <PageTransitionContext.Provider value={{ start }}>
      {/* Content keyed by pathname to ensure fresh mount per page; exit is immediate to avoid flicker */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
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
