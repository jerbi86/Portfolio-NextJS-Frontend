type FooterProps = {
  name?: string;
  email?: string;
  github?: string;
};

export default function Footer({ name, email, github }: FooterProps) {
  const displayName = (name && name.trim()) || "Your Name";
  const displayEmail = email || "you@example.com";
  const displayGithub = github && github.trim();

  return (
    <footer className="w-full relative z-10 flex justify-center px-4 sm:px-8 py-16">
      <div className="w-full max-w-7xl text-center space-y-3">
        <p className="text-2xl sm:text-3xl font-extrabold text-white">
          Have a project in mind?
        </p>
        <p className="text-xl sm:text-2xl">
          <a
            href={`mailto:${displayEmail}`}
            className="font-bold text-white/90 hover:text-gradient-primary transition-colors"
          >
            {displayEmail}
          </a>
        </p>
        <p className="text-white/60 text-sm">
          Designed and built by {displayGithub ? (
            <a
              href={displayGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-gradient-primary font-medium transition-colors"
            >
              {displayName}
            </a>
          ) : (
            displayName
          )}, inspired by {" "}
          <a
            href="https://github.com/Tajmirul"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-gradient-primary font-medium transition-colors"
          >
            Tajmirul Islam
          </a>{" "}
          and {" "}
          <a
            href="https://www.linkedin.com/in/amani-ziadi-a422b520b/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-gradient-primary font-medium transition-colors"
          >
            amaniziadi
          </a>.
        </p>
      </div>
    </footer>
  );
}
