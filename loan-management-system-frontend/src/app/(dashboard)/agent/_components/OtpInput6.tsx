"use client";

import { useEffect, useRef } from "react";

type OtpInput6Props = {
  value: string;
  onChange: (value: string) => void;
};

export function OtpInput6({ value, onChange }: OtpInput6Props) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const padded = value.padEnd(6, " ").slice(0, 6);

  useEffect(() => {
    if (!value && inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, [value]);

  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={padded[index] === " " ? "" : padded[index]}
          onChange={(event) => {
            const nextChar = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = value.split("").slice(0, 6);
            chars[index] = nextChar;
            const nextValue = chars.join("").slice(0, 6);
            onChange(nextValue);
            if (nextChar && index < 5) {
              inputs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !padded[index].trim() && index > 0) {
              inputs.current[index - 1]?.focus();
            }
          }}
          inputMode="numeric"
          maxLength={1}
          className="h-10 w-10 rounded-md border border-input text-center text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ))}
    </div>
  );
}
