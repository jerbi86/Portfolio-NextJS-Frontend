"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  selector?: string; // elements to animate inside the scope
  inStart?: string;
  inEnd?: string;
  outStart?: string;
  outEnd?: string;
  staggerIn?: number;
  staggerOut?: number;
  offsetIn?: number; // initial Y offset for 'from'
  offsetOut?: number; // target Y offset for 'to' when exiting
};

export default function SectionReveal({
  children,
  className,
  selector = ".slide-up-and-fade",
  inStart = "top 70%",
  inEnd = "bottom bottom",
  outStart = "bottom 50%",
  outEnd = "bottom 10%",
  staggerIn = 0.05,
  staggerOut = 0.02,
  offsetIn = 150,
  offsetOut = -150,
}: SectionRevealProps) {
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tlIn = gsap.timeline({
        scrollTrigger: {
          id: "section-reveal-in",
          trigger: container.current,
          start: inStart,
          end: inEnd,
          scrub: 0.5,
        },
      });

      tlIn.from(selector, {
        y: offsetIn,
        opacity: 0,
        stagger: staggerIn,
      });
    },
    { scope: container },
  );

  useGSAP(
    () => {
      const tlOut = gsap.timeline({
        scrollTrigger: {
          id: "section-reveal-out",
          trigger: container.current,
          start: outStart,
          end: outEnd,
          scrub: 0.5,
        },
      });

      tlOut.to(selector, {
        y: offsetOut,
        opacity: 0,
        stagger: staggerOut,
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className={cn(className)}>
      {children}
    </div>
  );
}
