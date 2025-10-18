import fetchContentType from "@/lib/strapi/fetchContentType";
import SectionReveal from "@/components/ui/section-reveal";
import ProjectsClient from "./projects-client";

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

export default async function Projects() {
  const res = await fetchContentType("projects", { populate: "*" });
  const projects: Project[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return (
    <section id="projects" className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20" aria-labelledby="projects-heading">
      <div className="w-full max-w-7xl">
        {/* Heading reveals first */}
        <SectionReveal selector=".projects-heading" staggerIn={0.15} staggerOut={0.20} inStart="top 75%" inEnd="bottom bottom" outStart="bottom 20%" outEnd="bottom 10%">
          <div className="flex items-center gap-4 projects-heading slide-up-and-fade mb-10">
            <h2 id="projects-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Projects</h2>
            <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary" />
          </div>
        </SectionReveal>

        {projects.length === 0 ? (
          <p className="mt-10 text-white/60">No projects found.</p>
        ) : (
          <ProjectsClient projects={projects} />
        )}
      </div>
    </section>
  );
}
