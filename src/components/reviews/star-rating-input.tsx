"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const ratingLabels = [
  "",
  "Ruim",
  "Abaixo do esperado",
  "Regular",
  "Bom",
  "Excelente",
];

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${i} estrela${i > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "size-8 transition-colors",
                i <= shown
                  ? "fill-warning text-warning"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-muted-foreground text-sm">
        {ratingLabels[shown] || "Selecione uma nota"}
      </span>
    </div>
  );
}
