import fetchContentType from "@/lib/strapi/fetchContentType";
import SectionReveal from "@/components/ui/section-reveal";

export default async function AboutMe() {
  const data = await fetchContentType(
    "global",
    { populate: { personnelInformations: { populate: "*" } } },
    true,
  );

  const info = data?.personnelInformations;
  const firstName = info?.firstName ?? "Your Name";
  const quote: string | null | undefined = (info as any)?.Quote;
  const longDescription: string | null | undefined = info?.longDescription;

  return (
    <section
      id="about"
      className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20"
      aria-labelledby="about-heading"
    >
      <SectionReveal className="w-full max-w-7xl">
        {quote ? (
          <blockquote className="text-center text-white/90 text-3xl sm:text-5xl font-extrabold italic tracking-tight slide-up-and-fade">
            “{quote}”
          </blockquote>
        ) : null}

        {/* Full-width label + separator that spans across both columns */}
        <div className="mt-10 slide-up-and-fade">
          <div className="flex items-center gap-4">
            <p className="text-sm sm:text-base uppercase tracking-widest text-white/60 whitespace-nowrap">This is me</p>
            <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary"></div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white slide-up-and-fade"
            >
              Hi, I'm
              {" "}
              <span className="bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent">
                {firstName}
              </span>
            </h2>
          </div>
          <div>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed slide-up-and-fade">
              {longDescription ?? "Long description about you."}
            </p>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
