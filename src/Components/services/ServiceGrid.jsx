import ServiceCard from "./ServiceCard";

export default function ServiceGrid({
  services = [],
  featuredService,
}) {
  return (
    <section id="services" className="py-4 sm:py-6 scroll-mt-28">
      {/* Contoured canvas for crisp card contrast against page */}
      <div className="rounded-3xl  lg:p-7 shadow-2xs">
        {/* Services Grid */}
        <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              description={service.description}
              image={service.imageUrl}
              icon={service.icon}
              price={
                service.plans?.[0]?.price
                  ? `₹${service.plans[0]?.price.toLocaleString("en-IN")}`
                  : service.price
              }
              tags={service.tags}
              badge={service.badge}
              badgeColor={service.badgeColor}
            />
          ))}

          {featuredService && (
            <ServiceCard
              id={featuredService.id}
              featured
              title={featuredService.title}
              description={featuredService.description || featuredService.desc}
              image={featuredService.image || featuredService.imgUrl}
              icon={featuredService.icon}
              price={
                featuredService.pricing?.price
                  ? `₹${featuredService.pricing.price.toLocaleString("en-IN")}`
                  : featuredService.price
              }
              tags={featuredService.tags}
              badge={featuredService.badge}
              badgeColor={featuredService.badgeColor}
              buttonIcon="shopping_bag"
            />
          )}
        </div>

        {/* Empty Search / Filter State */}
        {services.length === 0 && !featuredService && (
          <div className="py-12 sm:py-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-2xs text-[#0f5c3e]">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                No matching services found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find anything matching your search. Try checking for typos or searching for a different keyword.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
