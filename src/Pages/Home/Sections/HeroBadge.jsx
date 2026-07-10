export default function HeroBadge({
    text
}) {
    return (
        <div className="hero-badge mx-auto lg:mx-0">
            <div className="hero-badge__dot" />
            <span>{text}</span>
        </div>
    );
}