import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function SearchIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>;
}

export function BagIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5.5 8.5h13l-.7 11h-11.6l-.7-11Z" /><path d="M9 9V6.5a3 3 0 0 1 6 0V9" /></svg>;
}

export function HeartIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20.8 5.9a5 5 0 0 0-7.1 0L12 7.6l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8a5 5 0 0 0 0-7.1Z" /></svg>;
}

export function UserIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-4 3-6 7-6s6.4 2 7 6" /></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}

export function ArrowUpRightIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 17 17 7M8 7h9v9" /></svg>;
}

export function TruckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="18" r="1.5" /><circle cx="18" cy="18" r="1.5" /></svg>;
}

export function ShieldIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function RefreshIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 8a7 7 0 0 1 11.5-1L20 12M4 12l2.4 5a7 7 0 0 0 11.5-1" /></svg>;
}

export function SparkIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m12 2 1.2 4.1A6.6 6.6 0 0 0 17.9 11L22 12l-4.1 1.2a6.6 6.6 0 0 0-4.7 4.7L12 22l-1.2-4.1a6.6 6.6 0 0 0-4.7-4.7L2 12l4.1-1a6.6 6.6 0 0 0 4.7-4.9L12 2Z" /></svg>;
}

export function SlidersIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
}

export function GridIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
}

export function PackageIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></svg>;
}

export function TagIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 13 13 20 4 11V4h7l9 9Z" /><circle cx="8.5" cy="8.5" r="1" /></svg>;
}

export function UsersIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.7 2.3-5.5 5.5-5.5s5 1.8 5.5 5.5M15 5.5a3 3 0 0 1 0 5.8M16.5 14c2.4.3 3.7 1.9 4 5" /></svg>;
}

export function TrendIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></svg>;
}

export function AlertIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 4 3 20h18L12 4Z" /><path d="M12 9v5M12 17.5h.01" /></svg>;
}

export function DollarIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M16 7.5c-.7-1-2-1.5-4-1.5-2.4 0-4 1.2-4 3s1.5 2.7 4 3 4 1.2 4 3-1.6 3-4 3c-2 0-3.5-.6-4.3-1.8M12 3v18" /></svg>;
}

export function StoreIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 10v10h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5" /></svg>;
}

export function ChevronIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m9 18 6-6-6-6" /></svg>;
}
