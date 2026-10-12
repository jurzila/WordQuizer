type EmptyStateProps = {
  title: string;
  message: string;
};

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-10">
      <p className="text-base font-semibold text-text-primary mb-1">{title}</p>
      <p className="text-md text-text-muted">{message}</p>
    </div>
  );
}
