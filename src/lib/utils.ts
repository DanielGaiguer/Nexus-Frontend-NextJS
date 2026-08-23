import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Limita o score de match a 0-100% — o backend pode retornar valores fora
 * da faixa (ex.: bônus de reputação empurrando o final score acima de 100). */
export function clampScore(score: number) {
  return Math.min(100, Math.max(0, score));
}
