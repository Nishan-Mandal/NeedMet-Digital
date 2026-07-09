import Button from "../../../Components/common/Button";
import Container from "../../../Components/layout/Container";
import HeroBadge from "./HeroBadge";
import HeroStatsCard from "./HeroStatsCard";
import { scrollToSection } from "../../../utils/scrollTo";

const heroImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAXEAE2Z3D-pHIaH1Aj1h-I_8wdU-hoXTvgqRihEDViEsJnxiRwQpTIxFLHUoDIVeQkwmefHO2B-LnumcRzgsAYvW_NG3tZjJAlWkMM4oBRiOXBddrWYPkXpV-Ux3njaitycca5M0nepXCHRYKTL5zaP6bX5ubWL7d64g3WktyfIQO5jZn5rajckFYZMzptfTgWCzpAuQgion_zklorWuQB7tr4SXUFXSREmwxaezQ50oK6TxELd08CTkHYoKsCIg3bT0nZj6E2BOk";

export default function HeroSection({
    parallax,
    badge = "Premium Service Marketplace",
    title = "Grow Your Business",
    highlight = "Digitally",
    description = "Accelerate your growth with professionally managed digital services. From SEO to social media, we deliver measurable results through data-driven strategies.",
    image = heroImage,
}) {
    return (
        <section
            id="about"
            className="relative overflow-hidden scroll-mt-36 px-5 py-6 sm:py-10 lg:py-32"
        >
            {/* Background Blob */}
            {/* <div
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-primary to-primary-light opacity-10 blur-3xl transition-transform duration-150 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
                style={{
                    transform: `translate(${parallax.x}px, ${parallax.y}px)`,
                }}
            /> */}

            <div className="flex flex-col items-center justify-center gap-6">

                {/* Left Content */}
                <div className="flex-1 w-full space-y-6 sm:space-y-10  sm:gap-2 gap-1  flex flex-col items-center text-center">

                    <HeroBadge text={badge} />

                    <div className="w-full">
                        <h1 className="hero-headline text-3xl sm:text-5xl lg:text-6xl font-primary text-[#0d3d2e] text-center w-full">
                            {title}

                            <br />

                            <span className=" font-display font-normal m ">
                                {highlight}
                            </span>
                        </h1>
                    </div>

                    <p className="font-primary mt-[-6%] md:mt-[-3%] sm:mt-[-6%] lg:mt-[-2%] text-text-secondary max-w-xl mx-auto">
                        {description}
                    </p>


                    <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center">

                        <Button
                            className="w-full px-8 py-3 sm:w-auto sm:px-10 lg:px-12"
                            onClick={() => scrollToSection("services")}
                        >
                            Browse Plans
                        </Button>

                        <Button
                            variant="secondary"
                            className="w-full px-8 py-3 sm:w-auto sm:px-10 lg:px-12"
                            onClick={() => scrollToSection("reviews")}
                        >
                            View Reviews
                        </Button>

                    </div>

                </div>

                {/* Right Image (Desktop Only) */}
                
                {/* <div className="hidden lg:block relative w-full max-w-sm flex-1 sm:max-w-md lg:max-w-none">

                    <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl lg:rounded-3xl">

                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light opacity-10" />

                        <img
                            src={image}
                            alt="Hero"
                            className="h-full w-full object-cover"
                        />

                    </div>

                  
                    <div className="hidden lg:block">
                        <HeroStatsCard
                            title="Avg. Growth"
                            value="142%"
                            progress={75}
                        />
                    </div>

                </div> */}

            </div>
        </section>
    );
}
