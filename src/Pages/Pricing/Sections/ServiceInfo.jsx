import { useState } from "react";
import RatingBar from "./RatingBar";
import { getIconForTitle } from "../../../Components/icons/title.icon";

export default function ServiceInfo({ service = {} }) {
    const [imgFailed, setImgFailed] = useState(false);
    const coverImage = Array.isArray(service?.imageUrl)
        ? service.imageUrl[0]
        : (service?.imageUrl || service?.image);
    const icon = getIconForTitle(service?.title || service?.name || "");

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="group relative h-[260px] overflow-hidden rounded-2xl sm:h-[340px] sm:rounded-3xl lg:h-[420px] lg:rounded-[32px] bg-slate-900 border border-gray-100 shadow-xs">
                {coverImage && !imgFailed ? (
                    <img
                        src={coverImage}
                        alt={service?.title || "Service"}
                        onError={() => setImgFailed(true)}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    /* RICH BRANDED COVER PLACEHOLDER (Same aesthetic as ServiceCard) */
                    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#082218] via-[#0f5c3e] to-[#1a8a5a] text-white overflow-hidden">
                        {/* Ambient decorative watermark icon in corner */}
                        <span className="material-symbols-outlined absolute -bottom-6 -right-4 text-9xl sm:text-[180px] lg:text-[220px] text-white/10 select-none pointer-events-none transform -rotate-12">
                            {icon || "rocket_launch"}
                        </span>

                        {/* Ambient radial glow */}
                        <div className="absolute inset-0 bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />

                        {/* Frosted Glass Icon Tile */}
                        <div className="relative z-1 flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl group-hover:scale-105 group-hover:bg-white/20 transition-all duration-300">
                            <span className="material-symbols-outlined text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-md">
                                {icon || "rocket_launch"}
                            </span>
                        </div>
                    </div>
                )}

                <span className="absolute top-4 left-4 z-10 inline-block rounded-lg bg-primary/90 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white sm:text-xs lg:hidden shadow-xs">
                    {service?.category || service?.tags?.[0] || "Digital Service"}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-8 text-white z-10">
                    <span className="hidden lg:inline-block rounded-lg bg-primary/90 backdrop-blur-md border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs shadow-xs">
                        {service?.category || service?.tags?.[0] || "Digital Service"}
                    </span>

                    <div className="mt-3 text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl flex items-center gap-2">
                        {service?.title || service?.name}
                    </div>
                </div>
            </div>

            <RatingBar
                rating={service?.rating}
                reviews={service?.reviews}
                clients={service?.clients}
            />
        </div>
    );
}
