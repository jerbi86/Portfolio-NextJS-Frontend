"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef, useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ImageFormats = {
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  small?: {
    url: string;
    width: number;
    height: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
  };
  large?: {
    url: string;
    width: number;
    height: number;
  };
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
};

interface ProjectItemProps {
  index: number;
  project: Project;
  selectedProject: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

const ProjectItem = ({ index, project, selectedProject, onMouseEnter, onMouseLeave }: ProjectItemProps) => {
  const externalLinkSVGRef = useRef<SVGSVGElement>(null);
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  const { context, contextSafe } = useGSAP(() => {}, {
    scope: externalLinkSVGRef,
    revertOnUpdate: true,
  });

  const handleMouseEnter = contextSafe?.(() => {
    onMouseEnter(project.documentId);

    const box = externalLinkSVGRef.current?.querySelector("#box") as SVGPathElement;
    const arrowLine = externalLinkSVGRef.current?.querySelector("#arrow-line") as SVGPathElement;
    const arrowCurb = externalLinkSVGRef.current?.querySelector("#arrow-curb") as SVGPathElement;

    if (!box || !arrowLine || !arrowCurb) return;

    gsap.set([box, arrowLine, arrowCurb], {
      opacity: 0,
      strokeDasharray: function(i, target) { return (target as SVGPathElement).getTotalLength(); },
      strokeDashoffset: function(i, target) { return (target as SVGPathElement).getTotalLength(); },
    });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tl.to(externalLinkSVGRef.current, { autoAlpha: 1 })
      .to(box, { opacity: 1, strokeDashoffset: 0 })
      .to(arrowLine, { opacity: 1, strokeDashoffset: 0 }, "<0.2")
      .to(arrowCurb, { opacity: 1, strokeDashoffset: 0 })
      .to(externalLinkSVGRef.current, { autoAlpha: 0 }, "+=1");
  });

  const handleMouseLeaveLocal = contextSafe?.(() => {
    onMouseLeave();
    context.kill();
  });

  const imageUrl = project.image[0]?.formats?.medium?.url || project.image[0]?.formats?.small?.url || project.image[0]?.url;
  const fullImageUrl = imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${base}${imageUrl}`) : "";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-item group leading-none py-5 md:border-b border-white/10 first:!pt-0 last:pb-0 last:border-none md:group-hover/projects:opacity-30 md:hover:!opacity-100 transition-all cursor-pointer block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveLocal}
    >
      {selectedProject === null && fullImageUrl && (
        <Image
          src={fullImageUrl}
          alt={project.image[0]?.alternativeText || project.name}
          width={project.image[0]?.formats?.medium?.width || 300}
          height={project.image[0]?.formats?.medium?.height || 200}
          className="w-full object-cover mb-6 aspect-[3/2] object-top rounded-lg"
          loading="lazy"
        />
      )}
      <div className="flex gap-2 md:gap-5">
        <div className="font-extrabold text-white/40 text-2xl">
          _{(index + 1).toString().padStart(2, "0")}.
        </div>
        <div className="flex-1">
          <h4 className="text-4xl xs:text-5xl lg:text-6xl flex gap-4 font-extrabold transition-all duration-700 bg-gradient-to-r from-gradient-primary to-gradient-secondary from-[50%] to-[50%] bg-[length:200%] bg-right bg-clip-text text-transparent group-hover:bg-left">
            {project.name}
            {project.externalLink && (
              <span className="text-white opacity-0 group-hover:opacity-100 transition-all">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  ref={externalLinkSVGRef}
                >
                  <path id="box" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <path id="arrow-line" d="M10 14 21 3"></path>
                  <path id="arrow-curb" d="M15 3h6v6"></path>
                </svg>
              </span>
            )}
          </h4>
          <div className="mt-3 flex flex-wrap gap-3 text-white/60 text-sm">
            {project.tags.slice(0, 3).map((tag, idx, arr) => (
              <div className="gap-3 flex items-center" key={idx}>
                <span className="font-medium">{tag.name}</span>
                {idx !== arr.length - 1 && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(projects[0]?.documentId || null);
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  useGSAP(
    (context, contextSafe) => {
      if (typeof window === "undefined" || window.innerWidth < 768) {
        setSelectedProject(null);
        return;
      }

      const handleMouseMove = contextSafe?.((e: MouseEvent) => {
        if (!containerRef.current || !imageContainerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageContainerRef.current.getBoundingClientRect();
        const offsetTop = e.clientY - containerRect.y;

        if (
          containerRect.y > e.clientY ||
          containerRect.bottom < e.clientY ||
          containerRect.x > e.clientX ||
          containerRect.right < e.clientX
        ) {
          return gsap.to(imageContainerRef.current, {
            duration: 0.3,
            opacity: 0,
          });
        }

        gsap.to(imageContainerRef.current, {
          y: offsetTop - imageRect.height / 2,
          duration: 1,
          opacity: 1,
        });
      }) as any;

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: containerRef, dependencies: [containerRef.current] }
  );

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "top 80%",
          toggleActions: "restart none none reverse",
          scrub: 1,
        },
      });

      tl.from(containerRef.current, {
        y: 150,
        opacity: 0,
      });
    },
    { scope: containerRef }
  );

  const handleMouseEnter = (id: string) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSelectedProject(null);
      return;
    }
    setSelectedProject(id);
  };

  const handleMouseLeave = () => {
    // Keep the selected project visible
  };

  return (
    <div className="group/projects relative" ref={containerRef}>
      {selectedProject !== null && (
        <div
          className="max-md:hidden absolute right-0 top-0 z-[1] pointer-events-none w-[200px] xl:w-[350px] aspect-[3/4] overflow-hidden opacity-0 rounded-2xl"
          ref={imageContainerRef}
        >
          {projects.map((project) => {
            const imageUrl = project.image[0]?.formats?.large?.url || project.image[0]?.formats?.medium?.url || project.image[0]?.url;
            const fullImageUrl = imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${base}${imageUrl}`) : "";
            
            if (!fullImageUrl) return null;
            
            return (
              <Image
                key={project.documentId}
                src={fullImageUrl}
                alt={project.image[0]?.alternativeText || project.name}
                width={project.image[0]?.formats?.large?.width || 400}
                height={project.image[0]?.formats?.large?.height || 500}
                className={cn(
                  "absolute inset-0 transition-all duration-500 w-full h-full object-cover rounded-2xl",
                  {
                    "opacity-0": project.documentId !== selectedProject,
                  }
                )}
              />
            );
          })}
        </div>
      )}

      <div className="flex flex-col max-md:gap-10">
        {projects.map((project, index) => (
          <ProjectItem
            key={project.documentId}
            index={index}
            project={project}
            selectedProject={selectedProject}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
    </div>
  );
}
