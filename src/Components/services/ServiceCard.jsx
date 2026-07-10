import { useNavigate } from "react-router-dom";
import { getIconForTitle } from "../icons/title.icon";

const BADGE_COLORS = [
    "bg-emerald-500 text-white",
    "bg-violet-500 text-white",
    "bg-amber-400 text-gray-900",
    "bg-sky-500 text-white",
    "bg-rose-500 text-white",
    "bg-teal-500 text-white",
    "bg-indigo-500 text-white",
    "bg-orange-500 text-white",
];

function getBadgeColor(str) {
    if (!str) return BADGE_COLORS[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

export default function ServiceCard({
    id,
    title,
    description,
    image,
    // icon,   // commented out — icon is now resolved from title.icon.js
    price,
    tags = [],
    badge,
    featured = false,
    buttonIcon = "add_shopping_cart"
}) {
    const navigate = useNavigate();
    const icon = getIconForTitle(title); // derive icon from title

    const handleCardClick = () => {
        if (id) {
            navigate(`/service/${id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            role={id ? "link" : undefined}
            tabIndex={id ? 0 : undefined}
            onKeyDown={(e) => {
                if (id && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            className={`group bg-white rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
    ${featured
                    ? "border-primary/40 ring-2 ring-primary/10"
                    : "border-border/50 hover:border-primary/30"
                }
    ${id ? "cursor-pointer" : ""}`}
        >
            {/* IMAGE */}
            <div className="relative h-44 sm:h-52 lg:h-56 overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {badge && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span
                            className={`${getBadgeColor(
                                badge
                            )} px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm`}
                        >
                            {badge}
                        </span>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full">

                {/* TITLE */}
                <div className="flex items-start gap-2 min-h-[52px] sm:min-h-[60px]">
                    <span className="material-symbols-outlined text-primary text-xl sm:text-2xl shrink-0 mt-0.5">
                        {icon}
                    </span>

                    <h3
                        className="font-bold text-base sm:text-lg lg:text-xl leading-snug line-clamp-2"
                        title={title}
                    >
                        {title}
                    </h3>
                </div>

                {/* DESCRIPTION */}
                <p
                    className="mt-3 text-sm sm:text-[15px] text-text-secondary leading-relaxed line-clamp-2 min-h-[42px] sm:min-h-[48px]"
                    title={description}
                >
                    {description}
                </p>

                {/* TAGS */}
                <div className="mt-4 flex flex-wrap gap-2 min-h-[32px]">
                    {tags.length > 0 ? (
                        tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="bg-background-secondary border border-border/50 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-medium text-text-secondary"
                            >
                                {tag}
                            </span>
                        ))
                    ) : (
                        <div className="h-7" />
                    )}
                </div>

                {/* PRICE */}
                <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] sm:text-xs text-text-secondary font-medium">
                            {featured ? "Bundle Price" : "Starts at"}
                        </p>

                        <p className="text-xl sm:text-3xl font-bold text-primary">
                            {price}
                        </p>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick();
                        }}
                        className="flex items-center justify-center rounded-xl sm:rounded-2xl
                p-2.5 sm:p-3 bg-primary/10 hover:bg-primary
                text-primary hover:text-white transition-all shrink-0"
                    >
                        <span className="material-symbols-outlined text-xl sm:text-2xl">
                            {buttonIcon}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}