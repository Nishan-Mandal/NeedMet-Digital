import Container from "../layout/Container";
import ServiceCard from "./ServiceCard";

export default function ServiceGrid({
    services,
    featuredService
}) {
 console.log(services)
    return (

        <section id="services" className="py-10 sm:py-14 scroll-mt-36">

            <Container>

                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">

                    {services.map((service) => (

                        <ServiceCard
                            key={service.id}
                            id={service.id}
                            title={service.title}
                            description={service.description}
                            image={service.imageUrl}
                            icon={service.icon}
                            price={service.plans[0]?.price ? `₹${service.plans[0]?.price.toLocaleString("en-IN")}` : service.price}
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
                            price={featuredService.pricing?.price ? `₹${featuredService.pricing.price.toLocaleString("en-IN")}` : featuredService.price}
                            tags={featuredService.tags}
                            badge={featuredService.badge}
                            badgeColor={featuredService.badgeColor}
                            buttonIcon="shopping_bag"
                        />

                    )}

                </div>

            </Container>

        </section>

    );

}
