import {
  NotepadText,
  TicketCheck,
  Banknote,
  PlusCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react";

/**
 * Route-based Page Header Metadata for Top Navbar
 */
export const PAGE_META = {
  "/admin": {
    title: "Sales & Revenue Report",
    description: "Executive analytics, cash flow, plan sales performance, and EMI health.",
    icon: TrendingUp,
  },
  "/admin/reports": {
    title: "Sales & Revenue Report",
    description: "Executive analytics, cash flow, plan sales performance, and EMI health.",
    icon: TrendingUp,
  },
  "/admin/sales-report": {
    title: "Sales & Revenue Report",
    description: "Executive analytics, cash flow, plan sales performance, and EMI health.",
    icon: TrendingUp,
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
  "/admin/transactions": {
    title: "Transactions",
    description: "Customer purchases, payment gateway settlements & upcoming EMI schedules.",
    icon: CreditCard,
  },
  "/admin/purchases": {
    title: "Transactions",
    description: "Customer purchases, payment gateway settlements & upcoming EMI schedules.",
    icon: CreditCard,
  },
  "/admin/orders": {
    title: "Transactions",
    description: "Customer purchases, payment gateway settlements & upcoming EMI schedules.",
    icon: CreditCard,
  },
  "/admin/payments": {
    title: "Transactions",
    description: "Customer purchases, payment gateway settlements & upcoming EMI schedules.",
    icon: CreditCard,
  },
};

export const DEFAULT_PAGE_META = {
  title: "Admin Console",
  description: "NeedMate Digital Management Suite",
  icon: NotepadText,
};
