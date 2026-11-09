import {
  NotepadText,
  TicketCheck,
  Banknote,
  PlusCircle,
} from "lucide-react";

/**
 * Route-based Page Header Metadata for Top Navbar
 */
export const PAGE_META = {
  "/admin": {
    title: "Plans & Services",
    description: "Configure service packages, duration tiers, EMI options, and pricing.",
    icon: NotepadText,
  },
  "/admin/plans": {
    title: "Plans & Services",
    description: "Configure service packages, duration tiers, EMI options, and pricing.",
    icon: NotepadText,
  },
  "/admin/plans/new": {
    title: "Create Service Plan",
    description: "Add a new digital service with multi-duration pricing tiers and EMI schedules.",
    icon: PlusCircle,
  },
  "/admin/coupons": {
    title: "Coupon Management",
    description: "Configure promotional discount codes, validity periods, and usage limits.",
    icon: TicketCheck,
  },
  "/admin/cash-codes": {
    title: "Cash Codes Management",
    description: "Issue cryptographically secure store credit codes with immutable audit records.",
    icon: Banknote,
  },
};

export const DEFAULT_PAGE_META = {
  title: "Admin Console",
  description: "NeedMate Digital Management Suite",
  icon: NotepadText,
};
