import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Theme utilities
export const themeClasses = {
  bg: "bg-navy-900",
  card: "bg-navy-800",
  border: "border-navy-700",
  text: "text-slate-300",
  heading: "text-white",
};

// Gradient text and background classes
export const gradientClasses = {
  text: "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400",
  button:
    "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500",
  hover: "hover:opacity-90 transition-opacity duration-200",
  background: "bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700",
};

// Typography classes following our design system
export const typography = {
  h1: "text-6xl font-extrabold",
  h2: "text-4xl font-extrabold",
  h3: "text-3xl font-extrabold",
  subtitle: "text-xl text-slate-300",
  body: "text-base text-slate-300",
};

// Layout classes
export const layout = {
  maxWidth: "max-w-7xl",
  padding: "px-4 sm:px-6 lg:px-8",
  verticalSpacing: "py-8",
  sectionSpacing: "mb-12",
};

export const darkModeClass = {};

// Interactive element classes
export const interactive = {
  primaryButton: `
    px-4 py-2 rounded-lg font-medium text-white
    ${gradientClasses.button}
    focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
    transition-all duration-200
  `,
  secondaryButton: `
    px-4 py-2 rounded-lg font-medium
    bg-navy-700 text-cyan-400
    hover:bg-navy-600
    focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
    transition-all duration-200
  `,
  input: `
    w-full px-4 py-2 rounded-lg
    bg-navy-800
    border border-navy-700
    text-white
    placeholder-slate-400
    focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
    transition-all duration-200
  `,
};
