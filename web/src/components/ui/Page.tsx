import type { ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto w-full max-w-screen-sm">{children}</div>
    </div>
  );
}
