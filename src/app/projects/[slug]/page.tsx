import fetchContentType from "@/lib/strapi/fetchContentType";
import { notFound } from "next/navigation";
import ProjectDetailsClient from "./project-details-client";

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
};

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const res = await fetchContentType("projects", { populate: "*" }, false, true);
  const projects: Project[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch all projects and find the one matching the slug
  const res = await fetchContentType("projects", { 
    populate: "*",
    filters: {
      slug: {
        $eq: slug,
      },
    },
  });

  const projects: Project[] = Array.isArray(res?.data) ? (res.data as any) : [];
  const project = projects[0];

  if (!project) {
    notFound();
  }

  return <ProjectDetailsClient project={project} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  const res = await fetchContentType("projects", { 
    populate: "*",
    filters: {
      slug: {
        $eq: slug,
      },
    },
  });

  const projects: Project[] = Array.isArray(res?.data) ? (res.data as any) : [];
  const project = projects[0];

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} | Portfolio`,
    description: project.description.replace(/<[^>]*>/g, "").substring(0, 160),
  };
}
