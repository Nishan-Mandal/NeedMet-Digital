import RatingBar from "./RatingBar";

export default function ServiceInfo({ service }) {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="group relative h-[260px] overflow-hidden rounded-2xl sm:h-[340px] sm:rounded-3xl lg:h-[420px] lg:rounded-[32px]">
                <img
                    src={service.imageUrl || service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <span className="absolute top-4 left-4 z-10 inline-block rounded-lg bg-primary/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white sm:text-xs lg:hidden">
                    {service.category || service.tags?.[0] || "Digital Service"}
                </span>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-8 lg:right-8 text-white">

                    <span className="hidden lg:inline-block rounded-lg bg-primary/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider sm:text-xs">
                        {service.category || service.tags?.[0] || "Digital Service"}
                    </span>

                    <div className="mt-3 text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl flex  items-center gap-2">
                        {service.title}
                        {/* <div className="sm:hidden">
                            <span className="material-symbols-outlined text-white icon-md ">verified</span>
                        </div> */}
                    </div>

                </div>
            </div>

            <RatingBar
                rating={service.rating}
                reviews={service.reviews}
                clients={service.clients}
            />
        </div>
    );
}