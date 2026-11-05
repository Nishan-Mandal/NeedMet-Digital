import { useState } from "react";
import FeatureCard from "./FeatureCard";

const INITIAL_VISIBLE_COUNT = 4;

export default function FeatureGrid({ features = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!features || features.length === 0) return null;

  const canToggle = features.length > INITIAL_VISIBLE_COUNT;
  const visibleFeatures = canToggle && !isExpanded
    ? features.slice(0, INITIAL_VISIBLE_COUNT)
    : features;

  return (
    <section className="py-2">
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[21px] sm:text-[25px] lg:text-[25px] font-bold flex items-center gap-2 text-[#0F5C3E]">
            <span className="material-symbols-outlined">
              contextual_token_add
            </span>
            <span>What's Included</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {features.length}
            </span>
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 transition-all duration-300">
          {visibleFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.desc}
            />
          ))}
        </div>

        {/* Bottom Expand / Collapse Toggle Button */}
        {canToggle && (
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white hover:shadow-md active:scale-95"
            >
              <span>
                {isExpanded
                  ? "Show Less Features"
                  : `Expand & View All (${features.length}) Features`}
              </span>
              <span className="material-symbols-outlined text-lg transition-transform duration-200">
                {isExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}