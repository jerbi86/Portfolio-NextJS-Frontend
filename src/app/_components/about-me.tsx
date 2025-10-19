import fetchContentType from "@/lib/strapi/fetchContentType";
import AboutMeClient from "./about-me-client";

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
      <AboutMeClient firstName={firstName} quote={quote || undefined} longDescription={longDescription || undefined} />
    </section>
  );
}

