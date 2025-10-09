import { BackgroundGradient } from "@/components/ui/background-gradient";
import ParticleBackground from "@/components/ui/particle-background";
import fetchContentType from "@/lib/strapi/fetchContentType";
import Image from "next/image";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Github, Linkedin, FileText, Mail, Download } from "lucide-react";
import { GradientIconLink } from "@/components/ui/gradient-icon-link";
import ArrowAnimation from "@/components/ui/arrow-animation";
import ScrollProgressIndicator from "@/components/ui/scroll-indicator";
import { PortfolioNavbar } from "@/components/ui/portfolio-navbar";

export default async function Home() {
  // Fetch Global with nested populate
  const data = await fetchContentType(
    "global",
    { populate: { personnelInformations: { populate: "*" } } },
    true,
  );

  // Safely resolve image URL from Strapi response
  const info = data?.personnelInformations;
  const image = info?.image;
  const formats = image?.formats;
  const best = formats?.medium ?? formats?.small ?? formats?.thumbnail ?? image;
  const relUrl: string | undefined = best?.url;
  const base = process.env.NEXT_PUBLIC_API_URL;

  let src = "";
  try {
    if (relUrl && base) src = new URL(relUrl, base).href;
    else if (typeof relUrl === "string") src = relUrl; // if already absolute
  } catch {
    // leave empty to trigger fallback
  }

  // Prefer known dimensions from selected format
  const width = best?.width ?? image?.width ?? 400;
  const height = best?.height ?? image?.height ?? 500;

  // Get logo URL from personnelInformations
  const logo = info?.logo;
  const logoUrl = logo?.url;
  let logoSrc = "";
  try {
    if (logoUrl && base) logoSrc = new URL(logoUrl, base).href;
    else if (typeof logoUrl === "string") logoSrc = logoUrl;
  } catch {
    // leave empty to use fallback
  }

  return (
    <>
      <ParticleBackground />
      <PortfolioNavbar logoSrc={logoSrc} logoAlt={logo?.alternativeText || logo?.name || "Logo"} />
      <main className="min-h-dvh w-full relative z-10 flex items-start justify-center p-4 sm:p-8 pt-32">
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Rotated info on md+; normal on mobile */}
          <div className="relative md:min-h-[65vh]">
            <div className="mx-auto md:mx-0 max-w-2xl md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2">
              <AnimatedGradientText className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight">
                {info ? `${info.firstName} ${info.lastName}` : "Your Name"}
              </AnimatedGradientText>
              <p className="mt-3 text-white/80 text-3xl font-bold">
                {info?.currentRole ?? "Your current role"}
              </p>
              <p className="mt-5 text-white/70 text-xl sm:text-2xl max-w-prose">
                {info?.shortDescription ?? "Short description about you."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {info?.github && (
                  <GradientIconLink
                    href={info.github}
                    label="GitHub"
                  >
                    <Github strokeWidth={1.5} />
                  </GradientIconLink>
                )}
                {info?.linkedin && (
                  <GradientIconLink
                    href={info.linkedin}
                    label="LinkedIn"
                  >
                    <Linkedin strokeWidth={1.5} />
                  </GradientIconLink>
                )}
                {info?.resume?.url && (
                  <a
                    href={base ? new URL(info.resume.url, base).href : info.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white hover:shadow-lg hover:shadow-gradient-primary/50 transition-all text-xl font-bold flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" strokeWidth={2.5} />
                    Download Resume
                  </a>
                )}
                {info?.email && (
                  <a
                    href={`mailto:${info.email}`}
                    className="px-6 py-3 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition border border-white/10 md:hidden text-lg"
                  >
                    {info.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Profile image with gradient border + glow */}
          <div className="flex justify-center md:justify-end">
            {src ? (
              <BackgroundGradient
                containerClassName="w-full max-w-xs sm:max-w-sm"
                className="rounded-[2rem] bg-background overflow-hidden"
              >
                <Image
                  src={src}
                  width={width}
                  height={height}
                  alt={image?.alternativeText || image?.name || "Profile image"}
                  className="w-full h-auto object-contain"
                  priority
                />
              </BackgroundGradient>
            ) : (
              <div className="w-full max-w-sm sm:max-w-md rounded-3xl p-6 text-center text-white/80">
                <p className="text-base">No image available.</p>
                <p className="text-sm text-white/50 mt-1">
                  Ensure NEXT_PUBLIC_API_URL is set and Strapi is running.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Rotated email along left border on md+ */}
        {info?.email && (
          <a
            href={`mailto:${info.email}`}
            className="hidden md:flex fixed left-4 top-[85%] -translate-y-1/2 -rotate-90 origin-left text-white/70 hover:text-white transition-colors z-20 tracking-widest uppercase text-xs"
            aria-label={`Email ${info.firstName} ${info.lastName}`}
          >
            {info.email}
          </a>
        )}
        <ArrowAnimation />
      </main>
      <ScrollProgressIndicator />
    </>
  );
}
