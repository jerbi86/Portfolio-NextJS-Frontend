import fetchContentType from "@/lib/strapi/fetchContentType";
import ExperienceClient from "./experience-client";
import HeadingReveal from "@/components/ui/heading-reveal";

type ExperienceItem = {
  id: number;
  company: string;
  role: string;
  startDate: string; // ISO
  finishDate: string | null; // ISO or null for current
  description: string | null; // HTML string
  city?: string | null;
  country?: string | null;
  companyLink?: string | null;
};

export default async function Experience() {
  const res = await fetchContentType("experiences", { populate: "*", sort: ["startDate:desc"] });
  const items: ExperienceItem[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return (
    <section id="experience" className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20" aria-labelledby="experience-heading">
      <div className="w-full max-w-7xl">
        <HeadingReveal>
          <div className="flex items-center gap-4 min-w-0">
            <h2 id="experience-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Experience</h2>
            <div className="flex-1 h-[2px] md:h-[3px] bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-full" aria-hidden />
          </div>
        </HeadingReveal>
        {items.length === 0 ? (
          <p className="mt-10 text-white/60">No experience records found.</p>
        ) : (
          <ExperienceClient items={items} />
        )}
      </div>
    </section>
  );
}


