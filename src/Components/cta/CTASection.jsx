import Button from "../common/Button";
import Container from "../layout/Container";
import { useEffect, useState } from "react";
import { fetchSupportNumber } from "../../services/firebase/service";

export default function CTASection({
  title = "Not sure which plan is right?",
  description = "Get a free consultation with our digital experts. We'll analyze your business and recommend the perfect digital strategy."
}) {
  const [supportNumber, setSupportNumber] = useState("");

  useEffect(() => {
    async function loadSupport() {
      const num = await fetchSupportNumber();
      if (num) {
        setSupportNumber(num);
      }
    }
    loadSupport();
  }, []);
  const handleWhatsAppRedirect = () => {
    if (supportNumber) {
      // Clean number of non-digit characters
      const cleaned = supportNumber.replace(/\D/g, "");
      // Add country code if not present (defaulting to 91 if length is 10)
      const finalNumber = cleaned.length === 10 ? `91${cleaned}` : cleaned;
      window.open(`https://wa.me/${finalNumber}`, "_blank", "noopener,noreferrer");
    } else {
      // Fallback number if firebase isn't loaded or doesn't have it
      window.open("https://wa.me/919999999999", "_blank", "noopener,noreferrer");
    }
  };





  return (
    <section className="py-6 sm:py-10 lg:py-12 px-5">
      <div className="relative overflow-hidden rounded-3xl lg:rounded-[40px] bg-gradient-to-br from-primary to-primary-light px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20 text-center text-white shadow-2xl">

        {/* Background Blobs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-28 -right-28 h-56 w-56 rounded-full bg-white blur-3xl sm:-top-36 sm:-right-36 sm:h-80 sm:w-80 lg:-top-40 lg:-right-40 lg:h-96 lg:w-96" />
          <div className="absolute -bottom-28 -left-28 h-56 w-56 rounded-full bg-white blur-3xl sm:-bottom-36 sm:-left-36 sm:h-80 sm:w-80 lg:-bottom-40 lg:-left-40 lg:h-96 lg:w-96" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">

          <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

            <Button
              variant="secondary"
              className="w-full sm:w-auto px-8 py-3 lg:px-10"
              onClick={() => handleWhatsAppRedirect()}
            >
              Book Consultation
            </Button>
            {/* 
            <Button
              className="w-full border border-white/30 bg-white/10 px-8 py-3 hover:bg-white/20 sm:w-auto lg:px-10"
              onClick={() =>
              (window.location.href =
                "mailto:hello@needmetdigital.com?subject=Chat%20Request")
              }
            >
              Chat With Us
            </Button> */}

          </div>

        </div>
      </div>
    </section>
  );
}
