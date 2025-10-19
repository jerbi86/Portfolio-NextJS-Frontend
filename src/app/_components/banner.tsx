import ArrowAnimation from "@/components/ui/arrow-animation";
import fetchContentType from "@/lib/strapi/fetchContentType";
import BannerClient from "./banner-client";

export default async function Banner() {
  const data = await fetchContentType(
    "global",
    { populate: { personnelInformations: { populate: "*" } } },
    true,
  );

  const info = data?.personnelInformations;
  const image = info?.image;
  const formats = image?.formats;
  const best = formats?.medium ?? formats?.small ?? formats?.thumbnail ?? image;
  const relUrl: string | undefined = best?.url;
  const base = process.env.NEXT_PUBLIC_API_URL;

  let src = "";
  try {
    if (relUrl && base) src = new URL(relUrl, base).href;
    else if (typeof relUrl === "string") src = relUrl;
  } catch {}

  const width = best?.width ?? image?.width ?? 400;
  const height = best?.height ?? image?.height ?? 500;

  return (
    <section className="relative w-full flex items-center justify-center mt-16 sm:mt-20 md:mt-28">
      <BannerClient
        fullName={info ? `${info.firstName} ${info.lastName}` : "Your Name"}
        role={info?.currentRole}
        shortDescription={info?.shortDescription}
        email={info?.email}
        github={info?.github}
        linkedin={info?.linkedin}
        resumeUrl={info?.resume?.url ? (base ? new URL(info.resume.url, base).href : info.resume.url) : null}
        imageSrc={src}
        imageWidth={width}
        imageHeight={height}
      />

      {/* Rotated email link moved to layout for global rendering */}

      {/* Arrow centered horizontally, lower than mid-height */}
      <ArrowAnimation className="absolute top-[100%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
    </section>
  );
}
