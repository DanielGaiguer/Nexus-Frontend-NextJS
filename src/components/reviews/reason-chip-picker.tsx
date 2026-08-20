"use client";

import { cn } from "@/lib/utils";

export function ReasonChipPicker<T extends string>({
  options,
  value,
  onChange,
  variant,
}: {
  options: { value: T; label: string }[];
  value: T[];
  onChange: (value: T[]) => void;
  variant: "positive" | "negative";
}) {
  function toggle(option: T) {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? variant === "positive"
                  ? "border-success/40 bg-success/15 text-success"
                  : "border-destructive/40 bg-destructive/15 text-destructive"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
