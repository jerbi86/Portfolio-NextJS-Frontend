"use client";

import React from "react";
import { usePageTransition } from "./page-transition";

type TransitionLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  restoreTargetScroll?: boolean; // when true, restore saved scroll for target path
};

export default function TransitionLink({ href, replace, scroll, restoreTargetScroll, onClick, ...rest }: TransitionLinkProps) {
  const { start } = usePageTransition();

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
    e.preventDefault();
    try {
      // Save current page scroll before leaving so it can be restored later
      const originPath = window.location.pathname;
      sessionStorage.setItem(`scroll:${originPath}`, String(window.scrollY || 0));
      if (restoreTargetScroll) sessionStorage.setItem('restore-scroll-target', '1');
    } catch {}
    await start({ href, replace, scroll, restoreTargetScroll });
  };

  return <a href={href} onClick={handleClick} {...rest} />;
}
