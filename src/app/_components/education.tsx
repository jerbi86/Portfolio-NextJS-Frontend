import fetchContentType from "@/lib/strapi/fetchContentType";
import SectionReveal from "@/components/ui/section-reveal";

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

function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default async function Education() {
  const res = await fetchContentType("educations", { populate: "*", sort: ["startDate:desc"] });
  const items: EducationItem[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return (
    <section id="education" className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20" aria-labelledby="education-heading">
      <div className="w-full max-w-7xl">
        {/* Heading reveals first */}
        <SectionReveal selector=".education-heading" staggerIn={0.15} staggerOut={0.20} inStart="top 75%" inEnd="bottom bottom" outStart="bottom 20%" outEnd="bottom 10%">
          <div className="flex items-center gap-4 education-heading slide-up-and-fade">
            <h2 id="education-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Education</h2>
            <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary" />
          </div>
        </SectionReveal>

        {items.length === 0 ? (
          <p className="mt-10 text-white/60">No education records found.</p>
        ) : (
          /* Each item wrapped with its own SectionReveal */
          <div className="space-y-8 mt-10">
            {items.map((ed) => (
              <SectionReveal key={ed.id} selector=".education-item" staggerIn={0.15} staggerOut={0.20} inStart="top 75%" inEnd="bottom bottom" outStart="bottom 40%" outEnd="bottom 20%">
                <article className="education-item slide-up-and-fade">
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                    <div className="min-w-0">
                      {ed.schoolLink ? (
                        <a href={ed.schoolLink} target="_blank" rel="noopener noreferrer" className="text-xl sm:text-2xl font-bold text-white hover:text-white/90 transition-colors">
                          {ed.school}
                        </a>
                      ) : (
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{ed.school}</h3>
                      )}
                      {ed.grade && (
                        <p className="text-white/80 text-lg mt-1">{ed.grade}</p>
                      )}
                      {[ed.city, ed.country].filter(Boolean).length > 0 && (
                        <p className="text-white/50 text-sm mt-1">{[ed.city, ed.country].filter(Boolean).join(", ")}</p>
                      )}
                    </div>
                    <div className="text-white/60 text-sm whitespace-nowrap">
                      {formatDate(ed.startDate)} – {ed.endDate ? formatDate(ed.endDate) : "Present"}
                    </div>
                  </div>
                  {ed.description && (
                    <div className="prose prose-invert max-w-none text-white/80 mt-4" dangerouslySetInnerHTML={{ __html: ed.description }} />
                  )}
                  <div className="mt-6 h-px w-full bg-white/10" />
                </article>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
