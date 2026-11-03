import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIconForTitle } from "../../Components/icons/title.icon";

/**
 * Checks whether a purchase is configured as an EMI / installment purchase.
 */
function checkIsEmi(purchase) {
  return (
    String(purchase.paymentMethod || purchase.paymentType || "").toUpperCase() === "EMI" ||
    purchase.isEmi === true ||
    Boolean(purchase.mandate)
  );
}

/**
 * Maps authoritative purchase and mandate statuses to compact badge definitions.
 * Follows the requirement: a plan with verified upfront payment but incomplete mandate
 * must NOT be presented as active.
 */
function getStatusConfig(purchase) {
  const isEmi = checkIsEmi(purchase);
  const isMandateAuthorized = purchase.mandate?.status === "authorized";
  const isPlanMarkedActive = purchase.planAccessStatus === "active" || purchase.status === "active";

  // AutoPay required check
  if (isEmi && !isMandateAuthorized) {
    return {
      label: "AutoPay Required",
      variant: "warning",
      icon: "pending_actions",
      badgeClass: "bg-amber-400 text-gray-950 font-bold shadow-md ring-2 ring-amber-300/80",
      dotClass: "bg-gray-950 animate-pulse",
    };
  }

  // Active check
  if (isPlanMarkedActive) {
    return {
      label: "Active Plan",
      variant: "success",
      icon: "verified",
      badgeClass: "bg-emerald-600 text-white font-semibold shadow-xs",
      dotClass: "bg-white",
    };
  }

  // Completed check
  if (purchase.status === "completed" || purchase.planAccessStatus === "completed") {
    return {
      label: "Completed",
      variant: "neutral",
      icon: "task_alt",
      badgeClass: "bg-gray-800 text-white font-semibold shadow-xs",
      dotClass: "bg-gray-300",
    };
  }

  return {
    label: "Processing",
    variant: "neutral",
    icon: "hourglass_top",
    badgeClass: "bg-blue-600 text-white font-semibold shadow-xs",
    dotClass: "bg-white",
  };
}

export default function PurchasedPlanCard({ purchase }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const isEmi = checkIsEmi(purchase);
  const isMandateAuthorized = purchase.mandate?.status === "authorized";
  const isPlanActive =
    (purchase.planAccessStatus === "active" || purchase.status === "active") &&
    (!isEmi || isMandateAuthorized);
  const isMandateNeeded = isEmi && !isMandateAuthorized;

  const statusConfig = getStatusConfig(purchase);

  // Derive duration in days from service or purchase data
  const deriveDurationDays = () => {
    if (purchase.durationDays && !isNaN(Number(purchase.durationDays)) && Number(purchase.durationDays) > 0) {
      return Number(purchase.durationDays);
    }
    if (Array.isArray(purchase.plans) && purchase.plans[0]?.durationDays && !isNaN(Number(purchase.plans[0].durationDays))) {
      return Number(purchase.plans[0].durationDays);
    }
    const nameStr = `${purchase.planName || ""} ${purchase.planType || ""} ${purchase.duration || ""} ${Array.isArray(purchase.plans) ? purchase.plans[0]?.duration || "" : ""}`;
    const mMatch = nameStr.match(/(\d+)\s*(?:M|Months?)/i);
    if (mMatch) return Number(mMatch[1]) * 30;
    const dMatch = nameStr.match(/(\d+)\s*(?:D|Days?)/i);
    if (dMatch) return Number(dMatch[1]);
    const cycles = Number(purchase.pricing?.totalCycles ?? purchase.mandate?.totalCount ?? 0);
    if (cycles > 0) return cycles * 30;
    return 90;
  };

  const durationDays = deriveDurationDays();

  // Financial derivations
  const pricing = purchase.pricing || {};
  const finalPrice = Number(
    pricing.finalPrice ??
      purchase.amount ??
      purchase.price ??
      (Array.isArray(purchase.plans) && purchase.plans[0]?.price) ??
      1999
  );
  const upfrontPaid = Number(
    pricing.upfrontAmount ??
      purchase.upfrontAmount ??
      (isEmi ? Math.round(finalPrice * 0.15 * 100) / 100 : finalPrice)
  );
  const remainingBalance = Number(
    pricing.remainingAmount ?? Math.max(0, finalPrice - upfrontPaid)
  );
  const rawCycles = Number(pricing.totalCycles ?? purchase.mandate?.totalCount ?? 0);
  const totalCycles = rawCycles > 0 ? rawCycles : (durationDays > 30 ? Math.round(durationDays / 30) : 3);

  // Verified paid amount & percentage
  const verifiedPaid = isEmi ? upfrontPaid : (isPlanActive || purchase.status === "completed" ? finalPrice : 0);
  const paidPercent = finalPrice > 0 ? Math.min(Math.round((verifiedPaid / finalPrice) * 100), 100) : 0;

  const targetId = purchase.id || purchase.purchaseId || purchase.orderId || purchase.razorpayOrderId;

  const handleCardClick = () => {
    if (targetId) {
      navigate(`/profile/plans/${encodeURIComponent(targetId)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Resolve service title from service document (title) or purchase record
  const serviceTitle =
    purchase.title ||
    purchase.serviceTitle ||
    purchase.serviceName ||
    purchase.service?.title ||
    purchase.name ||
    purchase.category ||
    "Digital Marketing Service";

  // Catalog descriptions lookup by service keywords
  const SERVICE_DESCRIPTIONS = {
    "youtube": "Complete YouTube channel management including setup, branding, content optimization, and audience growth.",
    "facebook": "Professional Facebook and Instagram management to grow your brand, engage your audience, and increase your online presence.",
    "instagram": "Professional Facebook and Instagram management to grow your brand, engage your audience, and increase your online presence.",
    "social media": "Professional Facebook and Instagram management to grow your brand, engage your audience, and increase your online presence.",
    "whatsapp": "Professional WhatsApp Business API setup and campaign management for customer engagement.",
    "static": "Professional responsive business website suitable for startups and small businesses.",
    "dynamic": "Advanced business website with CMS, database integration, and custom functionality.",
    "website": "Professional responsive business website tailored to elevate your digital presence.",
    "seo": "Complete search engine optimization to boost organic visibility and top search rankings.",
  };

  // Description from service document (description), purchase record, or matched service catalog
  const resolveDescription = () => {
    if (purchase.description && typeof purchase.description === "string" && purchase.description.trim().length > 0) {
      return purchase.description;
    }
    if (purchase.serviceDescription && typeof purchase.serviceDescription === "string" && purchase.serviceDescription.trim().length > 0) {
      return purchase.serviceDescription;
    }
    if (purchase.service?.description) {
      return purchase.service.description;
    }
    if (Array.isArray(purchase.plans) && purchase.plans[0]?.description) {
      return purchase.plans[0].description;
    }

    const titleKey = `${serviceTitle} ${purchase.category || ""}`.toLowerCase();
    for (const [key, desc] of Object.entries(SERVICE_DESCRIPTIONS)) {
      if (titleKey.includes(key)) {
        return desc;
      }
    }

    return isEmi
      ? `Flexible monthly EMI subscription with active deliverables for ${durationDays} days.`
      : `Full-term digital deliverables and campaign execution for ${durationDays} days.`;
  };

  const description = resolveDescription();

  // Curated category & service image fallbacks
  const CURATED_SERVICE_IMAGES = {
    youtube: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&auto=format&fit=crop&q=80",
    facebook: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80",
    instagram: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80",
    "social media": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80",
    whatsapp: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=80",
    website: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    static: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    dynamic: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    seo: "https://images.unsplash.com/photo-1571786256017-aee7a0c009b6?w=800&auto=format&fit=crop&q=80",
  };

  // Safe image extractor that checks strings and arrays without breaking on empty arrays
  const extractValidImage = (...candidates) => {
    for (const item of candidates) {
      if (typeof item === "string" && item.trim().length > 0) return item.trim();
      if (Array.isArray(item)) {
        const found = item.find((url) => typeof url === "string" && url.trim().length > 0);
        if (found) return found.trim();
      }
    }
    return null;
  };

  const explicitImage = extractValidImage(
    purchase.imageUrl,
    purchase.image,
    purchase.serviceImage,
    purchase.thumbnail,
    purchase.service?.imageUrl,
    Array.isArray(purchase.plans) ? purchase.plans[0]?.imageUrl : null
  );

  const resolveCuratedImage = () => {
    const key = `${serviceTitle} ${purchase.category || ""}`.toLowerCase();
    for (const [k, url] of Object.entries(CURATED_SERVICE_IMAGES)) {
      if (key.includes(k)) return url;
    }
    return "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80";
  };

  const imageUrl = explicitImage || resolveCuratedImage();

  // Icon: match from service title, category, and tags
  const icon = getIconForTitle(
    `${serviceTitle} ${purchase.category || ""} ${Array.isArray(purchase.tags) ? purchase.tags.join(" ") : ""}`
  );

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer text-left ${
        isMandateNeeded
          ? "bg-gray-100/90 border-gray-300/80 shadow-xs sm:hover:border-gray-400 sm:hover:shadow-sm"
          : "bg-white border-border/50 shadow-brand-dark sm:hover:-translate-y-1 sm:hover:shadow-xl sm:hover:border-primary/30"
      }`}
    >
      {/* ========================================================= */}
      {/* A. SERVICE IMAGE OR BRANDED PLACEHOLDER */}
      {/* ========================================================= */}
      <div className={`relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden ${
        isMandateNeeded ? "bg-gray-200/90" : "bg-gray-50"
      }`}>
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={serviceTitle}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`h-full w-full object-cover transition-all duration-500 sm:group-hover:scale-105 ${
              isMandateNeeded ? "grayscale-[50%] opacity-70" : ""
            }`}
          />
        ) : (
          <div className={`relative flex h-full w-full items-center justify-center p-4 transition-transform duration-500 sm:group-hover:scale-105 ${
            isMandateNeeded
              ? "bg-gray-200/70 text-gray-400"
              : "bg-gradient-to-br from-[#0F5C3E]/15 via-emerald-50 to-teal-50/40"
          }`}>
            {!isMandateNeeded && (
              <>
                {/* Background Decorative Rings */}
                <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-primary/10 blur-xl" />
                <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-lg" />
              </>
            )}

            <div className="relative z-1 flex flex-col items-center gap-1.5 text-center">
              <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-xs ${
                isMandateNeeded
                  ? "bg-gray-100 text-gray-400 border border-gray-300/50"
                  : "bg-white text-primary"
              }`}>
                <span className="material-symbols-outlined text-2xl sm:text-3xl">
                  {icon}
                </span>
              </div>
              <span className={`text-xs font-bold line-clamp-1 max-w-[180px] ${
                isMandateNeeded ? "text-gray-500" : "text-gray-800"
              }`}>
                {serviceTitle}
              </span>
            </div>
          </div>
        )}

        {/* Floating Status Badge (Top Left) */}
        <div className="absolute left-2 top-2 sm:left-3.5 sm:top-3.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold shadow-xs ${statusConfig.badgeClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* B. CONTENT & PLAN INFORMATION (ONLY TITLE AND DESC) */}
      {/* ========================================================= */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4.5">
        {/* Bold Title */}
        <h3
          className={`mb-1 line-clamp-1 text-sm sm:text-base lg:text-lg font-heading font-bold transition-colors leading-snug ${
            isMandateNeeded
              ? "text-gray-700 group-hover:text-gray-900"
              : "text-gray-900 group-hover:text-primary"
          }`}
          title={serviceTitle}
        >
          {serviceTitle}
        </h3>

        {/* Short Service Description */}
        <p
          className={`mb-3 line-clamp-2 min-h-[2.25rem] text-xs sm:text-sm leading-relaxed ${
            isMandateNeeded ? "text-gray-500" : "text-text-secondary"
          }`}
          title={description}
        >
          {description}
        </p>

        {/* ========================================================= */}
        {/* E. PAYMENT SUMMARY AT BOTTOM WITH SUBTLE DIVIDER */}
        {/* ========================================================= */}
        <div className={`mt-auto border-t pt-2.5 sm:pt-3 ${isMandateNeeded ? "border-gray-200" : "border-border/40"}`}>
          {isEmi ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-secondary sm:text-xs truncate">
                      Upfront Paid
                    </p>
                    <p className={`truncate text-xs sm:text-sm md:text-base font-heading font-bold tabular-nums leading-tight ${
                      isMandateNeeded ? "text-gray-700" : "text-[#0B7B59]"
                    }`}>
                      ₹{upfrontPaid.toLocaleString("en-IN", {
                        minimumFractionDigits: upfrontPaid % 1 !== 0 ? 2 : 0,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-text-secondary sm:text-xs truncate">
                      Remaining
                    </p>
                    <p className="truncate text-xs sm:text-sm md:text-base font-heading font-bold tabular-nums leading-tight text-gray-700">
                      ₹{remainingBalance.toLocaleString("en-IN", {
                        minimumFractionDigits: remainingBalance % 1 !== 0 ? 2 : 0,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {/* Card Action Arrow */}
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isMandateNeeded
                      ? "bg-gray-200/90 text-gray-500 border-gray-300 group-hover:bg-gray-300 group-hover:text-gray-800"
                      : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                  }`}
                  aria-label="View plan details"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-text-secondary sm:text-xs">
                  Paid Amount
                </p>
                <p className={`truncate text-base sm:text-lg md:text-xl font-heading font-bold tabular-nums leading-tight ${
                  isMandateNeeded ? "text-gray-700" : "text-primary"
                }`}>
                  ₹{finalPrice.toLocaleString("en-IN", {
                    minimumFractionDigits: finalPrice % 1 !== 0 ? 2 : 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Card Action Arrow */}
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isMandateNeeded
                    ? "bg-gray-200/90 text-gray-500 border-gray-300 group-hover:bg-gray-300 group-hover:text-gray-800"
                    : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                }`}
                aria-label="View plan details"
              >
                <span className="material-symbols-outlined text-base sm:text-lg md:text-xl transition-transform duration-300 group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
