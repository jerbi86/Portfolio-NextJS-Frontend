import fetchContentType from "@/lib/strapi/fetchContentType";
import TechnicalSkillsClient from "./technical-skills-client";

type ToolIcon = {
  iconName: string;
  iconData: string;
  width: number;
  height: number;
  isSvgEditable: boolean;
  isIconNameEditable: boolean;
};

type Tool = {
  id: number;
  name: string;
  icon: ToolIcon;
};

type SkillGroup = {
  id: number;
  documentId: string;
  groupName: string;
  icon: ToolIcon;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  tools: Tool[];
};

export default async function TechnicalSkills() {
  const res = await fetchContentType("technical-skills", { populate: "*" });
  const skillGroups: SkillGroup[] = Array.isArray(res?.data) ? (res.data as any) : [];

  return (
    <section id="skills" className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-20" aria-labelledby="skills-heading">
      <div className="w-full max-w-7xl">
        <div className="flex items-center gap-4">
          <h2 id="skills-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Technical Skills</h2>
          <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary" />
        </div>

        {skillGroups.length === 0 ? (
          <p className="mt-10 text-white/60">No technical skills found.</p>
        ) : (
          <TechnicalSkillsClient groups={skillGroups} />
        )}
      </div>
    </section>
  );
}
