import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{eyebrow}</p>
        <h2 className="text-[clamp(1.75rem,4vw,2.4rem)] font-extrabold tracking-tight text-white">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-7 text-neutral-400 md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
