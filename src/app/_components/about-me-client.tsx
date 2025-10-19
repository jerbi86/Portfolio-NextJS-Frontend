'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  firstName: string;
  quote?: string | null;
  longDescription?: string | null;
};

export default function AboutMeClient({ firstName, quote, longDescription }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal all slide-up-and-fade elements
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 60%',
          toggleActions: 'restart none none reverse',
          scrub: 1,
        },
      });
      tl.from('.slide-up-and-fade', { y: 50, opacity: 0, stagger: 0.15 });
    },
    { scope: containerRef },
  );

  // Unreveal the whole section together
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom 50%',
          end: 'bottom 20%',
          scrub: 1,
        },
      });
      tl.to(containerRef.current, { y: -150, autoAlpha: 0 });
    },
    { scope: containerRef },
  );

  return (
    <div className="w-full max-w-7xl" ref={containerRef}>
      {quote ? (
        <blockquote className="text-center text-white/90 text-3xl sm:text-5xl font-extrabold italic tracking-tight slide-up-and-fade">
          “{quote}”
        </blockquote>
      ) : null}

      <div className="mt-10 slide-up-and-fade">
        <div className="flex items-center gap-4">
          <p className="text-sm sm:text-base uppercase tracking-widest text-white/60 whitespace-nowrap">This is me</p>
          <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary"></div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 id="about-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white slide-up-and-fade">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
              {firstName}
            </span>
          </h2>
        </div>
        <div>
          <p className="text-white/70 text-lg sm:text-xl leading-relaxed slide-up-and-fade">
            {longDescription ?? 'Long description about you.'}
          </p>
        </div>
      </div>
    </div>
  );
}

