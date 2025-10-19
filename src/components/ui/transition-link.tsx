"use client";

import React from "react";
import { usePageTransitionOptional } from "./page-transition";

type TransitionLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  restoreTargetScroll?: boolean; // when true, restore saved scroll for target path
  variant?: "default" | "project"; // project variant auto-handles home<->project scroll
};

export default function TransitionLink({ href, replace, scroll, restoreTargetScroll, variant = "default", onClick, ...rest }: TransitionLinkProps) {
  const ctx = usePageTransitionOptional();
  const start = ctx?.start;

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    // Only intercept left-click without modifier keys
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      rest.target === "_blank"
    ) {
      return;
    }
    // Only apply transition when provider is available (inside PageTransition)
    if (!start) return;
    e.preventDefault();
    try {
      // Save current page scroll before leaving so it can be restored later
      const originPath = window.location.pathname;
      sessionStorage.setItem(`scroll:${originPath}`, String(window.scrollY || 0));
      // Auto-flag restoration for project variant when returning to home
      const isHomeTarget = href === "/" || href.startsWith("/#");
      const shouldAutoRestore = variant === "project" && isHomeTarget;
      const shouldRestore = restoreTargetScroll || shouldAutoRestore;
      if (shouldRestore) sessionStorage.setItem('restore-scroll-target', '1');

      // Kick off transition with sensible defaults for project variant
      const effectiveScroll = (variant === "project" && isHomeTarget) ? false : scroll;
      await start({ href, replace, scroll: effectiveScroll, restoreTargetScroll: shouldRestore });
    } catch {}
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
