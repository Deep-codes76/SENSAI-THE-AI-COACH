export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="section-label">{eyebrow}</p>}
          {/*
            The old pages used a fixed text-6xl heading, which overflowed on
            phones. This scales instead.
          */}
          <h1 className="mt-3 text-balance text-4xl leading-tight md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      <div className="ink-rule mt-8" />
    </div>
  );
}

export default PageHeader;
