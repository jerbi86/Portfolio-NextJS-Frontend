'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ExperienceItem = {
  id: number;
  company: string;
  role: string;
  startDate: string;
  finishDate: string | null;
  description: string | null;
  city?: string | null;
  country?: string | null;
  companyLink?: string | null;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  } catch {
    return iso as any;
  }
}

function areSameMonth(startDate: string, endDate: string | null) {
  if (!endDate) return false;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  } catch {
    return false;
  }
}

interface ExperienceClientProps { items: ExperienceItem[] }

export default function ExperienceClient({ items }: ExperienceClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal items as they enter
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
          end: 'bottom 50%',
          toggleActions: 'restart none none reverse',
          scrub: 1,
        },
      });

      tl.from('.experience-item', {
        y: 50,
        opacity: 0,
        stagger: 0.15,
      });
    },
    { scope: containerRef },
  );

  // Unreveal entire section together near the end
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

      tl.to(containerRef.current, {
        y: -150,
        autoAlpha: 0,
      });
    },
    { scope: containerRef },
  );

  return (
    <div className="relative mt-10" ref={containerRef}>
      {/* Timeline line */}
      <div className="hidden md:block absolute left-[162px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-gradient-primary via-gradient-secondary to-gradient-tertiary" />

      <div className="space-y-8">
        {items.map((exp) => (
          <div key={exp.id} className="experience-item relative">
            {/* Date on the left - hidden on mobile */}
            <div className="hidden md:block absolute left-0 top-8 w-[140px] text-right pr-6">
              {areSameMonth(exp.startDate, exp.finishDate) ? (
                <p className="text-white/90 text-xl font-bold whitespace-nowrap">{formatDate(exp.startDate)}</p>
              ) : (
                <>
                  <p className="text-white/90 text-xl font-bold whitespace-nowrap">{formatDate(exp.startDate)}</p>
                  <p className="text-white/70 text-base font-bold">to</p>
                  <p className="text-white/90 text-xl font-bold whitespace-nowrap">{exp.finishDate ? formatDate(exp.finishDate) : 'Present'}</p>
                </>
              )}
            </div>

            {/* Timeline dot */}
            <div className="hidden md:block absolute left-[154px] top-8 w-4 h-4 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary ring-4 ring-background z-10" />

            {/* Content card */}
            <div className="md:ml-[186px] relative group">
              <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gradient-primary/50 transition-all duration-300">
                {/* Gradient accent on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gradient-primary/10 to-gradient-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex-1">
                      {exp.companyLink ? (
                        <a href={exp.companyLink} target="_blank" rel="noopener noreferrer" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                          {exp.company}
                        </a>
                      ) : (
                        <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
                          {exp.company}
                        </h3>
                      )}
                      <p className="text-xl text-white font-semibold mt-1">{exp.role}</p>

                      {/* Date badge - mobile */}
                      <div className="md:hidden flex items-center gap-2 px-4 py-2 mt-3 rounded-full bg-gradient-to-r from-gradient-primary/20 to-gradient-secondary/20 border border-gradient-primary/30 w-fit">
                        <svg className="w-4 h-4 text-gradient-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-white/90 text-sm font-medium whitespace-nowrap">
                          {formatDate(exp.startDate)} — {exp.finishDate ? formatDate(exp.finishDate) : 'Present'}
                        </span>
                      </div>

                      {[exp.city, exp.country].filter(Boolean).length > 0 && (
                        <p className="text-white/50 text-sm mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {[exp.city, exp.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {exp.description && (
                    <div
                      className="prose prose-invert max-w-none text-white/70 prose-ul:space-y-2 prose-li:text-white/70 prose-strong:text-white prose-strong:font-bold"
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

