type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="grid gap-4 rounded-[28px] border border-dashed border-line-strong bg-surface px-6 py-12 text-center shadow-soft">
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mx-auto max-w-xl text-sm leading-7 text-foreground-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
