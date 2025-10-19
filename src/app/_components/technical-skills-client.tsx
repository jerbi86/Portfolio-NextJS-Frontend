'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ToolIcon = {
  iconName: string;
  iconData: string;
  width: number;
  height: number;
  isSvgEditable: boolean;
  isIconNameEditable: boolean;
};

type Tool = {
  id: number;
  name: string;
  icon: ToolIcon;
};

export type SkillGroup = {
  id: number;
  documentId: string;
  groupName: string;
  icon: ToolIcon;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  tools: Tool[];
};

interface TechnicalSkillsClientProps { groups: SkillGroup[] }

export default function TechnicalSkillsClient({ groups }: TechnicalSkillsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Reveal groups as they enter
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
      tl.from('.skill-group-item', { y: 50, opacity: 0, stagger: 0.15 });
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
      tl.to(containerRef.current, { y: -150, autoAlpha: 0 });
    },
    { scope: containerRef },
  );

  return (
    <div className="space-y-12 mt-10" ref={containerRef}>
      {groups.map((group) => (
        <div key={group.id} className="skill-group-item">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Left: group name + icon */}
            <div className="flex items-center gap-3 md:flex-col md:items-start md:w-[250px] flex-shrink-0">
              <div className="w-10 h-10 flex items-center justify-center text-gradient-primary flex-shrink-0">
                <svg
                  width={group.icon.width}
                  height={group.icon.height}
                  viewBox={`0 0 ${group.icon.width} ${group.icon.height}`}
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: group.icon.iconData }}
                />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{group.groupName}</h3>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent self-stretch" />

            {/* Right: tools grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {group.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gradient-primary/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 mb-3 text-white/70 group-hover:text-gradient-primary transition-colors duration-300">
                    <svg
                      width={tool.icon.width}
                      height={tool.icon.height}
                      viewBox={`0 0 ${tool.icon.width} ${tool.icon.height}`}
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: tool.icon.iconData }}
                    />
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white font-bold text-center transition-colors duration-300">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 h-px w-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

