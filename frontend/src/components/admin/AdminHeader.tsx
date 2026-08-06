export const AdminHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white px-6 py-5">
    <div>
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-ink/50">{subtitle}</p>}
    </div>
    {action}
  </div>
);
