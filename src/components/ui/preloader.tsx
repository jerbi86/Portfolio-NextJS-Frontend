'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React, { useRef } from 'react';

gsap.registerPlugin(useGSAP);

type PreloaderProps = { active?: boolean; onDone?: () => void };

const Preloader = ({ active = true, onDone }: PreloaderProps) => {
  const preloaderRef = useRef<HTMLDivElement>(null);

  if (!active) return null;

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power1.inOut',
        },
      });

      tl.to('.name-text span', {
        y: 0,
        stagger: 0.05,
        duration: 0.2,
      });

      tl.to('.preloader-item', {
        delay: 1,
        y: '100%',
        duration: 0.5,
        stagger: 0.1,
      })
        .to('.name-text span', { autoAlpha: 0 }, '<0.5')
        .to(
          preloaderRef.current,
          {
            autoAlpha: 0,
            onComplete: () => onDone?.(),
          },
          '<1',
        );
    },
    { scope: preloaderRef },
  );

  return (
    <div className="fixed inset-0 z-[50] flex" ref={preloaderRef}>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>
            <div className="preloader-item h-full w-[10%] bg-black"></div>

            <p className="name-text flex text-[16vw] sm:text-[14vw] lg:text-[200px] font-anton text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none overflow-hidden text-white">
                <span className="inline-block translate-y-full">A</span>
                <span className="inline-block translate-y-full">H</span>
                <span className="inline-block translate-y-full">M</span>
                <span className="inline-block translate-y-full">E</span>
                <span className="inline-block translate-y-full">D</span>
                <span className="inline-block translate-y-full">&nbsp;</span>
                <span className="inline-block translate-y-full">J</span>
                <span className="inline-block translate-y-full">E</span>
                <span className="inline-block translate-y-full">R</span>
                <span className="inline-block translate-y-full">B</span>
                <span className="inline-block translate-y-full">I</span>
            </p>
        </div>
  );
};

export default Preloader;
