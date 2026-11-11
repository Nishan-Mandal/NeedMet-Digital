import React, { useEffect, useState, useMemo } from "react";
import { fetchSupportNumber } from "../../../services/firebase/service";
import {
  checkIsEmi,
  derivePurchaseReference,
  formatCurrency,
} from "../utils/planDetails.utils";

export default function ServiceConciergeCard({ purchase }) {
  const [supportNumber, setSupportNumber] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadSupport() {
      try {
        const num = await fetchSupportNumber();
        if (isMounted && num) {
          setSupportNumber(num);
        }
      } catch (err) {
        console.error("Failed to fetch support number:", err);
      }
    }
    loadSupport();
    return () => {
      isMounted = false;
    };
  }, []);

  const whatsappUrl = useMemo(() => {
    // 1. Clean support phone number
    const cleaned = (supportNumber || "9999999999").replace(/\D/g, "");
    const finalNumber = cleaned.length === 10 ? `91${cleaned}` : (cleaned || "919999999999");

    // 2. Extract purchase metadata
    const serviceName =
      purchase?.itemSnapshot?.serviceTitle ||
      purchase?.serviceName ||
      purchase?.title ||
      purchase?.category ||
      "Service Plan";
    const planName =
      purchase?.itemSnapshot?.planTitle ||
      purchase?.planName ||
      purchase?.planTitle ||
      "Selected Tier";
    const isEmi = checkIsEmi(purchase);
    const billingModel = isEmi ? "Monthly EMI Subscription" : "Full Online Payment";
    const purchaseRef = derivePurchaseReference(purchase);
    const amountVal = purchase?.pricing?.finalPrice || purchase?.amount || 0;
    const mandateStatus = String(purchase?.mandate?.status || "").toUpperCase();
    const isMandateAuthorized = mandateStatus === "AUTHORIZED";
    const statusUpper = String(purchase?.status || "").toUpperCase();
    const isMandateNeeded = statusUpper === "PENDING_MANDATE" || (isEmi && !isMandateAuthorized && statusUpper !== "ACTIVE");
    const statusLabel = isMandateNeeded
      ? "Action Required (AutoPay Setup)"
      : (statusUpper === "ACTIVE" || purchase?.planAccessStatus === "active" || purchase?.status === "active")
      ? "Active Plan"
      : statusUpper === "COMPLETED"
      ? "Completed"
      : "In Progress";

    // 3. Construct professional pre-filled WhatsApp message
    const messageLines = [
      "Hello NeedMet Team,",
      "I have an inquiry regarding my service deliverables & milestones:\n",
      `• Service: ${serviceName}`,
      `• Plan: ${planName}`,
      `• Billing: ${billingModel}`,
      `• Plan Ref: #${purchaseRef.slice(-12).toUpperCase()}`,
      amountVal > 0 ? `• Investment: ${formatCurrency(amountVal)}` : null,
      `• Status: ${statusLabel}\n`,
      "Could you please connect me with the delivery specialist assigned to my deliverables?",
    ].filter(Boolean);

    const fullMessage = messageLines.join("\n");
    return `https://wa.me/${finalNumber}?text=${encodeURIComponent(fullMessage)}`;
  }, [purchase, supportNumber]);

  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-xs text-left flex items-start gap-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
        <span className="material-symbols-outlined text-xl">support_agent</span>
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
          Questions About Deliverables?
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Our service delivery managers are here to assist with any milestone or mandate questions.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-heading text-xs font-bold text-[#0F5C3E] hover:underline pt-0.5"
        >
          <span>Chat with Delivery Team</span>
          <span className="material-symbols-outlined text-xs">open_in_new</span>
        </a>
      </div>
    </div>
  );
}
