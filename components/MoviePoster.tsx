"use client";

function initials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function hueFrom(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) % 360;
  return h;
}

export default function MoviePoster({
  title,
  posterUrl,
  className = "",
}: {
  title: string;
  posterUrl?: string | null;
  className?: string;
}) {
  if (posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterUrl}
        alt={title}
        className={`object-cover ${className}`}
      />
    );
  }

  const hue = hueFrom(title);
  return (
    <div
      className={`flex items-center justify-center font-[var(--font-display)] italic text-2xl ${className}`}
      style={{
        background: `linear-gradient(155deg, hsl(${hue} 45% 18%), hsl(${(hue + 40) % 360} 40% 10%))`,
        color: "rgba(255,255,255,0.85)",
      }}
    >
      {initials(title)}
    </div>
  );
}
