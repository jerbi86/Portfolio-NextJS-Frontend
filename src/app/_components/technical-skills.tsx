import fetchContentType from "@/lib/strapi/fetchContentType";
import SectionReveal from "@/components/ui/section-reveal";

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
        {/* Heading reveals first */}
        <SectionReveal selector=".skills-heading" staggerIn={0.15} staggerOut={0.20} inStart="top 75%" inEnd="bottom bottom" outStart="bottom 20%" outEnd="bottom 10%">
          <div className="flex items-center gap-4 skills-heading slide-up-and-fade">
            <h2 id="skills-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Technical Skills</h2>
            <div className="h-px w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary" />
          </div>
        </SectionReveal>

        {skillGroups.length === 0 ? (
          <p className="mt-10 text-white/60">No technical skills found.</p>
        ) : (
          /* Each skill group wrapped with its own SectionReveal */
          <div className="space-y-12 mt-10">
            {skillGroups.map((group) => (
              <SectionReveal key={group.id} selector=".skill-group-item" staggerIn={0.15} staggerOut={0.20} inStart="top 75%" inEnd="bottom bottom" outStart="bottom 40%" outEnd="bottom 20%">
                <div className="skill-group-item slide-up-and-fade">
                  {/* Group with name on left and tools on right */}
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Left side - Group Name and Icon */}
                    <div className="flex items-center gap-3 md:flex-col md:items-start md:w-[250px] flex-shrink-0">
                      {/* Group Icon */}
                      <div className="w-10 h-10 flex items-center justify-center text-gradient-primary flex-shrink-0">
                        <svg
                          width={group.icon.width}
                          height={group.icon.height}
                          viewBox={`0 0 ${group.icon.width} ${group.icon.height}`}
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: group.icon.iconData }}
                        />
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{group.groupName}</h3>
                    </div>

                    {/* Vertical separator - visible on desktop */}
                    <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/20 to-transparent self-stretch" />

                    {/* Right side - Tools Grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {group.tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-gradient-primary/50 transition-all duration-300 hover:scale-105"
                        >
                          {/* Tool Icon */}
                          <div className="w-12 h-12 mb-3 text-white/70 group-hover:text-gradient-primary transition-colors duration-300">
                            <svg
                              width={tool.icon.width}
                              height={tool.icon.height}
                              viewBox={`0 0 ${tool.icon.width} ${tool.icon.height}`}
                              className="w-full h-full"
                              dangerouslySetInnerHTML={{ __html: tool.icon.iconData }}
                            />
                          </div>
                          {/* Tool Name */}
                          <span className="text-sm text-white/80 group-hover:text-white font-bold text-center transition-colors duration-300">
                            {tool.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mt-8 h-px w-full bg-white/10" />
                </div>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
