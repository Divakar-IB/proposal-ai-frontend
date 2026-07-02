interface PageHeaderProps {
  title: string;
  description?: string;
}

export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold text-gradient-brand">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};
