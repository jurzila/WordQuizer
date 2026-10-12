import type { ReactNode } from "react";

type ErrorMessageProps = {
  children: ReactNode;
  className?: string;
};

export default function ErrorMessage({
  children,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`bg-danger-bg border border-danger-border rounded-md p-3 mt-3 ${className}`}
    >
      <p className="text-sm text-danger">{children}</p>
    </div>
  );
}
