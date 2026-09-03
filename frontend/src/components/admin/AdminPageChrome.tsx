import type { ComponentType, ReactNode, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="font-display text-[clamp(2.7rem,5vw,4.6rem)] font-normal leading-[0.92] tracking-[-0.055em]">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b6c65]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminEmptyState({ icon: Icon, title, description, action }: { icon: IconComponent; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-[430px] place-items-center rounded-[24px] border border-black/[0.08] bg-[#f9f7f2] p-8 text-center shadow-[0_16px_50px_rgba(17,18,15,0.04)]">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#b69b63]/35 bg-[#b69b63]/10 text-[#806a3d]"><Icon className="h-7 w-7" /></span>
        <h2 className="mt-6 font-display text-3xl tracking-[-0.04em]">{title}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#77786f]">{description}</p>
        {action && <div className="mt-7 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
