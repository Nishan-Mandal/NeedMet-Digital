import { useState } from "react";
import TimelineItem from "./TimelineItem";

export default function Timeline({ timeline = [] }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!timeline || timeline.length === 0) return null;

  return (
    <section className="py-2 sm:py-3 lg:py-4">
      <div className="rounded-2xl bg-primary-surface p-5 sm:rounded-3xl sm:p-8 lg:rounded-[32px] lg:p-10 transition-all duration-300">
        {/* Clickable Header */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between text-left transition-all ${
            isOpen ? "mb-6 sm:mb-8" : "mb-0"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">
              schedule
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F5C3E]">
              Deliverables Timeline
            </h2>
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {timeline.length} Milestones
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary py-1 px-3 rounded-full hover:bg-primary/10 border border-primary/20 transition-colors">
            
            <span
              className={`material-symbols-outlined text-lg sm:text-xl transition-transform duration-200 ${
                isOpen ? "rotate-0" : "rotate-180"
              }`}
            >
              expand_less
            </span>
          </div>
        </button>

        {/* Collapsible Timeline Content */}
        {isOpen && (
          <div className="space-y-1 animate-in fade-in duration-300">
            {timeline.map((item, index) => (
              <TimelineItem
                key={index}
                title={item.week}
                description={item.desc}
                isLast={index === timeline.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}