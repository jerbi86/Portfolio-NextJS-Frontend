import fetchContentType from "@/lib/strapi/fetchContentType";
import ScrollProgressIndicator from "@/components/ui/scroll-indicator";
import Banner from "./_components/banner";
import AboutMe from "./_components/about-me";
import Education from "./_components/education";
import TechnicalSkills from "./_components/technical-skills";
import Experience from "./_components/experience";

export default async function Home() {
  // Keep page server component minimal; banner and layout fetch their own data
  await Promise.resolve();

  return (
    <>
      <main className="min-h-dvh w-full relative z-10 flex flex-col items-center justify-start p-4 sm:p-8 pt-32 gap-24">
        <Banner />
        <AboutMe />
        <Experience />
        <Education />
        <TechnicalSkills />
      </main>
      <ScrollProgressIndicator />
    </>
  );
}
