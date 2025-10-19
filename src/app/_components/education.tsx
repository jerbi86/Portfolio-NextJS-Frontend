import fetchContentType from "@/lib/strapi/fetchContentType";
import EducationClient from "./education-client";
import HeadingReveal from "@/components/ui/heading-reveal";

type EducationItem = {
  id: number;
  school: string;
  grade: string | null;
  startDate: string; // ISO
  endDate: string | null; // ISO or null for current
  description: string | null; // HTML string
  city?: string | null;
  country?: string | null;
  schoolLink?: string | null;
};

export default async function Education() {
  const res = await fetchContentType("educations", { populate: "*", sort: ["startDate:desc"] });
  const items: EducationItem[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return (
    <section id="education" className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20" aria-labelledby="education-heading">
      <div className="w-full max-w-7xl">
        <HeadingReveal>
          <div className="flex items-center gap-4 min-w-0">
            <h2 id="education-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Education</h2>
            <div className="flex-1 h-[2px] md:h-[3px] bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-full" aria-hidden />
          </div>
        </HeadingReveal>

        {items.length === 0 ? (
          <p className="mt-10 text-white/60">No education records found.</p>
        ) : (
          <EducationClient items={items} />
        )}
      </div>
    </section>
  );
}
