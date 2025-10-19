"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type UnrevealTogetherProps = {
  children: React.ReactNode;
  selector: string; // targets inside to unreveal together
  outStart?: string;
  outEnd?: string;
  offsetOut?: number;
};

export default function UnrevealTogether({
  children,
  selector,
  outStart = "bottom 35%",
  outEnd = "bottom 15%",
  offsetOut = -150,
}: UnrevealTogetherProps) {
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tlOut = gsap.timeline({
        scrollTrigger: {
          id: "unreveal-together",
          trigger: container.current,
          start: outStart,
          end: outEnd,
          scrub: 0.5,
        },
      });

      tlOut.to(selector, {
        y: offsetOut,
        opacity: 0,
        stagger: 0, // unreveal all at once
        overwrite: "auto",
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      {children}
    </div>
  );
}

