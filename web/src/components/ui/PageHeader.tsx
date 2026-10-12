import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
};

export default function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-row justify-between items-center gap-2 mb-4">
      <h1 className="text-2xl font-semibold text-text-primary truncate">
        {title}
      </h1>
      {action}
    </div>
  );
}
