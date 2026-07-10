export default function TimelineItem({
  title,
  description,
  isLast,
}) {
  return (
    <div className="relative flex gap-4 sm:gap-5">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[9px] top-5 h-full w-[2px] bg-border sm:left-[11px] sm:top-6" />
      )}

      {/* Circle */}
      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary sm:h-6 sm:w-6">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>

      {/* Content */}
      <div className="pb-8 sm:pb-10">
        <h3 className="text-base font-semibold sm:text-lg lg:text-xl">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-4 text-text-secondary sm:text-base sm:leading-7">
          {description}
        </p>
      </div>
    </div>
  );
}