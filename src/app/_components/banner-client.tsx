'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { GradientIconLink } from "@/components/ui/gradient-icon-link";
import Image from "next/image";
import { Github, Linkedin, Download } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  fullName: string;
  role?: string | null;
  shortDescription?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
  resumeUrl?: string | null;
  imageSrc?: string;
  imageWidth: number;
  imageHeight: number;
};

export default function BannerClient({ fullName, role, shortDescription, email, github, linkedin, resumeUrl, imageSrc, imageWidth, imageHeight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal child blocks
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        end: 'bottom 60%',
        toggleActions: 'restart none none reverse',
        scrub: 1,
      },
    });
    tl.from('.slide-up-and-fade', { y: 50, opacity: 0, stagger: 0.12 });
  }, { scope: containerRef });

  // Unreveal whole hero grid together
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'bottom 55%',
        end: 'bottom 30%',
        scrub: 1,
      },
    });
    tl.to(containerRef.current, { y: -120, autoAlpha: 0 });
  }, { scope: containerRef });

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center" ref={containerRef}>
      <div className="relative md:min-h-[65vh]">
        <div className="mx-auto md:mx-0 max-w-2xl md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
          <p className="text-white/70 text-xl sm:text-2xl mb-2 font-bold slide-up-and-fade">Hello, I'm</p>
          <div className="slide-up-and-fade">
            <AnimatedGradientText className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
              {fullName || 'Your Name'}
            </AnimatedGradientText>
          </div>
          <p className="mt-3 text-white/80 text-3xl font-bold slide-up-and-fade">
            {role ?? 'Your current role'}
          </p>
          <div className="slide-up-and-fade">
            <p className="mt-5 text-white/70 text-xl sm:text-2xl max-w-prose">
              {shortDescription ?? 'Short description about you.'}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 slide-up-and-fade">
            {github && (
              <GradientIconLink href={github} label="GitHub">
                <Github strokeWidth={1.5} />
              </GradientIconLink>
            )}
            {linkedin && (
              <GradientIconLink href={linkedin} label="LinkedIn">
                <Linkedin strokeWidth={1.5} />
              </GradientIconLink>
            )}
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white hover:shadow-lg hover:shadow-gradient-primary/50 transition-all text-xl font-bold flex items-center gap-2"
              >
                <Download className="w-5 h-5" strokeWidth={2.5} />
                Download Resume
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="px-6 py-3 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition border border-white/10 md:hidden text-lg"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-end relative slide-up-and-fade">
        {imageSrc ? (
          <BackgroundGradient
            containerClassName="w-full max-w-xs sm:max-w-sm"
            className="rounded-[2rem] bg-background overflow-hidden"
          >
            <Image
              src={imageSrc}
              width={imageWidth}
              height={imageHeight}
              alt={"Profile image"}
              className="w-full h-auto object-contain"
              priority
            />
          </BackgroundGradient>
        ) : (
          <div className="w-full max-w-sm sm:max-w-md rounded-3xl p-6 text-center text-white/80">
            <p className="text-base">No image available.</p>
            <p className="text-sm text-white/50 mt-1">
              Ensure NEXT_PUBLIC_API_URL is set and Strapi is running.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

