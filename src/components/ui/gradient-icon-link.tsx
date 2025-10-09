"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const GradientIconLink = ({
  href,
  children,
  label,
  className,
}: {
  href: string;
  children: ReactNode;
  label: string;
  className?: string;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn("group p-4 rounded-full bg-transparent transition-all", className)}
    >
      <motion.div
        className="relative [&>svg]:w-10 [&>svg]:h-10 [&>svg]:stroke-white [&>svg]:group-hover:stroke-[url(#gradient)] [&>svg]:transition-all [&>svg]:duration-300"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gradient-primary)" />
              <stop offset="50%" stopColor="var(--gradient-secondary)" />
              <stop offset="100%" stopColor="var(--gradient-tertiary)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </a>
  );
};
