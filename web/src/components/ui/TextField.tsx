import type { ComponentProps } from "react";

type TextFieldProps = ComponentProps<"input"> & {
  /** Required — every input gets an accessible name. Use `labelHidden` to hide it visually. */
  label: string;
  id: string;
  labelHidden?: boolean;
};

/**
 * Width is deliberately not part of the input's classes: callers need
 * `w-full` in a stacked form and `flex-1 min-w-0` in a row, and those
 * conflict. Pass one via `className`.
 */
export default function TextField({
  label,
  id,
  labelHidden = false,
  className = "",
  ...rest
}: TextFieldProps) {
  return (
    <>
      <label
        htmlFor={id}
        className={
          labelHidden
            ? "sr-only"
            : "block text-sm font-medium text-text-secondary mb-1.5"
        }
      >
        {label}
      </label>
      <input
        id={id}
        className={`border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface focus:border-primary focus:outline-none ${className}`}
        {...rest}
      />
    </>
  );
}
