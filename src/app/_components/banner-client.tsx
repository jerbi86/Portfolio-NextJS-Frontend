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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      // Mobile: group reveal
      // Group A: image + greeting + name + role (appears as soon as section enters view)
      // Group B: description + socials/resume/email (appears after a small scroll)
      gsap.set('.group-a, .group-b', { y: 20, autoAlpha: 0 });

      // Group A reveal: earlier start so it appears first
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'top 45%',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      }).to('.group-a', { y: 0, autoAlpha: 1, ease: 'none', duration: 1 });

      // Group B reveal: only after a tiny scroll movement, over a longer range for smoothness
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 10%',
          end: 'top 0%',
          scrub: 2,
          invalidateOnRefresh: true,
        },
      })
        .to('.group-b', { y: 0, autoAlpha: 1, ease: 'none', duration: 1 });
      return;
    }
    // Desktop: keep original staggered reveal with scrub
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      // Mobile: grouped fade-out matching grouped reveal
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'bottom 65%',
          end: 'bottom 35%',
          scrub: 0.3,
        },
      })
        // Fade both groups within the same scroll span to ensure neither is skipped
        .to('.group-a', { y: -20, autoAlpha: 0, ease: 'none', duration: 1 }, 0)
        .to('.group-b', { y: -20, autoAlpha: 0, ease: 'none', duration: 1 }, 0.05);
      return;
    }
    // Desktop: original unreveal with scrub
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
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center" ref={containerRef}>
      <div className="relative md:min-h-[65vh] order-2 md:order-1">
        <div className="mx-auto md:mx-0 max-w-2xl md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
          <p className="text-white/70 text-base sm:text-2xl mb-1.5 sm:mb-2 font-bold slide-up-and-fade group-a opacity-0 md:opacity-100 translate-y-5 md:translate-y-0">Hello, I'm</p>
          <div className="slide-up-and-fade group-a opacity-0 md:opacity-100 translate-y-5 md:translate-y-0">
            <AnimatedGradientText className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
              {fullName || 'Your Name'}
            </AnimatedGradientText>
          </div>
          <p className="mt-2 sm:mt-3 text-white/80 text-2xl sm:text-3xl font-bold slide-up-and-fade group-a opacity-0 md:opacity-100 translate-y-5 md:translate-y-0">
            {role ?? 'Your current role'}
          </p>
          <div className="slide-up-and-fade group-b opacity-0 md:opacity-100 translate-y-5 md:translate-y-0">
            <p className="mt-4 sm:mt-5 text-white/70 text-base sm:text-2xl max-w-prose">
              {shortDescription ?? 'Short description about you.'}
            </p>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 slide-up-and-fade group-b opacity-0 md:opacity-100 translate-y-5 md:translate-y-0">
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
                className="inline-flex px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white hover:shadow-lg hover:shadow-gradient-primary/50 transition-all text-base sm:text-xl font-bold items-center gap-2"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                Download Resume
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="px-4 py-2 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition border border-white/10 md:hidden text-sm"
              >
                {email}
              </a>
            )}
          </div>
        </div>
      </div>

  <div className="flex justify-center md:justify-end relative slide-up-and-fade group-a opacity-0 md:opacity-100 translate-y-5 md:translate-y-0 order-1 md:order-2">
        {imageSrc ? (
          <BackgroundGradient
            containerClassName="w-full max-w-[250px] sm:max-w-sm"
            className="rounded-[2rem] bg-background overflow-hidden"
          >
            <Image
              src={imageSrc}
              width={imageWidth}
              height={imageHeight}
              alt={"Profile image"}
              className="w-full h-auto object-contain"
              priority
              unoptimized
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

