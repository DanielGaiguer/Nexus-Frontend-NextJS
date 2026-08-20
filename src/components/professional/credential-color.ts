import type { BadgeColor } from "@/types/professional";

/** Mesma paleta fixa de nexus-frontend (classes .nexus-credential-*), documentada no enum BadgeColor. */
export const credentialColorHex: Record<BadgeColor, string> = {
  NEXUS: "#6b6eff",
  SLATE: "#475569",
  CIANO: "#22d3ee",
  VIOLETA: "#a78bfa",
  TEAL: "#2dd4bf",
  AMBAR: "#fbbf24",
  ROSA: "#fb7185",
  ESMERALDA: "#34d399",
};

export const credentialColorOptions = Object.keys(
  credentialColorHex
) as BadgeColor[];
