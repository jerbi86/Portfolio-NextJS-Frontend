import TransitionLink from "@/components/ui/transition-link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-4">Project Not Found</h2>
        <p className="text-white/70 mb-8">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <TransitionLink
          href="/"
          scroll={false}
          restoreTargetScroll
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white font-bold hover:shadow-lg hover:shadow-gradient-primary/50 transition-all"
        >
          Back to Projects
        </TransitionLink>
      </div>
    </div>
  );
}
