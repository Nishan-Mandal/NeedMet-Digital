export const BADGE_COLORS = [
  "bg-emerald-500 text-white",
  "bg-violet-500 text-white",
  "bg-amber-400 text-gray-900",
  "bg-sky-500 text-white",
  "bg-rose-500 text-white",
  "bg-teal-500 text-white",
  "bg-indigo-500 text-white",
  "bg-orange-500 text-white",
];

export function getBadgeColor(str) {
  if (!str || typeof str !== "string") return BADGE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

export default function Badge({
  children,
  text,
  color,
  autoColor = true,
  className = "",
  ...props
}) {
  const content = children ?? text;
  if (!content) return null;

  // Resolve color class
  const colorClass =
    color ||
    (autoColor && typeof content === "string" ? getBadgeColor(content) : BADGE_COLORS[0]);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm transition-colors ${colorClass} ${className}`.trim()}
      {...props}
    >
      {content}
    </span>
  );
}