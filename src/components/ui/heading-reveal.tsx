"use client";

import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type HeadingRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export default function HeadingReveal({ children, className }: HeadingRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 70%",
          end: "top 55%",
          toggleActions: "restart none none reverse",
          scrub: 1,
        },
      });

      tl.from(ref.current, { y: 40, autoAlpha: 0 });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

