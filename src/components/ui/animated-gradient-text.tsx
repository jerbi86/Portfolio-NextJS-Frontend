"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const AnimatedGradientText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <motion.h1
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      style={{
        backgroundSize: "600% 600%",
      }}
      className={cn(
        "bg-gradient-to-r from-gradient-primary via-gradient-secondary to-gradient-tertiary bg-clip-text text-transparent will-change-transform",
        className
      )}
    >
      {children}
    </motion.h1>
  );
};
