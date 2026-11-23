import {
  NotepadText,
  TicketCheck,
  Banknote,
  CreditCard,
  TrendingUp,
} from "lucide-react";

/**
 * Flat & tree navigation configuration for NeedMate Digital Admin Panel
 */
export const navTree = [
  {
    type: "link",
    to: "/admin/reports",
    label: "Sales & Reports",
    icon: TrendingUp,
    description: "Revenue, plan analytics & EMI performance",
  },
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
  {
    type: "link",
    to: "/admin/transactions",
    label: "Transactions",
    icon: CreditCard,
    description: "Purchases, gateway payments & upcoming EMIs",
  },
];
