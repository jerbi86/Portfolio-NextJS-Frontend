"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/ui/transition-link";
import Image from "next/image";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "./resizable-navbar";

const navItems = [
  { name: "About Me", link: "/#about" },
  { name: "Experience", link: "/#experience" },
  { name: "Skills", link: "/#skills" },
  { name: "Education", link: "/#education" },
  { name: "Projects", link: "/#projects" },
];

interface PortfolioNavbarProps {
  logoSrc?: string;
  logoAlt?: string;
}

export const PortfolioNavbar = ({ logoSrc, logoAlt = "Logo" }: PortfolioNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const useTransition = pathname !== "/";

  const LogoComponent = () => {
    const inner = (
      <>
        {logoSrc ? (
          <div className="relative w-16 h-16 mx-auto grid place-items-center [&_svg]:fill-[url(#logo-gradient)] [&_path]:fill-[url(#logo-gradient)]">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={64}
              height={64}
              className="object-contain brightness-0 saturate-100 [filter:invert(48%)_sepia(93%)_saturate(2476%)_hue-rotate(180deg)_brightness(102%)_contrast(101%)]"
              style={{
                filter: 'brightness(0) saturate(100%) invert(48%) sepia(93%) saturate(2476%) hue-rotate(180deg) brightness(102%) contrast(101%)'
              }}
              unoptimized
            />
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--gradient-primary)" />
                  <stop offset="100%" stopColor="var(--gradient-secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ) : (
          <span className="bg-gradient-to-r from-gradient-primary to-gradient-secondary bg-clip-text text-transparent text-xl font-bold">
            Portfolio
          </span>
        )}
      </>
    );

    if (useTransition) {
      return (
        <TransitionLink href="/#" variant="project" className="relative z-20 flex items-center justify-center space-x-2 px-2 py-1">
          {inner}
        </TransitionLink>
      );
    }
    return (
      <a href="/#" className="relative z-20 flex items-center justify-center space-x-2 px-2 py-1">
        {inner}
      </a>
    );
  };

  return (
    <Navbar className="top-4">
      <NavBody>
        <LogoComponent />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="relative px-6 py-2 rounded-full bg-transparent text-white font-bold hover:-translate-y-0.5 transition duration-200 group"
          >
            <span className="relative z-10">Contact Me</span>
            <span className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              <span className="absolute inset-[2px] rounded-full bg-background"></span>
            </span>
          </a>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <LogoComponent />
          <MobileNavToggle
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => (
            useTransition ? (
              <TransitionLink
                key={idx}
                href={item.link}
                variant="project"
                onClick={() => setIsOpen(false)}
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                {item.name}
              </TransitionLink>
            ) : (
              <a
                key={idx}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                {item.name}
              </a>
            )
          ))}
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="relative px-6 py-2 rounded-full bg-transparent text-white font-bold hover:-translate-y-0.5 transition duration-200"
          >
            <span className="relative z-10">Contact Me</span>
            <span className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-gradient-primary to-gradient-secondary">
              <span className="absolute inset-[2px] rounded-full bg-background"></span>
            </span>
          </a>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
