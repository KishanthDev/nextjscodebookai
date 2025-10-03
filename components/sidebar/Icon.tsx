'use client';

import Image from "next/image";
import React from "react";
import { useTheme } from "next-themes";

interface IconProps {
  src: string;
  size?: number;
  className?: string;
  active?: boolean;
  alt?: string;
}

export function Icon({
  src,
  size = 18,
  className = "",
  active = false,
  alt = "icon",
}: IconProps) {
  const { theme } = useTheme();

  // Base color depending on theme
  const baseColor =
    theme === "dark"
      ? "brightness-0 invert" // white in dark mode
      : "brightness-0"; // black in light mode

  // Active color (inverted logic)
  const activeColor =
    theme === "dark"
      ? "brightness-0 invert" // black in dark mode
      : "brightness-0"; // white in light mode

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={`${className} ${active ? activeColor : baseColor}`}
    />
  );
}
export default Icon;