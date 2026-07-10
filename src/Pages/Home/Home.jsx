import { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Container from "../../Components/layout/Container";
import HeroSection from "./Sections/HeroSection";
import FilterBar from "../../Components/services/Filterbar";
import ServiceGrid from "../../Components/services/ServiceGrid";
import CTASection from "../../Components/cta/CTASection";
import ReviewSection from "../../Components/reviews/ReviewSection";
import demoReviews from "../../data/demoreview";
import useParallax from "../../hooks/useParallax";
import { scrollToSection } from "../../utils/scrollTo";
import { fetchServices, fetchReviews, fetchCategories } from "../../services/db";

const parsePrice = (price) => {
    if (!price) return 0;
    return Number(String(price).replace(/[^\d]/g, ""));
};

const SORT_OPTIONS = ["default", "price-asc", "price-desc", "title"];



export default function Home() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");

    const [servicesData, setServicesData] = useState([]);
    const [reviewsData, setReviewsData] = useState([]);
    const [categoriesData, setCategoriesData] = useState(["All"]);
    const [isLoading, setIsLoading] = useState(true);

    const parallax = useParallax();
    const location = useLocation();

    // Fetch data from Firebase on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            
            // Commented out firebase reviews fetch
            // const [services, reviews, categories] = await Promise.all([
            //     fetchServices(),
            //     fetchReviews(),
            //     fetchCategories()
            // ]);
            const [services, categories] = await Promise.all([
                fetchServices(),
                fetchCategories()
            ]);
            
            setServicesData(services);
            setReviewsData(demoReviews);
            setCategoriesData(categories);
            
            setIsLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (location.hash && !isLoading) {
            const sectionId = location.hash.replace("#", "");
            requestAnimationFrame(() => scrollToSection(sectionId));
        }
    }, [location, isLoading]);

    const featuredService = useMemo(() => {
        return servicesData.find((service) => service.featured);
    }, [servicesData]);

    const filteredServices = useMemo(() => {
        let result = servicesData.filter((service) => {
            if (service.featured) return false;

            const categoryParam = activeCategory.toLowerCase().replace(/ /g, '-');
            const matchesCategory =
                activeCategory === "All" ||
                (service.categoryId === categoryParam) || 
                (service.tags && service.tags.includes(activeCategory));

            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (service.title && service.title.toLowerCase().includes(query)) ||
                (service.description && service.description.toLowerCase().includes(query));

            return matchesCategory && matchesSearch;
        });

        if (sortBy === "price-asc") {
            result = [...result].sort(
                (a, b) => parsePrice(a.pricing?.price || a.price) - parsePrice(b.pricing?.price || b.price)
            );
        } else if (sortBy === "price-desc") {
            result = [...result].sort(
                (a, b) => parsePrice(b.pricing?.price || b.price) - parsePrice(a.pricing?.price || a.price)
            );
        } else if (sortBy === "title") {
            result = [...result].sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
        }

        return result;
    }, [servicesData, activeCategory, searchQuery, sortBy]);

    const handleSort = (newSortBy) => {
        setSortBy(newSortBy);
    };

    return (
        <>
            <Container>
                <div>
                    
              
                <main>
                    <HeroSection
                        parallax={parallax}
                    />

                    <FilterBar
                        categories={categoriesData}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSort={handleSort}
                        sortBy={sortBy}
                    />

                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : (
                        <ServiceGrid
                            services={filteredServices}
                            featuredService={featuredService}
                        />
                    )}

                    <CTASection />
                </main>

                {!isLoading && reviewsData.length > 0 && (
                    <ReviewSection
                        reviews={reviewsData}
                    />
                )}
                  </div>
            </Container>
        </>
    );
}
