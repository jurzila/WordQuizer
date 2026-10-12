import type { ReactNode } from "react";

export default function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row justify-end gap-2 mt-3">{children}</div>
  );
}
