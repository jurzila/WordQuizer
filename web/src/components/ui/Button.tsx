import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger";

const base = "py-2.5 px-4 rounded-md text-md disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-surface font-semibold",
  secondary: "border border-borderInput text-text-secondary font-medium",
  danger: "bg-danger text-surface font-semibold",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
};

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}
