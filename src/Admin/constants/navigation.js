import {
  NotepadText,
  TicketCheck,
  Banknote,
} from "lucide-react";

/**
 * Hierarchical tree navigation configuration for NeedMate Digital Admin Panel
 * Limited strictly to Plans, Coupons, and Cash Codes
 */
export const navTree = [
  {
    type: "link",
    to: "/admin/plans",
    label: "Plans & Services",
    icon: NotepadText,
    description: "Manage subscription plans & pricing",
  },
  {
    type: "link",
    to: "/admin/coupons",
    label: "Coupons",
    icon: TicketCheck,
    description: "Discounts & usage limits",
  },
  {
    type: "link",
    to: "/admin/cash-codes",
    label: "Cash Codes",
    icon: Banknote,
    description: "Redemption & audits",
  },
];
