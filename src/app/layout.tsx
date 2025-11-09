import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ui/particle-background";
import { PortfolioNavbar } from "@/components/ui/portfolio-navbar";
import ScrollProgressIndicator from "@/components/ui/scroll-indicator";
import fetchContentType from "@/lib/strapi/fetchContentType";
import PageTransition from "@/components/ui/page-transition";
import Footer from "@/components/ui/footer";
import LayoutPreloader from "@/components/ui/layout-preloader";
import { toAbsoluteMediaUrl } from "@/lib/media";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Static fallback metadata (will be overridden at runtime via generateMetadata())
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

// Dynamically generate metadata from Strapi global content
export async function generateMetadata(): Promise<Metadata> {
  try {
    const global = await fetchContentType(
      "global",
      { populate: { personnelInformations: { populate: "*" }, seo: { populate: "*" } } },
      true,
      true,
    );

    const personnel = global?.personnelInformations;
    const seo = global?.seo;
    const metaImage = seo?.metaImage;
    const imageUrl = typeof metaImage?.url === 'string' ? toAbsoluteMediaUrl(metaImage.url) : undefined;

    const fullName = [personnel?.firstName, personnel?.lastName].filter(Boolean).join(" ");
    const titleBase = seo?.metaTitle || fullName || "Portfolio";
    const description = seo?.metaDescription || personnel?.shortDescription || "";

    return {
      title: titleBase,
      description,
      openGraph: {
        title: titleBase,
        description,
        type: 'website',
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: titleBase,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: seo?.canonicalURL || undefined,
      },
    };
  } catch (e) {
    console.error('generateMetadataError', e);
    return metadata;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch logo at layout level for navbar
  const data = await fetchContentType(
    "global",
    { populate: { personnelInformations: { populate: "*" } } },
    true,
  );
  const info = data?.personnelInformations;
  const logo = info?.logo;
  const logoUrl = logo?.url;
  // Make logo absolute against the API so it is always fetched from NEXT_PUBLIC_API_URL
  const logoSrc = typeof logoUrl === "string" ? toAbsoluteMediaUrl(logoUrl) : "";
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <LayoutPreloader />
        <ParticleBackground />
        <PageTransition>
          <PortfolioNavbar logoSrc={logoSrc} logoAlt={logo?.alternativeText || logo?.name || "Logo"} />
          {info?.email && (
            <a
              href={`mailto:${info.email}`}
              className="hidden md:flex fixed left-4 top-[85%] -translate-y-1/2 -rotate-90 origin-left text-white/70 hover:text-white transition-colors z-20 tracking-widest uppercase text-xs"
              aria-label={`Email ${info.firstName} ${info.lastName}`}
            >
              {info.email}
            </a>
          )}
          {children}
        </PageTransition>
        <Footer
          name={[info?.firstName, info?.lastName].filter(Boolean).join(" ") || undefined}
          email={info?.email || undefined}
          github={info?.github || undefined}
        />
        <ScrollProgressIndicator />
      </body>
    </html>
  );
}
