import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIconForTitle } from "../icons/title.icon";
import Badge from "../common/Badge";

export default function ServiceCard({
  id,
  title,
  description,
  image,
  price,
  tags = [],
  badge,
  badgeColor,
  featured = false,
  buttonIcon = "arrow_forward",
}) {
  const navigate = useNavigate();
  const icon = getIconForTitle(title);
  const [imgFailed, setImgFailed] = useState(false);

  const coverImage = Array.isArray(image) ? image[0] : image;

  const handleCardClick = () => {
    if (id) {
      navigate(`/service/${id}`);
    }
  };

  const formattedPrice =
    typeof price === "number"
      ? `₹${price.toLocaleString("en-IN")}`
      : price || "Custom Quote";

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
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl
        bg-white border border-gray-200/90
        shadow-[0_2px_8px_-1px_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.04)]
        hover:shadow-[0_14px_28px_-4px_rgba(15,92,62,0.18)]
        hover:border-[#0f5c3e]/50
        transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]
        ${
          featured
            ? "border-primary/60 ring-2 ring-primary/20 shadow-brand-light"
            : ""
        }
        ${id ? "cursor-pointer" : ""}`}
    >
      {/* IMAGE / COVER AREA */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 border-b border-gray-100">
        {coverImage && !imgFailed ? (
          <>
            <img
              src={coverImage}
              alt={title}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {/* Subtle Bottom Gradient Overlay for Visual Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none" />
          </>
        ) : (
          /* RICH BRANDED COVER (For services without images, prevents washed-out white void) */
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#082218] via-[#0f5c3e] to-[#1a8a5a] text-white overflow-hidden">
            {/* Ambient decorative watermark icon in corner */}
            <span className="material-symbols-outlined absolute -bottom-3 -right-2 text-7xl text-white/10 select-none pointer-events-none transform -rotate-12">
              {icon || "rocket_launch"}
            </span>

            {/* Frosted Glass Icon Tile */}
            <div className="relative z-1 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-md group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
              <span className="material-symbols-outlined text-2xl sm:text-3xl text-white drop-shadow-sm">
                {icon || "rocket_launch"}
              </span>
            </div>
          </div>
        )}

        {/* BADGE */}
        {badge && (
          <div className="absolute left-2.5 top-2.5 z-10">
            <Badge
              color={badgeColor}
              className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold shadow-sm backdrop-blur-md"
            >
              {badge}
            </Badge>
          </div>
        )}
      </div>

      {/* CARD CONTENT (Concise padding & modern typography) */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-3.5 bg-white">
        <div>
          {/* TITLE */}
          <h3
            className="line-clamp-2 text-xs sm:text-sm font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors"
            title={title}
          >
            {title}
          </h3>

          {/* DESCRIPTION */}
          {description && (
            <p
              className="mt-1 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-gray-500"
              title={description}
            >
              {description}
            </p>
          )}

          {/* TAGS */}
          {tags && tags.length > 0 && (
            <div className="mt-2 hidden flex-wrap gap-1 sm:flex">
              {tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="max-w-full truncate rounded-md bg-gray-100/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-600"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="rounded-md bg-gray-100/90 px-1.5 py-0.5 text-[10px] text-gray-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* PRICE & ACTION FOOTER */}
        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-gray-100 pt-2.5">
          <div className="min-w-0 flex-1">
            <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400 leading-none">
              {featured ? "Bundle Price" : "Starts at"}
            </span>
            <span className="mt-0.5 block truncate text-xs sm:text-sm md:text-base font-extrabold text-primary tracking-tight leading-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            aria-label={`View ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary border border-emerald-100/80 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200 shadow-2xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base sm:text-lg transition-transform duration-200 group-hover:translate-x-0.5">
              {buttonIcon === "add_shopping_cart" ? "arrow_forward" : buttonIcon}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
