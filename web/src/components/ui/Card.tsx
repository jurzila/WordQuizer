import type { ReactNode } from "react";

type Tone = "default" | "danger";

const tones: Record<Tone, string> = {
  default: "bg-surface border-border",
  danger: "bg-danger-bg border-danger-border",
};

type CardProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

export default function Card({
  children,
  tone = "default",
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-xl py-3.5 px-4 border ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
