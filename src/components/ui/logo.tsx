const ACCENT = "#d76542";

type LogoProps = {
  className?: string;
  height?: number;
};

export function Logo({ className, height = 24 }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        fontSize: height,
        fontWeight: 300,
        letterSpacing: "0.04em",
        color: "transparent",
        WebkitTextStroke: `1.2px ${ACCENT}`,
        lineHeight: 1,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      Vibeollio
    </span>
  );
}
