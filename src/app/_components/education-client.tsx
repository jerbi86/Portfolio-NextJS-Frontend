'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type EducationItem = {
  id: number;
  school: string;
  grade: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  city?: string | null;
  country?: string | null;
  schoolLink?: string | null;
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

interface EducationClientProps { items: EducationItem[] }

export default function EducationClient({ items }: EducationClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal: stagger each item in
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
      tl.from('.education-item', { y: 50, opacity: 0, stagger: 0.15 });
    },
    { scope: containerRef },
  );

  // Unreveal: fade/translate entire section together
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
    <div className="space-y-8 mt-10" ref={containerRef}>
      {items.map((ed) => (
        <article key={ed.id} className="education-item">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
            <div className="min-w-0">
              {ed.schoolLink ? (
                <a href={ed.schoolLink || undefined} target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold text-white hover:text-white/90 transition-colors">
                  {ed.school}
                </a>
              ) : (
                <h3 className="text-xl sm:text-2xl font-bold text-white">{ed.school}</h3>
              )}
              {ed.grade && (
                <p className="text-white/80 text-lg mt-1">{ed.grade}</p>
              )}
              {[ed.city, ed.country].filter(Boolean).length > 0 && (
                <p className="text-white/50 text-sm mt-1">{[ed.city, ed.country].filter(Boolean).join(', ')}</p>
              )}
            </div>
            <div className="text-white/60 text-sm whitespace-nowrap">
              {formatDate(ed.startDate)} — {ed.endDate ? formatDate(ed.endDate) : 'Present'}
            </div>
          </div>
          {ed.description && (
            <div className="prose prose-invert max-w-none text-white/80 mt-4" dangerouslySetInnerHTML={{ __html: ed.description }} />
          )}
          <div className="mt-6 h-px w-full bg-white/10" />
        </article>
      ))}
    </div>
  );
}

