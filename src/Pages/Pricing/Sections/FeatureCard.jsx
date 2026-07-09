export default function FeatureCard({
  icon,
  title,
  description
}) {
  return (
    <div className="rounded-[24px] min-h-20 border border-border/30 bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
        </div>

        <div>
          <h3 className="text-[16px] sm:text-[18px] lg:text-[20px] font-semibold">
            {title}
          </h3>
          <p className=" text-sm leading-4 text-text-secondary">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}