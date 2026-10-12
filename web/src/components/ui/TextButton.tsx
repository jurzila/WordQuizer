import type { ComponentProps } from "react";

type Tone = "primary" | "muted" | "danger";

const base = "py-1 px-1.5 text-sm disabled:opacity-50";

const tones: Record<Tone, string> = {
  primary: "text-primary font-semibold",
  muted: "text-text-muted font-medium",
  danger: "text-danger font-medium",
};

type TextButtonProps = ComponentProps<"button"> & {
  tone?: Tone;
};

export default function TextButton({
  tone = "primary",
  type = "button",
  className = "",
  ...rest
}: TextButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${tones[tone]} ${className}`}
      {...rest}
    />
  );
}
