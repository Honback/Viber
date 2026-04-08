/* eslint-disable @next/next/no-img-element */

type LogoProps = {
  className?: string;
  height?: number;
};

export function Logo({ className, height = 24 }: LogoProps) {
  return (
    <img
      src="/logo-vibeollio.png"
      alt="Vibeollio"
      className={className}
      style={{ height, width: "auto" }}
      draggable={false}
    />
  );
}

export function IconMark({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/logo-vibeollio.png"
      alt="V"
      style={{ height: size, width: "auto" }}
      draggable={false}
    />
  );
}
