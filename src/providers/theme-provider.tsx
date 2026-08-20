"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Envelope fino sobre o next-themes.
 *
 * attribute="class" porque o design system (Tailwind v4 + @theme em
 * globals.css) usa o seletor `.dark` para trocar de paleta. defaultTheme
 * fica em "dark" para manter a mesma primeira impressão que o produto já
 * tem hoje (nexus-frontend é dark-only); enableSystem fica desligado de
 * propósito — o toggle só oferece claro/escuro, não "seguir o sistema".
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
