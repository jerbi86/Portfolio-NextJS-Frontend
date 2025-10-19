"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import TransitionLink from "@/components/ui/transition-link";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ImageFormats = {
  thumbnail?: { url: string; width: number; height: number };
  small?: { url: string; width: number; height: number };
  medium?: { url: string; width: number; height: number };
  large?: { url: string; width: number; height: number };
};

type ProjectImage = {
  id: number;
  name: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats: ImageFormats;
  url: string;
};

type ExternalLink = {
  id: number;
  name: string;
  url: string;
  external: boolean;
};

type Tag = {
  name: string;
};

type Project = {
  id: number;
  documentId: string;
  name: string;
  description: string;
  tags: Tag[];
  image: ProjectImage[];
  externalLink: ExternalLink | null;
  slug: string;
  createdAt?: string;
  role?: string;
};

interface ProjectDetailsClientProps {
  project: Project;
}

export default function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  useGSAP(
    () => {
      if (!containerRef.current) return;

      gsap.set(".fade-in-later", {
        autoAlpha: 0,
        y: 30,
      });
      const tl = gsap.timeline({
        delay: 0.5,
      });

      tl.to(".fade-in-later", {
        autoAlpha: 1,
        y: 0,
        stagger: 0.1,
      });
    },
    { scope: containerRef }
  );

  // blur info div and make it smaller on scroll
  useGSAP(
    () => {
      if (typeof window === "undefined" || window.innerWidth < 992) return;

      gsap.to("#info", {
        filter: "blur(3px)",
        autoAlpha: 0,
        scale: 0.9,
        scrollTrigger: {
          trigger: "#info",
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          scrub: 0.5,
        },
      });
    },
    { scope: containerRef }
  );

  // parallax effect on images
  useGSAP(
    () => {
      gsap.utils
        .toArray<HTMLDivElement>("#images > div")
        .forEach((imageDiv, i) => {
          // Set initial background position
          gsap.set(imageDiv, {
            backgroundPosition: "center 100%",
          });
          
          gsap.to(imageDiv, {
            backgroundPosition: "center 0%",
            ease: "none",
            scrollTrigger: {
              trigger: imageDiv,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
    },
    { scope: containerRef }
  );

  return (
    <section className="pt-32 pb-14">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8" ref={containerRef}>
        <TransitionLink
          href="/#projects"
          variant="project"
          className="mb-16 inline-flex gap-2 items-center group h-12 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="group-hover:-translate-x-1 group-hover:text-gradient-primary transition-all duration-300" />
          Back to Projects
        </TransitionLink>

        <div className="top-0 min-h-[calc(100svh-100px)] flex" id="info">
          <div className="relative w-full">
            <div className="flex items-start gap-6 mx-auto mb-10 max-w-[635px]">
              <h1 className="fade-in-later opacity-0 text-4xl md:text-[60px] leading-none font-extrabold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
                {project.name}
              </h1>

              {project.externalLink && (
                <div className="fade-in-later opacity-0 flex gap-2">
                  <a
                    href={project.externalLink.url}
                    target="_parent"
                    rel={project.externalLink.external ? "noreferrer noopener" : undefined}
                    className="text-white/70 hover:text-gradient-primary transition-colors"
                    title={project.externalLink.name}
                  >
                    <ExternalLink size={30} />
                  </a>
                </div>
              )}
            </div>

            <div className="max-w-[635px] space-y-7 pb-20 mx-auto">
              {project.createdAt && (
                <div className="fade-in-later">
                  <p className="text-white/50 font-extrabold mb-3 uppercase tracking-wider text-sm">
                    Year
                  </p>
                  <p className="text-lg text-white/90 font-medium">
                    {new Date(project.createdAt).getFullYear()}
                  </p>
                </div>
              )}

              <div className="fade-in-later">
                <p className="text-white/50 font-extrabold mb-3 uppercase tracking-wider text-sm">
                  Tech & Technique
                </p>
                <p className="text-lg text-white/90 font-medium">
                  {project.tags.map((tag) => tag.name).join(", ")}
                </p>
              </div>

              <div className="fade-in-later">
                <p className="text-white/50 font-extrabold mb-3 uppercase tracking-wider text-sm">
                  Description
                </p>
                <div
                  className="text-lg text-white/70 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>

              {project.role && (
                <div className="fade-in-later">
                  <p className="text-white/50 font-extrabold mb-3 uppercase tracking-wider text-sm">
                    My Role
                  </p>
                  <p className="text-lg text-white/90 font-medium">{project.role}</p>
                </div>
              )}
            </div>

            {/* Scroll indicator arrow */}
            <div className="fade-in-later flex justify-center pb-10">
              <div className="flex flex-col items-center gap-2 text-white/50">
                <span className="text-sm uppercase tracking-wider">Scroll to see more</span>
                <svg
                  className="w-6 h-6 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fade-in-later relative flex flex-col gap-4 max-w-[800px] mx-auto"
          id="images"
        >
          {project.image.map((img) => {
            const imageUrl = img.formats?.large?.url || img.formats?.medium?.url || img.url;
            const fullImageUrl = imageUrl.startsWith("http") ? imageUrl : `${base}${imageUrl}`;

            return (
              <div
                key={img.id}
                className="group relative w-full aspect-[750/400] bg-white/5 rounded-2xl overflow-hidden"
                style={{
                  backgroundImage: `url(${fullImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 50%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <a
                  href={fullImageUrl}
                  target="_parent"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 bg-background/70 backdrop-blur-sm text-white size-12 inline-flex justify-center items-center rounded-lg transition-all opacity-0 hover:bg-gradient-to-r hover:from-gradient-primary hover:to-gradient-secondary group-hover:opacity-100"
                >
                  <ExternalLink />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
