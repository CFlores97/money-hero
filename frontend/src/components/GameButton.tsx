"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "gold" | "outline";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-display text-base font-bold uppercase tracking-wide transition-all duration-100 active:translate-y-1";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-mh-green text-white border-b-[5px] border-mh-dark-2 shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:bg-mh-green/90 active:border-b-0 active:shadow-none",
  gold: "bg-mh-gold text-mh-black border-b-[5px] border-amber-600 shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:brightness-105 active:border-b-0 active:shadow-none",
  outline:
    "bg-white text-mh-dark border-2 border-mh-dark/15 hover:border-mh-green hover:text-mh-green",
};

interface GameButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  className?: string;
  onClick?: MouseEventHandler;
  disabled?: boolean;
}

export default function GameButton({
  children,
  variant = "primary",
  href,
  type = "button",
  className = "",
  onClick,
  disabled = false,
}: GameButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className} ${
    disabled ? "cursor-not-allowed opacity-60" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
