import React from "react";
import KpiCard from "../../../../components/KpiCard";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Receipt,
  CalendarCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function SalesKpiGridSection({ metrics = null, loading = false }) {
  const fin = metrics?.financials || {};
  const counts = metrics?.counts || {};
  const growth = metrics?.growth || {};

  const kpis = [
    {
      id: "gross-sales",
      title: "Gross Booked Sales",
      value: `₹${(fin.grossSales || 0).toLocaleString("en-IN")}`,
      subtitle: `Catalog: ₹${(fin.catalogGross || 0).toLocaleString("en-IN")} • Disc: ₹${(fin.totalDiscounts || 0).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      variant: "primary",
      trend: growth.grossSales,
    },
    {
      id: "net-revenue",
      title: "Net Collected Revenue",
      value: `₹${(fin.netRevenue || 0).toLocaleString("en-IN")}`,
      subtitle: `Refunded: ₹${(fin.refundedAmount || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      variant: "emerald",
      trend: growth.netRevenue,
    },
    {
      id: "cash-collected",
      title: "Total Cash Collected",
      value: `₹${(fin.collectedRevenue || 0).toLocaleString("en-IN")}`,
      subtitle: `${counts.successfulPayments || 0} successful transactions`,
      icon: Receipt,
      variant: "teal",
      trend: growth.collectedRevenue,
    },
    {
      id: "total-orders",
      title: "Total Confirmed Orders",
      value: (counts.totalOrders || 0).toLocaleString("en-IN"),
      subtitle: `${counts.completedOrders || 0} completed • ${counts.activeOrders || 0} active`,
      icon: ShoppingBag,
      variant: "blue",
      trend: growth.orders,
    },
    {
      id: "aov",
      title: "Average Order Value",
      value: `₹${(fin.averageOrderValue || 0).toLocaleString("en-IN")}`,
      subtitle: "Gross sales per confirmed order",
      icon: CalendarCheck,
      variant: "indigo",
      trend: growth.aov,
    },
    {
      id: "outstanding-emi",
      title: "Outstanding EMI Receivables",
      value: `₹${(fin.outstandingEmi || 0).toLocaleString("en-IN")}`,
      subtitle: `Upcoming 30d: ₹${(counts.upcomingEmiAmount || 0).toLocaleString("en-IN")} (${counts.upcomingInstallmentsCount || 0} cycles)`,
      icon: Clock,
      variant: "purple",
    },
    {
      id: "overdue-emi",
      title: "Overdue EMI Delinquency",
      value: `₹${(fin.overdueEmi || 0).toLocaleString("en-IN")}`,
      subtitle: `${counts.overdueInstallmentsCount || 0} cycles past due date`,
      icon: AlertTriangle,
      variant: fin.overdueEmi > 0 ? "rose" : "slate",
    },
    {
      id: "active-plans",
      title: "Active Plan Subscriptions",
      value: (counts.activePlans || 0).toLocaleString("en-IN"),
      subtitle: "Plans within valid access window",
      icon: ShieldCheck,
      variant: "emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={kpi.icon}
          variant={kpi.variant}
          trend={kpi.trend}
          loading={loading}
        />
      ))}
    </div>
  );
}
