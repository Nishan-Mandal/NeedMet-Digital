import {
  NotepadText,
  TicketCheck,
  Banknote,
  PlusCircle,
  ShoppingBag,
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
  "/admin/purchases": {
    title: "Purchases",
    description: "Customer plan purchase ledger, subscriptions, and fulfillment records.",
    icon: ShoppingBag,
  },
  "/admin/orders": {
    title: "Purchases",
    description: "Customer plan purchase ledger, subscriptions, and fulfillment records.",
    icon: ShoppingBag,
  },
  "/admin/payments": {
    title: "Transactions & Payments",
    description: "Payment gateway logs, settlements, refunds, and transaction audit trails.",
    icon: CreditCard,
  },
  "/admin/transactions": {
    title: "Transactions & Payments",
    description: "Payment gateway logs, settlements, refunds, and transaction audit trails.",
    icon: CreditCard,
  },
};

export const DEFAULT_PAGE_META = {
  title: "Admin Console",
  description: "NeedMate Digital Management Suite",
  icon: NotepadText,
};
